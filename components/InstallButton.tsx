"use client";
import { useState, useEffect } from "react";
import { Download, Share, PlusSquare } from "lucide-react";
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
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false); // Novo estado
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Verifica se JÁ ESTÁ RODANDO COMO APP
    // Se estiver, a gente esconde o botão, pois o usuário já está no app.
    const inStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (inStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. iOS (Sempre mostra no navegador)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    if (isIosDevice) setCanInstall(true);

    // 3. Android/PC (Se tiver o evento, libera o botão)
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);

    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions);
      return;
    }

    const deferredPrompt = (window as any).deferredPrompt;

    if (!deferredPrompt) {
      // Se clicou e não tem evento (ex: debug), só avisa
      toast.info("Instalação não disponível neste navegador/modo.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // NÃO salvamos mais no localStorage para não sumir pra sempre.
      // Apenas escondemos agora momentaneamente.
      setCanInstall(false);
      await incrementInstallCount(businessSlug);
      toast.success(`App ${businessName} instalado!`);
    }
  };

  // LÓGICA FINAL DE EXIBIÇÃO:
  // 1. Se estiver DENTRO do App (Standalone) -> NÃO MOSTRA (Null).
  // 2. Se não puder instalar (Android já instalado ou PC incompatível) -> NÃO MOSTRA.
  // 3. Caso contrário -> MOSTRA.

  if (isStandalone || !canInstall) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button
        onClick={handleInstall}
        className="
            relative w-full max-w-[95%] md:max-w-md 
            bg-slate-800 hover:bg-slate-700
            text-white py-4 px-5 rounded-2xl 
            flex items-center gap-4 
            shadow-xl shadow-black/20
            border border-slate-700 hover:border-indigo-500/50 
            transition-all active:scale-[0.98] group
        "
      >
        <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 border-slate-600 group-hover:border-indigo-500 transition-colors bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={businessLogo}
            alt="Icone do App"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-left overflow-hidden">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest truncate">
            Instalar Aplicativo
          </p>
          <p className="text-base font-black text-white leading-tight truncate">
            {businessName}
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Acesse offline e direto da tela inicial
          </p>
        </div>

        <div className="text-slate-500 group-hover:text-white transition-colors pl-2 border-l border-slate-700">
          <Download size={20} />
        </div>
      </button>

      {showIOSInstructions && isIOS && (
        <div className="w-full max-w-[95%] md:max-w-md mt-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-slate-400 mb-2 text-center uppercase">
            Para instalar no iPhone:
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Share size={14} className="text-blue-500" /> Toque em{" "}
              <strong>Compartilhar</strong>
            </div>
            <div className="flex items-center gap-2">
              <PlusSquare size={14} className="text-slate-400" /> Toque em{" "}
              <strong>Adicionar à Tela de Início</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
