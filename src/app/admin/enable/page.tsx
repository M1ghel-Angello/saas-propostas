"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminEnablePage() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "x-admin-secret": secret }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data && typeof data.message === "string"
            ? data.message
            : "Falha ao promover";
        throw new Error(message);
      }
      router.push("/admin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao promover";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Ativar Admin</h1>
      <p className="text-sm text-slate-300 mb-4">
        Insira o segredo para promover sua conta para ADMIN.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Segredo"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        {error && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary hover:bg-blue-500 text-primary-foreground text-sm font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processando..." : "Promover para ADMIN"}
        </button>
      </form>
    </div>
  );
}
