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
    url: "https://tafanu.com.br",
    siteName: "Tafanu",
    images: [
      {
        url: "https://tafanu.com.br/og-default.png", // Sua imagem de compartilhamento
        width: 1200,
        height: 630,
        alt: "Capa do Tafanu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tafanu | O que você precisa, perto de você",
    description:
      "Encontre as melhores empresas e profissionais em poucos segundos.",
    images: ["https://tafanu.com.br/og-default.png"],
  },
};

export default async function Home() {
  // Busca Tudo Paralelamente (Mais rápido e limpo agora!)
  const [activeCategories, trendingBusinesses] = await Promise.all([
    getActiveCategories(),
    getTrendingBusinesses(),
  ]);

  return (
    <main className="relative min-h-screen bg-white pb-24 overflow-hidden">
      {/* 📐 FUNDO ARQUITETÔNICO MODERNISTA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[30vh] left-0 w-full h-[100%] bg-[#F8FAFC] transform -skew-y-2 origin-top-left border-t border-slate-200 shadow-[inset_0_10px_30px_rgba(0,0,0,0.05)]" />
        <div className="absolute top-[60vh] -right-48 w-[800px] h-[800px] rounded-full border-[60px] border-emerald-50/80" />
        <div className="absolute top-[100vh] -left-32 w-[500px] h-[500px] rounded-full border-[40px] border-orange-50/50" />
      </div>

      {/* 📦 CONTEÚDO PRINCIPAL */}
      <div className="relative z-10">
        <Hero />
        <VitrineDigital />
        <OsMaisBuscados businesses={trendingBusinesses} />
        <Categories activeCats={activeCategories} />
      </div>
    </main>
  );
}
