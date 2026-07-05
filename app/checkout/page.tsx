"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import {
  createSubscription,
  getAuthSession,
  getBusinessExpiration,
  checkTrialStatus,
} from "@/app/actions";

const PLANS = {
  monthly: {
    id: "monthly",
    name: "Mensal",
    price: "39,90",
    description: "Equivale a R$ 1,33 por dia",
    footer: "R$ 39,90 / mês",
  },
} as const;

type PlanType = keyof typeof PLANS;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");

  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTrialEligible, setIsTrialEligible] = useState(true); // 🚀 Confere se o cliente é elegível ao trial

  const hasFetched = useRef(false);

  useEffect(() => {
    async function checkStatus() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        const serverSession = await getAuthSession();
        if (!serverSession) {
          window.location.href = "/login?callbackUrl=/checkout";
          return;
        }
      }

      if (hasFetched.current) return;
      hasFetched.current = true;

      let expirationDate = null;

      try {
        const [expiration, trialCheck] = await Promise.all([
          getBusinessExpiration(),
          checkTrialStatus(),
        ]);

        if (expiration) {
          expirationDate = new Date(expiration);
          setExpiresAt(expirationDate);
        }
        if (trialCheck && typeof trialCheck.eligible === "boolean") {
          setIsTrialEligible(trialCheck.eligible);
        }
      } catch (error) {
        console.log("Usuário não possui loja ainda.");
      } finally {
        setIsLoadingData(false);
      }

      const role = session?.user?.role;
      const isPlanoAtivo = expirationDate
        ? expirationDate.getTime() > Date.now()
        : false;

      if (role === "ADMIN") {
        router.replace("/admin");
      } else if (role === "AFILIADO") {
        router.replace("/dashboard");
      } else if (role === "ASSINANTE" && isPlanoAtivo) {
        router.replace("/dashboard");
      }
    }

    checkStatus();
  }, [session, status, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const serverSession = await getAuthSession();

      if (!serverSession?.id || !serverSession?.email) {
        toast.error("Sessão não encontrada. Faça login novamente.");
        setIsProcessing(false);
        return;
      }

      const res = await createSubscription(
        serverSession.id,
        serverSession.email,
        "",
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

  const isPlanoAtivoRender = expiresAt
    ? expiresAt.getTime() > Date.now()
    : false;

  if (
    status === "loading" ||
    isLoadingData ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "AFILIADO" ||
    (session?.user?.role === "ASSINANTE" && isPlanoAtivoRender)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B14]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  const plan = PLANS[selectedPlan];

  return (
    <div className="bg-[#050B14] min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-6 px-6 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">
          Ative seu plano <span className="text-emerald-500">Tafanu PRO</span>
        </h1>
        <p className="text-slate-400 font-medium mt-3">
          Acesso imediato ao painel. Cancele quando quiser diretamente pela
          plataforma.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-6">
        {/* COLUNA 1: CARD DINÂMICO DE SELEÇÃO */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="relative p-8 rounded-[2rem] border-2 text-center transition-all w-full flex flex-col items-center justify-center border-emerald-500 bg-[#0D172A] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
          >
            {/* TAG DINÂMICA BASEADA NO HISTÓRICO DO CLIENTE */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#050B14] text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
              {isTrialEligible
                ? "🎁 7 Dias Grátis Inclusos"
                : "⚡ Ativação Imediata"}
            </div>

            <h3 className="font-black uppercase italic text-xl text-emerald-500">
              {plan.name}
            </h3>

            {/* PREÇO COMPORTAMENTAL */}
            <div className="flex flex-col items-center mt-4">
              {isTrialEligible ? (
                <>
                  <p className="text-sm font-bold text-slate-400 line-through">
                    R$ 39,90
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">
                      R$ 0,00
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">
                      hoje
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <span className="text-5xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    /mês
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider bg-white/5 px-4 py-1.5 rounded-full">
              {plan.description}
            </p>

            {/* CTA INTERESSANTE E TRANSPARENTE */}
            <div className="mt-8 w-full py-4 rounded-xl bg-emerald-500 text-[#050B14] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg group-hover:bg-emerald-400 transition-colors">
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isTrialEligible
                    ? "Iniciar Teste Gratuito"
                    : "Ativar Minha Vitrine"}{" "}
                  <CheckCircle2 size={18} strokeWidth={3} />
                </>
              )}
            </div>
          </button>
        </div>

        {/* COLUNA 2: RECURSOS INCLUSOS */}
        <div className="lg:col-span-4 bg-[#0A1220] rounded-[2rem] p-6 border border-white/5 shadow-xl flex flex-col justify-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-3 px-2">
            <Sparkles className="text-emerald-500 w-4 h-4 shrink-0" />O que você
            recebe:
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Vitrine Premium e Buscas",
                desc: "Destaque total no nosso sistema de busca local e indexação automática.",
              },
              {
                title: "Pedidos e Orçamentos Livres",
                desc: "Receba contatos diretos no WhatsApp sem pagar comissão por venda.",
              },
              {
                title: "Gestão Kanban Integrada",
                desc: "Organize seus leads de prospecção e clientes do contato ao fechamento.",
              },
              {
                title: "O Ímã do Google (SEO Local)",
                desc: "Código otimizado para o robô do Google achar sua loja na sua região.",
              },
              {
                title: "Impressão Térmica Direta",
                desc: "Imprima orçamentos e comandas em aparelhos de 58mm/80mm num clique.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 transition-colors hover:bg-emerald-500/5"
              >
                <CheckCircle2
                  className="text-emerald-500 shrink-0 w-4 h-4 mt-0.5"
                  strokeWidth={2.5}
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white uppercase tracking-wider mb-0.5">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 3: CAIXA CENTRAL DO MERCADO PAGO */}
        <div className="lg:col-span-4 bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/10">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              Resumo do Pedido
            </span>
            <span className="font-mono text-[10px] font-bold tracking-widest text-white/80">
              MERCADO PAGO
            </span>
          </div>
          <div className="p-8 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Total a pagar hoje
            </p>
            <div className="flex items-start justify-center gap-1">
              <span className="text-xl font-black mt-2 text-emerald-500">
                R$
              </span>
              <span className="text-6xl font-black italic leading-none drop-shadow-md">
                {isTrialEligible ? "0,00" : plan.price}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-8 group w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-[#050814] rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all transform hover:scale-[1.01] active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center gap-2">
                  {isTrialEligible
                    ? "Garantir Meu Teste"
                    : "Ir Para o Pagamento"}{" "}
                  <ShieldCheck size={18} />
                </span>
              )}
            </button>

            <p className="text-slate-500 text-[9px] uppercase font-black mt-6 px-1 leading-relaxed tracking-wider">
              {isTrialEligible
                ? "Garantia de 7 dias grátis. A primeira cobrança de R$ 39,90 só ocorrerá no 8º dia se você mantiver a vitrine ativa. Cancele quando quiser no painel."
                : "Renovação mensal de R$ 39,90 recorrente. Liberação imediata dos recursos do portal após a aprovação do gateway."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
