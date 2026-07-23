"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, MapPin, ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";

// 🚀 LOGO INTELIGENTE: Agora 100% Circular e Clean (Padrão Referência)
function SmartLogo({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const renderInitials = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-xl select-none">
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
        sizes="80px"
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
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-4 pt-6 pb-4 md:pt-10 md:pb-8 lg:pt-12 relative z-20 animate-in fade-in duration-700">
      {/* 🚀 CABEÇALHO DA SEÇÃO: Cores e Fontes da Referência */}
      <div className="flex items-center gap-4 mb-8 md:mb-10">
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100/60 shadow-sm">
          <TrendingUp
            className="text-emerald-500 w-6 h-6 md:w-7 md:h-7"
            strokeWidth={2.5}
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none mb-1.5">
            Os Mais <span className="text-emerald-500">Buscados</span>
          </h2>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            A curadoria das vitrines que estão bombando na sua região.
          </p>
        </div>
      </div>

      {/* 🚀 GRID DE CARTÕES: Clean, Arejado e Arredondado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {businesses.map((biz) => (
          <Link
            href={`/site/${biz.slug}`}
            key={biz.id}
            className="group relative bg-white border border-slate-100 p-6 md:p-7 rounded-[2rem] flex flex-col h-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500"
          >
            {/* TOPO DO CARD: Logo Circular Menor + Seta Minimalista */}
            <div className="flex justify-between items-start mb-5">
              {/* Moldura da Logo Circular */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm group-hover:border-emerald-500/20 transition-all duration-500 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <SmartLogo biz={biz} />
                </div>
              </div>

              {/* Botão de Ação Suave */}
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors duration-300">
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>

            {/* CORPO DO CARD: Título e Tags Alinhadas */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-black text-slate-800 text-base md:text-lg uppercase tracking-tight line-clamp-2 leading-tight mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                {biz.name}
              </h3>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Tag Categoria (Verde) */}
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                  {biz.category}
                </span>

                {/* Avaliação (Amarelo) */}
                {biz.rating && biz.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-black text-[10px] md:text-xs">
                    <Star
                      size={12}
                      className="fill-amber-400 text-amber-400 mb-0.5"
                    />
                    {biz.rating.toFixed(1)}
                  </span>
                )}

                {/* Localização (Cinza) */}
                {biz.city && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={12} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate max-w-[100px] md:max-w-[120px]">
                      {biz.city}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* RODAPÉ DO CARD: Balão de Citação Soft */}
            <div className="mt-auto">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-emerald-50/40 transition-colors duration-500">
                <p className="text-[11px] md:text-xs font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
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
