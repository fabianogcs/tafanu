"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  ArrowRight,
  ShoppingBag,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDisplayName } from "@/lib/dictionary";

interface VitrineDigitalProps {
  data: { category: string; subcategories: string[] }[];
}

export default function VitrineDigital({ data }: VitrineDigitalProps) {
  const [activeTab, setActiveTab] = useState<string>(data?.[0]?.category || "");
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  const activeData = data.find((d) => d.category === activeTab);

  return (
    /* 🛡️ LAYOUT SEGURO: Agora a margem é bem pequena (mt-4/mt-8), pois os 'Mais Buscados' sempre seguram o teto! */
    <section className="max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-8 pb-16 md:pb-24 relative overflow-hidden z-10">
      {/* Brilho de Fundo Suave */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* CABEÇALHO */}
      <div className="mb-8 md:mb-10 text-center md:text-left flex flex-col items-center md:items-start">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Store size={16} strokeWidth={2.5} />
          </span>
          <span className="text-emerald-600 font-black text-[10px] md:text-[11px] uppercase tracking-[0.25em]">
            Shopping Local
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#023059] uppercase italic tracking-tighter leading-[1.1] drop-shadow-sm mb-4">
          Compre Sem <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 pr-2">
            Sair de Casa
          </span>
        </h2>

        {/* 🚀 MICRO PROVA SOCIAL: Gatilho de movimento e urgência */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] md:text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Centenas de negócios ativos agora
          </span>
        </div>
      </div>

      {/* CAIXA PRINCIPAL (Glassmorphism Suave) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 relative z-10">
        {/* MENU LATERAL (Container Cinza Claro) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-2 bg-slate-50/80 p-3 md:p-4 rounded-[1.5rem] border border-slate-100">
          {/* 🚀 CABEÇALHO DO MENU COM BADGE PARA MOBILE */}
          <div className="flex justify-between items-center mb-2 px-2 md:px-3 pt-1">
            <h3 className="font-bold text-[9px] md:text-[10px] uppercase text-slate-400 tracking-[0.2em]">
              Selecione o Segmento
            </h3>
            {/* O selo "Deslize" aparece apenas no mobile e tem um pulso suave */}
            <div className="flex items-center gap-1.5 bg-emerald-100/50 text-emerald-600 px-2 py-1 rounded-full lg:hidden animate-pulse">
              <span className="text-[8px] font-black uppercase tracking-widest">
                Deslize
              </span>
              <ArrowRight size={10} strokeWidth={3} />
            </div>
          </div>

          <div className="relative">
            {/* 🚀 ADICIONADO pr-8 e lg:pr-0: Dá espaço no final do scroll mobile para não cortar seco */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar snap-x relative z-10 pr-8 lg:pr-0">
              {data.map((item) => {
                const isActive = activeTab === item.category;
                return (
                  <button
                    key={item.category}
                    onClick={() => setActiveTab(item.category)}
                    className={`snap-start shrink-0 flex items-center justify-between px-5 py-4 rounded-[1rem] font-black text-[11px] md:text-sm uppercase tracking-widest transition-all duration-300 relative ${
                      isActive
                        ? "bg-white text-[#023059] shadow-md shadow-slate-200/50 ring-1 ring-slate-100 scale-100"
                        : "bg-transparent text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 scale-[0.98] hover:scale-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <ShoppingBag
                        size={18}
                        className={`transition-colors duration-300 ${
                          isActive ? "text-emerald-500" : "text-slate-300"
                        }`}
                      />
                      {formatDisplayName(item.category)}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="hidden lg:block relative z-10"
                      >
                        <ArrowRight size={18} className="text-emerald-400" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ÁREA DE SUBCATEGORIAS DIREITA */}
        <div className="w-full lg:w-[65%] pt-2 lg:pt-4 pb-2 relative min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeData && (
              <motion.div
                key={activeData.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1 flex flex-col"
              >
                {/* Título da Categoria Ativa */}
                <div className="mb-6 md:mb-8 pb-4 border-b border-slate-100">
                  <h4 className="font-black text-xl md:text-2xl italic uppercase text-[#023059] tracking-tighter">
                    {formatDisplayName(activeData.category)}{" "}
                    <span className="text-emerald-500 relative">
                      <span className="relative z-10">Online</span>
                      <span className="absolute bottom-1 left-0 w-full h-2 bg-emerald-100 -z-10 rounded-full opacity-50"></span>
                    </span>
                  </h4>
                </div>

                {/* Tags de Subcategorias (Estilo Cartões Delicados) */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {activeData.subcategories.map((sub) => {
                    const isLoading = isNavigating === sub;

                    return (
                      <Link
                        key={sub}
                        href={`/busca?modo=online&subcategory=${encodeURIComponent(sub)}`}
                        onClick={() => setIsNavigating(sub)}
                        className="group flex items-center justify-between gap-3 bg-white border border-slate-200 px-4 md:px-5 py-3 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                      >
                        <span className="font-bold text-[10px] md:text-xs text-slate-600 group-hover:text-[#023059] uppercase tracking-widest transition-colors">
                          {formatDisplayName(sub)}
                        </span>

                        <div className="shrink-0">
                          {isLoading ? (
                            <Loader2
                              size={14}
                              strokeWidth={3}
                              className="animate-spin text-emerald-500"
                            />
                          ) : (
                            <ChevronRight
                              size={14}
                              strokeWidth={3}
                              className="text-slate-300 group-hover:text-emerald-500 transition-colors md:w-[16px] md:h-[16px]"
                            />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
