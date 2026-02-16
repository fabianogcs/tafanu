"use client";
import { useState, useEffect } from "react";
import { X, Share, PlusSquare, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt({
  businessName,
}: {
  businessName: string;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Verifica se já está instalado (Modo Standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return; // Se já for app, não mostra nada.

    // 2. Detecta se é iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Lógica para Android (Captura o evento de instalação)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Só mostra se ainda não tiver fechado hoje
      const hasClosed = localStorage.getItem("install_prompt_closed");
      if (!hasClosed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Para iOS, mostramos logo de cara (se não tiver fechado)
    if (isIosDevice) {
      const hasClosed = localStorage.getItem("install_prompt_closed");
      if (!hasClosed) setShowPrompt(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      // No iOS não dá pra instalar automático, apenas mostramos o tutorial
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Salva no navegador para não mostrar de novo por hoje
    localStorage.setItem("install_prompt_closed", "true");
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">
          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">
                Instalar {businessName}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {isIOS
                  ? "Instale este app no seu iPhone para acessar mais rápido e offline."
                  : "Adicione à sua tela inicial para uma experiência de App nativo."}
              </p>

              {isIOS ? (
                // --- INSTRUÇÕES PARA iOS ---
                <div className="text-xs text-slate-400 space-y-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    1. Toque em <Share size={14} className="text-blue-400" />{" "}
                    (Compartilhar)
                  </div>
                  <div className="flex items-center gap-2">
                    2. Selecione{" "}
                    <PlusSquare size={14} className="text-slate-200" />{" "}
                    <strong>Adicionar à Tela de Início</strong>
                  </div>
                </div>
              ) : (
                // --- BOTÃO PARA ANDROID ---
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors w-full"
                >
                  Instalar Agora
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
