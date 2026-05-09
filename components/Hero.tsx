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
    /* 🚀 CIRURGIA 1: Aumentamos o pb-[clamp(...)] para o fundo escuro descer mais sem empurrar o texto. */
    <section className="relative bg-[#050B14] overflow-hidden pt-8 md:pt-20 lg:pt-24 pb-[clamp(200px,35vw,380px)] border-b border-white/5">
      {/* 1. FUNDO PREMIUM VETORIAL */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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

        {/* 🚀 NOVA BARRA DE PESQUISA "SINGLE PILL" */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Buscar serviços locais"
          className="relative z-30 w-full max-w-4xl mx-auto flex items-center bg-[#0A1220] border border-white/10 p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-2xl shadow-black/50 transition-all hover:border-white/20 focus-within:border-tafanu-action/50 focus-within:bg-[#0D172A] focus-within:ring-4 focus-within:ring-tafanu-action/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          <label
            htmlFor="hero-search"
            className="flex-1 h-12 md:h-14 flex items-center pl-4 md:pl-6 cursor-text"
          >
            <Search
              className="text-slate-400 focus-within:text-tafanu-action w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 shrink-0 transition-colors"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              name="pesquisa_tafanu_v1"
              autoComplete="off"
              type="text"
              aria-label="O que você está procurando?"
              placeholder="Pizzaria, Salão de Beleza..."
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
            className="bg-tafanu-action hover:bg-gradient-to-r hover:from-tafanu-action hover:to-emerald-400 text-[#050B14] font-black rounded-xl md:rounded-full px-5 md:px-10 h-10 md:h-14 flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-xs md:text-sm shrink-0 transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSearching ? (
              <Loader2
                size={18}
                strokeWidth={3}
                className="animate-spin md:w-5 md:h-5"
              />
            ) : (
              <>
                <span className="md:hidden">Buscar</span>
                <span className="hidden md:inline">Pesquisar</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 🚀 CIRURGIA 2: A setinha caiu de bottom-14 para bottom-8 no mobile e bottom-10 no PC */}
      <div className="absolute bottom-8 md:bottom-10 lg:bottom-10 left-0 w-full flex justify-center z-20 animate-bounce">
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
