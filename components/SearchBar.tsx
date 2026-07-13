"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Mic } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

    // 🚀 FASE 3: PERSISTÊNCIA INVISÍVEL (O CONCIERGE)
    // Se o usuário tem o GPS salvo e NÃO está explorando outra cidade ativamente,
    // nós injetamos o GPS para ele cair direto na zona de calor!
    const isExploreMode = params.has("city") || params.has("state");

    if (!isExploreMode) {
      try {
        const cachedCoords = localStorage.getItem("tafanu_user_coords");
        if (cachedCoords) {
          const { lat, lng } = JSON.parse(cachedCoords);
          if (!params.has("lat") && lat) params.set("lat", lat);
          if (!params.has("lng") && lng) params.set("lng", lng);
        }
      } catch (err) {
        // Ignora silenciosamente se o cache estiver corrompido
      }
    }

    router.push(`/busca?${params.toString()}`);
  };

  // 🎤 FUNÇÃO DO MICROFONE (BLINDADA)
  const handleVoiceSearch = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast.error("Navegador incompatível", {
          description:
            "Pesquisa por voz não suportada. Tente usar o Chrome ou Safari.",
        });
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          handleSearch(undefined, transcript);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === "not-allowed") {
            toast.error("Microfone Bloqueado", {
              description:
                "Clique no ícone de cadeado ao lado da URL e permita o uso do microfone.",
              duration: 8000,
            });
          } else {
            toast.warning("Erro no microfone", {
              description: `Falha técnica (${event.error}). Tente novamente.`,
            });
          }
        };

        recognition.start();
      } catch (err) {
        console.error("Erro ao iniciar o microfone:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <>
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
            maxLength={80} // 🚀 BLINDAGEM: UX e Segurança (Protege contra URL muito longa)
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
          className="shrink-0 bg-tafanu-action hover:bg-emerald-400 text-[#0f172a] font-black rounded-full px-6 md:px-10 h-10 md:h-12 shadow-md transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center uppercase tracking-wider text-[11px] md:text-sm disabled:!bg-slate-200 disabled:!text-slate-400 disabled:!shadow-none disabled:!opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
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

      {/* 🚀 MODAL MOVIDO PARA FORA DO FORMULÁRIO */}
      {isListening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
              <Mic className="w-10 h-10 text-rose-500 relative z-10 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic mb-2">
              Ouvindo...
            </h3>
            <p className="text-slate-500 text-sm font-medium text-center mb-6">
              Fale o que você está procurando.
            </p>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
