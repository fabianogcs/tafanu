"use client";

import { useState, useRef, useEffect } from "react";
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
  const [showArrows, setShowArrows] = useState(false); // 🚀 Novo estado para as setas

  // 🚀 Lógica que calcula se precisa de setas
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
  }, []);

  // 🚀 ESTADOS PARA O ARRASTE DO MOUSE (DRAG TO SCROLL)
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

  // 🚀 LÓGICA DE ARRASTE (MOUSE DRAG)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !scrollRef.current) return; // Só ativa se o botão esquerdo estiver pressionado

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidade do arraste

    if (Math.abs(walk) > 5) {
      setIsDragging(true); // Se moveu mais de 5px, entende que é um arraste e não um clique
    }

    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleLinkClick = (e: React.MouseEvent, catId: string) => {
    if (isDragging) {
      e.preventDefault(); // Impede de abrir a página se o usuário estava apenas arrastando
      return;
    }
    setIsNavigating(catId);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 relative z-30 -mt-[220px] md:-mt-[280px] lg:-mt-[320px] mb-16 md:mb-24 animate-in fade-in duration-700 delay-500 group">
      {showArrows && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft strokeWidth={3} size={20} />
        </button>
      )}

      {/* 🚀 CIRURGIA DE SCROLL: Eventos e Cursor Condicionais + Aceleração de GPU */}
      <div
        ref={scrollRef}
        // Só liga o motor de arraste se realmente tiver conteúdo escondido
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
        {CATEGORIES_DATA.map((cat) => {
          const isLoading = isNavigating === cat.id;
          const Icon = cat.icon;

          return (
            <div key={cat.id} className="shrink-0">
              <Link
                href={`/busca?category=${encodeURIComponent(cat.id)}`}
                onClick={(e) => handleLinkClick(e, cat.id)}
                draggable={false}
                className="flex flex-col items-center gap-2 group/card w-[72px] md:w-[90px] shrink-0 outline-none"
              >
                {/* 1. A BOLHA (CÍRCULO) - Zero Animação / Máxima Performance */}
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center shadow-sm border border-white relative overflow-hidden`}
                >
                  <Icon
                    className={`w-7 h-7 md:w-8 md:h-8 ${cat.iconColor} relative z-10`}
                    strokeWidth={2}
                  />
                </div>

                {/* 2. O TEXTO ENXUTO (Corrigido para text-slate-400) */}
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
