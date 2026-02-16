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

  // Criamos uma chave única para este negócio específico
  // Ex: install_closed_Pizzaria do João
  const storageKey = `install_closed_${businessName}`;

  useEffect(() => {
    // 1. Verifica se já está instalado (Modo App)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return; // Se já é app, não mostra.

    // 2. Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Função para mostrar o botão
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // MUDANÇA AQUI: Verifica no SessionStorage (Memória Temporária)
      // e verifica SE ESSE NEGÓCIO ESPECÍFICO foi fechado
      const hasClosed = sessionStorage.getItem(storageKey);

      if (!hasClosed) {
        setShowPrompt(true);
      }
    };

    // Verifica se o porteiro já segurou o evento
    if ((window as any).deferredPrompt) {
      handlePrompt((window as any).deferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // iOS sempre tenta mostrar (se não tiver fechado nessa sessão)
    if (isIosDevice) {
      const hasClosed = sessionStorage.getItem(storageKey);
      if (!hasClosed) setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
    };
  }, [businessName, storageKey]); // Recarrega se mudar o negócio

  const handleInstallClick = () => {
    if (isIOS) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          setShowPrompt(false);
        }
        // Não salvamos o fechamento aqui, pois se ele instalar,
        // o navegador já vai esconder automaticamente na próxima vez.
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      });
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // MUDANÇA: Salva na SESSÃO (Reseta ao fechar o navegador)
    // E salva com o NOME DO NEGÓCIO.
    sessionStorage.setItem(storageKey, "true");
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
                <div className="text-xs text-slate-400 space-y-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    1. Toque em <Share size={14} className="text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    2. Selecione{" "}
                    <PlusSquare size={14} className="text-slate-200" />{" "}
                    <strong>Adicionar à Tela de Início</strong>
                  </div>
                </div>
              ) : (
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
