"use client";

import {
  AlertTriangle,
  Calendar,
  ArrowRight,
  Clock,
  ShieldCheck,
  Store,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";

export default function SubscriptionAlert({ user }: { user: any }) {
  // =========================================================================
  // 🚀 1. IDENTIFICA SE É CONTA FANTASMA (Conta de Demonstração)
  // =========================================================================
  const isTestAccount = user?.email?.toLowerCase().endsWith("@tafanu.com.br");

  if (isTestAccount) {
    return (
      <div className="w-full bg-indigo-50 border-2 border-indigo-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8 mt-4 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
          <UserPlus size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-black uppercase text-indigo-900 tracking-widest mb-1">
            Modo de Demonstração Ativo
          </h3>
          <p className="text-sm font-medium text-indigo-700 leading-relaxed">
            Você está acessando uma vitrine de teste da plataforma. Para assinar
            um plano, não perder os acessos e assumir a titularidade oficial:
            <br className="hidden md:block" />
            <strong>Crie uma conta com seu e-mail pessoal</strong> e avise o seu
            consultor para fazermos a transferência (Transplante) da loja para
            você!
          </p>
        </div>
      </div>
    );
  }
  // =========================================================================

  const business = user?.businesses?.[0];
  const expirationDateRaw = business?.expiresAt;
  const subscriptionStatus = business?.subscriptionStatus;

  if (!expirationDateRaw) return null;

  const router = useRouter();

  // 🚀 A LÓGICA DO TEMPO (Blindada contra Fuso Horário usando .getTime())
  const now = Date.now();
  const expiresAt = new Date(expirationDateRaw).getTime();

  const isPastDueDate = now > expiresAt;
  const gracePeriodEnd = expiresAt + 48 * 60 * 60 * 1000; // Exatamente 48h depois em milissegundos
  const isPastGracePeriod = now > gracePeriodEnd;

  const expiryDate = format(new Date(expiresAt), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  // 1. FASE 1: CANCELADO, MAS COM ACESSO GARANTIDO (O mês já está pago)
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

  // 2. FASE 2: ATIVO E NO PRAZO (O aviso verdinho)
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

  // 3. FASE 3: CARÊNCIA / PROCESSANDO (Venceu hoje ou ontem, tá dentro das 48h e NÃO cancelou manual)
  if (
    user.role === "ASSINANTE" &&
    isPastDueDate &&
    !isPastGracePeriod &&
    subscriptionStatus !== "cancelled"
  ) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-xl animate-pulse shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              Processando Renovação...
            </p>
            <p className="text-[10px] font-bold text-amber-600/70 mt-0.5">
              Aguardando o Mercado Pago. Se houver falha, clique no botão ao
              lado para reativar. Sua vitrine ainda está online nas buscas!
            </p>
          </div>
        </div>
        {/* 🚀 CIRURGIA: BOTÃO INJETADO AQUI PARA GARANTIR ACESSO IMEDIATO */}
        <button
          onClick={() => router.push("/checkout")}
          className="w-full md:w-auto bg-amber-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] shadow-md hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          Pagar Manualmente <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // 4. 🚀 FASE 4: TOLERÂNCIA (Passou de 48h OU o status da loja é de falha/rejeitado/inativo)
  // Ampliado para capturar contas ativadas pelo Admin com falha de status!
  const isSuspiciousStatus =
    subscriptionStatus === "cancelled" ||
    subscriptionStatus === "inactive" ||
    subscriptionStatus === "rejected";

  if (
    user.role === "ASSINANTE" &&
    isPastDueDate &&
    (isPastGracePeriod || isSuspiciousStatus)
  ) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-sm gap-4 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500 text-white p-3 rounded-xl animate-bounce shrink-0">
            <Store size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-rose-700 uppercase tracking-widest">
              Sua Vitrine está Offline!
            </p>
            <p className="text-xs font-bold text-rose-600/70 mt-1 max-w-md leading-tight">
              A validade expirou. Sua loja foi ocultada do buscador do Tafanu,
              mas seus dados continuam salvos aqui.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full md:w-auto bg-rose-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          Reativar Loja Agora <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // 5. FASE 5: REBAIXADO DE VERDADE (Visitante / Passou dos 10 dias)
  if (user.role === "VISITANTE" && isPastDueDate) {
    return (
      <div className="bg-rose-600 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200 relative overflow-hidden mb-10 animate-pulse">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
          <AlertTriangle size={150} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="bg-white text-rose-600 p-4 rounded-3xl shadow-lg shrink-0">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-1">
                Acesso Expirado! ⚠️
              </h2>
              <p className="text-xs font-bold text-rose-100 uppercase tracking-widest mt-1">
                Você perdeu os recursos do painel PRO.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full md:w-auto bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shrink-0"
          >
            Assinar Novamente <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
