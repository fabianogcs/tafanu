"use client";

import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    router.push(`/busca?${params.toString()}`);
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    /* 🚀 A MÁGICA: Adicionamos transition-all duration-500 ease-in-out.
   Isso suaviza as mudanças de pb-40 para pb-[280px] e pb-[320px]! */
    <section className="relative bg-[#050B14] overflow-hidden pt-8 pb-40 md:pt-20 lg:pt-24 md:pb-[280px] lg:pb-[320px] border-b border-white/5">
      {/* 1. FUNDO PREMIUM VETORIAL */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. BRILHO DE PROFUNDIDADE (NEON) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[140px] mix-blend-screen opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 opacity-[0.07] rounded-full blur-[100px] -ml-20 -mb-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center mt-6 md:mt-0">
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-[-0.05em] leading-[1.05] md:leading-[0.95] mb-4 md:mb-6 relative z-20 uppercase italic drop-shadow-2xl animate-in fade-in zoom-in duration-700 delay-100">
          Tudo o que você busca, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-action via-emerald-400 to-teal-300 pr-1 md:pr-2 box-decoration-clone">
            em um só lugar.
          </span>
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 font-medium leading-relaxed relative z-20 opacity-90 animate-in fade-in duration-700 delay-200">
          Conectamos você aos melhores serviços, empresas e profissionais.
        </p>

        {/* Barra de Pesquisa */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Buscar serviços locais"
          className="relative z-30 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-3 bg-[#0A1220] border border-white/10 p-3 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-black/50 transition-all hover:border-white/20 focus-within:border-tafanu-action/50 focus-within:bg-[#0D172A] focus-within:shadow-[0_0_50px_rgba(45,212,191,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          <label
            htmlFor="hero-search"
            /* 🚀 AQUI ESTÁ A CORREÇÃO DO MOBILE:
               Devolvemos o 'bg-[#132035]' e 'rounded-xl' SÓ para o celular.
               E aumentamos a altura de h-12 para h-14 para ficar melhor para o toque! */
            className="w-full h-14 md:h-16 flex items-center px-4 md:px-6 bg-[#132035] rounded-xl md:bg-transparent md:rounded-none cursor-text"
          >
            <Search
              className="text-tafanu-action/70 w-5 h-5 md:w-6 md:h-6 mr-3 md:mr-4 shrink-0"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              name="pesquisa_tafanu_v1"
              autoComplete="off"
              type="text"
              aria-label="O que você está procurando?"
              placeholder="Ex: Pizzaria, Salão de Beleza..."
              className="w-full h-full !bg-transparent border-none outline-none focus:ring-0 text-white placeholder-slate-500 font-medium text-sm md:text-lg appearance-none shadow-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
          </label>

          <button
            type="submit"
            disabled={isSearching}
            aria-label="Realizar pesquisa"
            /* 🚀 Aumentamos a altura (h-14) no mobile para ficar simétrico com o input */
            className="w-full md:w-auto bg-tafanu-action hover:bg-gradient-to-r hover:from-tafanu-action hover:to-emerald-400 text-[#050B14] font-black rounded-xl md:rounded-2xl px-6 md:px-12 h-14 md:h-16 shadow-[0_0_30px_rgba(45,212,191,0.2)] transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-sm md:text-base shrink-0 md:border-l md:border-white/10 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSearching ? (
              <>
                <Loader2
                  size={18}
                  strokeWidth={3}
                  className="animate-spin md:w-5 md:h-5"
                />
                <span>Buscando...</span>
              </>
            ) : (
              <span>Pesquisar</span>
            )}
          </button>
        </form>
      </div>

      {/* 🚀 SETINHA AJUSTADA: Aumentamos o bottom no md e lg para ela subir no desktop */}
      <div className="absolute bottom-6 md:bottom-10 lg:bottom-12 left-0 w-full flex justify-center z-20 animate-bounce">
        <button
          onClick={handleScrollDown}
          type="button"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-tafanu-action hover:bg-tafanu-action/10 transition-colors shadow-lg cursor-pointer backdrop-blur-md"
          aria-label="Rolar página para baixo"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-tafanu-action" />
        </button>
      </div>
    </section>
  );
}
