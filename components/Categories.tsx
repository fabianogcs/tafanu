"use client";

import { useState, useRef } from "react";
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

export default function Categories() {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
        aria-label="Rolar para esquerda"
      >
        <ChevronLeft strokeWidth={3} size={20} />
      </button>

      {/* 🚀 CIRURGIA DE SCROLL: Removido o scroll-smooth e o snap rígido. Adicionado cursor-grab para o mouse. */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsDragging(false)}
        className="flex gap-2.5 md:gap-5 overflow-x-auto pb-6 md:pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 md:px-2 cursor-grab active:cursor-grabbing select-none"
      >
        {CATEGORIES_DATA.map((cat) => {
          const isLoading = isNavigating === cat.id;
          const Icon = cat.icon;

          return (
            <div key={cat.id} className="shrink-0">
              <Link
                href={`/busca?category=${encodeURIComponent(cat.id)}`}
                onClick={(e) => handleLinkClick(e, cat.id)}
                draggable={false} // Evita que o navegador tente arrastar o link como imagem
                /* 🚀 AINDA MAIS COMPACTO: w-[100px] no mobile */
                className="block relative w-[100px] md:w-[210px] bg-white rounded-2xl md:rounded-[1.75rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 border border-slate-100 overflow-hidden group/card"
              >
                {/* 1. METADE SUPERIOR */}
                {/* 🚀 ALTURA REDUZIDA: h-10 no mobile */}
                <div
                  className={`h-10 md:h-20 w-full bg-gradient-to-br ${cat.bgGradient} relative flex items-center justify-center overflow-hidden`}
                >
                  <Icon
                    className={`absolute w-14 h-14 md:w-24 md:h-24 opacity-10 -rotate-12 scale-150 ${cat.iconColor}`}
                  />
                </div>

                {/* 2. CÍRCULO CENTRALIZADO */}
                {/* 🚀 CÍRCULO MENOR: top-10, w-7 h-7 no mobile */}
                <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-sm border-[2px] md:border-[3px] border-white z-10 group-hover/card:scale-110 transition-transform duration-300">
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center bg-slate-50 ${cat.iconColor}`}
                  >
                    <Icon
                      className="w-3.5 h-3.5 md:w-5 md:h-5"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                {/* 3. METADE INFERIOR */}
                {/* 🚀 TEXTOS DELICADOS E MENOS MARGEM NO MOBILE */}
                <div className="pt-5 md:pt-10 pb-2 md:pb-5 px-1.5 md:px-3 flex flex-col items-center text-center bg-white pointer-events-none">
                  <h3 className="font-black text-[7px] md:text-[11px] text-slate-800 uppercase tracking-widest mb-0.5 leading-tight line-clamp-2">
                    {cat.title}
                  </h3>

                  <p className="hidden md:block text-[10px] text-slate-500 font-medium mb-3 line-clamp-1 leading-tight">
                    {cat.desc}
                  </p>

                  <div className="flex items-center gap-1 md:gap-1.5 mt-1 md:mt-0 text-[6px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600 group-hover/card:text-tafanu-action transition-colors">
                    {isLoading ? (
                      <>
                        <Loader2
                          size={8}
                          className="animate-spin md:w-3 md:h-3"
                        />
                        <span className="hidden md:inline">CARREGANDO</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden md:inline">EXPLORAR</span>
                        <ChevronRight
                          size={8}
                          strokeWidth={3}
                          className="md:w-3 md:h-3"
                        />
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
        aria-label="Rolar para direita"
      >
        <ChevronRight strokeWidth={3} size={20} />
      </button>
    </section>
  );
}
