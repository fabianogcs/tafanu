"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies
    const consent = localStorage.getItem("tafanu-cookie-consent");

    // Sem delay: aparece imediatamente assim que a página renderiza
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("tafanu-cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    /* 🚀 DESIGN MAIS ENCORPADO: Maior e mais confortável para leitura, mas sem bloquear a tela toda */
    <div className="fixed bottom-0 md:bottom-6 left-0 md:left-1/2 md:-translate-x-1/2 z-[9999] w-full md:w-[90%] md:max-w-4xl px-4 pb-4 md:px-0 md:pb-0 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-[#050B14]/95 backdrop-blur-xl border border-white/15 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Ícone maior para dar destaque no PC */}
        <div className="bg-white/5 p-3 rounded-2xl flex-shrink-0 hidden md:flex">
          <Cookie className="text-tafanu-action" size={28} />
        </div>

        {/* Textos maiores e com melhor espaçamento */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <h3 className="text-white font-bold text-sm mb-1.5 md:hidden">
            Privacidade e Cookies
          </h3>
          <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
            Usamos cookies para melhorar sua experiência no{" "}
            <strong className="text-white font-black">Tafanu</strong>. Ao
            continuar navegando, você concorda com nossa política.
          </p>
        </div>

        {/* Botões mais largos e altos */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
          <button
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-tafanu-action hover:bg-emerald-400 text-[#050B14] font-black px-6 md:px-10 py-3 md:py-3.5 rounded-xl transition-all uppercase text-[10px] md:text-xs tracking-widest whitespace-nowrap"
          >
            Aceitar
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            aria-label="Fechar aviso"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
