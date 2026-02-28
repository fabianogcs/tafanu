import { auth } from "@/auth";
import { getHomeBusinesses, getActiveCategories } from "@/app/actions"; // 1. IMPORTA AS NOVAS FUNÇÕES
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import BusinessCard from "@/components/BusinessCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // 2. BUSCA AS CATEGORIAS REAIS DO BANCO
  const activeCategories = await getActiveCategories();

  // 3. BUSCA OS NEGÓCIOS INTELIGENTES (Sabendo quem é você para pintar o coração)
  const businesses = await getHomeBusinesses(session?.user?.id);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <Hero />

      {/* 4. PASSA AS CATEGORIAS PARA O COMPONENTE */}
      <Categories activeCats={activeCategories} />

      {/* SEÇÃO DE DESTAQUES */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
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

        {/* GRID DE CARDS PREMIUM (VIDRO) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {businesses.map((item: any) => (
            <BusinessCard
              key={item.id}
              business={item}
              isLoggedIn={!!session?.user} // Passa true se tiver logado
            />
          ))}

          {businesses.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Estamos atualizando nossa vitrine. Volte em breve!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO CTA (MANTIDA) */}
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
            Criar Anúncio Grátis
          </Link>
        </div>
      </section>
    </main>
  );
}
