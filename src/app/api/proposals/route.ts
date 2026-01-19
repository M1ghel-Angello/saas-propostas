export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getTokenCookieName, getUserIdFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProposalItemInput = {
  description: string;
  amount: number;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getTokenCookieName())?.value;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      clientName: true,
      total: true,
      createdAt: true
    }
  });

  return NextResponse.json(
    {
      proposals: proposals.map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        clientName: proposal.clientName,
        total: Number(proposal.total),
        createdAt: proposal.createdAt.toISOString()
      }))
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(getTokenCookieName())?.value;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const title =
    typeof body.title === "string" ? body.title.trim() : "";
  const clientName =
    typeof body.clientName === "string" ? body.clientName.trim() : "";
  const clientEmail =
    typeof body.clientEmail === "string" ? body.clientEmail.trim() : "";
  const clientCompany =
    typeof body.clientCompany === "string" ? body.clientCompany.trim() : "";
  const items = Array.isArray(body.items) ? (body.items as ProposalItemInput[]) : [];

  if (!title || !clientName || items.length === 0) {
    return NextResponse.json(
      { message: "Informe título, cliente e ao menos um item" },
      { status: 400 }
    );
  }

  const sanitizedItems = items
    .map((item) => ({
      description: String(item.description ?? "").trim(),
      amount: Number(item.amount ?? 0)
    }))
    .filter((item) => item.description && item.amount > 0);

  if (sanitizedItems.length === 0) {
    return NextResponse.json(
      { message: "Informe itens válidos com descrição e valor" },
      { status: 400 }
    );
  }

  const total = sanitizedItems.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const proposal = await prisma.proposal.create({
    data: {
      userId,
      title,
      clientName,
      clientEmail,
      clientCompany,
      itemsJson: sanitizedItems,
      total
    }
  });

  return NextResponse.json(
    {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        clientName: proposal.clientName,
        total: Number(proposal.total),
        createdAt: proposal.createdAt.toISOString()
      }
    },
    { status: 201 }
  );
}
