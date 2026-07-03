"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const MOODS = [
  {
    id: "fome",
    title: "Bateu a Fome",
    subtitle: "Lanches, Pizzas & Delivery",
    icon: "🍔",
    url: "/busca?modo=online&category=Alimentacao",
    bgClass: "from-orange-500 to-red-500",
    shadowClass: "shadow-orange-500/30",
  },
  {
    id: "beleza",
    title: "Tapa no Visual",
    subtitle: "Salões & Estética",
    icon: "✂️",
    url: "/busca?modo=online&category=Beleza",
    bgClass: "from-pink-500 to-rose-500",
    shadowClass: "shadow-pink-500/30",
  },
  {
    id: "bo",
    title: "Resolvendo B.O.",
    subtitle: "Mecânicos & Serviços",
    icon: "🛠️",
    url: "/busca?modo=online&category=Servicos",
    bgClass: "from-slate-600 to-slate-800",
    shadowClass: "shadow-slate-500/30",
  },
  {
    id: "sextou",
    title: "Sextou!",
    subtitle: "Bares & Adegas",
    icon: "🍻",
    url: "/busca?modo=online&subcategory=bar,adega,espetinho,bebidas,cerveja",
    bgClass: "from-amber-400 to-yellow-600",
    shadowClass: "shadow-yellow-500/30",
  },
  {
    id: "pet",
    title: "Pro Seu Pet",
    subtitle: "Rações & Banhos",
    icon: "🐕",
    url: "/busca?modo=online&category=Pets",
    bgClass: "from-emerald-400 to-teal-600",
    shadowClass: "shadow-teal-500/30",
  },
  {
    id: "compras",
    title: "Moda & Lojas",
    subtitle: "Roupas & Presentes",
    icon: "🛍️",
    url: "/busca?modo=online&category=Comercio",
    bgClass: "from-indigo-500 to-purple-600",
    shadowClass: "shadow-indigo-500/30",
  },
];

export default function VitrineDigital() {
  const router = useRouter();

  const handleMoodClick = (e: React.MouseEvent, baseUrl: string) => {
    e.preventDefault();
    const cachedCoords = localStorage.getItem("tafanu_user_coords");

    if (cachedCoords) {
      try {
        const { lat, lng } = JSON.parse(cachedCoords);
        router.push(`${baseUrl}&lat=${lat}&lng=${lng}&sort=distance`);
        return;
      } catch (err) {
        console.error("Erro ao ler cache de localização");
      }
    }
    router.push(baseUrl);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-8 relative z-10">
      {/* CABEÇALHO LIMPO E CLARO */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-xl shadow-sm">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <span className="text-emerald-600 font-black text-[10px] md:text-[11px] uppercase tracking-[0.25em]">
            Experiência Local
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-[#023059] uppercase italic tracking-tighter leading-tight mb-4">
          O Que Você <span className="text-emerald-500">Quer Hoje?</span>
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
          Escolha o seu estado de espírito e nós encontramos as melhores opções
          da sua cidade em segundos.
        </p>
      </div>

      {/* GRELHA DE CARTÕES */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {MOODS.map((mood) => (
          <Link
            key={mood.id}
            href={mood.url}
            onClick={(e) => handleMoodClick(e, mood.url)}
            className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex flex-col justify-between aspect-square md:aspect-[4/3] lg:h-52 bg-gradient-to-br ${mood.bgClass} shadow-md hover:${mood.shadowClass} hover:-translate-y-1.5 transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start w-full relative z-10">
              <span className="text-4xl md:text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-300 origin-top-left">
                {mood.icon}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                <ArrowRight size={16} strokeWidth={3} />
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4">
              <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-widest leading-tight drop-shadow-md mb-1">
                {mood.title}
              </h3>
              <p className="text-white/80 font-semibold text-[9px] md:text-xs tracking-wider">
                {mood.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
