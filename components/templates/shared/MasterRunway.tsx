"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { VideoEmbed } from "./VideoEmbed";

interface MasterRunwayProps {
  feed: any[];
  setSelectedIndex: (index: number) => void;
  /** Estilo visual dos cards e setas */
  variant?: "luxe" | "comercial" | "showroom" | "urban";
  /** Classe de borda do tema (ex: "border-slate-200") */
  themeBorder: string;
  /** Classe de fundo dos cards (ex: "bg-white") */
  cardBg?: string;
  /** Classe de sombra dos cards */
  cardShadow?: string;
}

export function MasterRunway({
  feed,
  setSelectedIndex,
  variant = "urban",
  themeBorder,
  cardBg = "bg-white",
  cardShadow = "shadow-md",
}: MasterRunwayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE ARRASTE (DRAG TO SCROLL) ---
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingReal, setIsDraggingReal] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setIsDraggingReal(false); // Reseta a verificação do arraste real
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsDraggingReal(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Pequeno atraso para não disparar o onClick caso tenha havido arraste real
    setTimeout(() => setIsDraggingReal(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidade do arraste

    // Se andou mais de 5 pixels, consideramos arraste de verdade (não um clique)
    if (Math.abs(walk) > 5) {
      setIsDraggingReal(true);
    }

    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };
  // ------------------------------------------

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -340 : 340,
        behavior: "smooth",
      });
  };

  // Dimensões reduzidas para um visual ainda mais premium e delicado
  const cardSize =
    variant === "showroom"
      ? "w-[130px] sm:w-[160px] md:w-[190px] aspect-square"
      : "w-[140px] sm:w-[170px] md:w-[200px] lg:w-[230px] aspect-[3/4]";

  // Bordas arredondadas: Reduzidas para tirar o aspecto grosseiro/infantil
  const cardRounded =
    variant === "luxe"
      ? "rounded-[1.5rem] md:rounded-[2rem]"
      : variant === "comercial"
        ? "rounded-2xl md:rounded-[1.5rem]"
        : variant === "showroom"
          ? "rounded-xl"
          : "rounded-[1.5rem]";

  // Estilo das setas por variante
  const arrowStyle =
    variant === "luxe"
      ? `hidden md:flex absolute top-[50%] -translate-y-1/2 z-20 w-14 h-14 items-center justify-center rounded-full opacity-0 group-hover/runway:opacity-100 transition-all duration-500 hover:scale-105 border ${themeBorder} text-current backdrop-blur-md shadow-2xl hover:bg-current/10`
      : `hidden lg:flex absolute top-[50%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white/90 backdrop-blur-md border border-black/10 rounded-full shadow-xl opacity-0 group-hover/runway:opacity-100 transition-all hover:scale-110 text-slate-800`;

  const videoVariant =
    variant === "luxe" || variant === "comercial" ? variant : "default";

  return (
    <div className="relative group/runway w-full">
      <button
        aria-label="Rolar galeria para a esquerda"
        onClick={() => scroll("left")}
        className={`${arrowStyle} -left-4 lg:-left-7`}
      >
        <ChevronLeft size={variant === "luxe" ? 28 : 24} strokeWidth={1.5} />
      </button>
      {/* Eventos de mouse aplicados e troca inteligente do ícone do cursor */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-8 pt-4 px-2 ${
          isDragging
            ? "cursor-grabbing snap-none scroll-auto"
            : "cursor-grab snap-x scroll-smooth"
        }`}
      >
        {feed.map((item: any, i: number) => {
          // pointer-events-none ativado SOMENTE em arraste real (evita clique acidental sem matar o clique normal)
          const baseClasses = `shrink-0 snap-center ${cardSize} ${cardRounded} overflow-hidden relative border ${themeBorder} ${cardBg} ${cardShadow} transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 group ${
            isDraggingReal ? "pointer-events-none" : ""
          }`;
          if (item.type === "image") {
            return (
              <motion.div
                key={`img-${i}`}
                onClick={() => setSelectedIndex(item.lightboxIndex)}
                className={`${baseClasses} cursor-pointer select-none`}
                role="button"
                tabIndex={0}
                aria-label="Abrir imagem em tela cheia"
                whileHover={variant === "urban" ? { scale: 1.02 } : undefined}
              >
                <Image
                  src={item.url || "/og-default.png"}
                  alt="Vitrine"
                  fill
                  quality={100}
                  draggable={false} // ⬅️ O SEGREDO: Mata o "fantasma" do navegador
                  sizes="(max-width: 768px) 600px, 800px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Plus
                    size={36}
                    className="text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>
            );
          }

          if (
            item.type === "video" ||
            item.type === "video_v" ||
            item.type === "video_h"
          ) {
            return (
              <div key={`vid-${i}`} className={`${baseClasses}`}>
                <VideoEmbed url={item.url} variant={videoVariant} />
              </div>
            );
          }

          return null;
        })}
      </div>

      <button
        aria-label="Rolar galeria para a direita"
        onClick={() => scroll("right")}
        className={`${arrowStyle} -right-4 lg:-right-7`}
      >
        <ChevronRight size={variant === "luxe" ? 28 : 24} strokeWidth={1.5} />
      </button>
    </div>
  );
}
