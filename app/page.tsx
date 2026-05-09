import { auth } from "@/auth";
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

export default async function Home() {
  const session = await auth();

  // 🚀 Busca Tudo Paralelamente (Otimizado para não gerar gargalos)
  const [activeCategories, onlineMarketplaceData, trendingBusinesses] =
    await Promise.all([
      getActiveCategories(),
      getOnlineMarketplaceMetadata(),
      getTrendingBusinesses(),
    ]);

  return (
    <main className="relative min-h-screen bg-white pb-24 overflow-hidden">
      {/* 📐 FUNDO ARQUITETÔNICO MODERNISTA (O Fim do Fundo "Sem Graça") */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* 1. O "Palco" (Corte Diagonal de ponta a ponta) 
            Isso quebra a monotonia criando uma divisão visual na diagonal */}
        <div className="absolute top-[40vh] left-0 w-full h-[1200px] bg-[#F8FAFC] transform -skew-y-3 origin-top-left border-t border-slate-100 shadow-[inset_0_10px_30px_rgba(0,0,0,0.01)]" />

        {/* 2. Anéis Estruturais de Profundidade 
            Formas geométricas gigantes nas bordas dão um ar caríssimo ao design */}
        <div className="absolute top-[60vh] -right-48 w-[800px] h-[800px] rounded-full border-[60px] border-emerald-50/80" />
        <div className="absolute top-[100vh] -left-32 w-[500px] h-[500px] rounded-full border-[40px] border-orange-50/50" />
      </div>

      {/* 📦 CONTEÚDO PRINCIPAL (Z-10 para ficar acima das formas) */}
      <div className="relative z-10">
        <Hero />
        <Categories activeCats={activeCategories} />
        <OsMaisBuscados businesses={trendingBusinesses} />

        {/* 🛍️ VITRINE DE NEGÓCIOS COM DELIVERY/MARKETPLACE */}
        <VitrineDigital data={onlineMarketplaceData} />
      </div>
    </main>
  );
}
