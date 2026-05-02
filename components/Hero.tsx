"use client";

// 1. Importamos o Loader2 para usar como ícone de carregamento
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // 2. Criamos o estado que controla se a pesquisa está em andamento
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 3. Ao enviar o formulário, ativamos o estado de carregamento
    setIsSearching(true);

    const params = new URLSearchParams();
    if (query) params.append("q", query);
    router.push(`/busca?${params.toString()}`);
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[#0A0F1E] overflow-hidden pt-12 pb-32 md:pt-28 md:pb-48 lg:pt-36 lg:pb-56">
      {/* Fundo Premium com Brilho Sutil e Profundidade */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-tafanu-action/15 rounded-full blur-[80px] md:blur-[140px] mix-blend-screen opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 opacity-10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        {/* Tipografia de Alto Impacto */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.05em] leading-[0.95] mb-6 relative z-20 uppercase italic">
          Tudo o que você busca, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-action via-emerald-400 to-teal-300 pr-1 md:pr-2 box-decoration-clone">
            em um só lugar.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-medium leading-relaxed relative z-20 opacity-90">
          Conectamos você aos melhores serviços e empresas.
        </p>

        {/* Barra de Pesquisa */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Buscar serviços locais"
          className="relative z-30 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-3 bg-white/[0.03] backdrop-blur-lg md:backdrop-blur-3xl border border-white/10 p-2 md:p-3 rounded-[2.5rem] shadow-2xl shadow-black/30 transition-all hover:border-white/20 focus-within:border-tafanu-action/50"
        >
          <label
            htmlFor="hero-search"
            className="w-full h-14 md:h-16 flex items-center px-6 bg-white/5 rounded-2xl md:bg-transparent md:rounded-none focus-within:ring-2 focus-within:ring-tafanu-action/30 md:focus-within:ring-0 cursor-text"
          >
            <Search
              className="text-tafanu-action/70 w-5 h-5 md:w-6 md:h-6 mr-4 shrink-0"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              name="heroQuery"
              autoComplete="off"
              type="search"
              aria-label="O que você está procurando?"
              placeholder="Ex: Pizzaria, Salão de Beleza..."
              className="w-full h-full bg-transparent outline-none text-white placeholder-white/30 font-medium text-base md:text-lg appearance-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching} // Opcional: desabilita o input durante a busca
            />
          </label>

          {/* 4. Atualizamos o botão para reagir ao estado isSearching */}
          <button
            type="submit"
            disabled={isSearching}
            aria-label="Realizar pesquisa"
            className="w-full md:w-auto bg-tafanu-action hover:bg-gradient-to-r hover:from-tafanu-action hover:to-emerald-400 text-tafanu-blue font-black rounded-xl md:rounded-2xl px-12 h-14 md:h-16 shadow-[0_0_40px_rgba(45,212,191,0.25)] transform transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-sm md:text-base shrink-0 border-t border-white/20 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
          >
            {isSearching ? (
              <>
                <Loader2 size={20} strokeWidth={3} className="animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <span>Pesquisar</span>
            )}
          </button>
        </form>
      </div>

      {/* Indicativo de Rolagem Flutuante */}
      <div className="absolute bottom-14 md:bottom-32 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleScrollDown}
          type="button"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-tafanu-action hover:bg-tafanu-action/10 transition-colors shadow-lg cursor-pointer"
          aria-label="Rolar página para baixo"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-tafanu-action" />
        </button>
      </div>
    </section>
  );
}
