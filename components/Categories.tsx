"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Categories({ activeCats }: { activeCats: string[] }) {
  if (!activeCats || activeCats.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Cabeçalho Ultra Clean */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none flex items-center gap-3">
            Guia de Negócios
            <Sparkles size={24} className="text-tafanu-blue hidden md:block" />
          </h2>
        </div>
        <p className="text-slate-500 font-bold text-xs md:text-sm max-w-sm leading-relaxed border-l-2 border-tafanu-action pl-4">
          Encontre os melhores comércios, serviços e profissionais da
          plataforma.
        </p>
      </div>

      {/* Grid Compacto (Tiles Interativos) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {activeCats.sort().map((cat) => (
          <Link
            key={cat}
            href={`/busca?category=${encodeURIComponent(cat)}`}
            className="group relative bg-white flex items-center justify-between p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-tafanu-blue/10 hover:border-tafanu-blue/30 transition-all duration-300 overflow-hidden"
          >
            {/* Efeito de preenchimento ao passar o mouse */}
            <div className="absolute inset-0 bg-gradient-to-r from-tafanu-blue/0 via-tafanu-blue/[0.03] to-tafanu-action/[0.05] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>

            <span className="relative z-10 font-black text-[11px] md:text-xs uppercase tracking-widest text-slate-600 group-hover:text-tafanu-blue transition-colors truncate pr-2">
              {cat}
            </span>

            <div className="relative z-10 w-8 h-8 shrink-0 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-tafanu-blue group-hover:text-white transition-all duration-300 transform group-hover:-rotate-45">
              <ArrowRight size={14} strokeWidth={3} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
