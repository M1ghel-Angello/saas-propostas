export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getTokenCookieName, getUserIdFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getTokenCookieName())?.value;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado" }, { status: 401 });
  }

  const stats = await prisma.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 1
  });

  const totalProposals = await prisma.proposal.count({
    where: { userId }
  });

  const lastProposalAt = stats[0]?.createdAt ?? null;

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      stats: {
        totalProposals,
        lastProposalAt: lastProposalAt ? lastProposalAt.toISOString() : null
      }
    },
    { status: 200 }
  );
}

