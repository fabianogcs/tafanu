"use client";

import { ArrowRight, Sparkles, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// 🚀 LISTA LIMPA: Foco 100% em Tipografia e Cor
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
        const { city } = JSON.parse(cachedCoords);
        if (city) setUserCity(city);
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
        const { lat, lng } = JSON.parse(cachedCoords);
        router.push(
          `${baseUrl}&lat=${lat}&lng=${lng}&sort=distance&status=open&page=1`,
        );
        return;
      } catch (err) {
        console.error("Erro ao ler cache de localização");
      }
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

    const executeGpsFetch = (isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
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
          timeout: isRetry ? 12000 : 7000,
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6 md:pb-8 relative z-10 -mt-3 sm:-mt-6">
      <div className="mb-4 md:mb-6 text-center flex flex-col items-center animate-in fade-in duration-500">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="bg-emerald-50 border border-emerald-100 text-tafanu-action p-1 rounded-lg shadow-2xs">
            {userCity ? (
              <MapPin size={12} strokeWidth={2.5} />
            ) : (
              <Sparkles size={12} strokeWidth={2.5} />
            )}
          </span>
          <span className="text-tafanu-action font-black text-[10px] uppercase tracking-[0.25em]">
            {userCity ? "Perto de Você" : "Categorias Oficiais"}
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

      {/* 🚀 GRID TIPOGRÁFICO: Mais limpo e focado no contraste */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-3.5">
        {CATEGORIES_SHOWCASE.map((mood) => {
          const isLoadingThis = activeLoadingId === mood.id;

          return (
            <button
              key={mood.id}
              onClick={(e) => handleMoodClick(e, mood.url, mood.id)}
              disabled={activeLoadingId !== null && !isLoadingThis}
              // Altura ajustada para h-24 sm:h-28 (como não há ícones, o card fica mais fino e elegante!)
              className={`group relative overflow-hidden rounded-[1.2rem] md:rounded-[1.4rem] p-4 flex flex-col justify-between h-24 sm:h-28 bg-gradient-to-br ${mood.bgClass} shadow-sm hover:shadow-xl hover:${mood.shadowClass} hover:-translate-y-1 transition-all duration-300 text-left w-full disabled:opacity-40 disabled:pointer-events-none border border-white/10`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              {/* 🚀 TOPO LIMPO: Apenas o indicador de seta ou o spinner alinhado à direita */}
              <div className="flex justify-end items-start w-full relative z-10">
                <div className="w-6 h-6 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300 shadow-2xs">
                  {isLoadingThis ? (
                    <Loader2
                      size={12}
                      className="animate-spin text-white group-hover:text-slate-900"
                    />
                  ) : (
                    <ArrowRight
                      size={12}
                      strokeWidth={2.5}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  )}
                </div>
              </div>

              {/* 🚀 RODAPÉ DO CARD: Foco total nas palavras */}
              <div className="relative z-10 mt-auto">
                <h3 className="text-white font-black text-xs sm:text-[13px] md:text-sm uppercase tracking-tight leading-tight drop-shadow-sm mb-0.5">
                  {isLoadingThis ? "Abrindo..." : mood.title}
                </h3>
                <p className="text-white/80 font-bold text-[9px] sm:text-[10px] tracking-wider truncate">
                  {isLoadingThis ? "Buscando GPS..." : mood.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
