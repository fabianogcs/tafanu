"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDisplayName } from "@/lib/dictionary";

export default function Categories({ activeCats }: { activeCats: string[] }) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  if (!activeCats || activeCats.length === 0) return null;

  return (
    // ✅ AQUI ESTÁ A MÁGICA: -mt-12 md:-mt-24 sobe o componente. rounded-t-[3rem] arredonda. shadow-[0_-20px...] cria sombra por cima do fundo escuro.
    <section className="relative w-full z-20 -mt-12 md:-mt-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-16 md:pt-24 pb-16 md:pb-24 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
      {/* Detalhe Premium: Pílula de "App Mobile" no topo */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1.5 md:h-2 bg-slate-200 rounded-full opacity-60" />

      {/* Fundo Decorativo com Mesh Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-tafanu-blue/5 blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-400/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none flex items-center gap-3 drop-shadow-sm">
              Guia de Negócios
              <Sparkles
                size={28}
                className="text-tafanu-action hidden md:block animate-pulse"
              />
            </h2>
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-sm leading-relaxed border-l-4 border-tafanu-action pl-4 bg-gradient-to-r from-tafanu-action/5 to-transparent py-1.5">
            Encontre os melhores comércios, serviços e profissionais da
            plataforma.
          </p>
        </div>

        {/* Grid de Cartões */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {activeCats.sort().map((cat, i) => {
            const isLoading = isNavigating === cat;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                key={cat}
              >
                <Link
                  href={`/busca?category=${encodeURIComponent(cat)}`}
                  onClick={() => setIsNavigating(cat)}
                  className="group relative bg-white/80 backdrop-blur-md flex items-center justify-between p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-tafanu-action/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-tafanu-action/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                  <span className="relative z-10 font-black text-[11px] md:text-xs uppercase tracking-widest text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-2 leading-tight break-words pr-3">
                    {formatDisplayName(cat)}
                  </span>

                  <div
                    className={`relative z-10 shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isLoading
                        ? "bg-tafanu-action text-tafanu-blue"
                        : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-tafanu-action group-hover:text-tafanu-blue group-hover:border-transparent group-hover:shadow-md transform group-hover:-rotate-45"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2
                        size={16}
                        strokeWidth={3}
                        className="animate-spin"
                      />
                    ) : (
                      <ArrowRight size={16} strokeWidth={3} />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
