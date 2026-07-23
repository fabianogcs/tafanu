"use client";

import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  MapPin,
  ArrowUpRight,
  Star,
  BadgeCheck, // 🚀 CIRURGIA DEV: Importado para o selo
} from "lucide-react";
import { useState } from "react";

// 🚀 LOGO INTELIGENTE: Agora menor para overlay no canto da capa
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
        sizes="60px" // Reduzido para overlay
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`object-cover group-hover:scale-110 transition-transform duration-700 ease-out z-10 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

// 🚀 CAPA INTELIGENTE: Efeito Vidro Fosco (Blur) ou Gradiente Premium no Fallback!
function SmartCover({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const coverImageUrl = biz.coverImage;
  const logoImageUrl = biz.imageUrl;

  // 1. NÍVEL 1: TEM CAPA REAL CADASTRADA
  if (coverImageUrl && !imgError) {
    return (
      <div className="w-full h-full relative bg-slate-900">
        <Image
          src={coverImageUrl}
          alt={`Capa de ${biz.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Overlay gradiente suave para leitura da logo e botões */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      </div>
    );
  }

  // 2. NÍVEL 2: NÃO TEM CAPA, MAS TEM LOGO (Efeito Vidro Fosco / Spotify Style)
  if (logoImageUrl) {
    return (
      <div className="w-full h-full relative bg-slate-950 overflow-hidden">
        {/* Usamos o próprio logo esticado e desfocado como imagem de fundo! */}
        <Image
          src={logoImageUrl}
          alt="Background Blur"
          fill
          sizes="200px"
          className="object-cover blur-xl scale-150 opacity-40 group-hover:scale-125 transition-transform duration-700 ease-out"
        />
        {/* Gradiente escuro por cima para manter o contraste perfeito da logo real que vai flutuar na frente */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-900/50 to-emerald-950/30 z-10" />
      </div>
    );
  }

  // 3. NÍVEL 3: NÃO TEM NADA CADASTRADO (Gradiente Arquitetônico Aura Tafanu - Zero Texto!)
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 overflow-hidden group-hover:scale-105 transition-transform duration-700 ease-out">
      {/* Luz abstrata de fundo (Efeito Aura) */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      {/* Padrão de pontos digitais super sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
    </div>
  );
}

export default function OsMaisBuscados({ businesses }: { businesses: any[] }) {
  if (!businesses || businesses.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-2 pt-4 pb-4 md:pt-8 md:pb-6 relative z-20 animate-in fade-in duration-700 -mt-6 sm:-mt-10 md:-mt-14">
      {/* 🚀 CABEÇALHO DA SEÇÃO: Compacto e alinhado */}
      <div className="flex items-center gap-2 mb-6 md:mb-8">
        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100/60 shadow-inner">
          <TrendingUp
            className="text-emerald-500 w-5 h-5 md:w-6 md:h-6"
            strokeWidth={2.5}
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">
            Os Mais <span className="text-emerald-500">Buscados</span>
          </h2>
          <p className="text-slate-500 font-medium text-[11px] md:text-xs">
            A curadoria das vitrines que estão bombando na sua região.
          </p>
        </div>
      </div>

      {/* 🚀 GRID DE CARTÕES: 2 colunas no mobile (grid-cols-2) e 4 no desktop (lg:grid-cols-4), gap menor e responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {businesses.map((biz) => (
          <Link
            href={`/site/${biz.slug}`}
            key={biz.id}
            // 🚀 CIRURGIA VISUAL: rounded-[1.8rem], padding menor p-4, overflow-hidden para a capa no topo
            className="group relative bg-white border border-slate-100 rounded-[1.8rem] flex flex-col h-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200 hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden"
          >
            {/* TOPO DO CARD: Bloco de Imagem de Capa com Overlay de Logo */}
            <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-100">
              <SmartCover biz={biz} />

              {/* Moldura da Logo Circular Menor flutuando sobre a Capa (Canto Superior Esquerdo) */}
              <div className="absolute top-2.5 left-2.5 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md group-hover:border-emerald-400 transition-all duration-500 bg-white">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <SmartLogo biz={biz} />
                </div>
              </div>

              {/* Botão de Ação Minimalista no Canto Superior Direito */}
              <div className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-slate-950/30 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:bg-white group-hover:text-slate-950 group-hover:scale-110 transition-all duration-300 shadow">
                <ArrowUpRight
                  size={14}
                  strokeWidth={3}
                  className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>

            {/* CORPO DO CARD: Título e Tags (Paddings p-4 e textos bem proporcionais) */}
            <div className="flex-1 flex flex-col p-4">
              {/* 🚀 CIRURGIA DEV: Título menor com Selo de Verificado embutido */}
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
                {/* Tag Categoria */}
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                  {biz.category}
                </span>

                {/* Avaliação (Estrelas) */}
                {(biz.rating || 0) > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-500 font-black text-[9px] md:text-[10px]">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {biz.rating.toFixed(1)}
                  </span>
                )}

                {/* Localização */}
                {biz.city && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={11} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[80px] md:max-w-[100px]">
                      {biz.city}
                    </span>
                  </span>
                )}
              </div>

              {/* RODAPÉ DO CARD: Balão de Citação Soft */}
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
    </section>
  );
}
