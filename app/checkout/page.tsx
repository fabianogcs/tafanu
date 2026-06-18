"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import {
  createSubscription,
  getAuthSession,
  getBusinessExpiration,
} from "@/app/actions";

// 🚀 AJUSTES NOS TEXTOS PARA CLAREZA DO TRIAL
const PLANS = {
  monthly: {
    id: "monthly",
    name: "Mensal",
    price: "39,90",
    initialPrice: "0,00", // Continua zero por causa do Trial de 7 dias
    description: "Equivale a R$ 1,33 por dia",
    footer: "R$ 39,90 / mês após o teste",
    badge: "1ª Assinatura: 7 Dias Grátis",
  },

  // 🔒 PLANOS MAIORES COMENTADOS PARA VALIDAÇÃO DE MVP (DESCOMENTE QUANDO QUISER ESCALAR)
  /*
  quarterly: {
    id: "quarterly",
    name: "Trimestral",
    price: "104,70",
    initialPrice: "104,70", // Cobrado na hora, sem trial
    description: "Equivale a R$ 34,90/mês",
    footer: "Cobrado a cada 3 meses",
    badge: "Plano Seguro - 7 Dias de Garantia",
  },
  yearly: {
    id: "yearly",
    name: "Anual",
    price: "358,80",
    initialPrice: "358,80", // Cobrado na hora, sem trial
    description: "Equivale a R$ 29,90/mês",
    footer: "Cobrado anualmente",
    badge: "SUPER OFERTA - 7 Dias de Garantia",
  },
  */
} as const;

type PlanType = keyof typeof PLANS;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");

  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function checkStatus() {
      if (status === "loading") return;

      // 🚀 VACINA DO LOOP CEGO: Se o React achar que tá deslogado, confere no servidor antes de ejetar!
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
        const expiration = await getBusinessExpiration();
        if (expiration) {
          expirationDate = new Date(expiration);
          setExpiresAt(expirationDate);
        }
      } catch (error) {
        console.log("Usuário não possui loja ainda.");
      } finally {
        setIsLoadingData(false);
      }

      const role = session?.user?.role;

      // 🚀 CIRURGIA 1: Avalia o tempo em milissegundos para evitar falhas de Fuso Horário
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

  // 🚀 CIRURGIA 2: Mesma proteção em milissegundos para a barreira visual
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

  return (
    // 🚀 NOVO TEMA DARK PREMIUM COM 3 COLUNAS
    <div className="bg-[#050B14] min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-6 px-6 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">
          Escolha seu plano <span className="text-emerald-500">Tafanu PRO</span>
        </h1>
        <p className="text-slate-400 font-medium mt-3">
          Cancele quando quiser. Sem taxas escondidas.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-6">
        {/* COLUNA 1: SELEÇÃO DE PLANOS (Ajustado para crescer se tiver mais planos) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {(Object.keys(PLANS) as PlanType[]).map((key) => {
            const plan = PLANS[key];
            return (
              <button
                key={key}
                onClick={handlePayment} // 🚀 AQUI: O clique no card aciona o pagamento!
                disabled={isProcessing}
                className="relative p-8 rounded-[2rem] border-2 text-center transition-all w-full flex flex-col items-center justify-center border-emerald-500 bg-[#0D172A] shadow-2xl shadow-emerald-900/20 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#050B14] text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                  {plan.badge}
                </div>

                <h3 className="font-black uppercase italic text-xl text-emerald-500">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <span className="text-5xl font-black text-white">
                    {plan.price}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  {plan.description}
                </p>

                {/* 🚀 O BOTÃO VERDE INJETADO DENTRO DO CARD */}
                <div className="mt-8 w-full py-4 rounded-xl bg-emerald-500 text-[#050B14] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg group-hover:bg-emerald-400 transition-colors">
                  {isProcessing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Ativar Plano <CheckCircle2 size={18} strokeWidth={3} />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* COLUNA 2: VANTAGENS PRO INCLUSAS (Alta Conversão) */}
        <div className="lg:col-span-5 bg-[#0A1220] rounded-[2rem] p-8 border border-white/5 shadow-xl h-full flex flex-col justify-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
            <Sparkles className="text-emerald-500 w-5 h-5 shrink-0" />
            Tudo o que você vai liberar:
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                title: "Vitrine Digital de Alta Conversão",
                desc: "Seu negócio aberto 24h por dia, com design de luxo e sem taxas por venda.",
              },
              {
                title: "Vendas Diretas no WhatsApp",
                desc: "Botões de contato rápido para o cliente fechar o pedido direto com você.",
              },
              {
                title: "Prioridade no Radar de Buscas",
                desc: "Apareça antes dos seus concorrentes quando buscarem pelo seu serviço.",
              },
              {
                title: "Links Rápidos e Redes Sociais",
                desc: "Reúna seu Instagram, iFood, Shopee e Mapa em um único link oficial.",
              },
              {
                title: "Métricas de Acesso e Cliques",
                desc: "Acompanhe quantas pessoas viram sua loja e clicaram no seu WhatsApp.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10 hover:border-white/10 group"
              >
                <div className="mt-0.5">
                  <CheckCircle2
                    className="text-emerald-500 shrink-0 w-5 h-5 group-hover:scale-110 transition-transform"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-white uppercase tracking-wider mb-1">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 3: RESUMO E PAGAMENTO MERCADO PAGO */}
        <div className="lg:col-span-4 bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/10 sticky top-12">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              Resumo
            </span>
            <span className="font-bold text-xs">mercado pago</span>
          </div>
          <div className="p-8 md:p-10 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Total a pagar hoje
            </p>
            <div className="flex items-start justify-center gap-1">
              <span className="text-xl font-black mt-2 text-emerald-500">
                R$
              </span>
              <span className="text-7xl font-black italic leading-none drop-shadow-md">
                {PLANS[selectedPlan].initialPrice}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-10 group w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-[#050814] rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                "Ativar Plano"
              )}
            </button>

            <p className="text-slate-500 text-[10px] uppercase font-bold mt-6 px-2 leading-relaxed">
              {selectedPlan === "monthly"
                ? "Cobrança única mensal de R$ 39,90 programada para o 8º dia. Não existe cobrança diária."
                : "Você está coberto pela nossa Garantia de 7 Dias. Risco Zero."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
