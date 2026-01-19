"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProposalItemInput = {
  description: string;
  amount: number;
};

type Proposal = {
  id: number;
  title: string;
  clientName: string;
  total: number;
  createdAt: string;
};

type ListResponse = {
  proposals: Proposal[];
};

export default function ProposalsPage() {
  const [items, setItems] = useState<ProposalItemInput[]>([
    { description: "", amount: 0 }
  ]);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadList() {
      try {
        const response = await fetch("/api/proposals");
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (response.ok) {
          const data = (await response.json()) as ListResponse;
          setProposals(data.proposals);
        }
      } finally {
        setListLoading(false);
      }
    }
    loadList();
  }, [router]);

  function updateItem(index: number, field: "description" | "amount", value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "amount" ? Number(value.replace(",", ".")) || 0 : value
            }
          : item
      )
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { description: "", amount: 0 }]);
  }

  function removeItemRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, item) => acc + (item.amount || 0), 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const filteredItems = items.filter(
        (item) => item.description.trim().length > 0 && item.amount > 0
      );
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          clientName,
          clientEmail,
          clientCompany,
          items: filteredItems
        })
      });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        throw new Error("Não foi possível criar a proposta");
      }
      const data = (await response.json()) as { proposal: Proposal };
      setProposals((prev) => [data.proposal, ...prev]);
      setTitle("");
      setClientName("");
      setClientEmail("");
      setClientCompany("");
      setItems([{ description: "", amount: 0 }]);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold mb-1">
              Nova proposta
            </h1>
            <p className="text-xs text-slate-300">
              Preencha os dados do cliente, adicione itens e gere o valor total.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
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
              onClick={() =>
                alert(
                  "Dica rápida:\n\n1. Preencha cliente e itens.\n2. Salve a proposta.\n3. Clique em Ver proposta na lista ao lado para visualizar e imprimir em PDF."
                )
              }
              className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] text-blue-100 hover:bg-blue-500/20"
            >
              <span>?</span>
              <span>Ajuda</span>
            </button>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">Título da proposta</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="space-y-1">
            <label className="block text-slate-200">Nome do cliente</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-200">E-mail do cliente</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-200">
              Empresa do cliente
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">
              Itens da proposta
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800"
            >
              Adicionar item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1fr)_110px_32px] gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Descrição do item ou serviço"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Valor"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={item.amount || ""}
                  onChange={(e) => updateItem(index, "amount", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                  disabled={items.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-300">
            Use o botão de imprimir do navegador para salvar como PDF.
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-300">Total estimado</span>
            <span className="text-lg font-semibold">
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary hover:bg-blue-500 text-primary-foreground text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Criando proposta..." : "Salvar proposta"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Últimas propostas</h2>
        </div>

        {listLoading ? (
          <div className="text-xs text-slate-300">
            Carregando propostas...
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-xs text-slate-300">
            Ainda não há propostas salvas.
          </div>
        ) : (
          <ul className="space-y-2">
            {proposals.map((proposal) => (
              <li
                key={proposal.id}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs flex items-center justify-between gap-3 hover:border-blue-500/60 hover:bg-slate-900 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {proposal.title}
                  </div>
                  <div className="text-slate-400 truncate">
                    {proposal.clientName} •{" "}
                    {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="whitespace-nowrap text-slate-100 text-sm">
                    {proposal.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/proposals/${proposal.id}`)}
                    className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
                  >
                    Ver
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
