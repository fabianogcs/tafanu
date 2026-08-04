"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  BadgeCheck,
  Flame,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";

// 🚀 LOGO INTELIGENTE (Com bloqueio de drag)
function SmartLogo({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const renderInitials = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-lg select-none">
      {biz.name.charAt(0).toUpperCase()}
    </div>
  );

  if (!biz.imageUrl || imgError) {
    return renderInitials();
  }

  return (
    <div className="w-full h-full relative bg-slate-50">
      <div className="absolute inset-0 z-0">{renderInitials()}</div>
      <Image
        src={biz.imageUrl}
        alt={biz.name}
        fill
        sizes="60px"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`object-cover transition-opacity duration-700 ease-out z-10 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

// 🚀 CAPA INTELIGENTE (Com bloqueio de drag)
function SmartCover({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const coverImageUrl = biz.coverImage;
  const logoImageUrl = biz.imageUrl;

  if (coverImageUrl && !imgError) {
    return (
      <div className="w-full h-full relative bg-slate-900">
        <Image
          src={coverImageUrl}
          alt={`Capa de ${biz.name}`}
          fill
          draggable={false}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      </div>
    );
  }

  if (logoImageUrl) {
    return (
      <div className="w-full h-full relative bg-slate-950 overflow-hidden">
        <Image
          src={logoImageUrl}
          alt="Background Blur"
          fill
          draggable={false}
          sizes="200px"
          className="object-cover blur-xl scale-150 opacity-40 group-hover:scale-125 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-900/50 to-emerald-950/30 z-10" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 overflow-hidden group-hover:scale-105 transition-transform duration-700 ease-out">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
    </div>
  );
}

export default function OsMaisBuscados({ businesses }: { businesses: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Estados do Drag-to-Scroll
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Estados das Setinhas
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  if (!businesses || businesses.length === 0) {
    return null;
  }

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

  const handleLinkClick = (e: React.MouseEvent) => {
    if (dragDistance > 10) {
      e.preventDefault();
    }
  };

  return (
    // 🚀 UX FIX: Espaçamentos (mt-6 mb-6) reduzidos para colar melhor com as categorias e o rodapé
    <section className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 mt-6 md:mt-8 mb-6 relative z-20 animate-in fade-in duration-700">
      {/* 🚀 FIX: A sintaxe correta para injeção de CSS no Next.js */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 mb-1">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            Empresas em destaque
          </h2>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">
            Os melhores negócios, escolhidos para você
          </p>
        </div>
      </div>

      <div className="relative group/carousel">
        {/* Seta Esquerda */}
        <button
          onClick={() => scroll(-350)}
          className={`absolute left-[-20px] top-[40%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex ${!showLeft ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        {/* CARROSSEL HORIZONTAL */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex flex-nowrap overflow-x-auto gap-4 md:gap-5 pb-8 pt-2 hide-scroll ${isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"}`}
        >
          {/* Limitado a 8 resultados reais */}
          {businesses.slice(0, 8).map((biz) => (
            <Link
              href={`/site/${biz.slug}`}
              key={biz.id}
              onClick={handleLinkClick}
              draggable={false}
              className="group relative bg-white border border-slate-100 rounded-[1.8rem] flex flex-col h-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200 hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden shrink-0 w-[260px] sm:w-[280px] snap-start"
            >
              {/* TOPO DO CARD: Capa com Overlay */}
              <div className="relative w-full h-32 overflow-hidden border-b border-slate-100 bg-slate-100 pointer-events-none">
                <SmartCover biz={biz} />

                {/* Logo Circular */}
                <div className="absolute top-3 left-3 z-20 w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md group-hover:border-emerald-400 transition-all duration-500 bg-white">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <SmartLogo biz={biz} />
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-slate-950/30 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:bg-white group-hover:text-slate-950 group-hover:scale-110 transition-all duration-300 shadow">
                  <ArrowUpRight
                    size={14}
                    strokeWidth={3}
                    className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>

              {/* CORPO DO CARD COM DADOS REAIS */}
              <div className="flex-1 flex flex-col p-4 pointer-events-none">
                <h3 className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-tight line-clamp-2 leading-tight mb-2.5 group-hover:text-emerald-600 transition-colors duration-300 flex items-center gap-1.5">
                  <span className="line-clamp-2">{biz.name}</span>
                  {biz.isVerified && (
                    <span
                      title="Empresa Verificada"
                      className="shrink-0 inline-flex"
                    >
                      <BadgeCheck
                        size={16}
                        className="fill-emerald-500 text-white shrink-0 shadow-sm rounded-full"
                      />
                    </span>
                  )}
                </h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-3.5 mt-auto">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                    {biz.category}
                  </span>

                  {(biz.rating || 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-black text-[9px] md:text-[10px]">
                      <Star
                        size={11}
                        className="fill-amber-400 text-amber-400"
                      />
                      {biz.rating.toFixed(1)}
                    </span>
                  )}

                  {biz.city && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin size={11} strokeWidth={2.5} />
                      <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[80px] md:max-w-[100px]">
                        {biz.city}
                      </span>
                    </span>
                  )}
                </div>

                {/* RODAPÉ DO CARD: Balão de Citação Soft Original */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50 group-hover:bg-emerald-50/40 transition-colors duration-500">
                  <p className="text-[10px] md:text-[11px] font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
                    "
                    {biz.luxe_quote ||
                      `A melhor opção de ${biz.category} na região.`}
                    "
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Seta Direita */}
        <button
          onClick={() => scroll(350)}
          className={`absolute right-[-20px] top-[40%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex ${!showRight ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
