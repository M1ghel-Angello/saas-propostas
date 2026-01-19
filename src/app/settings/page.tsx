"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CompanySettings = {
  companyName: string;
  cnpj: string;
  address: string;
  logoUrl: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<CompanySettings>({
    companyName: "",
    cnpj: "",
    address: "",
    logoUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/company");
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (response.ok) {
          const data = (await response.json()) as {
            company: CompanySettings | null;
          };
          if (data.company) {
            setForm(data.company);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function updateField<K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error("Não foi possível salvar as configurações");
      }
      setMessage("Configurações salvas com sucesso");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar dados";
      setMessage(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-300">
        Carregando dados da empresa...
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
        >
          <span>←</span>
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl font-semibold mb-1">
          Dados da empresa
        </h1>
      </div>
      <p className="text-sm text-slate-300">
        Essas informações serão usadas no cabeçalho das suas propostas.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40"
      >
        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">
            Nome fantasia ou razão social
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">CNPJ (opcional)</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.cnpj}
            onChange={(e) => updateField("cnpj", e.target.value)}
          />
        </div>

        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">
            Endereço (opcional)
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm min-h-[70px]"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">
            URL do logo (opcional)
          </label>
          <input
            type="url"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.logoUrl}
            onChange={(e) => updateField("logoUrl", e.target.value)}
          />
          <p className="text-[11px] text-slate-400">
            Você pode hospedar o logo no próprio site ou em um serviço de
            imagens.
          </p>
        </div>

        {message && (
          <div className="text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-md px-3 py-2">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary hover:bg-blue-500 text-primary-foreground text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Salvar dados da empresa"}
        </button>
      </form>
    </div>
  );
}
