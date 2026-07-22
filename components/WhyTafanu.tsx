"use client";

import { ShieldCheck, MapPin, Zap, MessageCircle } from "lucide-react";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Confiança",
    desc: "Apenas empresas e profissionais verificados e recomendados.",
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
    icon: MessageCircle,
    title: "Atendimento",
    desc: "Fale direto com os donos no WhatsApp e tire suas dúvidas.",
  },
];

export default function WhyTafanu() {
  return (
    // 🚀 CIRURGIA: py-28 cortado para py-12 md:py-16! Fica fino, elegante e proporcional.
    <section className="relative w-full bg-gradient-to-b from-[#F8FAFC] via-[#ECFDF5] to-[#E6F9F0] py-12 md:py-16 border-t border-slate-200/60 overflow-hidden">
      {/* Luz Esmeralda Topo Direita */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-gradient-to-bl from-emerald-400/25 via-teal-300/15 to-transparent rounded-full blur-[90px] pointer-events-none" />

      {/* Onda Abstrata Canto Inferior Esquerdo */}
      <div className="absolute bottom-0 left-0 w-full md:w-[50%] h-[250px] pointer-events-none overflow-hidden opacity-50">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 800 400"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,400 C150,300 250,150 100,50 C0,-50 300,0 450,150 C600,300 700,350 800,250 L800,400 L0,400 Z"
            fill="url(#bottom-wave)"
          />
          <defs>
            <linearGradient
              id="bottom-wave"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Padrão de Pontos Digitais */}
      <div
        className="absolute bottom-4 left-6 w-56 h-36 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#10b981 1.8px, transparent 1.8px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute top-6 right-8 w-48 h-32 opacity-25 pointer-events-none hidden sm:block"
        style={{
          backgroundImage: "radial-gradient(#059669 1.8px, transparent 1.8px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Título da Seção Compacto */}
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic mb-1.5">
            Por que usar o{" "}
            <span className="text-tafanu-action drop-shadow-sm">Tafanu?</span>
          </h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm">
            Mais que um guia, uma experiência completa e segura para o seu dia a
            dia.
          </p>
        </div>

        {/* Grade de Cards mais fina (padding de p-8 reduzido para p-5 md:p-6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {REASONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-5 md:p-6 rounded-[1.8rem] bg-white/90 backdrop-blur-md border border-white shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-tafanu-action mb-4 group-hover:scale-110 group-hover:bg-tafanu-action group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Icon size={24} strokeWidth={2.2} />
                </div>

                <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight mb-1.5 group-hover:text-tafanu-action transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
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
