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
    // 🚀 FIX: overflow-x-clip mata a 2ª barra de rolagem. Reduzimos o pb-32 para pb-10 para colar no Footer!
    <main className="relative min-h-screen pb-6 lg:pb-10 bg-white selection:bg-emerald-200 selection:text-emerald-900 overflow-x-clip w-full">
      {/* 📐 FUNDO SAAS PREMIUM */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]" />

        {/* FIX: Trocamos VW por px para não bugar o zoom em telas Ultra-Wide */}
        <div className="absolute top-[35%] -left-[200px] w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[120px]" />
        <div className="absolute top-[65%] -right-[200px] w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <Hero />

        <div className="relative z-30">
          <VitrineDigital />
        </div>

        <div className="relative z-20">
          <OsMaisBuscados businesses={trendingBusinesses} />
        </div>

        {/* FIX: Tiramos o mt-16 gigante para o bloco de vantagens colar na lista de empresas */}
        <div className="relative mt-2 md:mt-4 z-10">
          <WhyTafanu />
        </div>
      </div>
    </main>
  );
}
