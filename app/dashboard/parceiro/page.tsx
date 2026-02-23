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
  DollarSign, // Adicionado para corrigir a linha vermelha
  SearchX,
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
        <div className="h-12 w-12 border-4 border-[#F28705] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#023059] font-black uppercase text-[10px] tracking-widest">
          Sincronizando Dashboard...
        </p>
      </div>
    );

  if (!data) return null;
  const { stats } = data;

  // Lógica de filtragem para as abas
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
    toast.success("Link copiado!", { icon: <Share2 size={16} /> });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* 1. PAINEL FINANCEIRO */}
      <div className="bg-gradient-to-br from-[#023059] to-[#011a33] rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border-b-8 border-[#F28705]">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
          <div className="space-y-6 flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">
                Comissões sobre R$ 29,90
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Bônus <span className="text-[#F28705]">{stats.taxaAtual}%</span>
            </h1>

            <div className="flex items-center gap-3 bg-black/20 p-2 rounded-3xl border border-white/10 max-w-md">
              <div className="flex-1 px-4 truncate font-mono text-[10px] text-blue-200/50 italic">
                {window.location.origin}/?ref={data.referralCode}
              </div>
              <button
                onClick={copyLink}
                className="bg-[#F28705] text-[#023059] px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg"
              >
                Copiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-white/5 backdrop-blur-md p-7 rounded-[40px] border border-white/10 border-l-4 border-l-emerald-500 min-w-[280px]">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-2">
                Para Receber (Dia 30)
              </p>
              <p className="text-4xl font-black">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.ganhoEstimado)}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-7 rounded-[40px] border border-white/10 border-l-4 border-l-[#F28705] min-w-[280px]">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-2">
                Previsão (Aguardando Teste)
              </p>
              <p className="text-4xl font-black italic text-white/50">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.potencialFuturo)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REGRA DE NEGÓCIO DIDÁTICA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Timer size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-[#023059]">
              Mês 1 (Teste)
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Assinatura R$ 1,00
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <DollarSign size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-[#023059]">
              Mês 2 em diante
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Sua comissão cai aqui
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F28705]">
            <Trophy size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-[#023059]">
              Dia 30
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Data do seu pagamento
            </p>
          </div>
        </div>
      </div>

      {/* 3. METAS E BUSCA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[45px] border border-gray-100 shadow-xl space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-black text-[#023059] uppercase italic flex items-center gap-3">
              <Zap className="text-[#F28705]" fill="currentColor" /> Performance
              Atual
            </h2>
            <p className="text-2xl font-black text-[#023059]">
              {stats.vendasConfirmadas}{" "}
              <span className="text-xs text-gray-300">/ 20</span>
            </p>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-full p-1 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#023059] to-[#F28705] rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${stats.progressoMeta}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 px-1">
            <span>Bronze (15%)</span>
            <span>Prata (10 Vendas - 20%)</span>
            <span>Ouro (20 Vendas - 30%)</span>
          </div>
        </div>

        <div className="bg-[#f8fafc] p-8 rounded-[45px] border border-gray-100 flex items-center">
          <div className="relative w-full">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
              size={22}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[30px] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#F28705]/5"
            />
          </div>
        </div>
      </div>

      {/* 4. ABAS E LISTAGEM */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
          <TabButton
            active={activeTab === "ativos"}
            onClick={() => setActiveTab("ativos")}
            label="Confirmados (R$ 29,90)"
            count={data.ativos.length}
            color="bg-[#023059]"
          />
          <TabButton
            active={activeTab === "teste"}
            onClick={() => setActiveTab("teste")}
            label="Em Teste (R$ 1,00)"
            count={data.emTeste.length}
            color="bg-[#F28705]"
          />
          <TabButton
            active={activeTab === "inativos"}
            onClick={() => setActiveTab("inativos")}
            label="Cancelados"
            count={data.inativos.length}
            color="bg-red-500"
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

            return (
              <div
                key={ref.id}
                className="bg-white rounded-[45px] border border-gray-100 shadow-lg hover:shadow-2xl transition-all flex flex-col overflow-hidden group"
              >
                <div
                  className={`py-3 text-[9px] font-black uppercase tracking-[0.2em] text-center text-white ${
                    activeTab === "ativos"
                      ? "bg-emerald-500"
                      : activeTab === "teste"
                        ? "bg-[#F28705]"
                        : "bg-slate-400"
                  }`}
                >
                  {activeTab === "ativos"
                    ? "Assinante Pagante"
                    : activeTab === "teste"
                      ? "Aguardando Maturação"
                      : "Inativo"}
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 max-w-[70%]">
                      <h3 className="font-black text-[#023059] text-base uppercase leading-tight truncate">
                        {ref.name}
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
                        className="h-12 w-12 bg-blue-50 text-[#023059] rounded-2xl flex items-center justify-center hover:bg-[#023059] hover:text-white transition-all shadow-sm"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-[25px] border flex items-center gap-3 ${daysLeft <= 0 ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-[#023059]"}`}
                  >
                    {daysLeft <= 0 ? (
                      <AlertCircle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {daysLeft <= 0
                          ? "Plano Expirado"
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
                    className={`w-full py-4 rounded-[24px] text-[10px] font-black uppercase flex items-center justify-center gap-3 transition-all ${ref.phone ? "bg-emerald-500 text-white shadow-xl hover:bg-emerald-600" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
                  >
                    <MessageCircle size={18} />{" "}
                    {ref.phone ? "WhatsApp" : "Sem Telefone"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[50px] border-2 border-dashed border-gray-200">
            <SearchX size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="font-black uppercase text-gray-400 text-xs tracking-widest">
              Nenhum cliente nesta categoria.
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
      className={`px-8 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? `${color} text-white shadow-2xl translate-y-[-4px]` : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100 shadow-sm"}`}
    >
      {label} <span className="ml-2 opacity-50">({count})</span>
    </button>
  );
}
