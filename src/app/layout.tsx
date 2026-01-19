import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Gerador de Propostas",
  description: "Gere propostas profissionais em poucos cliques"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto w-full max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-blue-500/30">
                  P
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm tracking-tight">
                    Propostas em Minutos
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Gere propostas profissionais em poucos cliques
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-blue-200">
                  Beta
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-5xl px-4 py-8">
              {props.children}
            </div>
          </main>
          <footer className="border-t border-slate-800 bg-slate-950/90 text-xs text-slate-500">
            <div className="mx-auto w-full max-w-5xl px-4 py-4 flex justify-between">
              <span>SaaS Gerador de Propostas</span>
              <span>Feito para fechar mais negócios</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
