"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // 👈 Importamos a sessão
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { upgradeUserToAssinante } from "@/app/actions";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [isActivating, setIsActivating] = useState(false); // Novo estado para o botão
  const router = useRouter();
  const { update } = useSession(); // 👈 Pegamos a função de atualizar

  useEffect(() => {
    const processUpgrade = async () => {
      try {
        await upgradeUserToAssinante();

        // Tenta atualizar a sessão silenciosamente assim que carrega
        await update();

        setTimeout(() => {
          setStatus("success");
          router.refresh();

          // CONFETES 🎉
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

          const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);

            confetti({
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ["#023059", "#F28705", "#ffffff"],
            });
            confetti({
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ["#023059", "#F28705", "#ffffff"],
            });
          }, 250);
        }, 1500);
      } catch (error) {
        console.error("Erro ao atualizar plano:", error);
        setStatus("success");
      }
    };

    processUpgrade();
  }, []);

  // 🚀 FUNÇÃO BLINDADA: Só navega depois de ter certeza que o crachá mudou
  const handleActivate = async () => {
    setIsActivating(true);

    // 1. Força a atualização do token no servidor
    await update();

    // 2. Dá um reload forçado para garantir que o Middleware leia o novo cookie
    window.location.href = "/dashboard/perfil";
  };

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="absolute inset-0 bg-tafanu-action rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="w-20 h-20 bg-tafanu-blue rounded-[24px] flex items-center justify-center shadow-2xl relative z-10">
            <Loader2 className="text-white animate-spin" size={40} />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-black text-tafanu-blue uppercase italic tracking-tighter animate-pulse">
          Validando pagamento...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 animate-in zoom-in duration-500">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-tafanu-blue/10 border border-gray-100 overflow-hidden">
        {/* TOPO */}
        <div className="bg-tafanu-blue p-10 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-tafanu-action/10 rounded-full -mr-16 -mb-16 animate-bounce" />

          <div className="w-24 h-24 bg-tafanu-action rounded-[30px] flex items-center justify-center text-tafanu-blue mb-6 shadow-2xl shadow-tafanu-action/40 animate-in bounce-in duration-1000">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-2 text-center">
            Bem-vindo ao <br />
            <span className="text-tafanu-action">Time!</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px]">
            Pagamento Confirmado
          </p>
        </div>

        {/* CONTEÚDO */}
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
              <Sparkles size={14} /> Assinatura Ativa
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase italic">
              Falta pouco para anunciar!
            </h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Para garantir a segurança da plataforma, precisamos que você
              acesse seu painel e valide seus dados (CPF e WhatsApp).
            </p>
          </div>

          {/* 🚀 BOTÃO DE AÇÃO QUE FORÇA O UPDATE */}
          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="group w-full flex flex-col items-center justify-center p-6 bg-tafanu-blue rounded-[24px] transition-all hover:bg-[#0f172a] hover:scale-[1.02] shadow-xl shadow-tafanu-blue/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isActivating ? (
              <div className="flex items-center gap-3 mb-1">
                <Loader2 className="text-white animate-spin" size={24} />
                <span className="font-black text-white uppercase italic tracking-tighter text-lg">
                  Atualizando Acesso...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck
                  className="text-tafanu-action group-hover:animate-pulse"
                  size={24}
                />
                <span className="font-black text-white uppercase italic tracking-tighter text-lg">
                  Ativar Minha Conta
                </span>
              </div>
            )}
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
              Ir para validação de dados{" "}
              {!isActivating && (
                <ArrowRight className="inline ml-1" size={10} />
              )}
            </span>
          </button>

          <div className="pt-6 border-t border-gray-50 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Ambiente seguro Tafanu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
