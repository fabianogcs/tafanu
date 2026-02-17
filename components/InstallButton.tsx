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
    // 1. Se for iOS, não tem jeito, é manual mesmo.
    if (isIOS) {
      setShowInstructions(!showInstructions);
      return;
    }

    // 2. Tenta pegar o evento que o Porteiro guardou na "janela" (window)
    const deferredPrompt = (window as any).deferredPrompt;

    if (deferredPrompt) {
      // SE O EVENTO EXISTE, DISPARA O INSTALADOR REAL! 🚀
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        await incrementInstallCount(businessSlug);
        toast.success(`App ${businessName} instalado!`);
        setShowInstructions(false);
        // Limpa o evento para não instalar duas vezes seguidas
        (window as any).deferredPrompt = null;
      }
    } else {
      // SE O EVENTO NÃO EXISTE (Já instalado ou bloqueado), MOSTRA AS INSTRUÇÕES
      setShowInstructions(!showInstructions);
      if (!showInstructions) {
        toast.info("Siga as instruções abaixo para instalar.");
      }
    }
  };

  if (isStandalone) return null;

  return (
    // Reduzi o mb-8 para mb-2 e removi paddings desnecessários na div pai
    <div className="w-full flex flex-col items-center justify-center px-4 mb-2">
      {/* Botão com efeito de "Glow" na borda que pulsa suavemente */}
      <div className="relative w-full max-w-md group">
        {/* Sombra de brilho sutil ao redor (não trava o celular) */}
        <div className="absolute -inset-0.5 bg-indigo-500/30 rounded-2xl blur opacity-75 group-hover:opacity-100 animate-pulse transition duration-1000"></div>

        <button
          onClick={handleInstall}
          className="
              relative w-full 
              bg-slate-900 hover:bg-slate-800
              text-white py-3.5 px-5 rounded-2xl 
              flex items-center gap-4 
              border border-slate-700/50 group-hover:border-indigo-500/50 
              transition-all duration-300 active:scale-[0.97]
              overflow-hidden
          "
        >
          {/* Efeito de brilho que passa apenas UM vez a cada 3 segundos (configurado no tailwind) */}
          <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />

          {/* Logo um pouco menor para reduzir a altura total */}
          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={businessLogo}
              alt="App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-left overflow-hidden">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
              {hasDeferredPrompt ? "Instalação Oficial" : "App Exclusivo"}
            </p>
            <p className="text-base font-black text-white leading-tight truncate">
              {businessName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] text-slate-400 truncate font-medium">
                Instalar no celular
              </p>
            </div>
          </div>

          <div className="text-indigo-400 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <Download size={18} />
          </div>
        </button>
      </div>

      {/* Instruções compactas */}
      {showInstructions && (
        <div className="w-full max-w-md mt-2 bg-slate-900 border border-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-1 shadow-2xl">
          <p className="text-[11px] font-bold text-slate-500 mb-3 text-center uppercase tracking-widest">
            Passo a passo rápido:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {isIOS ? (
              <>
                <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <Share size={14} className="text-blue-500" />
                  <span className="text-xs text-slate-300">
                    Toque em <strong>Compartilhar</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <PlusSquare size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-300">
                    <strong>Adicionar à Tela de Início</strong>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <MoreVertical size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-300">
                    Toque nos <strong>3 pontinhos</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <Smartphone size={14} className="text-indigo-400" />
                  <span className="text-xs text-slate-300">
                    Clique em <strong>Instalar App</strong>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
