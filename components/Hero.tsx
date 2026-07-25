"use client";

import { Search, Sparkles, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const POPULAR_TAGS = ["Mecânico", "Salão", "Pizzaria", "Barbearia", "Padaria"];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e?: React.FormEvent, tagQuery?: string) => {
    if (e) e.preventDefault();

    const finalQuery = tagQuery || query;
    // 🔒 TRAVA DE SEGURANÇA E PERFORMANCE (CFO/CTO): Aborta no milissegundo zero se estiver vazio!
    if (!finalQuery.trim()) return;

    setIsSearching(true);

    const params = new URLSearchParams();
    params.append("q", finalQuery.trim());

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

    // ⚡ CIRURGIA DE UX/PERFORMANCE: Tempo reduzido para 2.5s (evita travar a tela!)
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
          // Se falhou rápido, tenta uma única vez em alta precisão (máximo 3 segundos)
          if (error.code === error.TIMEOUT && !isRetry) {
            executeGpsFetch(true);
            return;
          }

          // Redireciona IMEDIATAMENTE sem travar o cliente olhando para um spinner
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
          timeout: isRetry ? 3000 : 2500, // 🚀 DE 12s/7s PARA 3s/2.5s!
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  return (
    // 🚀 MANTIDA A SUA ALTURA EXATA: min-h-[400px] lg:min-h-[440px] pt-6 pb-8 lg:py-6
    <section className="relative w-full min-h-[400px] lg:min-h-[440px] bg-gradient-to-br from-[#E6F9F0] via-white to-[#F0FDF4] overflow-hidden flex items-center border-b border-slate-200/60 pt-6 pb-8 lg:py-6">
      {/* Luz Esmeralda Principal */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-br from-emerald-400/25 to-teal-300/10 rounded-full blur-[90px] pointer-events-none" />

      {/* 📱 FOTO MOBILE VIBRANTE (lg:hidden) */}
      <div className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden">
        <Image
          src="/hero-bg.webp"
          alt="Fundo Urbano Mobile"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 1vw"
          className="object-cover object-center opacity-75 scale-105"
        />
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

      {/* =========================================================================
          💻 NOVO ALGORITMO DE FUSÃO NA DIREITA (Sem borda, w-[62%], máscara gradual)
          ========================================================================= */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[62%] z-10 pointer-events-none overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to left, black 65%, transparent 100%)",
          maskImage: "linear-gradient(to left, black 65%, transparent 100%)",
        }}
      >
        <Image
          src="/hero-bg.webp"
          alt="Centro Comercial Cidade e Serviços"
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 1vw"
          /* 🚀 CIRURGIA: Tiramos o scale-105 (zoom) e mudamos object-center para object-[center_25%] para descer a cabeça do rapaz! */
          className="object-cover object-[center_25%] scale-100 hover:scale-[1.02] transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/15 to-white" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
      </div>

      {/* =========================================================================
          🎯 LADO ESQUERDO: MANTIDAS SUAS FONTES, ALTURAS E ESPAÇAMENTOS EXATOS
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-20">
        <div className="w-full lg:w-[54%] xl:w-[51%] flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Sua Tag Topo Exata */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-emerald-200 text-tafanu-action text-[10px] font-black uppercase tracking-widest mb-3.5 shadow-sm backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse text-tafanu-action" />{" "}
            Guia comercial inteligente
          </div>

          {/* Seu Título Exato (3xl/4xl/5xl) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.06] mb-2.5 uppercase italic drop-shadow-sm">
            Tudo o que você busca, <br className="hidden sm:block" />
            <span className="text-tafanu-action drop-shadow-[0_0_25px_rgba(0,168,107,0.3)]">
              em um só lugar.
            </span>
          </h1>

          {/* Seu Subtítulo Exato */}
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-semibold leading-relaxed max-w-md mb-5 drop-shadow-2xs">
            Conectamos você aos melhores serviços e comércios de confiança da
            sua cidade em poucos segundos.
          </p>

          {/* BARRA DE PESQUISA COM DESTAQUE MÁXIMO (Branco puro + Sombra de Alta Elevação!) */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-lg h-14 sm:h-15 flex flex-row items-center gap-2 bg-white rounded-2xl px-3 py-1.5 border border-slate-200/80 focus-within:border-tafanu-action focus-within:ring-4 focus-within:ring-tafanu-action/15 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,168,107,0.18)] mb-5 relative z-30"
          >
            {/* Ícone de Busca Cinza (Esquerda) */}
            <Search className="text-slate-400 w-5 h-5 ml-1.5 shrink-0" />

            {/* Campo de Texto Limpo e com Fonte Bem Legível */}
            <input
              type="text"
              placeholder="Ex: Mecânico, Pizzaria, Moda..."
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-bold text-sm sm:text-base h-full"
              value={query}
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />

            {/* Botão de Pesquisar Compacto com Trava de Segurança */}
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="w-11 h-11 rounded-xl bg-tafanu-action text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:bg-emerald-600"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search className="w-5 h-5" strokeWidth={3} />
              )}
            </button>
          </form>

          {/* Suas Tags Rápidas Exatas */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 max-w-lg">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <TrendingUp size={12} className="text-tafanu-action" /> Populares:
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  setQuery(tag);
                  handleSearch(e, tag);
                }}
                className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 hover:border-tafanu-action hover:bg-emerald-50 text-slate-700 hover:text-tafanu-action text-[11px] font-bold transition-all shadow-2xs active:scale-95 backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
