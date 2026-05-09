"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDisplayName } from "@/lib/dictionary";
import {
  ArrowRight,
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

const getCategoryTheme = (categoryName: string) => {
  const name = categoryName.toUpperCase();
  let IconComponent = <Briefcase className="w-5 h-5" strokeWidth={2} />;

  if (
    name.includes("ALIMENTA") ||
    name.includes("COMIDA") ||
    name.includes("RESTAURANTE")
  ) {
    IconComponent = <Utensils className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("AUTOMOTIVO") ||
    name.includes("CARRO") ||
    name.includes("MOTO")
  ) {
    IconComponent = <Car className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("COMERCIO") ||
    name.includes("LOJA") ||
    name.includes("ROUPA")
  ) {
    IconComponent = <ShoppingBag className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("SAUDE") ||
    name.includes("BELEZA") ||
    name.includes("MEDICO")
  ) {
    IconComponent = <Heart className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("SERVICO") ||
    name.includes("MANUTENCAO") ||
    name.includes("REFORMA")
  ) {
    IconComponent = <Wrench className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("TECNOLOGIA") ||
    name.includes("INFORMATICA") ||
    name.includes("CELULAR")
  ) {
    IconComponent = <Monitor className="w-5 h-5" strokeWidth={2} />;
  } else if (
    name.includes("ESTETICA") ||
    name.includes("SALAO") ||
    name.includes("BARBEARIA")
  ) {
    IconComponent = <Scissors className="w-5 h-5" strokeWidth={2} />;
  }

  return {
    icon: IconComponent,
    card: "bg-emerald-50/90 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300",
    iconBox: "bg-white text-emerald-500 shadow-sm",
    text: "text-emerald-950",
    arrow: "text-emerald-300 group-hover:text-emerald-600",
  };
};

export default function Categories({ activeCats }: { activeCats: string[] }) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  if (!activeCats || activeCats.length === 0) return null;

  return (
    /* 🚀 O ELEVADOR MÁXIMO: -mt-28 puxa o carrossel inteirinho para dentro da área escura do Hero */
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-30 -mt-[132px] md:-mt-[350px] lg:-mt-[360px] mb-16 md:mb-24 animate-in fade-in duration-700 delay-500">
      {/* 🚀 RESPIRANDO: Removemos o -mx-4 que colava o carrossel na borda do celular. Agora ele respeita as margens! */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 md:px-0 md:justify-center">
        {activeCats.sort().map((cat) => {
          const isLoading = isNavigating === cat;
          const theme = getCategoryTheme(cat);

          return (
            <div key={cat} className="snap-start shrink-0">
              <Link
                href={`/busca?category=${encodeURIComponent(cat)}`}
                onClick={() => setIsNavigating(cat)}
                /* 🚀 PÍLULA MENOR: p-1 e pr-3 no mobile para não ficar gigante */
                className={`group relative flex items-center p-1 pr-3 md:p-1.5 md:pr-5 rounded-full border transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md ${theme.card}`}
              >
                <div
                  /* 🚀 CAIXA DE ÍCONE MENOR e ÍCONE REDUZIDO via CSS ([&>svg]:w-3.5) no mobile */
                  className={`shrink-0 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-2 md:mr-3 transition-transform duration-300 group-hover:scale-105 [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-5 md:[&>svg]:h-5 ${theme.iconBox}`}
                >
                  {theme.icon}
                </div>

                <div className="flex-1 min-w-0 pr-1 md:pr-2">
                  <span
                    /* 🚀 FONTE MENOR: text-[9px] no mobile para caber confortavelmente */
                    className={`block font-black text-[9px] md:text-xs uppercase tracking-wider transition-colors leading-tight whitespace-nowrap ${theme.text}`}
                  >
                    {formatDisplayName(cat)}
                  </span>
                </div>

                <div
                  className={`shrink-0 transition-colors duration-300 ${theme.arrow}`}
                >
                  {isLoading ? (
                    <Loader2
                      size={12}
                      strokeWidth={3}
                      className="animate-spin md:w-3.5 md:h-3.5"
                    />
                  ) : (
                    <ArrowRight
                      size={12}
                      strokeWidth={3}
                      className="transform group-hover:-rotate-45 transition-transform duration-300 opacity-50 group-hover:opacity-100 md:w-3.5 md:h-3.5"
                    />
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
