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
    /* Aumentamos o pb (padding-bottom) para o fundo escuro descer mais sem levar o texto junto */
    <section className="relative bg-[#050B14] overflow-hidden pt-8 md:pt-20 lg:pt-24 pb-[260px] md:pb-[350px] lg:pb-[390px] border-b border-white/5">
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 text-center mt-2 md:mt-0">
        {/* 🚀 TIPOGRAFIA REFINADA: No mobile (text-4xl), o texto fica mais elegante e deixa a tela respirar. No desktop, continua impactante. */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-[-0.05em] leading-[1.1] md:leading-[1] mb-3 md:mb-6 relative z-20 uppercase italic drop-shadow-2xl animate-in fade-in zoom-in duration-700 delay-100">
          Tudo o que você busca, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-action via-emerald-400 to-teal-300 pr-1 md:pr-2 box-decoration-clone">
            em um só lugar.
          </span>
        </h1>

        {/* 🚀 SUBTÍTULO: Reduzido para text-sm no mobile, acompanhando a proporção do título. */}
        <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto mb-6 md:mb-10 font-medium leading-relaxed relative z-20 opacity-90 animate-in fade-in duration-700 delay-200 px-2 md:px-0">
          Conectamos você aos melhores serviços, comércios e profissionais.
        </p>

        {/* BARRA DE PESQUISA (Mantida idêntica, apenas com leve ajuste de margem) */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Buscar serviços locais"
          className="relative z-30 w-full max-w-4xl mx-auto flex items-center bg-white/90 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:bg-white hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:ring-4 focus-within:ring-emerald-500/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          <label
            htmlFor="hero-search"
            className="flex-1 h-12 md:h-14 flex items-center pl-3 md:pl-6 cursor-text"
          >
            <Search
              className="text-slate-400 focus-within:text-tafanu-action w-4 h-4 md:w-6 md:h-6 mr-2 md:mr-3 shrink-0 transition-colors"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              name="pesquisa_tafanu_v1"
              autoComplete="off"
              type="text"
              aria-label="O que você está procurando?"
              placeholder="O que você procura?..."
              className="w-full h-full !bg-transparent border-none outline-none focus:ring-0 text-slate-800 placeholder-slate-400 font-bold text-sm md:text-lg appearance-none shadow-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
          </label>

          <button
            type="submit"
            disabled={isSearching}
            aria-label="Realizar pesquisa"
            className="bg-tafanu-action hover:bg-emerald-400 text-[#050B14] font-black rounded-xl md:rounded-full px-5 md:px-12 h-10 md:h-14 flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[10px] md:text-sm shrink-0 shadow-md transform transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSearching ? (
              <Loader2
                size={16}
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

      <div className="flex absolute bottom-2 md:bottom-2 lg:bottom-2 left-0 w-full justify-center z-40 animate-bounce pointer-events-none">
        <button
          onClick={handleScrollDown}
          type="button"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-tafanu-action hover:bg-tafanu-action/10 transition-colors shadow-lg cursor-pointer backdrop-blur-md pointer-events-auto"
          aria-label="Rolar página para baixo"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-tafanu-action" />
        </button>
      </div>
    </section>
  );
}
