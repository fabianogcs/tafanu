"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDisplayName } from "@/lib/dictionary";
import {
  ArrowRight,
  Sparkles,
  Loader2,
  Car,
  ShoppingBag,
  Utensils,
  Heart,
  Wrench,
  Monitor,
  Briefcase,
  Scissors,
} from "lucide-react";

// 🚀 SISTEMA ESCALÁVEL DE TEMAS
const getCategoryTheme = (categoryName: string) => {
  const name = categoryName.toUpperCase();
  let IconComponent = (
    <Briefcase className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
  );

  if (
    name.includes("ALIMENTA") ||
    name.includes("COMIDA") ||
    name.includes("RESTAURANTE")
  ) {
    IconComponent = (
      <Utensils className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  } else if (
    name.includes("AUTOMOTIVO") ||
    name.includes("CARRO") ||
    name.includes("MOTO") ||
    name.includes("VEICULO")
  ) {
    IconComponent = <Car className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />;
  } else if (
    name.includes("COMERCIO") ||
    name.includes("LOJA") ||
    name.includes("ROUPA") ||
    name.includes("MODA")
  ) {
    IconComponent = (
      <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  } else if (
    name.includes("SAUDE") ||
    name.includes("BELEZA") ||
    name.includes("MEDICO") ||
    name.includes("FARMACIA")
  ) {
    IconComponent = (
      <Heart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  } else if (
    name.includes("SERVICO") ||
    name.includes("MANUTENCAO") ||
    name.includes("REFORMA")
  ) {
    IconComponent = (
      <Wrench className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  } else if (
    name.includes("TECNOLOGIA") ||
    name.includes("INFORMATICA") ||
    name.includes("CELULAR")
  ) {
    IconComponent = (
      <Monitor className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  } else if (
    name.includes("ESTETICA") ||
    name.includes("SALAO") ||
    name.includes("BARBEARIA") ||
    name.includes("CABELO")
  ) {
    IconComponent = (
      <Scissors className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    );
  }

  return {
    icon: IconComponent,
    card: "bg-emerald-50/80 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.2)]",
    iconBox: "bg-white text-emerald-500",
    text: "text-emerald-900",
    arrow: "text-emerald-300 group-hover:text-emerald-600",
  };
};

export default function Categories({ activeCats }: { activeCats: string[] }) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  if (!activeCats || activeCats.length === 0) return null;

  return (
    /* 🚀 A CORREÇÃO ESTÁ AQUI: O "pb-0" remove o excesso de espaço branco no fundo! */
    <section className="relative w-full z-20 -mt-12 md:-mt-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-16 md:pt-24 pb-4 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1.5 md:h-2 bg-slate-200 rounded-full opacity-60" />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-tafanu-blue/5 blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-400/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col gap-3 mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none flex items-center gap-3 drop-shadow-sm">
            Guia de Negócios
            <Sparkles
              size={28}
              className="text-tafanu-action hidden md:block animate-pulse"
            />
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl leading-relaxed border-l-4 border-tafanu-action pl-4">
            Encontre os melhores comércios, serviços e profissionais da
            plataforma.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pt-4 pb-6 md:pt-4 md:pb-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 md:mx-0 -mt-4 md:-mt-4">
          {activeCats.sort().map((cat, i) => {
            const isLoading = isNavigating === cat;
            const theme = getCategoryTheme(cat);

            return (
              <div
                key={cat}
                className={`snap-start shrink-0 w-[75vw] sm:w-[260px] md:w-auto md:max-w-none ${
                  i === 0 ? "ml-4 md:ml-0 scroll-ml-4 md:scroll-ml-0" : ""
                }`}
              >
                <Link
                  href={`/busca?category=${encodeURIComponent(cat)}`}
                  onClick={() => setIsNavigating(cat)}
                  className={`group relative flex items-center p-2.5 md:p-3 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${theme.card}`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mr-3 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 ${theme.iconBox}`}
                  >
                    {theme.icon}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <span
                      className={`block font-black text-[11px] md:text-xs uppercase tracking-widest transition-colors leading-tight whitespace-nowrap truncate ${theme.text}`}
                    >
                      {formatDisplayName(cat)}
                    </span>
                  </div>

                  <div
                    className={`shrink-0 transition-colors duration-300 ml-1 ${theme.arrow}`}
                  >
                    {isLoading ? (
                      <Loader2
                        size={16}
                        strokeWidth={3}
                        className="animate-spin"
                      />
                    ) : (
                      <ArrowRight
                        size={16}
                        strokeWidth={3}
                        className="transform group-hover:-rotate-45 transition-transform duration-300"
                      />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}

          <div className="shrink-0 w-1 md:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
