export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, signToken, getTokenCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

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
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

