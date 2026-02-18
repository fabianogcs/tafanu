"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldEllipsis,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Simulação do sucesso e upgrade de role
      router.push("/checkout/sucesso");
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans selection:bg-tafanu-action selection:text-tafanu-blue">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto pt-8 pb-4 px-6 text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#050814] tracking-tighter uppercase italic">
          Finalizar <span className="text-tafanu-blue">Assinatura</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* COLUNA DE PAGAMENTO - PRIORIDADE MOBILE */}
        <div className="lg:col-span-5 order-first lg:order-last">
          <div className="bg-[#050814] rounded-[2.5rem] shadow-2xl overflow-hidden text-white border border-white/5 sticky top-24">
            {/* MERCADO PAGO BADGE */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 py-3 px-6 flex items-center justify-between">
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-white/90">
                Pagamento Processado por
              </span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm lg:text-base">mercado</span>
                <span className="font-light text-sm lg:text-base">pago</span>
              </div>
            </div>

            {/* PREÇO DE IMPACTO */}
            <div className="p-8 md:p-10 lg:p-16 text-center border-b border-white/5">
              <p className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                Total a pagar hoje
              </p>
              <div className="flex items-start justify-center gap-1 text-tafanu-action">
                <span className="text-xl lg:text-2xl font-black mt-2">R$</span>
                <span className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-none text-white">
                  1,00
                </span>
              </div>
              <p className="mt-6 text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                Próximo mês: R$ 29,90
              </p>
            </div>

            {/* BOTÃO CTA */}
            <div className="p-8 md:p-10 lg:p-14 space-y-6">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="group relative w-full h-20 lg:h-24 bg-tafanu-action text-tafanu-blue rounded-2xl font-black text-sm lg:text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />

                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Pagar com PIX / Cartão
                    <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 py-3 border-y border-white/5">
                  <div className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="text-emerald-500 w-3 h-3 lg:w-4 lg:h-4" />{" "}
                    Compra Garantida
                  </div>
                  <div className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Lock className="text-emerald-500 w-3 h-3 lg:w-4 lg:h-4" />{" "}
                    SSL Criptografado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DE BENEFÍCIOS - AMPLA NO DESKTOP */}
        <div className="lg:col-span-7 order-last lg:order-first space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <h2 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
              <Sparkles className="text-tafanu-action w-5 h-5" /> Vantagens da
              Assinatura
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
                  className="flex items-center gap-4 p-5 lg:p-7 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-tafanu-action/30 transition-all"
                >
                  <CheckCircle2
                    className="text-tafanu-action shrink-0 w-5 h-5 lg:w-6 lg:h-6"
                    strokeWidth={3}
                  />
                  <span className="text-[10px] lg:text-[13px] font-black text-slate-700 uppercase tracking-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* BOX DE CANCELAMENTO */}
            <div className="bg-tafanu-blue/5 p-8 lg:p-10 rounded-[2.5rem] border border-tafanu-blue/10 flex items-start gap-6">
              <div className="bg-tafanu-blue text-white p-3 lg:p-4 rounded-2xl shadow-lg shadow-tafanu-blue/20">
                <ShieldEllipsis className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <div>
                <h4 className="text-xs lg:text-lg font-black text-tafanu-blue uppercase mb-1">
                  Cancele quando quiser
                </h4>
                <p className="text-[10px] lg:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                  Não temos contrato de fidelidade. Se o Tafanu não trouxer
                  resultados, cancele com um clique no seu painel.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/anunciar"
              className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-widest hover:text-tafanu-blue transition-all"
            >
              ← Voltar para a oferta
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
