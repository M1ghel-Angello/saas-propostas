"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  stats: {
    totalProposals: number;
    lastProposalAt: string | null;
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/me");
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        const json = (await response.json()) as MeResponse;
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-300">Carregando seu painel...</div>
    );
  }

  if (!data) {
    return null;
  }

  const firstName =
    data.user.name && data.user.name.trim().length > 0
      ? data.user.name.split(" ")[0]
      : data.user.email;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            Olá, {firstName}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Este é o seu painel de propostas. Cadastre os dados da sua empresa,
            crie propostas e acompanhe tudo em um só lugar.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40">
          <div className="text-xs text-slate-400 mb-1">
            Propostas criadas
          </div>
          <div className="text-2xl font-semibold">
            {data.stats.totalProposals}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40">
          <div className="text-xs text-slate-400 mb-1">
            Última proposta
          </div>
          <div className="text-sm">
            {data.stats.lastProposalAt
              ? new Date(data.stats.lastProposalAt).toLocaleDateString(
                  "pt-BR"
                )
              : "Ainda não há propostas"}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40">
          <div className="text-xs text-slate-400 mb-1">
            Próximo passo
          </div>
          <div className="text-sm">
            Cadastre os dados da sua empresa e crie sua primeira proposta.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/proposals")}
          className="rounded-xl border border-blue-500/60 bg-blue-500/10 px-4 py-3 text-left hover:bg-blue-500/20"
        >
          <div className="text-sm font-medium mb-1">
            Criar nova proposta
          </div>
          <div className="text-xs text-slate-200">
            Monte uma proposta com itens, valores e dados do cliente em poucos
            cliques.
          </div>
        </button>

        <button
          onClick={() => router.push("/settings")}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left hover:bg-slate-800"
        >
          <div className="text-sm font-medium mb-1">
            Configurar dados da empresa
          </div>
          <div className="text-xs text-slate-200">
            Defina nome, CNPJ, endereço e logo para aparecerem nas propostas.
          </div>
        </button>
      </div>
    </div>
  );
}
