"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createSubscription, getAuthSession } from "@/app/actions";

// Definição dos planos para facilitar a manutenção
const PLANS = {
  monthly: {
    id: "monthly",
    name: "Mensal",
    price: "29,90",
    initialPrice: "0,00",
    description: "7 dias grátis",
    footer: "R$ 29,90 / mês após o teste",
    badge: "O mais popular",
  },
  quarterly: {
    id: "quarterly",
    name: "Trimestral",
    price: "74,70",
    initialPrice: "74,70",
    description: "R$ 24,90/mês",
    footer: "Cobrado a cada 3 meses",
    badge: "17% OFF",
  },
  yearly: {
    id: "yearly",
    name: "Anual",
    price: "238,80",
    initialPrice: "238,80",
    description: "R$ 19,90/mês",
    footer: "Cobrado anualmente",
    badge: "MELHOR VALOR",
  },
} as const;

type PlanType = keyof typeof PLANS;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession() as any;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");

  // --- SEGURANÇA E SINCRONIZAÇÃO TREINADA 🛡️ ---
  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && !session?.user?.id) {
      update();
    }

    const role = session?.user?.role;
    const expiresAt = session?.user?.expiresAt;

    // O segurança olha a data de validade!
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

    if (role === "ADMIN") {
      router.replace("/admin");
    }
    // Se for assinante E NÃO ESTIVER VENCIDO, manda pro dashboard.
    // Se estiver vencido (isExpired = true), a porta do checkout fica aberta!
    else if (role === "ASSINANTE" && !isExpired) {
      router.replace("/dashboard");
    }
  }, [session, status, router, update]);

  // --- LÓGICA DE PAGAMENTO ---
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const serverSession = await getAuthSession();

      if (!serverSession?.id || !serverSession?.email) {
        toast.error("Sessão não encontrada. Faça login novamente.");
        setIsProcessing(false);
        return;
      }

      // Passamos o selectedPlan para a Action
      const res = await createSubscription(
        serverSession.id,
        serverSession.email,
        selectedPlan,
      );

      if (res.success && res.init_point) {
        window.location.href = res.init_point;
      } else {
        toast.error(res.error || "Erro ao gerar pagamento.");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Erro interno. Tente novamente.");
      setIsProcessing(false);
    }
  };

  // Trava visual atualizada: Só mostra o "Loader" infinito bloqueando a tela
  // se ele for ASSINANTE com tempo sobrando (!isExpired).
  const isExpired = session?.user?.expiresAt
    ? new Date(session.user.expiresAt) < new Date()
    : false;

  if (
    status === "loading" ||
    (session?.user?.role === "ASSINANTE" && !isExpired)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <div className="max-w-6xl mx-auto pt-8 pb-4 px-6 text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#050814] tracking-tighter uppercase italic">
          Escolha seu plano <span className="text-emerald-500">Tafanu PRO</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Cancele quando quiser. Sem taxas escondidas.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-8">
        {/* COLUNA ESQUERDA: PLANOS E BENEFÍCIOS */}
        <div className="lg:col-span-7 space-y-8">
          {/* SELETOR DE PLANOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(PLANS) as PlanType[]).map((key) => {
              const plan = PLANS[key];
              const isSelected = selectedPlan === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`relative p-6 rounded-[2rem] border-2 text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-white shadow-xl scale-[1.02] z-10"
                      : "border-slate-200 bg-slate-50 opacity-70 hover:opacity-100"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3
                        className={`font-black uppercase italic ${isSelected ? "text-emerald-500" : "text-slate-400"}`}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xs font-bold text-slate-400">
                          R$
                        </span>
                        <span className="text-3xl font-black text-slate-900">
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">
                        {plan.description}
                      </p>
                    </div>
                    <div
                      className={`mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}
                    >
                      {isSelected && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* LISTA DE BENEFÍCIOS */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
              <Sparkles className="text-emerald-500 w-5 h-5" /> Vantagens PRO
              Inclusas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Página Profissional Exclusiva",
                "Destaque no Guia Tafanu",
                "Cliques ilimitados pro WhatsApp",
                "Painel de Métricas Real-time",
                "SEO Local Ativo (Google)",
                "Galeria de Fotos Ultra-Leve",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <CheckCircle2
                    className="text-emerald-500 shrink-0 w-4 h-4"
                    strokeWidth={3}
                  />
                  <span className="text-[11px] font-black text-slate-700 uppercase">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO (STICKY) */}
        <div className="lg:col-span-5">
          <div className="bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/5 sticky top-12">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Resumo do Pedido
              </span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs">mercado</span>
                <span className="font-light text-xs">pago</span>
              </div>
            </div>

            <div className="p-10 text-center border-b border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                Total a pagar hoje
              </p>
              <div className="flex items-start justify-center gap-1">
                <span className="text-xl font-black mt-2 text-emerald-500">
                  R$
                </span>
                <span className="text-7xl md:text-8xl font-black tracking-tighter italic leading-none text-white transition-all">
                  {PLANS[selectedPlan].initialPrice}
                </span>
              </div>
              <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {PLANS[selectedPlan].footer}
              </p>
            </div>

            <div className="p-10 space-y-6">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="group relative w-full h-20 bg-emerald-500 text-[#050814] rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] disabled:opacity-50 overflow-hidden"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Ativar Plano {PLANS[selectedPlan].name}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 py-3 border-y border-white/5">
                <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="text-emerald-500 w-3 h-3" /> Compra
                  Garantida
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Lock className="text-emerald-500 w-3 h-3" /> SSL Seguro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
