"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES_SHOWCASE = [
  {
    id: "Alimentacao",
    title: "Alimentação",
    subtitle: "Lanches & Pizzas",
    icon: "🍔",
    url: "/busca?category=Alimentacao",
    bgClass: "from-orange-500 to-red-500",
    shadowClass: "shadow-orange-500/30",
  },
  {
    id: "Automotivo",
    title: "Automotivo",
    subtitle: "Oficinas & Peças",
    icon: "🚗",
    url: "/busca?category=Automotivo",
    bgClass: "from-slate-600 to-slate-800",
    shadowClass: "shadow-slate-500/30",
  },
  {
    id: "Beleza",
    title: "Beleza",
    subtitle: "Salões & Estética",
    icon: "✂️",
    url: "/busca?category=Beleza",
    bgClass: "from-pink-500 to-rose-500",
    shadowClass: "shadow-pink-500/30",
  },
  {
    id: "Comercio",
    title: "Comércio",
    subtitle: "Lojas & Varejo",
    icon: "🛍️",
    url: "/busca?category=Comercio",
    bgClass: "from-indigo-500 to-purple-600",
    shadowClass: "shadow-indigo-500/30",
  },
  {
    id: "Educacao",
    title: "Educação",
    subtitle: "Cursos & Escolas",
    icon: "🎓",
    url: "/busca?category=Educacao",
    bgClass: "from-blue-500 to-cyan-600",
    shadowClass: "shadow-blue-500/30",
  },
  {
    id: "Eventos",
    title: "Eventos",
    subtitle: "Festas & Shows",
    icon: "🎈",
    url: "/busca?category=Eventos",
    bgClass: "from-fuchsia-500 to-purple-600",
    shadowClass: "shadow-fuchsia-500/30",
  },
  {
    id: "Logistica",
    title: "Logística",
    subtitle: "Fretes & Entregas",
    icon: "🚚",
    url: "/busca?category=Logistica",
    bgClass: "from-amber-400 to-orange-500",
    shadowClass: "shadow-amber-500/30",
  },
  {
    id: "Pets",
    title: "Pets",
    subtitle: "Clínicas & Banho",
    icon: "🐕",
    url: "/busca?category=Pets",
    bgClass: "from-emerald-400 to-teal-600",
    shadowClass: "shadow-teal-500/30",
  },
  {
    id: "Profissionais",
    title: "Serv. Prof.",
    subtitle: "Advogados, T.I",
    icon: "💼",
    url: "/busca?category=Profissionais",
    bgClass: "from-stone-500 to-zinc-700",
    shadowClass: "shadow-stone-500/30",
  },
  {
    id: "Saude",
    title: "Saúde",
    subtitle: "Médicos & Clínicas",
    icon: "⚕️",
    url: "/busca?category=Saude",
    bgClass: "from-red-500 to-rose-700",
    shadowClass: "shadow-red-500/30",
  },
  {
    id: "Servicos",
    title: "Serv. Gerais",
    subtitle: "Reformas & Limpeza",
    icon: "🛠️",
    url: "/busca?category=Servicos",
    bgClass: "from-sky-500 to-blue-600",
    shadowClass: "shadow-sky-500/30",
  },
];

export default function VitrineDigital() {
  const router = useRouter();
  const [userCity, setUserCity] = useState<string | null>(null);

  // 🚀 O MISTÉRIO REVELADO: Ele puxa a cidade assim que a Home carrega
  useEffect(() => {
    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { city } = JSON.parse(cachedCoords);
        if (city) setUserCity(city);
      }
    } catch (err) {}
  }, []);

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
      {/* CABEÇALHO INTELIGENTE */}
      <div className="mb-6 md:mb-10 text-center flex flex-col items-center animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-xl shadow-sm">
            {userCity ? (
              <MapPin size={14} strokeWidth={2.5} />
            ) : (
              <Sparkles size={14} strokeWidth={2.5} />
            )}
          </span>
          <span className="text-emerald-600 font-black text-[10px] md:text-[11px] uppercase tracking-[0.25em]">
            {userCity ? "Perto de Você" : "Busca Rápida"}
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-[#023059] uppercase italic tracking-tighter leading-tight mb-2">
          {userCity ? (
            <>
              Opções em{" "}
              <span className="text-emerald-500 truncate">{userCity}</span>
            </>
          ) : (
            <>
              O Que Você <span className="text-emerald-500">Quer Hoje?</span>
            </>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
        {CATEGORIES_SHOWCASE.map((mood) => (
          <Link
            key={mood.id}
            href={mood.url}
            onClick={(e) => handleMoodClick(e, mood.url)}
            className={`group relative overflow-hidden rounded-[1rem] md:rounded-[1.5rem] p-2.5 md:p-5 flex flex-col justify-between aspect-square md:aspect-auto md:h-36 lg:h-40 bg-gradient-to-br ${mood.bgClass} shadow-sm hover:shadow-md hover:${mood.shadowClass} hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start w-full relative z-10">
              <span className="text-2xl md:text-3xl lg:text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300 origin-top-left">
                {mood.icon}
              </span>
              <div className="hidden md:flex w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={12} strokeWidth={3} />
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-2 md:pt-4">
              <h3 className="text-white font-black text-[9px] md:text-xs lg:text-sm uppercase tracking-wide md:tracking-widest leading-tight drop-shadow-sm mb-0.5 md:mb-1 break-words">
                {mood.title}
              </h3>
              <p className="hidden md:block text-white/80 font-bold text-[8px] lg:text-[10px] tracking-wider truncate">
                {mood.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
