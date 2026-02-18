"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  PartyPopper,
} from "lucide-react";
import { upgradeUserToAssinante } from "@/app/actions";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();

  // --- 1. SEGURANÇA E BLOQUEIO ---
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

  // --- 2. O CORAÇÃO DA PÁGINA: UPGRADE E CONFETES ---
  useEffect(() => {
    const processUpgrade = async () => {
      // Só rodamos o upgrade se o cara ainda for VISITANTE
      if (session?.user?.role === "VISITANTE") {
        try {
          await upgradeUserToAssinante();
          // Esperamos o "crachá" da sessão atualizar de verdade
          await update();
        } catch (error) {
          console.error("Erro no upgrade:", error);
        }
      }

      // Pequena pausa para o usuário sentir que algo importante aconteceu
      setTimeout(() => {
        setStatus("success");

        // 🎉 EXPLOSÃO DE CONFETES PROFISSIONAL
        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 1000 };

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: ["#023059", "#10b981", "#ffffff"], // Cores do Tafanu
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }, 2000);
    };

    if (sessionStatus === "authenticated") {
      processUpgrade();
    }
  }, [sessionStatus, session?.user?.role, update]);

  // --- 3. ATIVAÇÃO FINAL (window.location limpa o cache) ---
  const handleActivate = async () => {
    setIsActivating(true);
    await update();
    // Forçamos o recarregamento total para evitar cair no dashboard de visitante
    window.location.href = "/dashboard/perfil";
  };

  // TELA DE LOADING PREMIUM
  if (status === "loading" || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-tafanu-action rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="w-24 h-24 bg-tafanu-blue rounded-[32px] flex items-center justify-center shadow-2xl relative z-10">
            <Loader2 className="text-white animate-spin" size={48} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-tafanu-blue uppercase italic tracking-tighter animate-pulse mb-2">
          Validando seu acesso VIP
        </h2>
        <p className="text-slate-400 font-medium max-w-xs uppercase text-[10px] tracking-widest">
          Estamos preparando sua vitrine de elite...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-tafanu-blue/5 border border-slate-100 overflow-hidden animate-in zoom-in duration-700">
        {/* HEADER COM GRADIENTE */}
        <div className="bg-[#050814] p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tafanu-action/20 via-transparent to-transparent"></div>

          <div className="w-24 h-24 bg-tafanu-action rounded-[30px] flex items-center justify-center text-[#050814] mb-8 shadow-2xl shadow-tafanu-action/40 animate-bounce">
            <CheckCircle2 size={54} strokeWidth={3} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4 relative z-10">
            VOCÊ ESTÁ NO <br />
            <span className="text-tafanu-action font-black">
              TIME DE ELITE!
            </span>
          </h1>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 relative z-10">
            <PartyPopper size={14} className="text-tafanu-action" />
            <p className="text-white font-bold uppercase tracking-[0.2em] text-[9px]">
              Assinatura confirmada com sucesso
            </p>
          </div>
        </div>

        {/* CONTEÚDO E AÇÃO */}
        <div className="p-10 md:p-14 space-y-10">
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              SUA VITRINE ESTÁ PRONTA!
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              O pagamento de{" "}
              <span className="text-tafanu-blue font-black">R$ 1,00</span> foi
              processado. Agora você tem acesso total para cadastrar seus
              produtos, fotos e receber contatos ilimitados no WhatsApp.
            </p>
          </div>

          {/* BOTÃO DE IMPACTO */}
          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="group w-full flex flex-col items-center justify-center p-8 bg-tafanu-blue rounded-[28px] transition-all hover:bg-[#0f172a] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-tafanu-blue/30 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isActivating ? (
              <div className="flex items-center gap-4">
                <Loader2 className="text-white animate-spin" size={28} />
                <span className="font-black text-white uppercase italic tracking-tighter text-xl">
                  Sincronizando...
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <ShieldCheck
                    className="text-tafanu-action group-hover:rotate-12 transition-transform"
                    size={28}
                    strokeWidth={2.5}
                  />
                  <span className="font-black text-white uppercase italic tracking-tighter text-2xl">
                    ATIVAR MEU PAINEL
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/50 font-black uppercase text-[10px] tracking-widest">
                  COMEÇAR A VENDER AGORA <ArrowRight size={14} />
                </div>
              </>
            )}
          </button>

          <div className="pt-8 border-t border-slate-50 text-center">
            <div className="flex justify-center gap-6 opacity-30 grayscale mb-4">
              <span className="text-[10px] font-black uppercase">
                Mercado Pago
              </span>
              <span className="text-[10px] font-black uppercase">
                SSL Secure
              </span>
              <span className="text-[10px] font-black uppercase">
                Tafanu Business
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              Seu faturamento começa aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
