"use client";

import Link from "next/link";
import { Users, Globe, Rocket, Zap, ArrowUpRight } from "lucide-react";

export default function SobrePage() {
  const stats = [
    {
      label: "Propósito",
      value: "Conectar",
      icon: <Users className="text-indigo-500" size={24} />,
    },
    {
      label: "Foco",
      value: "Expansão",
      icon: <Globe className="text-emerald-500" size={24} />,
    },
    {
      label: "Visão",
      value: "Escalar",
      icon: <Rocket className="text-orange-500" size={24} />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/10 text-slate-800 pb-20">
      {/* Hero Section */}
      <section className="py-24 bg-white border-b border-slate-200 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6 shadow-inner animate-bounce duration-1000">
            <Zap className="text-indigo-600" fill="currentColor" size={24} />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-6">
            Mais que um diretório, <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent normal-case not-italic tracking-tight">
              o ecossistema do seu negócio.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-semibold max-w-2xl mx-auto text-balance">
            O TAFANU nasceu para revolucionar a infraestrutura digital de marcas
            em escala. Elevamos o posicionamento de negócios locais e globais
            através de vitrines premium inteligentes, eliminando o atrito entre
            o seu ecossistema e o seu cliente final.
          </p>
        </div>
      </section>

      {/* Grid de Valores */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                {item.label}
              </span>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
                {item.value}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto / Proposta de Valor */}
      <section className="py-12 max-w-3xl mx-auto px-6">
        <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-4">
            Por que posicionar sua marca no TAFANU?
          </h2>
          <p className="text-balance">
            Acreditamos no poder do neuromarketing e do design de padrão
            internacional. Todo negócio merece uma interface que transmita
            autoridade instantânea. No mercado digital moderno, ter links
            fragmentados e canais espalhados destrói sua conversão. Centralizar
            sua operação é o único caminho para escalar o faturamento.
          </p>
          <p className="text-balance">
            Para o <strong>empreendedor</strong>, entregamos um hub de
            tecnologia de alta retenção que unifica suas redes, portfólio,
            agendas e canais de checkout, respondendo de forma flexível ao seu
            modelo comercial — seja processando vendas internas ou direcionando
            o tráfego cirurgicamente para as suas ferramentas oficiais. Para o{" "}
            <strong>consumidor</strong>, garantimos uma experiência de
            descoberta premium, fluida e sem fronteiras.
          </p>
        </div>

        {/* Call to Action Box */}
        <div className="mt-16 p-8 md:p-12 bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] text-center text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/20 blur-3xl rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-600/20 blur-3xl rounded-full" />

          <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight mb-4 relative z-10">
            Pronto para dominar o mercado?
          </h3>
          <p className="text-slate-400 text-sm md:text-base font-semibold max-w-lg mx-auto mb-8 relative z-10">
            Crie sua vitrine inteligente em menos de 5 minutos e mude o patamar
            digital do seu negócio hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 max-w-md mx-auto">
            <Link
              href="/anunciar"
              className="flex-1 px-8 py-4 bg-white text-slate-900 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              Criar Minha Vitrine <ArrowUpRight size={14} strokeWidth={2.5} />
            </Link>
            <Link
              href="/"
              className="flex-1 px-8 py-4 bg-slate-800 border border-slate-700 text-white rounded-xl font-black uppercase text-xs tracking-wider hover:bg-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Explorar Negócios
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
