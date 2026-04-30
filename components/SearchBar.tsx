"use client";

// 1. Importamos o useEffect do React e o Loader2 do lucide-react
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  // 2. Criamos o estado de carregamento
  const [isSearching, setIsSearching] = useState(false);

  // 3. Este useEffect "escuta" a URL. Quando a pesquisa termina e a URL muda, ele desliga o botão de carregamento.
  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // 4. Ao iniciar a busca (seja por clique ou Enter), ativamos o "carregando"
    setIsSearching(true);

    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    params.delete("page");
    router.push(`/busca?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-full shadow-lg flex items-center gap-2 group transition-all hover:bg-white/20 focus-within:ring-4 ring-white/10"
    >
      <div className="flex-1 flex items-center px-4 md:px-6 h-12 md:h-14">
        <Search className="text-gray-300 w-5 h-5 md:w-6 md:h-6 mr-3 shrink-0 group-focus-within:text-tafanu-action transition-colors" />
        <input
          id="search-input"
          name="searchQuery"
          autoComplete="search"
          type="text"
          placeholder="Buscar outro negócio..."
          className="w-full bg-transparent outline-none text-white placeholder-gray-400 font-medium text-sm md:text-lg truncate disabled:opacity-50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching} // Opcional: bloqueia digitação enquanto busca
        />
      </div>

      <button
        type="submit"
        disabled={isSearching} // Bloqueia cliques duplos
        className="shrink-0 bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black rounded-full px-5 md:px-8 h-10 md:h-12 shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center uppercase tracking-wider text-[11px] md:text-sm disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
      >
        {/* 5. Feedback visual: Troca o conteúdo do botão dependendo do estado */}
        {isSearching ? (
          <div className="flex items-center gap-2">
            <Loader2 size={16} strokeWidth={3} className="animate-spin" />
            <span className="hidden md:inline">Buscando...</span>
          </div>
        ) : (
          "BUSCAR"
        )}
      </button>
    </form>
  );
}
