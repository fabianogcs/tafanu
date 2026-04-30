"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDisplayName } from "@/lib/dictionary"; // ✅ Dicionário importado!

interface VitrineDigitalProps {
  data: { category: string; subcategories: string[] }[];
}

export default function VitrineDigital({ data }: VitrineDigitalProps) {
  const [activeTab, setActiveTab] = useState<string>(data?.[0]?.category || "");
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  const activeData = data.find((d) => d.category === activeTab);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-16 md:pt-8 md:pb-24 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="mb-10 md:mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-md shadow-emerald-500/20">
            <Globe size={16} strokeWidth={2.5} />
          </span>
          <span className="text-emerald-600 font-black text-[11px] uppercase tracking-[0.25em]">
            Shopping Nacional
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none drop-shadow-sm">
          Compre Sem{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Sair de Casa
          </span>
        </h2>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
        {/* MENU LATERAL */}
        <div className="w-full lg:w-[35%] flex flex-col gap-3">
          <h3 className="font-black text-[10px] md:text-xs uppercase text-slate-400 tracking-[0.2em] mb-2 px-2">
            Selecione o Segmento
          </h3>

          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar snap-x">
            {data.map((item) => {
              const isActive = activeTab === item.category;
              return (
                <button
                  key={item.category}
                  onClick={() => setActiveTab(item.category)}
                  className={`snap-start shrink-0 lg:w-full flex items-center justify-between px-6 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-100"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 scale-[0.98] hover:scale-100"
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <ShoppingBag
                      size={18}
                      className={
                        isActive ? "text-emerald-400" : "text-slate-400"
                      }
                    />
                    {/* ✅ Categoria do Menu Lateral Formata */}
                    {formatDisplayName(item.category)}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
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

        {/* SUBCATEGORIAS DIREITA */}
        <div className="w-full lg:w-[65%] bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-6 md:p-10 border border-slate-200/60 relative min-h-[350px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeData && (
              <motion.div
                key={activeData.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200/80 gap-4">
                  <h4 className="font-black text-2xl md:text-3xl italic uppercase text-slate-800 tracking-tighter">
                    {/* ✅ Título do bloco Formata */}
                    {formatDisplayName(activeData.category)}{" "}
                    <span className="text-emerald-500">Online</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-3 md:gap-4">
                  {activeData.subcategories.map((sub) => {
                    const isLoading = isNavigating === sub;

                    return (
                      <Link
                        key={sub}
                        href={`/busca?modo=online&subcategory=${encodeURIComponent(sub)}`}
                        onClick={() => setIsNavigating(sub)}
                        className="group relative bg-white text-slate-700 font-bold text-[11px] md:text-xs uppercase tracking-[0.15em] px-6 py-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all duration-300 flex items-center gap-3 shadow-sm hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] active:scale-95 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-emerald-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                        {/* ✅ Nome do botão da subcategoria Formata */}
                        <span className="relative z-10">
                          {formatDisplayName(sub)}
                        </span>

                        <div className="relative z-10 shrink-0">
                          {isLoading ? (
                            <Loader2
                              size={16}
                              strokeWidth={3}
                              className="animate-spin text-emerald-600"
                            />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
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
