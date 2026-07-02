"use client";

import Link from "next/link";
import { Store, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

// 🚀 OS MOODS (Estados de Espírito do Neuromarketing)
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
  const router = useRouter(); // 🚀 ACIONA O DIRECIONADOR

  // 🚀 O INTERCEPTADOR MÁGICO (COLE ISTO AQUI!)
  const handleMoodClick = (e: React.MouseEvent, baseUrl: string) => {
    e.preventDefault(); // Cancela o comportamento nativo do link

    const cachedCoords = localStorage.getItem("tafanu_user_coords");

    if (cachedCoords) {
      try {
        const { lat, lng } = JSON.parse(cachedCoords);
        // 🚀 SE HOUVER CACHE: Injeta as coordenadas dinamicamente na URL e ordena por distância!
        router.push(`${baseUrl}&lat=${lat}&lng=${lng}&sort=distance`);
        return;
      } catch (err) {
        console.error("Erro ao ler cache de localização");
      }
    }

    // Se for a primeira vez do cara e não houver cache, vai limpo (mostra tudo)
    router.push(baseUrl);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-12 pb-16 relative overflow-hidden z-10">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-tafanu-action/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* CABEÇALHO */}
      <div className="mb-8 md:mb-12 text-center md:text-left flex flex-col items-center md:items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gradient-to-r from-tafanu-action to-emerald-400 text-[#0f172a] p-1.5 rounded-xl shadow-lg">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <span className="text-emerald-500 font-black text-[10px] md:text-[11px] uppercase tracking-[0.25em]">
            Experiência Local
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0f172a] uppercase italic tracking-tighter leading-[1.1] drop-shadow-sm mb-4">
          O Que Você <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 pr-2">
            Quer Hoje?
          </span>
        </h2>

        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
          Escolha o seu estado de espírito e nós encontramos as melhores opções
          da sua cidade em segundos.
        </p>
      </div>

      {/* 🚀 GRELHA DE MOODS (NEUROMARKETING APLICADO) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
        {MOODS.map((mood, idx) => (
          <Link
            key={mood.id}
            href={mood.url}
            onClick={(e) => handleMoodClick(e, mood.url)} // 🚀 DISPARA O INTERCEPTADOR
            className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex flex-col justify-between aspect-square md:aspect-auto md:h-52 bg-gradient-to-br ${mood.bgClass} shadow-lg hover:${mood.shadowClass} hover:-translate-y-2 transition-all duration-500`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Efeito de Reflexo no Vidro */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start w-full relative z-10">
              <span className="text-4xl md:text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-500 origin-top-left">
                {mood.icon}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
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
