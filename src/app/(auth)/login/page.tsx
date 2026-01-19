"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: mode === "register" ? name : undefined,
          email,
          password
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data && typeof data.message === "string"
            ? data.message
            : "Falha na autenticação";
        throw new Error(message);
      }
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao entrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">
          Gere propostas profissionais em minutos
        </h1>
        <p className="text-sm text-slate-300">
          Organize seus serviços, preencha os dados do cliente e gere
          propostas prontas para enviar.
        </p>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-slate-950/50">
        <div className="flex mb-4 text-sm border border-slate-800 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 px-3 py-2 ${
              mode === "login"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-900 text-slate-300"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 px-3 py-2 ${
              mode === "register"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-900 text-slate-300"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1 text-sm">
              <label className="block text-slate-200">Nome</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1 text-sm">
            <label className="block text-slate-200">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="block text-slate-200">Senha</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

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
            {loading
              ? "Processando..."
              : mode === "login"
              ? "Entrar"
              : "Criar conta e continuar"}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-2">
            Seus dados de acesso são usados apenas para este painel. Você pode
            excluir sua conta a qualquer momento.
          </p>
        </form>
      </div>
    </div>
  );
}
