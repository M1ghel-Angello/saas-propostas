"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProposalItem = {
  description: string;
  amount: number;
};

type CompanyData = {
  companyName: string;
  cnpj: string;
  address: string;
  logoUrl: string;
} | null;

type ProposalView = {
  id: number;
  title: string;
  clientName: string;
  clientEmail: string | null;
  clientCompany: string | null;
  total: number;
  createdAt: string;
  items: ProposalItem[];
  company: CompanyData;
};

type ApiResponse = {
  proposal: ProposalView;
};

export default function ProposalViewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ProposalView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const rawId = (params as Record<string, string | string[]>).id;
      const id =
        typeof rawId === "string"
          ? rawId
          : Array.isArray(rawId)
          ? rawId[0]
          : "";
      if (!id) {
        router.replace("/proposals");
        return;
      }
      try {
        const response = await fetch(`/api/proposals/${id}`);
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (response.status === 404) {
          router.replace("/proposals");
          return;
        }
        const json = (await response.json()) as ApiResponse;
        setData(json.proposal);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params, router]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-300">
        Carregando proposta...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const createdDate = new Date(data.createdAt).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/proposals")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            <span>Lista</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-blue-500"
        >
          <span>Imprimir / salvar PDF</span>
        </button>
      </div>

      <div className="print:bg-white print:text-black mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/60 print:shadow-none print:border-none print:p-0">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 print:border-black/10">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-black/60">
              Proposta comercial
            </div>
            <div className="text-lg font-semibold text-slate-50 print:text-black">
              {data.title}
            </div>
            <div className="text-xs text-slate-400 print:text-black/70">
              Criada em {createdDate}
            </div>
          </div>
          {data.company && data.company.logoUrl && (
            <img
              src={data.company.logoUrl}
              alt="Logo"
              className="h-12 w-auto object-contain print:h-10"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 print:text-black">
              De
            </div>
            {data.company ? (
              <div className="space-y-0.5 text-slate-300 print:text-black/80">
                <div>{data.company.companyName}</div>
                {data.company.cnpj && <div>CNPJ: {data.company.cnpj}</div>}
                {data.company.address && <div>{data.company.address}</div>}
              </div>
            ) : (
              <div className="text-slate-400 print:text-black/60">
                Configure os dados da empresa em Configurações.
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 print:text-black">
              Para
            </div>
            <div className="space-y-0.5 text-slate-300 print:text-black/80">
              <div>{data.clientName}</div>
              {data.clientCompany && <div>{data.clientCompany}</div>}
              {data.clientEmail && <div>{data.clientEmail}</div>}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 print:border-black/20">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-900/80 text-slate-200 print:bg-black/5 print:text-black">
              <tr>
                <th className="px-4 py-2 text-left font-medium">
                  Descrição
                </th>
                <th className="px-4 py-2 text-right font-medium w-32">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-800/70 print:border-black/10"
                >
                  <td className="px-4 py-2 align-top text-slate-100 print:text-black">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-100 print:text-black">
                    {item.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-700/80 bg-slate-900/80 print:border-black/20 print:bg-black/5">
                <td className="px-4 py-3 text-right text-xs font-semibold text-slate-200 print:text-black">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-50 print:text-black">
                  {data.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-[11px] text-slate-400 leading-relaxed print:text-black/70">
          Esta proposta é válida por 7 dias a partir da data de emissão, salvo
          negociação em contrário entre as partes. Os valores apresentados
          consideram as condições atuais do escopo e podem ser revisados em caso
          de alterações significativas.
        </div>
      </div>
    </div>
  );
}

