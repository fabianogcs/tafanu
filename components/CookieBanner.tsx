"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies antes
    const consent = localStorage.getItem("tafanu-cookie-consent");
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-2xl">
      <div className="bg-tafanu-blue/80 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="bg-tafanu-action/20 p-4 rounded-2xl flex-shrink-0">
          <Cookie className="text-tafanu-action" size={32} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-bold text-lg mb-1">
            Privacidade e Cookies
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            O Tafanu utiliza cookies para garantir que você tenha a melhor
            experiência. Ao continuar navegando, você concorda com nossa
            política de uso.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-tafanu-action hover:bg-emerald-400 text-tafanu-blue font-black px-8 h-12 rounded-xl transition-all uppercase text-xs tracking-wider"
          >
            Aceitar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-3 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
