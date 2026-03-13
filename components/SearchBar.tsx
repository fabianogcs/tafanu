"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
      // 🚀 AJUSTE 1: Adicionado o "mx-auto" aqui para centralizar a barra no Desktop
      className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-full shadow-lg flex items-center gap-2 group transition-all hover:bg-white/20 focus-within:ring-4 ring-white/10"
    >
      <div className="flex-1 flex items-center px-4 md:px-6 h-12 md:h-14">
        <Search className="text-gray-300 w-5 h-5 md:w-6 md:h-6 mr-3 shrink-0 group-focus-within:text-tafanu-action transition-colors" />
        <input
          type="text"
          placeholder="Buscar outro negócio..."
          // 🚀 AJUSTE 2: Mudamos de text-base para text-sm (menor no celular) e text-lg (grande no PC)
          className="w-full bg-transparent outline-none text-white placeholder-gray-400 font-medium text-sm md:text-lg truncate"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="shrink-0 bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black rounded-full px-5 md:px-8 h-10 md:h-12 shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center uppercase tracking-wider text-[11px] md:text-sm"
      >
        BUSCAR
      </button>
    </form>
  );
}
