import { getTrendingBusinesses } from "@/app/actions";
import Hero from "@/components/Hero";
import VitrineDigital from "@/components/VitrineDigital";
import OsMaisBuscados from "@/components/OsMaisBuscados";
import WhyTafanu from "@/components/WhyTafanu"; // 🚀 NOVO COMPONENTE DE NEUROMARKETING
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
        url: "https://tafanu.com.br/og-default.png",
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
  // 🚀 CIRURGIA DO CFO: Como removemos o diretório cinza duplicado,
  // o banco de dados agora só faz 1 consulta leve para carregar a Home!
  const trendingBusinesses = await getTrendingBusinesses();

  return (
    <main className="relative min-h-screen pb-6 md:pb-12 overflow-hidden bg-[#F8FAFC]">
      {/* 📐 FUNDO ARQUITETÔNICO MODERNISTA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[25vh] left-0 w-full h-[80%] bg-white transform -skew-y-2 origin-top-left border-t border-slate-200/60 shadow-[inset_0_10px_30px_rgba(0,0,0,0.01)]" />
        <div className="absolute top-[60vh] -right-48 w-[800px] h-[800px] rounded-full border-[60px] border-emerald-50/50" />
      </div>

      {/* 📦 FLUXO DE NAVEGAÇÃO COMPLETO E DENSO */}
      <div className="relative z-10 space-y-4 md:space-y-8">
        <Hero />
        <VitrineDigital />
        <WhyTafanu />
        <OsMaisBuscados businesses={trendingBusinesses} />
      </div>
    </main>
  );
}
