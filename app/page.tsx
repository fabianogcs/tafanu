import { auth } from "@/auth";
import {
  getActiveCategories,
  getOnlineMarketplaceMetadata,
} from "@/app/actions";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import VitrineDigital from "@/components/VitrineDigital"; // 🚀 Importação do novo Shopping!

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

  // 🚀 Busca Tudo Paralelamente (Mais Rápido)
  const [activeCategories, onlineMarketplaceData] = await Promise.all([
    getActiveCategories(),
    getOnlineMarketplaceMetadata(),
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <Hero />

      <Categories activeCats={activeCategories} />

      {/* 🛍️ A NOSSA MÁQUINA DE E-COMMERCE ENTRANDO AQUI */}
      <VitrineDigital data={onlineMarketplaceData} />
    </main>
  );
}
