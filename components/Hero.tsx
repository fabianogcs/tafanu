"use client";

import {
  Search,
  Sparkles,
  Loader2,
  Store,
  LayoutGrid,
  MapPin,
  Star,
  Smile,
  ShieldCheck, // 🚀 Importado para o card flutuante!
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

// 🚀 Atualizado com os textos do mockup!
const POPULAR_TAGS = [
  "Mecânico",
  "Pizzaria",
  "Salão de Beleza",
  "Dentista",
  "Academia",
  "Delivery",
];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e?: React.FormEvent, tagQuery?: string) => {
    if (e) e.preventDefault();

    const finalQuery = tagQuery || query;
    // 🔒 TRAVA DE SEGURANÇA E PERFORMANCE (CFO/CTO): Exige no mínimo 2 letras!
    if (finalQuery.trim().length < 2) {
      if (finalQuery.trim().length === 1) {
        toast.info("Pesquisa muito curta", {
          description:
            "Digite pelo menos 2 letras para encontrar o que procura.",
        });
      }
      return;
    }

    setIsSearching(true);

    const params = new URLSearchParams();
    params.append("q", finalQuery.trim());

    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { lat, lng, timestamp } = JSON.parse(cachedCoords);
        const tempoPassado = Date.now() - (timestamp || 0);
        const TRES_HORAS = 3 * 60 * 60 * 1000;

        if (lat && lng && tempoPassado < TRES_HORAS) {
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
            JSON.stringify({
              lat: latitude,
              lng: longitude,
              city: foundCity,
              timestamp: Date.now(),
            }),
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
    // 🚀 UX FIX: Reduzimos o padding no mobile (pt-10 pb-8) para subir o conteúdo e não colidir com a navbar!
    <section className="relative w-full min-h-[auto] lg:min-h-[640px] bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0FDF4] overflow-hidden flex items-center border-b border-slate-200/60 pt-10 pb-8 lg:pt-24 lg:pb-20">
      {/* Luz Esmeralda Suave no Topo (Elegância no Mobile e Desktop) */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Padrão de Pontos Digitais Sutil */}
      <div
        className="absolute bottom-10 left-10 w-64 h-64 opacity-[0.03] pointer-events-none hidden lg:block"
        style={{
          backgroundImage: "radial-gradient(#000000 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* =========================================================================
          💻 NOVO ALGORITMO DE FUSÃO NA DIREITA (Cores vivas e máscara ajustada)
          ========================================================================= */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[60%] xl:w-[55%] z-10 pointer-events-none overflow-hidden"
        style={{
          // 🚀 FIX: O "black 80%" garante que a foto e os cards fiquem 100% sólidos.
          // O esfumaçado só acontece nos últimos 20% da esquerda!
          WebkitMaskImage:
            "linear-gradient(to left, black 80%, transparent 100%)",
          maskImage: "linear-gradient(to left, black 80%, transparent 100%)",
        }}
      >
        <Image
          src="/hero-bg.webp"
          alt="Centro Comercial Cidade e Serviços"
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 1vw"
          className="object-cover object-[center_35%] scale-100 hover:scale-[1.01] transition-transform duration-1000 ease-out"
        />
        {/* Removemos a div branca por cima para as cores originais da sua foto brilharem! */}
      </div>

      {/* =========================================================================
          🎯 LADO ESQUERDO: LARGURA OTIMIZADA (Para o texto começar na margem correta)
          ========================================================================= */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 w-full relative z-20 flex">
        {/* BLOCO DE TEXTO E BUSCA */}
        <div className="w-full lg:w-[62%] flex flex-col items-start text-left">
          {/* Tag Topo */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles size={12} className="text-emerald-500" /> A Vitrine
            Digital da sua cidade
          </div>

          {/* Título SaaS Mockup 3 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
            Encontre os melhores <br className="hidden sm:block" />
            negócios <span className="text-emerald-600">perto de você</span>
          </h1>

          {/* Subtítulo Clean */}
          <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed max-w-lg mb-6 md:mb-8 pr-4">
            Descubra empresas verificadas, avaliações reais e os melhores
            serviços da sua região em segundos.
          </p>

          {/* BARRA DE PESQUISA */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl h-14 md:h-16 flex flex-row items-center gap-2 bg-white rounded-2xl md:rounded-[2rem] pl-4 md:pl-6 pr-2 py-2 border border-slate-200/80 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all duration-300 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] mb-5 relative z-30"
          >
            <Search className="text-slate-400 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Ex: Mecânico, Pizzaria, Salão, Dentista..."
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-medium text-sm md:text-base h-full"
              value={query}
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="h-full px-5 md:px-8 rounded-xl md:rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:block">Buscar</span>
                  <Search className="w-4 h-4 sm:hidden" />
                </>
              )}
            </button>
          </form>

          {/* Tags Populares Clean (Ocultas em telas muito pequenas para poupar espaço) */}
          <div className="hidden sm:flex flex-wrap items-center justify-start gap-2 max-w-2xl">
            <span className="text-[11px] font-bold text-slate-800 mr-1">
              Buscas populares:
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  setQuery(tag);
                  handleSearch(e, tag);
                }}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-600 text-[11px] font-medium transition-all shadow-sm active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* =========================================================================
              🚀 NOVA BARRA DE ESTATÍSTICAS (Apertada no Mobile para caber certinho!)
              ========================================================================= */}
          <div className="mt-6 md:mt-10 lg:mt-12 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 md:px-8 md:py-6 grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-y-4 gap-x-2 w-full max-w-3xl relative z-30">
            {/* Bloco 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm md:text-base font-black text-slate-800 leading-none mb-1">
                  1.100+
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Empresas
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-100"></div>

            {/* Bloco 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0">
                <LayoutGrid
                  className="w-5 h-5 text-emerald-600"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm md:text-base font-black text-slate-800 leading-none mb-1">
                  48
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Categorias
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-100"></div>

            {/* Bloco 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm md:text-base font-black text-slate-800 leading-none mb-1">
                  300+
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Avaliações
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-100"></div>

            {/* Bloco 4 */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0">
                <Smile className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm md:text-base font-black text-slate-800 leading-none mb-1">
                  98%
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Satisfação
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
