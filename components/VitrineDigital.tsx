"use client";

import { ArrowRight, Sparkles, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// 🚀 AS 11 CATEGORIAS: Cores preservadas para atuar como ACENTO DE LUXO no botão de ação!
const CATEGORIES_SHOWCASE = [
  {
    id: "Alimentacao",
    title: "Alimentação",
    subtitle: "Lanches & Pizzas",
    url: "/busca?category=Alimentacao",
    bgClass: "from-orange-500 to-amber-600",
    shadowClass: "shadow-orange-500/20",
  },
  {
    id: "Automotivo",
    title: "Automotivo",
    subtitle: "Oficinas & Peças",
    url: "/busca?category=Automotivo",
    bgClass: "from-slate-700 to-slate-900",
    shadowClass: "shadow-slate-700/20",
  },
  {
    id: "Beleza",
    title: "Beleza",
    subtitle: "Salões & Estética",
    url: "/busca?category=Beleza",
    bgClass: "from-rose-500 to-pink-600",
    shadowClass: "shadow-rose-500/20",
  },
  {
    id: "Comercio",
    title: "Comércio",
    subtitle: "Lojas & Varejo",
    url: "/busca?category=Comercio",
    bgClass: "from-indigo-600 to-purple-700",
    shadowClass: "shadow-indigo-500/20",
  },
  {
    id: "Educacao",
    title: "Educação",
    subtitle: "Cursos & Escolas",
    url: "/busca?category=Educacao",
    bgClass: "from-blue-600 to-cyan-600",
    shadowClass: "shadow-blue-500/20",
  },
  {
    id: "Eventos",
    title: "Eventos",
    subtitle: "Festas & Shows",
    url: "/busca?category=Eventos",
    bgClass: "from-fuchsia-600 to-purple-600",
    shadowClass: "shadow-fuchsia-500/20",
  },
  {
    id: "Logistica",
    title: "Logística",
    subtitle: "Fretes & Entregas",
    url: "/busca?category=Logistica",
    bgClass: "from-amber-500 to-orange-600",
    shadowClass: "shadow-amber-500/20",
  },
  {
    id: "Pets",
    title: "Pets",
    subtitle: "Clínicas & Banho",
    url: "/busca?category=Pets",
    bgClass: "from-emerald-500 to-teal-700",
    shadowClass: "shadow-emerald-500/20",
  },
  {
    id: "Profissionais",
    title: "Serv. Prof.",
    subtitle: "Advogados, T.I",
    url: "/busca?category=Profissionais",
    bgClass: "from-stone-600 to-zinc-800",
    shadowClass: "shadow-stone-600/20",
  },
  {
    id: "Saude",
    title: "Saúde",
    subtitle: "Médicos & Clínicas",
    url: "/busca?category=Saude",
    bgClass: "from-red-600 to-rose-700",
    shadowClass: "shadow-red-600/20",
  },
  {
    id: "Servicos",
    title: "Serv. Gerais",
    subtitle: "Reformas & Limpeza",
    url: "/busca?category=Servicos",
    bgClass: "from-sky-500 to-blue-600",
    shadowClass: "shadow-sky-500/20",
  },
];

export default function VitrineDigital() {
  const router = useRouter();
  const [userCity, setUserCity] = useState<string | null>(null);
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { city, timestamp } = JSON.parse(cachedCoords);
        const tempoPassado = Date.now() - (timestamp || 0);
        if (city && tempoPassado < 3 * 60 * 60 * 1000) setUserCity(city);
      }
    } catch (err) {}
  }, []);

  const handleMoodClick = async (
    e: React.MouseEvent,
    baseUrl: string,
    categoryId: string,
  ) => {
    e.preventDefault();
    if (activeLoadingId) return;

    const cachedCoords = localStorage.getItem("tafanu_user_coords");

    if (cachedCoords) {
      try {
        const { lat, lng, timestamp } = JSON.parse(cachedCoords);
        const tempoPassado = Date.now() - (timestamp || 0);
        if (lat && lng && tempoPassado < 3 * 60 * 60 * 1000) {
          router.push(
            `${baseUrl}&lat=${lat}&lng=${lng}&sort=distance&status=open&page=1`,
          );
          return;
        }
      } catch (err) {}
    }

    if (!navigator.geolocation) {
      router.push(baseUrl);
      return;
    }

    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          router.push(baseUrl);
          return;
        }
      } catch (e) {}
    }

    setActiveLoadingId(categoryId);

    // ⚡ CIRURGIA DE VELOCIDADE: GPS agora tem limite de 2.5s para não travar a tela!
    const executeGpsFetch = (isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let foundCity = null;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            if (res.ok) {
              const data = await res.json();
              const bairro =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.city_district;
              const cidade =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                "";

              foundCity = bairro ? `${bairro}, ${cidade}` : cidade || null;
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

          setActiveLoadingId(null);
          router.push(
            `${baseUrl}&lat=${latitude}&lng=${longitude}&sort=distance&status=open&page=1`,
          );
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            executeGpsFetch(true);
            return;
          }

          setActiveLoadingId(null);
          router.push(baseUrl);

          if (error.code === error.PERMISSION_DENIED) {
            toast.warning("Busca ampla ativada", {
              description:
                "Como o GPS está bloqueado, exibiremos resultados gerais.",
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
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-8 md:pb-12 relative z-10 -mt-2 sm:-mt-4">
      <div className="mb-6 md:mb-8 text-center flex flex-col items-center animate-in fade-in duration-500">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="bg-emerald-50 border border-emerald-100 text-tafanu-action p-1 rounded-lg shadow-2xs">
            {userCity ? (
              <MapPin size={12} strokeWidth={2.5} />
            ) : (
              <Sparkles size={12} strokeWidth={2.5} />
            )}
          </span>
          <span className="text-tafanu-action font-black text-[10px] uppercase tracking-[0.25em]">
            {userCity ? "Aberto Perto de Você" : "Categorias Oficiais"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight">
          {userCity ? (
            <>
              Opções em{" "}
              <span className="text-tafanu-action truncate">{userCity}</span>
            </>
          ) : (
            <>
              O Que Você <span className="text-tafanu-action">Busca Hoje?</span>
            </>
          )}
        </h2>
      </div>

      {/* 🚀 GRID PREMIUM: Layout preservado em 5 colunas no desktop com respiro perfeito */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-3.5">
        {CATEGORIES_SHOWCASE.map((mood) => {
          const isLoadingThis = activeLoadingId === mood.id;

          return (
            // 🎨 CIRURGIA DE LUXO: Fundo branco, borda suave, sombra elegante e hover esmeralda
            <button
              key={mood.id}
              onClick={(e) => handleMoodClick(e, mood.url, mood.id)}
              disabled={activeLoadingId !== null && !isLoadingThis}
              className="group relative overflow-hidden rounded-[1.2rem] md:rounded-[1.4rem] px-4 py-3.5 md:px-5 md:py-4 flex items-center justify-between min-h-[76px] sm:min-h-[84px] bg-white border border-slate-200/80 hover:border-tafanu-action/50 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left w-full disabled:opacity-40 disabled:pointer-events-none"
            >
              {/* Efeito sutil de brilho esmeralda no fundo ao passar o mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* LADO ESQUERDO: Título Escuro e Subtítulo Cinza */}
              <div className="relative z-10 flex flex-col justify-center pr-2 min-w-0">
                <h3 className="text-slate-800 group-hover:text-tafanu-action transition-colors font-black text-sm sm:text-base md:text-lg uppercase tracking-tight leading-tight mb-0.5 truncate">
                  {isLoadingThis ? "Abrindo..." : mood.title}
                </h3>
                <p className="text-slate-500 font-bold text-[11px] sm:text-xs tracking-wider truncate">
                  {isLoadingThis ? "Buscando..." : mood.subtitle}
                </p>
              </div>

              {/* LADO DIREITO: O Acento Colorido Exclusivo de Cada Categoria! */}
              <div className="relative z-10 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${mood.bgClass} flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:${mood.shadowClass} transition-all duration-300`}
                >
                  {isLoadingThis ? (
                    <Loader2 size={14} className="animate-spin text-white" />
                  ) : (
                    <ArrowRight
                      size={15}
                      strokeWidth={2.5}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
