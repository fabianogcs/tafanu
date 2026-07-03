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

// 🚀 IDS EXATAMENTE IGUAIS AO constants.tsx E AO BANCO DE DADOS
const CATEGORIES_DATA = [
  {
    id: "Alimentacao",
    title: "ALIMENTAÇÃO",
    desc: "Bares, restaurantes e lanches",
    icon: Utensils,
    bgGradient: "from-orange-100 to-amber-50",
    iconColor: "text-orange-500",
  },
  {
    id: "Beleza",
    title: "BELEZA",
    desc: "Cortes, estética e bem-estar",
    icon: Scissors,
    bgGradient: "from-rose-100 to-pink-50",
    iconColor: "text-rose-500",
  },
  {
    id: "Comercio",
    title: "COMÉRCIO",
    desc: "Lojas, mercados e varejo",
    icon: ShoppingBag,
    bgGradient: "from-emerald-100 to-teal-50",
    iconColor: "text-emerald-500",
  },
  {
    id: "Educacao",
    title: "EDUCAÇÃO",
    desc: "Cursos, escolas e aprendizado",
    icon: GraduationCap,
    bgGradient: "from-blue-100 to-cyan-50",
    iconColor: "text-blue-500",
  },
  {
    id: "Eventos",
    title: "EVENTOS",
    desc: "Festas, casamentos e shows",
    icon: PartyPopper,
    bgGradient: "from-indigo-100 to-purple-50",
    iconColor: "text-indigo-500",
  },
  {
    id: "Logistica",
    title: "LOGÍSTICA",
    desc: "Fretes, mudanças e entregas",
    icon: Truck,
    bgGradient: "from-yellow-100 to-amber-50",
    iconColor: "text-yellow-600",
  },
  {
    id: "Pets",
    title: "PETS",
    desc: "Pet shops, clínicas e banho",
    icon: Dog,
    bgGradient: "from-cyan-100 to-sky-50",
    iconColor: "text-cyan-500",
  },
  {
    id: "Profissionais",
    title: "PROFISSIONAIS",
    desc: "Advogados, arquitetos e mais",
    icon: Briefcase,
    bgGradient: "from-slate-200 to-slate-50",
    iconColor: "text-slate-600",
  },
  {
    id: "Saude",
    title: "SAÚDE",
    desc: "Clínicas, médicos e farmácias",
    icon: Heart,
    bgGradient: "from-red-100 to-rose-50",
    iconColor: "text-red-500",
  },
  {
    id: "Servicos",
    title: "SERVIÇOS",
    desc: "Manutenção, reformas e limpeza",
    icon: Wrench,
    bgGradient: "from-stone-200 to-zinc-50",
    iconColor: "text-stone-600",
  },
  {
    id: "Automotivo",
    title: "AUTOMOTIVO",
    desc: "Oficinas, estética e peças",
    icon: Car,
    bgGradient: "from-gray-200 to-slate-100",
    iconColor: "text-gray-600",
  },
];

interface CategoriesProps {
  activeCats?: string[];
}

export default function Categories({ activeCats = [] }: CategoriesProps) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  // 🚀 O CÉREBRO DA ORDENAÇÃO (Separa quem tem loja de quem não tem)
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
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [sortedCategories]);

  // ESTADOS PARA O ARRASTE DO MOUSE (DRAG TO SCROLL)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 120 : 230;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !scrollRef.current) return;

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }

    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 🚀 ATUALIZADO: Recebe a flag isActiveCat para saber se deve navegar ou ignorar
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
      e.preventDefault(); // Impede o clique nas inativas
      return;
    }
    setIsNavigating(catId);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 relative z-30 mt-16 mb-4 md:mb-6 animate-in fade-in duration-700 group">
      <div className="flex items-center justify-between mb-6 px-2 md:px-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-[#023059] uppercase tracking-tighter italic leading-none mb-1">
            Diretório <span className="text-emerald-500">Global</span>
          </h2>
          <p className="text-slate-400 font-medium text-[10px] md:text-sm">
            Navegue por todas as categorias da plataforma de forma organizada.
          </p>
        </div>
      </div>{" "}
      {showArrows && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Rolar para esquerda"
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
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-6 md:pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 md:px-4 overscroll-x-contain will-change-scroll transform-gpu ${
          showArrows ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        } ${isDragging ? "[&_*]:pointer-events-none" : ""}`}
      >
        {sortedCategories.map((cat) => {
          const isActiveCat = activeCats.includes(cat.id);
          const isLoading = isNavigating === cat.id && isActiveCat;
          const Icon = cat.icon;

          return (
            <div key={cat.id} className="shrink-0 relative">
              {isActiveCat ? (
                // 🟢 RENDERIZA COLORIDO SE ESTIVER ATIVO
                <Link
                  href={`/busca?category=${encodeURIComponent(cat.id)}`}
                  onClick={(e) => handleLinkClick(e, cat.id, isActiveCat)}
                  draggable={false}
                  className="flex flex-col items-center gap-2 group/card w-[72px] md:w-[90px] shrink-0 outline-none"
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center shadow-sm border border-white relative overflow-hidden`}
                  >
                    <Icon
                      className={`w-7 h-7 md:w-8 md:h-8 ${cat.iconColor} relative z-10`}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="h-8 flex items-start justify-center px-1">
                    {isLoading ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-emerald-500 mt-1"
                      />
                    ) : (
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center line-clamp-2 leading-[1.1] group-hover/card:text-emerald-600 transition-colors">
                        {cat.title}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                // ⚪ RENDERIZA PRETO E BRANCO "EM BREVE" SE ESTIVER VAZIO
                <div
                  onClick={(e) => handleLinkClick(e, cat.id, isActiveCat)}
                  className="flex flex-col items-center gap-2 group/card w-[72px] md:w-[90px] shrink-0 outline-none cursor-not-allowed opacity-75"
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center shadow-inner border border-slate-200 relative overflow-hidden`}
                  >
                    <Icon
                      className={`w-7 h-7 md:w-8 md:h-8 text-slate-300 relative z-10 grayscale`}
                      strokeWidth={2}
                    />

                    <div className="absolute -bottom-1 w-full flex justify-center z-20 pb-2">
                      <span className="bg-slate-800 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full shadow-lg border border-slate-700">
                        Breve
                      </span>
                    </div>
                  </div>

                  <div className="h-8 flex items-start justify-center px-1">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest text-center line-clamp-2 leading-[1.1]">
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
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Rolar para direita"
        >
          <ChevronRight strokeWidth={3} size={20} />
        </button>
      )}
    </section>
  );
}
