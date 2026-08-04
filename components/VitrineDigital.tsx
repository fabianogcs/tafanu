"use client";

import {
  Sparkles,
  MapPin,
  Loader2,
  LayoutGrid,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Package,
  PawPrint,
  Briefcase,
  Stethoscope,
  Wrench,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";

// 🚀 AS 11 CATEGORIAS: Agora com ícones reais mapeados para ficar idêntico ao mockup premium!
const CATEGORIES_SHOWCASE = [
  {
    id: "Alimentacao",
    title: "Alimentação",
    subtitle: "Lanches & Pizzas",
    url: "/busca?category=Alimentacao",
    bgClass: "from-orange-500 to-orange-500", // Cores mais flat/sólidas estilo SaaS
    icon: Utensils,
  },
  {
    id: "Automotivo",
    title: "Automotivo",
    subtitle: "Oficinas & Peças",
    url: "/busca?category=Automotivo",
    bgClass: "from-slate-700 to-slate-800",
    icon: Car,
  },
  {
    id: "Beleza",
    title: "Beleza",
    subtitle: "Salões & Estética",
    url: "/busca?category=Beleza",
    bgClass: "from-rose-500 to-rose-500",
    icon: Sparkles,
  },
  {
    id: "Saude",
    title: "Saúde",
    subtitle: "Médicos & Clínicas",
    url: "/busca?category=Saude",
    bgClass: "from-emerald-500 to-emerald-500",
    icon: Stethoscope,
  },
  {
    id: "Educacao",
    title: "Educação",
    subtitle: "Cursos & Escolas",
    url: "/busca?category=Educacao",
    bgClass: "from-blue-500 to-blue-500",
    icon: GraduationCap,
  },
  {
    id: "Pets",
    title: "Pets",
    subtitle: "Clínicas & Banho",
    url: "/busca?category=Pets",
    bgClass: "from-purple-500 to-purple-500",
    icon: PawPrint,
  },
  {
    id: "Servicos",
    title: "Serv. Gerais",
    subtitle: "Reformas & Limpeza",
    url: "/busca?category=Servicos",
    bgClass: "from-amber-500 to-amber-500",
    icon: Wrench,
  },
  {
    id: "Eventos",
    title: "Eventos",
    subtitle: "Festas & Shows",
    url: "/busca?category=Eventos",
    bgClass: "from-fuchsia-500 to-fuchsia-500",
    icon: Calendar,
  },
  {
    id: "Comercio",
    title: "Comércio",
    subtitle: "Lojas & Varejo",
    url: "/busca?category=Comercio",
    bgClass: "from-indigo-500 to-indigo-500",
    icon: ShoppingBag,
  },
  {
    id: "Logistica",
    title: "Logística",
    subtitle: "Fretes & Entregas",
    url: "/busca?category=Logistica",
    bgClass: "from-sky-500 to-sky-500",
    icon: Package,
  },
  {
    id: "Profissionais",
    title: "Serv. Prof.",
    subtitle: "Advogados, T.I",
    url: "/busca?category=Profissionais",
    bgClass: "from-stone-600 to-stone-600",
    icon: Briefcase,
  },
];

export default function VitrineDigital() {
  const router = useRouter();
  const [userCity, setUserCity] = useState<string | null>(null);
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 5);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance((prev) => prev + Math.abs(e.movementX));
  };

  const handleMoodClick = async (
    e: React.MouseEvent,
    baseUrl: string,
    categoryId: string,
  ) => {
    e.preventDefault();

    // 🚀 Se o usuário arrastou o mouse, cancela o clique!
    if (dragDistance > 10) return;
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
          timeout: isRetry ? 3000 : 2500,
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  return (
    // 🚀 UX FIX: Espaçamento reduzido (pt-4 pb-6) para aproximar a seção da Hero
    <section className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 pt-4 pb-6 relative z-10 animate-in fade-in duration-700">
      {/* Estilo para matar a barra de rolagem */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* 🚀 CABEÇALHO DA SEÇÃO (Limpo, sem redundância) */}
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 mb-1">
            <LayoutGrid className="text-slate-700" size={24} />
            Navegue por categorias
          </h2>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">
            {userCity
              ? `Exibindo melhores resultados em ${userCity}`
              : "O que você busca hoje?"}
          </p>
        </div>
      </div>

      <div className="relative group/carousel">
        {/* Seta Esquerda */}
        <button
          onClick={() => scroll(-300)}
          className={`absolute left-[-20px] top-[50%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex ${!showLeft ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        {/* 🚀 CARROSSEL HORIZONTAL DE CATEGORIAS (DRAG TO SCROLL) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex flex-nowrap overflow-x-auto gap-3 md:gap-4 pb-4 pt-2 hide-scroll ${isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"}`}
        >
          {CATEGORIES_SHOWCASE.map((mood) => {
            const isLoadingThis = activeLoadingId === mood.id;
            const Icon = mood.icon;

            return (
              <button
                key={mood.id}
                onClick={(e) => handleMoodClick(e, mood.url, mood.id)}
                disabled={activeLoadingId !== null && !isLoadingThis}
                draggable={false}
                className="group flex flex-row items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 w-[200px] sm:w-[220px] shrink-0 snap-start text-left disabled:opacity-40 disabled:pointer-events-none"
              >
                {/* Ícone Redondo */}
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${mood.bgClass} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm`}
                >
                  {isLoadingThis ? (
                    <Loader2 size={20} className="animate-spin text-white" />
                  ) : (
                    <Icon size={20} strokeWidth={2.5} />
                  )}
                </div>

                {/* Textos */}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-slate-800 text-[13px] md:text-sm truncate group-hover:text-emerald-600 transition-colors">
                    {isLoadingThis ? "Abrindo..." : mood.title}
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold truncate">
                    {mood.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Seta Direita */}
        <button
          onClick={() => scroll(300)}
          className={`absolute right-[-20px] top-[50%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex ${!showRight ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
