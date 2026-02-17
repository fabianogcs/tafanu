"use client";
import { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  Smartphone,
} from "lucide-react";
import { incrementInstallCount } from "@/app/actions";
import { toast } from "sonner";

interface InstallButtonProps {
  businessSlug: string;
  businessName: string;
  businessLogo: string;
}

export default function InstallButton({
  businessSlug,
  businessName,
  businessLogo,
}: InstallButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);

  useEffect(() => {
    const inStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (inStandaloneMode) setIsStandalone(true);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const checkAndSetPrompt = () => {
      if ((window as any).deferredPrompt) setHasDeferredPrompt(true);
    };

    checkAndSetPrompt();
    window.addEventListener("beforeinstallprompt", checkAndSetPrompt);
    window.addEventListener("pwa-ready", checkAndSetPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", checkAndSetPrompt);
      window.removeEventListener("pwa-ready", checkAndSetPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(!showInstructions);
      return;
    }

    const deferredPrompt = (window as any).deferredPrompt;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        await incrementInstallCount(businessSlug);
        toast.success(`App ${businessName} instalado!`);
        setShowInstructions(false);
      }
      return;
    }
    setShowInstructions(!showInstructions);
  };

  if (isStandalone) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 mb-8">
      {/* CONTAINER DO BOTÃO COM EFEITO DE PULSO ATRÁS */}
      <div className="relative w-full max-w-[95%] md:max-w-md group">
        {/* Efeito de Ondas (Ping) saindo de trás do botão */}
        <span className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping duration-[3000ms]" />

        <button
          onClick={handleInstall}
          className="
              relative w-full 
              bg-slate-800 hover:bg-slate-700
              text-white py-5 px-6 rounded-2xl 
              flex items-center gap-4 
              shadow-2xl shadow-indigo-500/20
              border border-slate-700 hover:border-indigo-500/50 
              transition-all duration-500 active:scale-[0.95]
              overflow-hidden
              animate-bounce-slow
          "
        >
          {/* EFEITO DE BRILHO (SHINE) QUE PASSA PELO BOTÃO */}
          <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />

          <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 border-slate-600 group-hover:border-indigo-500 transition-colors bg-slate-900 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={businessLogo}
              alt="App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-left overflow-hidden">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">
              {hasDeferredPrompt ? "Instalar Oficial" : "Baixar Aplicativo"}
            </p>
            <p className="text-lg font-black text-white leading-tight truncate">
              {businessName}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Disponível para seu celular
            </p>
          </div>

          <div className="text-white bg-indigo-600 p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
            <Download size={22} />
          </div>
        </button>
      </div>

      {/* ÁREA DE INSTRUÇÕES (IGUAL ANTERIOR) */}
      {showInstructions && (
        <div className="w-full max-w-[95%] md:max-w-md mt-4 bg-slate-900/95 backdrop-blur border border-slate-800 p-5 rounded-xl animate-in fade-in zoom-in-95 shadow-2xl">
          <p className="text-sm font-bold text-white mb-4 text-center border-b border-slate-800 pb-2">
            Como instalar o App:
          </p>
          {isIOS ? (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  1
                </span>
                <span>
                  Toque no ícone{" "}
                  <Share size={14} className="inline text-blue-500 mx-1" />{" "}
                  <strong>Compartilhar</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  2
                </span>
                <span>
                  Toque em{" "}
                  <PlusSquare
                    size={14}
                    className="inline text-slate-400 mx-1"
                  />{" "}
                  <strong>Adicionar à Tela de Início</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  1
                </span>
                <span>
                  Toque nos <strong>3 pontinhos</strong> do Chrome{" "}
                  <MoreVertical size={14} className="inline text-slate-400" />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  2
                </span>
                <span>
                  Escolha{" "}
                  <Smartphone
                    size={14}
                    className="inline text-slate-400 mx-1"
                  />{" "}
                  <strong>Instalar Aplicativo</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
