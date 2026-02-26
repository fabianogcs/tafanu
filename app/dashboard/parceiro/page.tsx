"use client";

import { useEffect, useState } from "react";
import { getAffiliateStats } from "@/app/actions";
import { toast } from "sonner";
import {
  Users,
  Copy,
  Trophy,
  Zap,
  Clock,
  MessageCircle,
  Mail,
  ExternalLink,
  Search,
  CheckCircle2,
  Timer,
  Wallet,
  Share2,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  SearchX,
  Crown,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AffiliateDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ativos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadStats() {
      const res = await getAffiliateStats();
      if (res.error) toast.error(res.error);
      else setData(res);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading)
    return (
      <div className="flex h-[90vh] items-center justify-center flex-col gap-4">
        <div className="h-14 w-14 border-4 border-[#F28705] border-t-transparent rounded-full animate-spin shadow-lg" />
        <p className="text-[#023059] font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
          Sincronizando Dados Bancários...
        </p>
      </div>
    );

  if (!data) return null;
  const { stats, createdAt } = data;

  // Calcula o dia de pagamento baseado na data de criação do Afiliado
  const dataCriacao = createdAt ? new Date(createdAt) : new Date();
  const diaPagamento = dataCriacao.getDate();

  // Lógica de filtragem
  const getRawList = () => {
    if (activeTab === "ativos") return data.ativos || [];
    if (activeTab === "teste") return data.emTeste || [];
    return data.inativos || [];
  };

  const filteredList = getRawList()
    .filter(
      (ref: any) =>
        ref.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a: any, b: any) => {
      if (!a.expiresAt) return 1;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/?ref=${data.referralCode}`,
    );
    toast.success("Link VIP copiado! Boas vendas!", {
      icon: <Share2 size={16} />,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 font-sans">
      {/* 1. PAINEL FINANCEIRO DE ALTA CONVERSÃO */}
      <div className="bg-gradient-to-br from-[#023059] to-[#011a33] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-[#F28705]">
        {/* Efeito de Fundo */}
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Zap size={400} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10 items-center">
          <div className="space-y-8 flex-1 w-full">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md">
              <Wallet size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
                Seu Fechamento: Todo dia {diaPagamento}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F28705] mb-2">
                Comissão Atual Base
              </p>
              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none drop-shadow-lg">
                <span className="text-white">{stats.taxaAtual}%</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 p-2.5 rounded-[2rem] border border-white/10 max-w-lg backdrop-blur-sm">
              <div className="flex-1 px-5 py-2 w-full truncate font-mono text-[11px] text-blue-200/70 italic font-bold">
                {window.location.origin}/?ref={data.referralCode}
              </div>
              <button
                onClick={copyLink}
                className="w-full sm:w-auto bg-[#F28705] text-[#023059] px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-xl"
              >
                Copiar Link
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 border-l-8 border-l-emerald-500 min-w-[280px] shadow-2xl relative overflow-hidden">
              <p className="text-[10px] font-black uppercase text-gray-300 mb-2 tracking-widest">
                Saldo a Receber (Dia {diaPagamento})
              </p>
              <p className="text-4xl md:text-5xl font-black tracking-tighter">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.ganhoEstimado)}
              </p>
              <div className="absolute -bottom-4 -right-4 text-emerald-500/20">
                <DollarSign size={100} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 border-l-8 border-l-[#F28705] min-w-[280px] shadow-2xl">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                Aguardando Pagamento
              </p>
              <p className="text-4xl md:text-5xl font-black italic text-white/40 tracking-tighter">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.potencialFuturo)}
              </p>
              <p className="text-[8px] font-bold text-gray-400 mt-3 uppercase tracking-widest">
                *Assinantes no teste de 7 dias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MANUAL DO PARCEIRO (NOVA REGRA DE NEGÓCIOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-start gap-4 group">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <CalendarDays size={28} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#023059] mb-1">
              Ciclo Mensal
            </h4>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
              Seu fechamento é todo{" "}
              <strong className="text-blue-500">dia {diaPagamento}</strong>.
              Vendas feitas hoje só contabilizam para o próximo ciclo se
              passarem da data de corte.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-start gap-4 group">
          <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F28705] group-hover:scale-110 transition-transform">
            <Timer size={28} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#023059] mb-1">
              Regra dos 7 Dias
            </h4>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
              Assinantes no período de teste grátis{" "}
              <strong className="text-[#F28705]">não pontuam</strong>. A
              comissão é gerada apenas quando a 1ª mensalidade é paga com
              sucesso.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all flex flex-col items-start gap-4 group border-b-8 border-emerald-900">
          <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Crown size={28} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-1">
              High Ticket VIP
            </h4>
            <p className="text-[10px] text-emerald-100 font-bold leading-relaxed">
              Vendeu Plano Trimestral ou Anual? Você ganha{" "}
              <strong className="text-white text-xs bg-black/20 px-2 py-0.5 rounded ml-1">
                30% DIRETO
              </strong>{" "}
              no ato da venda, independente da sua meta atual!
            </p>
          </div>
        </div>
      </div>

      {/* 3. METAS E BUSCA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#023059] uppercase italic flex items-center gap-3 tracking-tighter">
                <Zap className="text-[#F28705]" fill="currentColor" size={28} />{" "}
                Progresso do Ciclo
              </h2>
              <p className="text-[10px] font-bold text-gray-400 mt-2 tracking-widest">
                Planos High Ticket pontuam na meta e pagam 30% fixo.
              </p>
            </div>
            <div className="bg-[#f8fafc] px-6 py-3 rounded-2xl border border-gray-100">
              <p className="text-3xl font-black text-[#023059] italic">
                {stats.vendasConfirmadas}{" "}
                <span className="text-sm text-gray-300 font-bold">/ 20</span>
              </p>
            </div>
          </div>
          <div className="h-5 w-full bg-gray-100 rounded-full p-1 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#023059] via-[#F28705] to-emerald-500 rounded-full transition-all duration-1000 shadow-lg relative"
              style={{ width: `${Math.min(stats.progressoMeta, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 px-2 tracking-widest">
            <span>Bronze (15%)</span>
            <span>Prata (10 Vendas - 20%)</span>
            <span className="text-[#F28705]">Ouro (20 Vendas - 30%)</span>
          </div>
        </div>

        <div className="bg-[#f8fafc] p-8 rounded-[3rem] border border-gray-100 flex items-center shadow-sm">
          <div className="relative w-full">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"
              size={24}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-16 pr-6 py-6 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#F28705]/10 transition-all text-[#023059]"
            />
          </div>
        </div>
      </div>

      {/* 4. ABAS E LISTAGEM */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 no-scrollbar">
          <TabButton
            active={activeTab === "ativos"}
            onClick={() => setActiveTab("ativos")}
            label="Pagantes (Meta)"
            count={data.ativos.length}
            color="bg-[#023059]"
          />
          <TabButton
            active={activeTab === "teste"}
            onClick={() => setActiveTab("teste")}
            label="Teste 7 Dias"
            count={data.emTeste.length}
            color="bg-[#F28705]"
          />
          <TabButton
            active={activeTab === "inativos"}
            onClick={() => setActiveTab("inativos")}
            label="Inativos"
            count={data.inativos.length}
            color="bg-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredList.map((ref: any) => {
            const expDate = ref.expiresAt ? new Date(ref.expiresAt) : null;
            const daysLeft = expDate
              ? Math.ceil(
                  (expDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : 0;
            const business = ref.businesses?.[0];

            // Identificação do Plano e Tag visual
            const isHighTicket = Number(ref.lastPrice) > 30;
            const isAnual = Number(ref.lastPrice) > 100;

            return (
              <div
                key={ref.id}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col overflow-hidden group"
              >
                {/* CABEÇALHO DO CARD */}
                <div
                  className={`px-6 py-4 flex justify-between items-center ${
                    activeTab === "ativos"
                      ? "bg-emerald-50 border-b border-emerald-100"
                      : activeTab === "teste"
                        ? "bg-orange-50 border-b border-orange-100"
                        : "bg-slate-50 border-b border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      activeTab === "ativos"
                        ? "text-emerald-600"
                        : activeTab === "teste"
                          ? "text-[#F28705]"
                          : "text-slate-500"
                    }`}
                  >
                    {activeTab === "ativos"
                      ? "Gera Comissão"
                      : activeTab === "teste"
                        ? "Aguardando 1º Pagto"
                        : "Cancelado"}
                  </span>
                  {/* TAG HIGH TICKET */}
                  {isHighTicket && activeTab === "ativos" && (
                    <span
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${isAnual ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      <Crown size={10} />{" "}
                      {isAnual ? "Anual VIP (30%)" : "Trimestral (30%)"}
                    </span>
                  )}
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 max-w-[70%]">
                      <h3 className="font-black text-[#023059] text-xl uppercase leading-none truncate tracking-tighter">
                        {ref.name || "Sem Nome"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={12} />
                        <span className="text-[10px] font-bold truncate">
                          {ref.email}
                        </span>
                      </div>
                    </div>
                    {business && (
                      <Link
                        href={`/site/${business.slug}`}
                        target="_blank"
                        className="h-12 w-12 bg-[#f8fafc] text-[#023059] rounded-[1rem] flex items-center justify-center hover:bg-[#023059] hover:text-white transition-all shadow-sm border border-gray-100 group-hover:scale-110"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${daysLeft <= 0 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-[#f8fafc] border-gray-100 text-[#023059]"}`}
                  >
                    <div className="flex items-center gap-3">
                      {daysLeft <= 0 ? (
                        <AlertCircle size={18} />
                      ) : (
                        <CheckCircle2
                          size={18}
                          className={
                            activeTab === "ativos"
                              ? "text-emerald-500"
                              : "text-[#F28705]"
                          }
                        />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {daysLeft <= 0
                          ? "Expirado"
                          : `Vence em ${daysLeft} dias`}
                      </span>
                    </div>
                  </div>

                  <a
                    href={
                      ref.phone
                        ? `https://wa.me/55${ref.phone.replace(/\D/g, "")}`
                        : "#"
                    }
                    target="_blank"
                    className={`w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      ref.phone
                        ? "bg-[#023059] text-white shadow-xl hover:bg-[#F28705]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle size={18} />{" "}
                    {ref.phone ? "Chamar no WhatsApp" : "Sem Telefone"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <SearchX size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="font-black uppercase text-gray-400 text-xs tracking-[0.2em] italic">
              Nenhum cliente neste status no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
function TabButton({ active, onClick, label, count, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
        active
          ? `${color} text-white shadow-xl scale-105 border-b-4 border-black/20`
          : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100 shadow-sm"
      }`}
    >
      {label}
      <span
        className={`px-2 py-0.5 rounded-full text-[9px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}
      >
        {count}
      </span>
    </button>
  );
}
