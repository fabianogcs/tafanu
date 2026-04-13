"use client";

import Link from "next/link";
import {
  Utensils,
  Stethoscope,
  Scissors,
  Wrench,
  Car,
  Briefcase,
  ShoppingBag,
  Dog,
} from "lucide-react";

// 🛡️ Tipagem forte garantida
interface CategoryConfig {
  dbKey: string;
  name: string;
  icon: React.ElementType;
  colorTheme: string;
}

const categoriesData: CategoryConfig[] = [
  {
    dbKey: "Alimentacao",
    name: "Alimentação",
    icon: Utensils,
    colorTheme:
      "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 active:bg-orange-100",
  },
  {
    dbKey: "Automotivo",
    name: "Automotivo",
    icon: Car,
    colorTheme:
      "hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:bg-red-100",
  },
  {
    dbKey: "Beleza",
    name: "Beleza e Estética",
    icon: Scissors,
    colorTheme:
      "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 active:bg-pink-100",
  },
  {
    dbKey: "Comercio",
    name: "Comércio Local",
    icon: ShoppingBag,
    colorTheme:
      "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:bg-emerald-100",
  },
  {
    dbKey: "Pets",
    name: "Pets",
    icon: Dog,
    colorTheme:
      "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 active:bg-teal-100",
  },
  {
    dbKey: "Profissionais",
    name: "Profissionais",
    icon: Briefcase,
    colorTheme:
      "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 active:bg-purple-100",
  },
  {
    dbKey: "Saude",
    name: "Saúde e Bem-Estar",
    icon: Stethoscope,
    colorTheme:
      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100",
  },
  {
    dbKey: "Servicos",
    name: "Serviços Casa",
    icon: Wrench,
    colorTheme:
      "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 active:bg-amber-100",
  },
];

interface CategoriesProps {
  activeCats?: string[];
}

export default function Categories({ activeCats = [] }: CategoriesProps) {
  if (!activeCats || activeCats.length === 0) return null;

  const visibleCategories = categoriesData.filter((cat) =>
    activeCats.includes(cat.dbKey),
  );

  if (visibleCategories.length === 0) return null;

  return (
    <section className="py-6 md:py-8 max-w-7xl mx-auto overflow-hidden">
      {/* 🚀 REMOVIDO: snap-x. ADICIONADO: justify-start md:justify-center */}
      <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 px-6 overflow-x-auto no-scrollbar pb-2">
        {visibleCategories.map((cat) => (
          <Link
            key={cat.dbKey}
            href={`/busca?category=${encodeURIComponent(cat.dbKey)}`}
            className={`
              shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full 
              text-slate-500 transition-all duration-200 cursor-pointer
              active:scale-95 ${cat.colorTheme}
            `}
          >
            <cat.icon size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {cat.name}
            </span>
          </Link>
        ))}

        {/* Espaçador invisível no final apenas para mobile */}
        <div className="shrink-0 w-2 md:hidden" />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
