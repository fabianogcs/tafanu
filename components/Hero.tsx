"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    router.push(`/busca?${params.toString()}`);
  };

  return (
    // 🚀 SEO: Alterado de <div> para <section> para demarcar uma área principal
    <section className="relative bg-[#0A0F1E] overflow-hidden pt-8 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 border-b border-white/5">
      {/* Fundo Premium com Brilho Sutil */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-tafanu-action/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        {/* Tipografia de Alto Impacto (H1 principal da página) */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-4 relative z-20">
          Tudo o que você busca, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-action to-emerald-400">
            em um só lugar.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 font-medium leading-relaxed relative z-20">
          Conectamos você aos melhores serviços e comércios.
        </p>

        {/* 🔍 Barra de Busca - Otimizada para SEO e Acessibilidade */}
        {/* 🔍 Barra de Busca - Otimizada para SEO e Acessibilidade */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Buscar serviços locais"
          className="relative z-30 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-2 md:bg-white/10 md:backdrop-blur-xl md:border md:border-white/20 md:p-3 md:rounded-[2rem] transition-all"
        >
          {/* 🚀 O PULO DO GATO: Trocamos a <div> por <label>. Agora, clicar na Lupa foca no input! */}
          <label
            htmlFor="hero-search"
            className="w-full h-14 md:h-16 flex items-center px-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:bg-transparent md:backdrop-blur-none md:border-none md:rounded-none focus-within:ring-2 focus-within:ring-tafanu-action/50 md:focus-within:ring-0 cursor-text"
          >
            <Search
              className="text-white/50 w-5 h-5 md:w-6 md:h-6 mr-3 shrink-0"
              aria-hidden="true"
            />
            <input
              id="hero-search" // ⬅️ O htmlFor do label aponta para este ID
              name="heroQuery"
              autoComplete="off"
              type="search"
              aria-label="O que você está procurando?"
              placeholder="Pizzaria, Encanador, Advogado..."
              className="w-full h-full bg-transparent outline-none text-white placeholder-white/40 font-medium text-base md:text-xl appearance-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <button
            type="submit"
            aria-label="Realizar pesquisa"
            className="w-full md:w-auto bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black rounded-xl md:rounded-[1.25rem] px-10 h-14 md:h-16 shadow-[0_0_30px_rgba(45,212,191,0.2)] transform transition hover:-translate-y-1 active:scale-95 flex items-center justify-center uppercase tracking-widest text-sm md:text-base shrink-0"
          >
            Pesquisar
          </button>
        </form>
      </div>
    </section>
  );
}
