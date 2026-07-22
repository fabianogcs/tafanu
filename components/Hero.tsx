"use client";

import { Search, Mic, Sparkles, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const POPULAR_TAGS = ["Restaurante", "Mecânico", "Salão", "Academia"];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSearch = (
    e?: React.FormEvent,
    voiceQuery?: string,
    tagQuery?: string,
  ) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    const finalQuery = tagQuery || voiceQuery || query;
    if (finalQuery.trim() !== "") params.append("q", finalQuery);

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
            executeGpsFetch(true);
            return;
          }

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
          timeout: isRetry ? 12000 : 7000,
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
        recognition.onerror = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <section className="relative w-full min-h-[400px] lg:min-h-[440px] bg-gradient-to-br from-[#E6F9F0] via-white to-[#F0FDF4] overflow-hidden flex items-center border-b border-slate-200/60 pt-6 pb-8 lg:py-6">
      {/* Luz Esmeralda Principal */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-br from-emerald-400/25 to-teal-300/10 rounded-full blur-[90px] pointer-events-none" />

      {/* =========================================================================
          📱 CIRURGIA MOBILE: FOTO VIVA, VIBRANTE E COM CORES REAIS (lg:hidden)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden">
        {/* Opacidade subida para 75% para as cores da cidade brilharem de verdade! */}
        <Image
          src="/hero-bg.webp"
          alt="Fundo Urbano Mobile"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75 scale-105"
        />
        {/* Gradiente Inteligente: Deixa o topo mais livre para ver a arquitetura,
            e cria uma base limpa embaixo apenas onde o texto e a barra precisam de leitura! */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/85 to-[#F8FAFC]" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-transparent to-teal-500/10" />
      </div>

      {/* Onda Abstrata Esquerda */}
      <div className="absolute bottom-0 left-0 w-full lg:w-[60%] h-full pointer-events-none overflow-hidden opacity-40">
        <svg
          className="absolute bottom-0 left-0 w-full h-[80%]"
          viewBox="0 0 1000 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,600 C200,500 350,300 200,100 C100,0 400,0 500,200 C600,400 800,550 1000,450 L1000,600 L0,600 Z"
            fill="url(#wave-grad)"
          />
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Padrão de Pontos Digitais no Fundo */}
      <div
        className="absolute top-6 left-8 w-56 h-48 opacity-25 pointer-events-none hidden md:block"
        style={{
          backgroundImage: "radial-gradient(#10b981 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* LADO DIREITO DESKTOP: IMAGEM CURVA */}
      <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[48%] xl:w-[50%] z-10 pointer-events-none">
        <div className="w-full h-full relative rounded-l-[140px] xl:rounded-l-[180px] overflow-hidden border-l-[6px] border-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] bg-slate-900">
          <Image
            src="/hero-bg.webp"
            alt="Centro Comercial Cidade e Serviços"
            fill
            priority
            sizes="50vw"
            className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-transparent" />
        </div>
      </div>

      {/* LADO ESQUERDO: CONTEÚDO E PESQUISA COMPACTOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-20">
        <div className="w-full lg:w-[54%] xl:w-[51%] flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Tag Topo */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-emerald-200 text-tafanu-action text-[10px] font-black uppercase tracking-widest mb-3.5 shadow-sm backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse text-tafanu-action" />{" "}
            Guia comercial inteligente
          </div>

          {/* Título Principal Compacto */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.06] mb-2.5 uppercase italic drop-shadow-sm">
            Tudo o que você busca, <br className="hidden sm:block" />
            <span className="text-tafanu-action drop-shadow-[0_0_25px_rgba(0,168,107,0.3)]">
              em um só lugar.
            </span>
          </h1>

          {/* Subtítulo com Constraste Reforçado para Leitura Perfeita no Celular */}
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-semibold leading-relaxed max-w-md mb-5 drop-shadow-2xs">
            Conectamos você aos melhores serviços e comércios de confiança da
            sua cidade em poucos segundos.
          </p>

          {/* BARRA DE PESQUISA COMPACTA E COM BRILHO */}
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl shadow-[0_15px_35px_rgba(0,168,107,0.1)] border border-emerald-100/80 mb-4 relative z-30">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 h-11 sm:h-12 bg-slate-50/90 rounded-xl flex items-center px-3.5 border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-tafanu-action/20 transition-all">
                <Search className="text-slate-400 w-4 h-4 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isListening
                      ? "Ouvindo..."
                      : "Ex: Mecânico, Pizzaria, Moda..."
                  }
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-bold text-xs sm:text-sm h-full"
                  value={query}
                  maxLength={80}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching || isListening}
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-lg transition-all ${isListening ? "bg-red-100 text-red-500 animate-pulse" : "text-slate-400 hover:text-tafanu-action hover:bg-white"}`}
                  title="Pesquisar por voz"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* 🚀 BOTÃO SEMPRE VERDE, VIBRANTE E ATIVO! Fim do bloco cinza desativado! */}
              <button
                type="submit"
                disabled={isSearching}
                className="h-11 sm:h-12 bg-tafanu-action hover:bg-[#00c27a] text-white font-black rounded-xl px-6 flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-[0_4px_15px_rgba(0,168,107,0.35)] transition-all hover:scale-[1.02] active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Pesquisar"
                )}
              </button>
            </form>
          </div>

          {/* TAGS RÁPIDAS (4 PALAVRAS) */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 max-w-lg">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <TrendingUp size={12} className="text-tafanu-action" /> Populares:
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  setQuery(tag);
                  handleSearch(e, undefined, tag);
                }}
                className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 hover:border-tafanu-action hover:bg-emerald-50 text-slate-700 hover:text-tafanu-action text-[11px] font-bold transition-all shadow-2xs active:scale-95 backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Voz */}
      {isListening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
              <Mic className="w-6 h-6 text-rose-500 relative z-10 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-slate-800 uppercase italic mb-1">
              Ouvindo...
            </h3>
            <p className="text-slate-500 text-xs font-medium text-center mb-5">
              Fale o que você está procurando (ex: "Mecânico").
            </p>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              className="px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
