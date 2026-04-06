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
// 🚀 Importamos a nova função getBusinessExpiration
import {
  createSubscription,
  getAuthSession,
  getBusinessExpiration,
} from "@/app/actions";

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
  const { data: session, status, update } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");

  // 🚀 Novo estado para guardar a data de validade vinda do banco
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      // Busca a validade real da loja no servidor
      const expiration = await getBusinessExpiration();
      if (expiration) setExpiresAt(new Date(expiration));
      setIsLoadingData(false);

      const role = session?.user?.role;
      const isExpired = expiration ? new Date(expiration) < new Date() : false;

      if (role === "ADMIN") {
        router.replace("/admin");
      }
      // Se for assinante e ainda estiver no prazo, não precisa estar aqui
      else if (role === "ASSINANTE" && !isExpired) {
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

      // Buscamos a primeira loja do usuário para ter o ID dela
      // Nota: Em um sistema multi-loja, aqui você passaria o ID da loja específica
      // Para o seu caso (assinante = 1 loja), buscamos a dele.
      const res = await createSubscription(
        serverSession.id,
        serverSession.email,
        "", // O createSubscription lá no actions já busca o businessId se enviarmos vazio ou ajustarmos
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

  // Trava de carregamento
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  if (
    status === "loading" ||
    isLoadingData ||
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
      {/* O RESTANTE DO SEU HTML CONTINUA IGUAL... */}
      <div className="max-w-6xl mx-auto pt-8 pb-4 px-6 text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#050814] tracking-tighter uppercase italic">
          Escolha seu plano <span className="text-emerald-500">Tafanu PRO</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Cancele quando quiser. Sem taxas escondidas.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-8">
        <div className="lg:col-span-7 space-y-8">
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

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
              <Sparkles className="text-emerald-500 w-5 h-5 shrink-0" />{" "}
              Vantagens PRO Inclusas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Site Exclusivo",
                "Métricas",
                "Redes Sociais",
                "Botão WhatsApp",
                "SEO Google",
                "Galeria de Fotos",
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

        <div className="lg:col-span-5">
          <div className="bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/5 sticky top-12">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Resumo
              </span>
              <span className="font-bold text-xs">mercado pago</span>
            </div>
            <div className="p-10 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Total a pagar
              </p>
              <div className="flex items-start justify-center gap-1">
                <span className="text-xl font-black mt-2 text-emerald-500">
                  R$
                </span>
                <span className="text-7xl font-black italic leading-none">
                  {PLANS[selectedPlan].initialPrice}
                </span>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="mt-10 group w-full h-20 bg-emerald-500 text-[#050814] rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  "Ativar Plano"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
