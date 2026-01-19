export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getTokenCookieName, getUserIdFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.ADMIN_ENABLE_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ message: "Segredo não configurado" }, { status: 500 });
  }
  const providedSecret = request.headers.get("x-admin-secret")?.trim() ?? "";
  const normalize = (s: string) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  const matches =
    providedSecret === configuredSecret ||
    normalize(providedSecret) === configuredSecret ||
    providedSecret === normalize(configuredSecret);
  if (!matches) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const token = request.cookies.get(getTokenCookieName())?.value ?? null;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" }
  });

  return NextResponse.json(
    {
      message: "Usuário promovido para ADMIN",
      user: { id: updated.id, email: updated.email, role: updated.role }
    },
    { status: 200 }
  );
}
