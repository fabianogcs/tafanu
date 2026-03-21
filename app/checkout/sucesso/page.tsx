"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  PartyPopper,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const router = useRouter();

  // --- 1. SEGURANÇA BÁSICA E BLOQUEIO DE ADMIN/NÃO LOGADOS ---
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
  }, [session, sessionStatus, router]);

  // --- 2. O CORAÇÃO DA PÁGINA: APENAS CONFETES E CONFIRMAÇÃO ---
  useEffect(() => {
    // Se o usuário já for assinante, a gente assume que ele só está visitando a página
    if (session?.user?.role === "ASSINANTE") {
      setTimeout(() => {
        setStatus("success");
        triggerConfetti();
      }, 1000);
      return;
    }

    // Se ele for visitante, a gente assume que ele acaba de vir do pagamento.
    // Mas nós NÃO fazemos o upgrade aqui. O Webhook cuidará disso.
    setTimeout(() => {
      setStatus("success");
      triggerConfetti();
    }, 1500);
  }, [sessionStatus, session?.user?.role]);

  // 🎉 Função de Confetes isolada
  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 1000 };
    const fire = (particleRatio: number, opts: any) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ["#023059", "#10b981", "#ffffff"],
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleGoToDashboard = () => {
    // ✅ Redirecionamento forçado para limpar o cache da sessão
    window.location.href = "/dashboard";
  };

  if (status === "loading" || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
        <Loader2 className="text-tafanu-blue animate-spin mb-4" size={48} />
        <h2 className="text-2xl font-black text-tafanu-blue uppercase italic">
          Processando sua confirmação...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-700">
        {/* HEADER */}
        <div className="bg-[#050814] p-12 flex flex-col items-center text-center relative">
          <div className="w-20 h-20 bg-tafanu-action rounded-[25px] flex items-center justify-center text-[#050814] mb-6 shadow-xl animate-bounce">
            <CheckCircle2 size={44} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase mb-2">
            PAGAMENTO <span className="text-tafanu-action">RECEBIDO!</span>
          </h1>
          <p className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">
            Estamos liberando seu acesso
          </p>
        </div>

        {/* CONTEÚDO */}
        <div className="p-10 space-y-8 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">
              QUASE LÁ, TIME!
            </h3>
            <p className="text-slate-500 font-medium">
              Sua assinatura está sendo ativada. O Mercado Pago já confirmou o
              recebimento e o seu acesso PRO estará pronto em instantes.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="group w-full flex flex-col items-center justify-center p-6 bg-tafanu-blue rounded-[24px] transition-all hover:bg-[#0f172a] hover:scale-[1.02] active:scale-95"
          >
            <>
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck className="text-tafanu-action" size={24} />
                <span className="font-black text-white uppercase italic text-xl">
                  IR PARA O PAINEL
                </span>
              </div>
              <div className="text-white/50 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1">
                VERIFICAR MEU ACESSO PRO <ArrowRight size={12} />
              </div>
            </>
          </button>
        </div>
      </div>
    </div>
  );
}
