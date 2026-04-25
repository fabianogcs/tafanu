"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight, ShoppingBag } from "lucide-react";

interface VitrineDigitalProps {
  data: { category: string; subcategories: string[] }[];
}

export default function VitrineDigital({ data }: VitrineDigitalProps) {
  // Define a primeira categoria como ativa por padrão
  const [activeTab, setActiveTab] = useState<string>(data?.[0]?.category || "");

  if (!data || data.length === 0) return null;

  const activeData = data.find((d) => d.category === activeTab);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 border-t border-slate-200/60 mt-4 relative overflow-hidden">
      {/* Decoração de Fundo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Cabeçalho Impactante e Otimizado */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
            <Globe size={14} strokeWidth={2.5} />
          </span>
          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em]">
            Shopping Nacional
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Compre Sem{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Sair de Casa
          </span>
        </h2>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        {/* LADO ESQUERDO: Menu Interativo de Categorias */}
        <div className="w-full lg:w-1/3 flex flex-col gap-2">
          <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest mb-2 px-2">
            Selecione o Segmento
          </h3>

          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar snap-x">
            {data.map((item) => {
              const isActive = activeTab === item.category;
              return (
                <button
                  key={item.category}
                  onClick={() => setActiveTab(item.category)}
                  className={`snap-start shrink-0 lg:w-full flex items-center justify-between px-5 py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 border-2 ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag
                      size={16}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />
                    {item.category}
                  </div>
                  {isActive && (
                    <ArrowRight
                      size={16}
                      className="hidden lg:block text-emerald-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LADO DIREITO: Subcategorias Dinâmicas */}
        <div className="w-full lg:w-2/3 bg-slate-50 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 relative min-h-[300px]">
          {activeData && (
            <div
              key={activeData.category}
              className="animate-in fade-in slide-in-from-right-8 duration-500"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h4 className="font-black text-xl md:text-2xl italic uppercase text-slate-800 tracking-tighter">
                  {activeData.category}{" "}
                  <span className="text-emerald-500">Online</span>
                </h4>
                <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {activeData.subcategories.length} Opções
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {activeData.subcategories.map((sub) => (
                  <Link
                    key={sub}
                    href={`/busca?modo=online&subcategory=${encodeURIComponent(sub)}`}
                    className="group bg-white text-slate-600 font-bold text-xs md:text-sm uppercase tracking-widest px-6 py-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center gap-3 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
                  >
                    {sub}
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-white transition-colors"></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
