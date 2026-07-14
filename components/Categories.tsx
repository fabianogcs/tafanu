"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Car,
  ShoppingBag,
  Utensils,
  Heart,
  Wrench,
  Briefcase,
  Scissors,
  GraduationCap,
  PartyPopper,
  Truck,
  Dog,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORIES_DATA = [
  {
    id: "Alimentacao",
    title: "ALIMENTAÇÃO",
    desc: "Bares, restaurantes",
    icon: Utensils,
    bgGradient: "from-orange-100 to-amber-50",
    iconColor: "text-orange-500",
  },
  {
    id: "Beleza",
    title: "BELEZA",
    desc: "Cortes, estética",
    icon: Scissors,
    bgGradient: "from-rose-100 to-pink-50",
    iconColor: "text-rose-500",
  },
  {
    id: "Comercio",
    title: "COMÉRCIO",
    desc: "Lojas, varejo",
    icon: ShoppingBag,
    bgGradient: "from-emerald-100 to-teal-50",
    iconColor: "text-emerald-500",
  },
  {
    id: "Educacao",
    title: "EDUCAÇÃO",
    desc: "Cursos, escolas",
    icon: GraduationCap,
    bgGradient: "from-blue-100 to-cyan-50",
    iconColor: "text-blue-500",
  },
  {
    id: "Eventos",
    title: "EVENTOS",
    desc: "Festas, shows",
    icon: PartyPopper,
    bgGradient: "from-indigo-100 to-purple-50",
    iconColor: "text-indigo-500",
  },
  {
    id: "Logistica",
    title: "LOGÍSTICA",
    desc: "Fretes, entregas",
    icon: Truck,
    bgGradient: "from-yellow-100 to-amber-50",
    iconColor: "text-yellow-600",
  },
  {
    id: "Pets",
    title: "PETS",
    desc: "Clínicas, banho",
    icon: Dog,
    bgGradient: "from-cyan-100 to-sky-50",
    iconColor: "text-cyan-500",
  },
  {
    id: "Profissionais",
    title: "PROFISSIONAIS",
    desc: "Advogados, T.I",
    icon: Briefcase,
    bgGradient: "from-slate-200 to-slate-50",
    iconColor: "text-slate-600",
  },
  {
    id: "Saude",
    title: "SAÚDE",
    desc: "Clínicas, farmácias",
    icon: Heart,
    bgGradient: "from-red-100 to-rose-50",
    iconColor: "text-red-500",
  },
  {
    id: "Servicos",
    title: "SERVIÇOS",
    desc: "Reformas, limpeza",
    icon: Wrench,
    bgGradient: "from-stone-200 to-zinc-50",
    iconColor: "text-stone-600",
  },
  {
    id: "Automotivo",
    title: "AUTOMOTIVO",
    desc: "Oficinas, estética",
    icon: Car,
    bgGradient: "from-gray-200 to-slate-100",
    iconColor: "text-gray-600",
  },
];

export default function Categories({
  activeCats = [],
}: {
  activeCats?: string[];
}) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const sortedCategories = useMemo(() => {
    const active = CATEGORIES_DATA.filter((cat) =>
      activeCats.includes(cat.id),
    ).sort((a, b) => a.title.localeCompare(b.title));
    const inactive = CATEGORIES_DATA.filter(
      (cat) => !activeCats.includes(cat.id),
    ).sort((a, b) => a.title.localeCompare(b.title));
    return [...active, ...inactive];
  }, [activeCats]);

  const checkScrollability = () => {
    if (scrollRef.current)
      setShowArrows(
        scrollRef.current.scrollWidth > scrollRef.current.clientWidth,
      );
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [sortedCategories]);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !scrollRef.current) return;
    const walk = (e.pageX - scrollRef.current.offsetLeft - startX) * 1.5;
    if (Math.abs(walk) > 5) setIsDragging(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleLinkClick = (
    e: React.MouseEvent,
    catId: string,
    isActiveCat: boolean,
  ) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    if (!isActiveCat) {
      e.preventDefault();
      return;
    }
    setIsNavigating(catId);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 relative z-30 mt-12 mb-2 animate-in fade-in duration-700 group">
      <div className="flex items-center justify-between mb-6 px-2 md:px-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none mb-1">
            Diretório <span className="text-tafanu-action">Global</span>
          </h2>
          <p className="text-slate-500 font-medium text-[10px] md:text-sm">
            Navegue por todas as categorias oficiais da plataforma.
          </p>
        </div>
      </div>

      {showArrows && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md border border-slate-100 text-slate-400 hover:text-tafanu-action transition-all"
        >
          <ChevronLeft strokeWidth={3} size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        onMouseDown={showArrows ? handleMouseDown : undefined}
        onMouseMove={showArrows ? handleMouseMove : undefined}
        onMouseLeave={showArrows ? () => setIsDragging(false) : undefined}
        onMouseUp={
          showArrows
            ? () => setTimeout(() => setIsDragging(false), 50)
            : undefined
        }
        className={`flex gap-3 md:gap-6 overflow-x-auto pb-4 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 overscroll-x-contain will-change-scroll ${showArrows ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "[&_*]:pointer-events-none" : ""}`}
      >
        {sortedCategories.map((cat) => {
          const isActiveCat = activeCats.includes(cat.id);
          const isLoading = isNavigating === cat.id && isActiveCat;
          const Icon = cat.icon;

          return (
            <div key={cat.id} className="shrink-0 relative">
              {isActiveCat ? (
                <Link
                  href={`/busca?category=${encodeURIComponent(cat.id)}`}
                  onClick={(e) => handleLinkClick(e, cat.id, isActiveCat)}
                  draggable={false}
                  className="flex flex-col items-center gap-2.5 group/card w-[72px] md:w-[90px] shrink-0 outline-none"
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center border border-white shadow-sm group-hover/card:shadow-md group-hover/card:-translate-y-1 transition-all duration-300`}
                  >
                    <Icon
                      className={`w-7 h-7 md:w-8 md:h-8 ${cat.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="h-8 flex items-start justify-center">
                    {isLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-tafanu-action"
                      />
                    ) : (
                      <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest text-center leading-tight group-hover/card:text-tafanu-action transition-colors">
                        {cat.title}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  onClick={(e) => handleLinkClick(e, cat.id, isActiveCat)}
                  className="flex flex-col items-center gap-2.5 w-[72px] md:w-[90px] shrink-0 outline-none cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-slate-50 flex items-center justify-center border border-slate-200 relative overflow-hidden">
                    <Icon
                      className="w-7 h-7 md:w-8 md:h-8 text-slate-400 grayscale"
                      strokeWidth={2}
                    />
                    <div className="absolute bottom-1 w-full flex justify-center z-20">
                      <span className="bg-slate-800 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-sm">
                        Breve
                      </span>
                    </div>
                  </div>
                  <div className="h-8 flex items-start justify-center">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">
                      {cat.title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md border border-slate-100 text-slate-400 hover:text-tafanu-action transition-all"
        >
          <ChevronRight strokeWidth={3} size={20} />
        </button>
      )}
    </section>
  );
}
