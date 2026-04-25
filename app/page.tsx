import { auth } from "@/auth";
import {
  getActiveCategories,
  getOnlineMarketplaceMetadata,
} from "@/app/actions";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import VitrineDigital from "@/components/VitrineDigital"; // 🚀 Importação do novo Shopping!
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tafanu | O que você precisa, perto de você",
  description:
    "De serviços essenciais a experiências únicas. Encontre as melhores empresas e profissionais de confiança em poucos segundos.",
  openGraph: {
    title: "Tafanu | Conectando você aos melhores negócios",
    description: "Encontre as melhores empresas e profissionais na sua região.",
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

      {/* CTA Final (Call to Action) */}
      <section className="px-4 mt-20">
        <div className="max-w-6xl mx-auto bg-[#0f172a] rounded-[3rem] p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-tafanu-blue/20 relative overflow-hidden border border-white/5 group">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-tafanu-action opacity-10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:opacity-20 transition-opacity duration-1000"></div>
          <div className="absolute left-0 bottom-0 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

          <div className="z-10 mb-8 md:mb-0 max-w-lg relative">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter leading-[0.95]">
              Sua marca merece <br />{" "}
              <span className="text-tafanu-action">ser vista.</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
              Junte-se a centenas de empresas que já estão crescendo com o
              Tafanu.
            </p>
          </div>

          <Link
            href="/anunciar"
            className="z-10 bg-white text-[#0f172a] font-black py-5 px-10 rounded-2xl hover:bg-tafanu-action hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] whitespace-nowrap transform hover:-translate-y-1 duration-300 uppercase text-[10px] md:text-xs tracking-[0.2em]"
          >
            Criar Anúncio
          </Link>
        </div>
      </section>
    </main>
  );
}
