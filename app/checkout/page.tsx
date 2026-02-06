"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- IMPORTANTE: Importação do Router
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter(); // <--- Hook de navegação
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulação do tempo de processamento do gateway (2 segundos)
    setTimeout(() => {
      // Em vez de alert, mandamos para a página de sucesso
      // É lá que o upgrade de "Visitante" para "Assinante" acontece
      router.push("/checkout/sucesso");
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-4 md:px-6">
      {/* HEADER: ANIMAÇÃO DE ENTRADA */}
      <div className="flex flex-col items-center text-center py-10 md:py-16 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 bg-tafanu-action/10 text-tafanu-action px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-tafanu-action/20 mb-6 animate-pulse">
          <Sparkles size={14} /> Checkout Exclusivo
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-tafanu-blue tracking-tighter uppercase italic leading-[0.9]">
          Sua Presença <br />
          <span className="text-tafanu-action">Profissional.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        {/* COLUNA ESQUERDA: O VALOR PERCEBIDO */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-4 duration-1000 delay-150">
          {/* CARD HOJE (MOBILE-FIRST) */}
          <div className="bg-white rounded-[32px] p-1 md:p-2 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="p-6 md:p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-tafanu-action rounded-2xl flex items-center justify-center text-tafanu-blue shadow-lg animate-bounce duration-[3000ms]">
                  <span className="font-black text-sm italic">Hj</span>
                </div>
                <div>
                  <p className="text-xl font-black text-tafanu-blue uppercase italic tracking-tighter">
                    Início Imediato
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Ativação de recursos Pro
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-tafanu-blue tracking-tighter">
                  R$ 1,00
                </p>
              </div>
            </div>
          </div>

          {/* CARD RENOVAÇÃO (DESTAQUE MOBILE) */}
          <div className="bg-tafanu-blue rounded-[32px] p-1 border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Efeito de luz passando ao fundo (animação contínua) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

            <div className="p-6 md:p-8 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-tafanu-action border border-white/10">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <p className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Próximo Mês
                  </p>
                  <p className="text-[10px] text-tafanu-action font-bold uppercase tracking-widest">
                    Renovação Transparente
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white tracking-tighter">
                  R$ 29,90
                </p>
              </div>
            </div>
          </div>

          {/* LISTA DE BENEFÍCIOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4">
            {[
              "Página Exclusiva Tafanu",
              "Selo de Verificado",
              "Botão WhatsApp Direto",
              "Métricas de Acesso",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-gray-50 shadow-sm"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                  <CheckCircle2 size={14} strokeWidth={3} />
                </div>
                <span className="text-xs font-black text-tafanu-blue uppercase tracking-tight">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: O FECHAMENTO */}
        <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
          <div className="bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden sticky top-28">
            {/* VALOR TOTAL */}
            <div className="bg-gray-50 p-8 md:p-10 text-center border-b border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                Total a pagar agora
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-7xl md:text-8xl font-black text-tafanu-blue tracking-tighter italic">
                  R$ 1,00
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-6">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="relative w-full overflow-hidden bg-tafanu-action text-tafanu-blue h-20 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-tafanu-action/30 disabled:opacity-50 group"
              >
                {/* Brilho animado interno */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Confirmar Assinatura
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </>
                )}
              </button>

              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-center gap-8 grayscale opacity-50">
                  <div className="font-black text-2xl italic text-tafanu-blue">
                    PIX
                  </div>
                  <CreditCard size={32} className="text-tafanu-blue" />
                </div>

                <div className="flex flex-col items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <Lock size={14} className="text-green-500" />
                    Pagamento via Mercado Pago
                  </div>
                  <p className="text-[9px] text-gray-400 text-center font-bold uppercase leading-tight tracking-wider">
                    Ambiente criptografado. Cancele quando quiser diretamente no
                    painel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/anunciar"
            className="block text-center mt-8 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-tafanu-blue transition-all"
          >
            ← Voltar e mudar plano
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
