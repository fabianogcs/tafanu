import {
  getActiveCategories,
  getOnlineMarketplaceMetadata,
  getTrendingBusinesses,
} from "@/app/actions";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import VitrineDigital from "@/components/VitrineDigital";
import OsMaisBuscados from "@/components/OsMaisBuscados";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tafanu | O que você precisa, perto de você",
  description:
    "De serviços essenciais a experiências únicas. Encontre as melhores empresas e profissionais de confiança em poucos segundos.",
  openGraph: {
    title: "Tafanu | Conectando você aos melhores negócios",
    description: "Encontre as melhores empresas e profissionais",
    type: "website",
  },
};

/* 🚀 A MÁGICA DO CACHE (ISR): 
   A Vercel vai salvar essa página na memória (Edge Network). 
   Ela vai no Prisma/Neon buscar empresas novas apenas 1 vez por hora (3600 segundos).
   Para o usuário, o site vai abrir em 0.01s! */
export const revalidate = 3600;

export default async function Home() {
  // 🚀 Removido o 'await auth()' que estava forçando o site a ser dinâmico e lento!

  // Busca Tudo Paralelamente
  const [activeCategories, onlineMarketplaceData, trendingBusinesses] =
    await Promise.all([
      getActiveCategories(),
      getOnlineMarketplaceMetadata(),
      getTrendingBusinesses(),
    ]);

  return (
    <main className="relative min-h-screen bg-white pb-24 overflow-hidden">
      {/* 📐 FUNDO ARQUITETÔNICO MODERNISTA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[40vh] left-0 w-full h-[1200px] bg-[#F8FAFC] transform -skew-y-3 origin-top-left border-t border-slate-100 shadow-[inset_0_10px_30px_rgba(0,0,0,0.01)]" />
        <div className="absolute top-[60vh] -right-48 w-[800px] h-[800px] rounded-full border-[60px] border-emerald-50/80" />
        <div className="absolute top-[100vh] -left-32 w-[500px] h-[500px] rounded-full border-[40px] border-orange-50/50" />
      </div>

      {/* 📦 CONTEÚDO PRINCIPAL */}
      <div className="relative z-10">
        <Hero />
        <Categories activeCats={activeCategories} />
        <OsMaisBuscados businesses={trendingBusinesses} />
        <VitrineDigital data={onlineMarketplaceData} />
      </div>
    </main>
  );
}
