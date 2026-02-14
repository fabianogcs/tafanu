"use client";

import { Wrench, Clock, MessageCircle } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="relative min-h-screen bg-tafanu-blue overflow-hidden flex items-center justify-center px-4">
      {/* LUZES DE FUNDO (PADRÃO TAFANU) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-tafanu-action rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* ÍCONE COM GLASSMORFISM */}
        <div className="inline-flex items-center justify-center p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-[3rem] mb-8 shadow-2xl">
          <Wrench size={64} className="text-tafanu-action animate-spin-slow" />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          Estamos em <span className="text-tafanu-action">Manutenção</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg mx-auto">
          O Tafanu está recebendo melhorias para conectar você ainda melhor.
          Voltaremos em alguns minutos!
        </p>

        {/* BOX DE INFORMAÇÃO RÁPIDA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
            <Clock className="text-tafanu-action mb-2" size={24} />
            <span className="text-white font-bold">Previsão</span>
            <span className="text-gray-400 text-sm">Hoje mesmo</span>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
            <MessageCircle className="text-tafanu-action mb-2" size={24} />
            <span className="text-white font-bold">Dúvidas?</span>
            <span className="text-gray-400 text-sm">fale conosco</span>
          </div>
        </div>

        <div className="mt-12">
          <div className="inline-block px-4 py-2 bg-tafanu-action/10 border border-tafanu-action/20 rounded-full text-tafanu-action text-xs font-black uppercase tracking-widest">
            Agradecemos a paciência
          </div>
        </div>
      </div>
    </div>
  );
}
