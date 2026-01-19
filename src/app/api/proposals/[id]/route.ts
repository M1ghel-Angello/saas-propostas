export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getTokenCookieName, getUserIdFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const token = request.cookies.get(getTokenCookieName())?.value;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const idNumber = Number(context.params.id);
  if (!idNumber || Number.isNaN(idNumber)) {
    return NextResponse.json({ message: "Proposta inválida" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id: idNumber, userId },
    include: {
      user: {
        include: {
          company: true
        }
      }
    }
  });

  if (!proposal) {
    return NextResponse.json({ message: "Proposta não encontrada" }, { status: 404 });
  }

  let items: { description: string; amount: number }[] = [];
  const parsed = proposal.itemsJson as unknown;
  if (Array.isArray(parsed)) {
    items = parsed
      .map((item) => ({
        description: String((item as any).description ?? "").trim(),
        amount: Number((item as any).amount ?? 0)
      }))
      .filter((item) => item.description && item.amount > 0);
  }

  const company = proposal.user.company;

  return NextResponse.json(
    {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        clientName: proposal.clientName,
        clientEmail: proposal.clientEmail,
        clientCompany: proposal.clientCompany,
        total: Number(proposal.total),
        createdAt: proposal.createdAt.toISOString(),
        items,
        company: company
          ? {
              companyName: company.companyName,
              cnpj: company.cnpj ?? "",
              address: company.address ?? "",
              logoUrl: company.logoUrl ?? ""
            }
          : null
      }
    },
    { status: 200 }
  );
}

