"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner"; // Para avisar se algo der errado
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldEllipsis,
} from "lucide-react";
import Link from "next/link";
import { createSubscription } from "@/app/actions"; // ⬅️ IMPORTANTE: Importe sua action aqui

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- TRAVA DE SEGURANÇA ---
  useEffect(() => {
    if (status === "loading") return;

    const role = session?.user?.role;
    if (role === "ADMIN") {
      router.replace("/admin");
    } else if (role === "ASSINANTE") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // --- LÓGICA DE PAGAMENTO REAL ---
  const handlePayment = async () => {
    if (!session?.user?.id || !session?.user?.email) {
      return toast.error("Você precisa estar logado para assinar.");
    }

    setIsProcessing(true);

    try {
      // 1. Chama a Action que criamos no Mercado Pago
      const res = await createSubscription(session.user.id, session.user.email);

      if (res.success && res.init_point) {
        // 2. Grava o lembrete (opcional, mas bom para sua lógica de sucesso depois)
        localStorage.setItem("tafanu_pending_upgrade", "true");

        // 3. REDIRECIONA PARA O MERCADO PAGO
        // O usuário sai do seu site e vai para a tela segura deles
        window.location.href = res.init_point;
      } else {
        toast.error(res.error || "Erro ao conectar com o Mercado Pago.");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Erro interno. Tente novamente.");
      setIsProcessing(false);
    }
  };

  if (
    status === "loading" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "ASSINANTE"
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
          Finalizar <span className="text-emerald-500">Assinatura</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 order-first lg:order-last">
          <div className="bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/5 sticky top-24">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-white/90">
                Pagamento Processado por
              </span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm lg:text-base">mercado</span>
                <span className="font-light text-sm lg:text-base">pago</span>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-16 text-center border-b border-white/5">
              <p className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                Total a pagar hoje
              </p>
              <div className="flex items-start justify-center gap-1">
                <span className="text-xl lg:text-2xl font-black mt-2 text-emerald-500">
                  R$
                </span>
                <span className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-none text-white">
                  1,00
                </span>
              </div>
              <p className="mt-6 text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                Próximo mês: R$ 29,90
              </p>
            </div>

            <div className="p-8 md:p-10 lg:p-14 space-y-6">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="group relative w-full h-20 lg:h-24 bg-emerald-500 text-[#050814] rounded-2xl font-black text-sm lg:text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] disabled:opacity-50 overflow-hidden"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Ativar Assinatura
                    <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 py-3 border-y border-white/5">
                <div className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="text-emerald-500 w-3 h-3 lg:w-4 lg:h-4" />{" "}
                  Compra Garantida
                </div>
                <div className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Lock className="text-emerald-500 w-3 h-3 lg:w-4 lg:h-4" />{" "}
                  SSL Seguro
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DE BENEFÍCIOS */}
        <div className="lg:col-span-7 order-last lg:order-first space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 lg:p-16 border border-slate-200 shadow-sm">
            <h2 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
              <Sparkles className="text-emerald-500 w-5 h-5" /> Vantagens PRO
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-12">
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
                  className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100"
                >
                  <CheckCircle2
                    className="text-emerald-500 shrink-0 w-5 h-5"
                    strokeWidth={3}
                  />
                  <span className="text-[10px] lg:text-[13px] font-black text-slate-700 uppercase tracking-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6">
              <div className="bg-[#050814] text-white p-3 rounded-2xl">
                <ShieldEllipsis className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs lg:text-lg font-black text-[#050814] uppercase mb-1">
                  Cancele quando quiser
                </h4>
                <p className="text-[10px] lg:text-sm text-slate-500 font-medium leading-relaxed">
                  Não temos fidelidade. Se o Tafanu não trouxer resultados, você
                  cancela no painel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
