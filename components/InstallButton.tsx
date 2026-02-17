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

  // Estado para saber se o "Automático" está disponível
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está DENTRO do App
    const inStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (inStandaloneMode) {
      setIsStandalone(true);
    }

    // 2. Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIos);

    // 3. Monitora o "Interfone" (Evento Automático)
    const checkAndSetPrompt = () => {
      if ((window as any).deferredPrompt) {
        setHasDeferredPrompt(true);
      }
    };

    // Checa agora
    checkAndSetPrompt();

    // Fica ouvindo caso chegue depois
    window.addEventListener("beforeinstallprompt", checkAndSetPrompt);
    window.addEventListener("pwa-ready", checkAndSetPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", checkAndSetPrompt);
      window.removeEventListener("pwa-ready", checkAndSetPrompt);
    };
  }, []);

  const handleInstall = async () => {
    // Se for iOS, sempre mostra instruções
    if (isIOS) {
      setShowInstructions(!showInstructions);
      return;
    }

    // Tenta pegar o evento automático
    const deferredPrompt = (window as any).deferredPrompt;

    // CENÁRIO A: Instalação Automática Disponível
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

    // CENÁRIO B: Sem instalação automática (Já instalado ou Bloqueado)
    // Mostra as instruções manuais do Android (3 pontinhos)
    setShowInstructions(!showInstructions);
  };

  // REGRA DE OURO: Só esconde se estiver USANDO o app.
  // Se estiver no navegador (mesmo que já instalado), MOSTRA O BOTÃO.
  if (isStandalone) return null;

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
            alt="App Icon"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-left overflow-hidden">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest truncate">
            {hasDeferredPrompt ? "Instalar Agora" : "Baixar Aplicativo"}
          </p>
          <p className="text-base font-black text-white leading-tight truncate">
            {businessName}
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {isIOS ? "Instale no iPhone" : "Acesso rápido e offline"}
          </p>
        </div>

        <div className="text-slate-500 group-hover:text-white transition-colors pl-2 border-l border-slate-700">
          <Download size={20} />
        </div>
      </button>

      {/* ÁREA DE INSTRUÇÕES (Aparece se clicar e não der pra instalar direto) */}
      {showInstructions && (
        <div className="w-full max-w-[95%] md:max-w-md mt-4 bg-slate-900/95 backdrop-blur border border-slate-800 p-5 rounded-xl animate-in fade-in slide-in-from-top-2 shadow-2xl">
          <p className="text-sm font-bold text-white mb-4 text-center border-b border-slate-800 pb-2">
            Como instalar o App:
          </p>

          {isIOS ? (
            // INSTRUÇÕES iOS (iPhone)
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  1
                </span>
                <span>
                  Toque no botão{" "}
                  <Share size={14} className="inline text-blue-500 mx-1" />{" "}
                  <strong>Compartilhar</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  2
                </span>
                <span>
                  Role e toque em{" "}
                  <PlusSquare
                    size={14}
                    className="inline text-slate-400 mx-1"
                  />{" "}
                  <strong>Adicionar à Tela de Início</strong>
                </span>
              </div>
            </div>
          ) : (
            // INSTRUÇÕES ANDROID (Quando o automático falha)
            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-center text-slate-400 italic mb-2">
                Se a instalação automática não abriu:
              </p>
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  1
                </span>
                <span>
                  Toque nos <strong>3 pontinhos</strong> do navegador{" "}
                  <MoreVertical size={14} className="inline text-slate-400" />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white">
                  2
                </span>
                <span>
                  Selecione{" "}
                  <Smartphone
                    size={14}
                    className="inline text-slate-400 mx-1"
                  />{" "}
                  <strong>Instalar Aplicativo</strong> ou{" "}
                  <strong>Adicionar à Tela Inicial</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
