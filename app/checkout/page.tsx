"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
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
  const [isTrialEligible, setIsTrialEligible] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-tafanu-action" size={40} />
      </div>
    );
  }

  const plan = PLANS[selectedPlan];

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans relative">
      {/* 🚀 CIRURGIA 1: BOTÃO WHATSAPP FLUTUANTE DE VENDAS */}
      <a
        href="https://wa.me/5514991406618?text=Ol%C3%A1!%20Estou%20na%20p%C3%A1gina%20de%20Checkout%20do%20Tafanu%20e%20fiquei%20com%20uma%20d%C3%BAvida%20antes%20de%20assinar."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center group"
        title="Falar com Atendimento"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Dúvida no Pagamento?
        </span>
      </a>

      {/* CABEÇALHO LIGHT THEME */}
      <div className="max-w-7xl mx-auto pt-10 pb-6 px-6 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
          Ative seu plano <span className="text-tafanu-action">Tafanu PRO</span>
        </h1>
        <p className="text-slate-500 font-medium mt-3">
          Acesso imediato ao painel. Cancele quando quiser diretamente pela
          plataforma.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-6">
        {/* COLUNA 1: CARD DE SELEÇÃO */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="relative p-8 rounded-[2rem] border-2 text-center transition-all w-full flex flex-col items-center justify-center border-emerald-400 bg-white shadow-xl shadow-emerald-900/5 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-tafanu-action text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-md">
              {isTrialEligible
                ? "🎁 7 Dias Grátis Inclusos"
                : "⚡ Ativação Imediata"}
            </div>

            <h3 className="font-black uppercase italic text-xl text-slate-900">
              {plan.name}
            </h3>

            <div className="flex flex-col items-center mt-4">
              {isTrialEligible ? (
                <>
                  <p className="text-sm font-bold text-slate-400 line-through">
                    R$ 39,90
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-tafanu-action">
                      R$ 0,00
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      hoje
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <span className="text-5xl font-black text-tafanu-action">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    /mês
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full">
              {plan.description}
            </p>

            <div className="mt-8 w-full py-4 rounded-xl bg-tafanu-action text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg group-hover:bg-[#00c27a] transition-colors">
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

        {/* COLUNA 2: RECURSOS INCLUSOS (LIGHT THEME) */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 border border-slate-200 shadow-md flex flex-col justify-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center gap-3 px-2">
            <Sparkles className="text-tafanu-action w-4 h-4 shrink-0" />O que
            você recebe:
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Presença no Buscador Local",
                desc: "Sua empresa rastreada pelo nosso algoritmo de proximidade (Zonas de Calor) para clientes da sua cidade.",
              },
              {
                title: "Tráfego Direto sem Taxas",
                desc: "Receba clientes no seu WhatsApp, iFood ou site próprio sem pagar NENHUMA comissão por venda.",
              },
              {
                title: "Hub de Lojas Oficiais",
                desc: "Centralize Mercado Livre, Shopee, Shein, iFood e redes sociais em uma única vitrine premium.",
              },
              {
                title: "O Ímã do Google (SEO Local)",
                desc: "Código otimizado para o robô do Google achar sua loja e indexar sua marca na sua região.",
              },
              {
                title: "Métricas em Tempo Real",
                desc: "Acompanhe no seu painel quantos acessos, cliques no WhatsApp e ligações você recebeu.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-emerald-50"
              >
                <CheckCircle2
                  className="text-tafanu-action shrink-0 w-4 h-4 mt-0.5"
                  strokeWidth={2.5}
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider mb-0.5">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 3: CAIXA CENTRAL DO MERCADO PAGO */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-xl overflow-hidden text-slate-900 border border-slate-200">
          <div className="bg-[#009EE3] py-3 px-6 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              Resumo do Pedido
            </span>
            <span className="font-mono text-[10px] font-bold tracking-widest text-white/90">
              MERCADO PAGO
            </span>
          </div>
          <div className="p-8 text-center bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Total a pagar hoje
            </p>
            <div className="flex items-start justify-center gap-1">
              <span className="text-xl font-black mt-2 text-tafanu-action">
                R$
              </span>
              <span className="text-6xl font-black italic leading-none text-slate-900 drop-shadow-sm">
                {isTrialEligible ? "0,00" : plan.price}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-8 group w-full h-16 bg-tafanu-action hover:bg-[#00c27a] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_5px_20px_rgba(0,168,107,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
