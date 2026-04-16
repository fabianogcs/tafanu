"use client";

import {
  AlertTriangle,
  Calendar,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";

export default function SubscriptionAlert({ user }: { user: any }) {
  // 🚀 AJUSTE CIRÚRGICO: Puxando a data e o status do banco!
  const business = user?.businesses?.[0];
  const expirationDateRaw = business?.expiresAt;
  const subscriptionStatus = business?.subscriptionStatus;

  // 1. Se não tem data de expiração na loja, não mostramos nada (Visitante ou Admin)
  if (!expirationDateRaw) return null;

  const router = useRouter();
  const now = new Date();
  const expiresAt = new Date(expirationDateRaw);
  const isPastDueDate = now > expiresAt;

  const expiryDate = format(expiresAt, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  // 🚀 FASE NOVA: CANCELADO, MAS COM ACESSO GARANTIDO (UX de Ouro)
  if (
    user.role === "ASSINANTE" &&
    subscriptionStatus === "cancelled" &&
    !isPastDueDate
  ) {
    return (
      <div className="bg-slate-100 border border-slate-200 p-4 md:p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-700 text-white p-2.5 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider">
              Assinatura Cancelada
            </p>
            <p className="text-[11px] md:text-xs font-bold text-slate-500 mt-1">
              Não haverá novas cobranças. Seu acesso PRO continua garantido até
              o dia <span className="text-slate-900">{expiryDate}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. FASE 1: ATIVO E NO PRAZO (O aviso verdinho)
  if (
    user.role === "ASSINANTE" &&
    subscriptionStatus !== "cancelled" &&
    !isPastDueDate
  ) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl">
            <Calendar size={18} />
          </div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            Assinatura Ativa até {expiryDate}
          </p>
        </div>
      </div>
    );
  }

  // 3. FASE 2: CARÊNCIA / PROCESSANDO (O aviso tranquilizador)
  if (user.role === "ASSINANTE" && isPastDueDate) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-xl animate-pulse">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              Processando Renovação...
            </p>
            <p className="text-[10px] font-bold text-amber-600/70 mt-0.5">
              Aguardando confirmação do Mercado Pago. Seu acesso continua
              liberado!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. FASE 3: EXPIRADO DE VERDADE (O aviso vermelhão)
  if (user.role === "VISITANTE" && isPastDueDate) {
    return (
      <div className="bg-rose-600 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200 relative overflow-hidden mb-10 animate-pulse">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
          <AlertTriangle size={150} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="bg-white text-rose-600 p-4 rounded-3xl shadow-lg">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-1">
                Assinatura Expirada! ⚠️
              </h2>
              <p className="text-xs font-bold text-rose-100 uppercase tracking-widest mt-1">
                Seu anúncio foi <span className="underline">ocultado</span> das
                buscas no dia {expiryDate}.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full md:w-auto bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shrink-0"
          >
            Renovar Agora <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
