import Link from "next/link";
import { TrendingUp, MapPin, ArrowUpRight } from "lucide-react";

export default function OsMaisBuscados({ businesses }: { businesses: any[] }) {
  if (!businesses || businesses.length === 0) return null;

  return (
    /* 🚀 DESCENDO MAIS: Usamos mt-[220px] no desktop para descolar bem do Hero */
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-24 md:mt-40 lg:mt-[220px] pt-10 pb-20 md:pt-16 md:pb-24 animate-in fade-in duration-700 delay-400">
      {/* CABEÇALHO DA SESSÃO */}
      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
        <div className="bg-orange-100 p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-sm">
          <TrendingUp className="text-[#F28705] w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div>
          <h2 className="text-xl md:text-3xl font-black text-[#023059] uppercase tracking-tighter italic leading-none mb-1">
            Os Mais <span className="text-[#F28705]">Buscados</span>
          </h2>
          <p className="text-slate-400 font-medium text-[10px] md:text-sm">
            As vitrines que estão bombando na região.
          </p>
        </div>
      </div>

      {/* GRID DE CARTÕES SÓLIDA */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {businesses.map((biz) => (
          <Link
            href={`/site/${biz.slug}`}
            key={biz.id}
            className="group relative bg-white border border-slate-100 p-4 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col h-full overflow-hidden shadow-sm hover:border-slate-200 hover:-translate-y-2 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-[#F28705]/30 transition-all duration-300 p-0.5">
                <div className="w-full h-full rounded-[10px] md:rounded-[14px] overflow-hidden bg-slate-50 relative">
                  {biz.imageUrl ? (
                    <img
                      src={biz.imageUrl}
                      alt={biz.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#023059] to-blue-800 flex items-center justify-center text-white font-black text-[14px] md:text-2xl">
                      {biz.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#F28705] group-hover:border-[#F28705] group-hover:text-white transition-all duration-300 shadow-sm">
                <ArrowUpRight
                  size={16}
                  className="md:w-[18px] md:h-[18px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="font-black text-[#023059] text-sm md:text-xl uppercase tracking-tight line-clamp-2 leading-tight mb-2 group-hover:text-[#F28705] transition-colors">
                {biz.name}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                <span className="text-[#F28705]">{biz.category}</span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {biz.neighborhood || biz.city || "Guarulhos"}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-auto pt-3 md:pt-4 border-t border-slate-100">
              <p className="text-[10px] md:text-sm font-medium text-slate-500 italic line-clamp-2 group-hover:text-slate-700 transition-colors">
                "{biz.luxe_quote || `A melhor opção de ${biz.category}`}"
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
