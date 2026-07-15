"use client";

import {
  Search,
  ChevronDown,
  Loader2,
  Mic,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // 🚀 BUSCA RÁPIDA (Só GPS, botão de baixo)
  const handleQuickGpsSearch = () => {
    if (!navigator.geolocation) {
      toast.error("Seu dispositivo não suporta GPS.");
      return;
    }
    setIsGpsLoading(true);

    const executeGpsFetch = (isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const params = new URLSearchParams();
          params.set("lat", latitude.toString());
          params.set("lng", longitude.toString());
          params.set("sort", "distance");
          params.set("status", "open");
          params.set("page", "1");
          let foundCity = null;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            if (res.ok) {
              const data = await res.json();
              foundCity =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                null;
            }
          } catch (e) {}
          localStorage.setItem(
            "tafanu_user_coords",
            JSON.stringify({ lat: latitude, lng: longitude, city: foundCity }),
          );
          router.push(`/busca?${params.toString()}`);
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            console.log(
              "GPS Cold Start detectado. Tentando rota alternativa...",
            );
            executeGpsFetch(true);
            return;
          }

          setIsGpsLoading(false);

          if (error.code === error.PERMISSION_DENIED) {
            toast.error("GPS Bloqueado", {
              description:
                "Permita o acesso à localização nas configurações do aparelho.",
            });
          } else if (error.code === error.TIMEOUT) {
            toast.info("Sinal de GPS fraco", {
              description:
                "Não conseguimos achar os satélites a tempo. Tente novamente em local aberto ou via Wi-Fi.",
            });
          } else {
            toast.error("Sinal indisponível", {
              description: "Não foi possível obter sua localização no momento.",
            });
          }
        },
        {
          enableHighAccuracy: isRetry,
          timeout: isRetry ? 15000 : 10000,
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  // 🚀 BUSCA TEXTUAL PRINCIPAL (Agora captura GPS junto se possível)
  const handleSearch = (e?: React.FormEvent, voiceQuery?: string) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    const finalQuery = voiceQuery || query;
    if (finalQuery.trim() !== "") params.append("q", finalQuery);

    // 1. Tem cache salvo de até 5 minutos? Injeta e vai na hora!
    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { lat, lng } = JSON.parse(cachedCoords);
        if (lat && lng) {
          params.set("lat", lat);
          params.set("lng", lng);
          params.set("sort", "distance");
          router.push(`/busca?${params.toString()}`);
          return;
        }
      }
    } catch (err) {}

    // 2. Não tem cache? Pede o GPS silenciosamente com Auto-Retry!
    if (!navigator.geolocation) {
      router.push(`/busca?${params.toString()}`);
      return;
    }

    const executeGpsFetch = (isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          params.set("lat", latitude.toString());
          params.set("lng", longitude.toString());
          params.set("sort", "distance");

          let foundCity = null;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            if (res.ok) {
              const data = await res.json();
              foundCity =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                null;
            }
          } catch (e) {}

          localStorage.setItem(
            "tafanu_user_coords",
            JSON.stringify({ lat: latitude, lng: longitude, city: foundCity }),
          );

          router.push(`/busca?${params.toString()}`);
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            console.log("Cold start na busca textual. Retentando...");
            executeGpsFetch(true);
            return;
          }

          // Se negar ou falhar, joga para a busca normal (fallback suave)
          router.push(`/busca?${params.toString()}`);

          if (error.code === error.PERMISSION_DENIED) {
            toast.warning("Buscando em todo o diretório", {
              description:
                "Para achar resultados mais próximos, permita o uso do GPS.",
            });
          }
        },
        {
          enableHighAccuracy: isRetry,
          timeout: isRetry ? 12000 : 7000, // 7s na primeira, pra não frustrar a espera do usuário
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Navegador incompatível", {
          description: "Pesquisa por voz não suportada.",
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
        };
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[#F8FAFC] overflow-hidden flex flex-col justify-start md:justify-center pt-10 md:pt-20 pb-12 md:pb-16 border-b border-slate-200">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/hero-bg.webp"
          alt="Fundo Tafanu"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-emerald-50/70 to-white/95"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center mt-2 md:mt-0 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-tafanu-action text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 animate-in fade-in duration-500 shadow-sm">
          <Sparkles size={12} className="animate-pulse" /> O seu guia comercial
          inteligente
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] md:leading-[1] mb-3 md:mb-5 uppercase italic animate-in fade-in zoom-in duration-700 delay-100">
          Tudo o que você busca, <br className="hidden sm:block" />
          <span className="text-tafanu-action drop-shadow-[0_0_20px_rgba(0,168,107,0.2)]">
            em um só lugar.
          </span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-6 md:mb-10 font-medium leading-relaxed animate-in fade-in duration-700 delay-200 px-2">
          Conectamos você aos melhores serviços, comércios e profissionais de
          confiança da sua cidade.
        </p>

        <div className="relative z-30 w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex flex-col md:flex-row gap-2.5 md:gap-3.5"
          >
            <div className="w-full h-12 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center px-3.5 focus-within:ring-4 focus-within:ring-tafanu-action/20 transition-all shadow-inner border border-slate-200">
              <Search className="text-slate-400 w-4 h-4 md:w-5 md:h-5 mr-2.5 shrink-0" />
              <input
                id="hero-search"
                type="text"
                placeholder={
                  isListening ? "Ouvindo..." : "Ex: Mecânico, Pizzaria, Moda..."
                }
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-bold text-xs sm:text-sm md:text-base h-full"
                value={query}
                maxLength={80}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching || isListening}
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-lg transition-all ${isListening ? "bg-red-100 text-red-500 animate-pulse" : "text-slate-400 hover:text-tafanu-action hover:bg-slate-50"}`}
                title="Pesquisar por voz"
              >
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto h-12 md:h-14 bg-tafanu-action hover:bg-[#00c27a] text-white font-black rounded-xl md:rounded-2xl px-8 flex items-center justify-center gap-2 uppercase tracking-wider text-xs md:text-sm shadow-[0_4px_20px_rgba(0,168,107,0.3)] transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Pesquisar"
              )}
            </button>
          </form>

          <div className="my-4 md:my-5 flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest font-black">
              Ou explore por proximidade
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <button
            onClick={handleQuickGpsSearch}
            disabled={isGpsLoading}
            className="w-full h-12 md:h-13 flex items-center justify-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-tafanu-action/30 text-slate-700 px-5 rounded-xl md:rounded-2xl transition-all text-xs sm:text-sm font-bold uppercase tracking-wider group disabled:opacity-50 active:scale-95"
          >
            {isGpsLoading ? (
              <Loader2
                size={16}
                className="animate-spin text-tafanu-action shrink-0"
              />
            ) : (
              <MapPin
                size={16}
                className="text-tafanu-action group-hover:animate-bounce shrink-0"
              />
            )}
            <span className="truncate">Ver abertos perto de mim</span>
          </button>
        </div>

        <div className="mt-8 md:mt-12 flex justify-center animate-bounce">
          <button
            onClick={handleScrollDown}
            type="button"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 hover:border-tafanu-action hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 text-tafanu-action" />
          </button>
        </div>
      </div>

      {isListening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
              <Mic className="w-8 h-8 text-rose-500 relative z-10 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase italic mb-1">
              Ouvindo...
            </h3>
            <p className="text-slate-500 text-xs font-medium text-center mb-6">
              Fale o que você está procurando (ex: "Mecânico").
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
    </section>
  );
}
