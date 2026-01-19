export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, signToken, getTokenCookieName } from "@/lib/auth";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; expires: number }>();
function rateLimited(key: string) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || record.expires < now) {
    attempts.set(key, { count: 1, expires: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `login:${ip}`;
  if (rateLimited(key)) {
    return NextResponse.json({ message: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: "Informe e-mail e senha" },
      { status: 400 }
    );
  }

  const user = await authenticateUser({ email, password });
  if (!user) {
    return NextResponse.json(
      { message: "E-mail ou senha inválidos" },
      { status: 401 }
    );
  }

  const token = signToken({ userId: user.id });
  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    },
    { status: 200 }
  );
  response.cookies.set(getTokenCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

