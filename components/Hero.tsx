"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [text, setText] = useState("");
  const fullText = "O que você precisa agora?";
  const [index, setIndex] = useState(0);

  // Estados para busca (Simplificado: só query)
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText.charAt(index));
        setIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    router.push(`/busca?${params.toString()}`);
  };

  return (
    <div className="relative bg-tafanu-blue overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tafanu-action rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 h-16 md:h-20">
          {text}
          <span className="animate-blink text-tafanu-action">|</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
          Conectamos você aos melhores serviços e comércios da região.
        </p>

        {/* BARRA DE BUSCA ÚNICA E PODEROSA */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex items-center gap-2 group transition-all hover:bg-white/20 focus-within:ring-4 ring-white/10"
        >
          <div className="flex-1 flex items-center px-6 h-14 md:h-16">
            <Search className="text-gray-300 w-6 h-6 mr-4 group-focus-within:text-tafanu-action transition-colors" />
            <input
              type="text"
              placeholder="Ex: Pizzaria, Encanador, Advogado..."
              className="w-full bg-transparent outline-none text-white placeholder-gray-400 font-medium text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black rounded-full px-8 h-12 md:h-14 shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center uppercase tracking-wider text-sm md:text-base"
          >
            BUSCAR
          </button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-400">
          <span>Populares:</span>
          {[
            { label: "🍕 Pizza", val: "pizza" },
            { label: "🔧 Mecânico", val: "mecanico" },
            { label: "💇‍♀️ Salão", val: "salao" },
            { label: "💊 Farmácia", val: "farmacia" },
          ].map((tag) => (
            <button
              key={tag.val}
              onClick={() => router.push(`/busca?q=${tag.val}`)}
              className="px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:border-tafanu-action hover:text-white cursor-pointer transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
