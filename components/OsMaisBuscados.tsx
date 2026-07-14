"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, MapPin, ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";

// 🚀 LOGO INTELIGENTE: Padrão Minimalista e Elegante
function SmartLogo({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🎨 DESIGN PREMIUM: Iniciais em tons de prata/grafite para não poluir o card
  const renderInitials = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-2xl md:text-4xl select-none">
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
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`object-cover group-hover:scale-110 transition-transform duration-700 ease-out z-10 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function OsMaisBuscados({ businesses }: { businesses: any[] }) {
  if (!businesses || businesses.length === 0) {
    return <div className="w-full pt-24 md:pt-40 lg:pt-24" />;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-8 pb-4 md:pt-12 md:pb-8 lg:pt-16 animate-in fade-in duration-700 delay-200">
      {/* 🚀 CABEÇALHO DA SEÇÃO (Nova Identidade) */}
      <div className="flex items-center gap-4 mb-8 md:mb-12">
        <div className="bg-emerald-50 p-3 md:p-4 rounded-2xl shadow-sm border border-emerald-100/50">
          <TrendingUp className="text-tafanu-action w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter italic leading-none mb-1">
            Os Mais <span className="text-tafanu-action">Buscados</span>
          </h2>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            A curadoria das vitrines que estão bombando na sua região.
          </p>
        </div>
      </div>

      {/* 🚀 GRID DE CARTÕES: Estilo "Bento Grid" de Alto Padrão */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {businesses.map((biz) => (
          <Link
            href={`/site/${biz.slug}`}
            key={biz.id}
            className="group relative bg-white border border-slate-200/70 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col h-full overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-emerald-200 hover:-translate-y-1.5 transition-all duration-500"
          >
            {/* TOPO DO CARD: Logo + Seta Direcionamento */}
            <div className="flex justify-between items-start mb-5 md:mb-6">
              {/* O Quadro da Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1rem] md:rounded-[1.25rem] overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-tafanu-action/30 transition-all duration-500 p-1">
                <div className="w-full h-full rounded-[0.75rem] md:rounded-[1rem] overflow-hidden relative">
                  <SmartLogo biz={biz} />
                </div>
              </div>

              {/* Botão de Ação Redondo */}
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-tafanu-action group-hover:border-tafanu-action group-hover:text-white transition-all duration-500 shadow-sm">
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>

            {/* CORPO DO CARD: Informações Centrais */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-black text-slate-800 text-base md:text-xl uppercase tracking-tight line-clamp-2 leading-tight mb-2 group-hover:text-tafanu-action transition-colors duration-300">
                {biz.name}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                  {biz.category}
                </span>

                {/* Avaliação Limpa e Moderna */}
                {biz.rating && biz.rating > 0 && (
                  <>
                    <span className="text-amber-500 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/50">
                      <Star size={10} className="fill-amber-400" />
                      <span>{biz.rating.toFixed(1)}</span>
                    </span>
                  </>
                )}

                {/* Localização Minimalista */}
                {biz.city && (
                  <>
                    <span className="flex items-center gap-1 text-slate-400 font-bold truncate max-w-[100px] md:max-w-[120px]">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{biz.city}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* RODAPÉ DO CARD: O Bloco de Citação Curada */}
            <div className="mt-auto pt-2">
              <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-3 md:p-3.5 group-hover:bg-emerald-50/50 transition-colors duration-500">
                <p className="text-[10px] md:text-xs font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
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
    </section>
  );
}
