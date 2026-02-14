"use client";

import Link from "next/link";
import { SearchX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-tafanu-blue overflow-hidden flex items-center justify-center px-4">
      {/* MESMO FUNDO DE LUZES DO HERO */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-tafanu-action rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* ÍCONE COM ESTILO GLASSMORFISM */}
        <div className="inline-flex items-center justify-center p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-[3rem] mb-8 shadow-2xl">
          <SearchX size={64} className="text-tafanu-action animate-bounce" />
        </div>

        {/* TÍTULO COM O ESTILO DO HERO */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-4">
          404<span className="text-tafanu-action animate-blink">|</span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          Ops! Essa página "deu linha".
        </h2>

        <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md mx-auto">
          Não conseguimos encontrar o que você buscava. Talvez o link tenha
          mudado ou o perfil não exista mais.
        </p>

        {/* BOTÕES COM O ESTILO DO TAFANU */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black rounded-full px-10 h-14 shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
          >
            <Home size={18} />
            Voltar ao Início
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-10 h-14 bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 uppercase text-sm"
          >
            <ArrowLeft size={18} />
            Voltar Página
          </button>
        </div>

        {/* TAGS DE AJUDA RÁPIDA (Como no Hero) */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">
            Tente buscar de novo:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/busca"
              className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              🔍 Ver todos os anúncios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
