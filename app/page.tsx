import { auth } from "@/auth";
import { getHomeBusinesses, getActiveCategories } from "@/app/actions";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import { Suspense } from "react";
import { Metadata } from "next"; // 🚀 Adicione no topo junto com os outros imports

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

export const dynamic = "force-dynamic";

// 🚀 O PULO DO GATO 2: Separar o carregamento dos cards para a página não ficar "presa" esperando o banco acordar
async function BusinessGrid({ userId }: { userId?: string }) {
  const businesses = await getHomeBusinesses(userId);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {businesses.map((item: any) => (
        <BusinessCard key={item.id} business={item} isLoggedIn={!!userId} />
      ))}

      {businesses.length === 0 && (
        <div className="col-span-full py-24 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-300">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Estamos atualizando nossa vitrine. Volte em breve!
          </p>
        </div>
      )}
    </div>
  );
}

// Skeleton para mostrar enquanto o banco está dormindo
function BusinessGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="h-64 bg-slate-200 rounded-3xl animate-pulse"
        ></div>
      ))}
    </div>
  );
}

export default async function Home() {
  const session = await auth();

  // Busca categorias (geralmente é rápido)
  const activeCategories = await getActiveCategories();

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <Hero />
      <Categories activeCats={activeCategories} />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-tafanu-blue/10 text-tafanu-blue p-1.5 rounded-lg">
                <Sparkles size={14} />
              </span>
              <span className="text-tafanu-blue font-black text-[10px] uppercase tracking-[0.3em]">
                DESCUBRA
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              VITRINE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-blue to-cyan-500 pr-2">
                TAFANU
              </span>
            </h2>
          </div>

          <Link
            href="/busca"
            className="group flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-lg transition-all border border-slate-100"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-tafanu-blue">
              Ver todos os locais
            </span>
            <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-tafanu-blue group-hover:text-white transition-colors">
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* 🚀 Suspense: Mostra os "quadrados cinzas piscando" enquanto aguarda a resposta do Prisma */}
        <Suspense fallback={<BusinessGridSkeleton />}>
          <BusinessGrid userId={session?.user?.id} />
        </Suspense>
      </section>

      <section className="px-4">
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
