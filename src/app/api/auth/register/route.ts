export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, registerUser, signToken, getTokenCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name =
      typeof body.name === "string" && body.name.trim().length > 0
        ? body.name.trim()
        : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { message: "Dados inválidos para cadastro" },
        { status: 400 }
      );
    }

    const user = await registerUser({ name, email, password });
    const token = signToken({ userId: user.id });
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );
    response.cookies.set(getTokenCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("E-mail já está em uso")
        ? err.message
        : "Não foi possível criar sua conta";
    return NextResponse.json({ message }, { status: 400 });
  }
}

