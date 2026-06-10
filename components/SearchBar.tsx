"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Mic } from "lucide-react"; // ⬅️ Mic adicionado aqui
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false); // ⬅️ Controle do microfone

  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent, voiceQuery?: string) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams(searchParams.toString());
    const finalQuery = voiceQuery || query;

    if (finalQuery) {
      params.set("q", finalQuery);
    } else {
      params.delete("q");
    }

    params.delete("page");
    router.push(`/busca?${params.toString()}`);
  };

  // 🎤 FUNÇÃO DO MICROFONE
  const handleVoiceSearch = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          "Seu navegador não suporta pesquisa por voz. Tente usar o Google Chrome.",
        );
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);

      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(undefined, transcript); // Pesquisa automaticamente!
      };

      recognition.start();
    }
  };

  return (
    <form
      onSubmit={(e) => handleSearch(e)}
      className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-2 group transition-all hover:bg-white hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] focus-within:ring-4 ring-emerald-500/20"
    >
      <div className="flex-1 flex items-center px-4 md:px-6 h-12 md:h-14">
        <Search className="text-slate-400 w-5 h-5 md:w-6 md:h-6 mr-3 shrink-0 group-focus-within:text-tafanu-action transition-colors" />
        <input
          id="search-input"
          name="searchQuery"
          autoComplete="search"
          type="text"
          placeholder={isListening ? "Ouvindo..." : "Buscar outro negócio..."}
          className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 font-bold text-sm md:text-lg truncate disabled:opacity-50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching || isListening}
        />
      </div>

      {/* 🎤 BOTÃO DE MICROFONE */}
      <button
        type="button"
        onClick={handleVoiceSearch}
        className={`p-2 mr-1 rounded-full transition-all ${
          isListening
            ? "bg-red-100 text-red-500 animate-pulse"
            : "text-slate-400 hover:text-tafanu-action hover:bg-slate-100"
        }`}
        title="Pesquisar por voz"
      >
        <Mic className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        type="submit"
        disabled={isSearching || query.trim() === ""}
        className="shrink-0 bg-tafanu-action hover:bg-emerald-400 text-[#0f172a] font-black rounded-full px-6 md:px-10 h-10 md:h-12 shadow-md transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center uppercase tracking-wider text-[11px] md:text-sm disabled:opacity-[0.3] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
      >
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
