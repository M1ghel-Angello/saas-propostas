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

  const company = await prisma.companySettings.findUnique({
    where: { userId }
  });

  return NextResponse.json(
    {
      company: company
        ? {
            companyName: company.companyName,
            cnpj: company.cnpj ?? "",
            address: company.address ?? "",
            logoUrl: company.logoUrl ?? ""
          }
        : null
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
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const cnpj = typeof body.cnpj === "string" ? body.cnpj.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const logoUrl =
    typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";

  if (!companyName) {
    return NextResponse.json(
      { message: "Informe o nome da empresa" },
      { status: 400 }
    );
  }

  const existing = await prisma.companySettings.findUnique({
    where: { userId }
  });

  if (existing) {
    const updated = await prisma.companySettings.update({
      where: { userId },
      data: {
        companyName,
        cnpj,
        address,
        logoUrl
      }
    });
    return NextResponse.json(
      {
        company: {
          companyName: updated.companyName,
          cnpj: updated.cnpj ?? "",
          address: updated.address ?? "",
          logoUrl: updated.logoUrl ?? ""
        }
      },
      { status: 200 }
    );
  }

  const created = await prisma.companySettings.create({
    data: {
      userId,
      companyName,
      cnpj,
      address,
      logoUrl
    }
  });

  return NextResponse.json(
    {
      company: {
        companyName: created.companyName,
        cnpj: created.cnpj ?? "",
        address: created.address ?? "",
        logoUrl: created.logoUrl ?? ""
      }
    },
    { status: 201 }
  );
}

