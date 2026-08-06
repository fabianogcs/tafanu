"use client";

import { ShieldCheck, MapPin, Zap, MessageCircle } from "lucide-react";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Confiança",
    desc: "Encontre empresas e profissionais verificados e recomendados.",
  },
  {
    icon: MapPin,
    title: "Perto de Você",
    desc: "Resultados relevantes com precisão na sua localização.",
  },
  {
    icon: Zap,
    title: "Rápido e Fácil",
    desc: "Encontre o que precisa em poucos segundos, sem burocracia.",
  },
  {
    // 🚀 MARKETING FIX: Texto ampliado para suportar o Hub Multicanal real exibido no painel de métricas!
    icon: MessageCircle,
    title: "Conexão Direta",
    desc: "Acesse cardápios, faça agendamentos ou fale direto com os donos sem intermediários.",
  },
];

export default function WhyTafanu() {
  return (
    // 🚀 CIRURGIA ESTÉTICA E ESTRUTURAL PREMIUM:
    // 1. bg-gradient: Trocado por um gradiente SaaS minimalista (White -> Esmeralda Ultra Light -> White). Dá foco central.
    // 2. py-12 md:py-16: Removido o padding forçado. Agora o componente respira pelas margens da page.tsx e pela máscara de fusão.
    // 3. border-t: Removido para evitar quebras visuais duras. O luxo é feito de transições suaves.
    // 4. maskImage: Aplicada uma máscara de gradiente reverso para fundir o componente com o topo e o final da página (Hero e Footer). ISSO MATA O BURACÃO!
    <section
      className="relative w-full min-h-[auto] bg-gradient-to-b from-white via-[#E6F9F0]/60 to-white pt-10 pb-12 lg:pt-16 lg:pb-20 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      {/* Luz Esmeralda Centralizada e Difusa (Efeito Aura SaaS) */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Onda Abstrata Canto Inferior Esquerdo (Suavizada) */}
      <div className="absolute bottom-0 left-0 w-full md:w-[60%] h-[300px] pointer-events-none overflow-hidden opacity-30">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 800 400"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,400 C150,300 250,150 100,50 C0,-50 300,0 450,150 C600,300 700,350 800,250 L800,400 L0,400 Z"
            fill="url(#bottom-wave-premium)"
          />
          <defs>
            <linearGradient
              id="bottom-wave-premium"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Padrão de Pontos Digitais (Ultra Sutil - Apenas Textura) */}
      <div
        className="absolute bottom-6 left-6 w-56 h-36 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#10b981 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className="absolute top-10 right-10 w-48 h-32 opacity-10 pointer-events-none hidden sm:block"
        style={{
          backgroundImage: "radial-gradient(#059669 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* =========================================================================
          🎯 CONTEÚDO PRINCIPAL (Mantida sua estrutura excelente!)
          ========================================================================= */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
        {/* Título da Seção Otimizado (text-3xl/text-4xl) */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-2.5">
            Por que usar o{" "}
            <span className="text-emerald-600 drop-shadow-[0_0_20px_rgba(0,168,107,0.1)]">
              Tafanu?
            </span>
          </h2>
          <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Mais que um guia, uma experiência completa, rápida e segura para o
            seu dia a dia.
          </p>
        </div>

        {/* GRID DE CARTÕES (Mantida sua estrutura de 2 colunas no mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {REASONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-5 md:p-6 rounded-[1.8rem] bg-white border border-slate-100 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.1)] hover:border-emerald-100 transition-all duration-300 group"
              >
                {/* Ícone Container (Mantido w-10 h-10) */}
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                  <Icon size={20} strokeWidth={2.3} />
                </div>

                {/* Título (text-sm/text-base) */}
                <h3 className="text-sm md:text-base font-bold text-slate-800 tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>

                {/* Descrição (text-[11px]/text-xs) */}
                <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
