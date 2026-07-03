"use client";

import { useEffect, useState, useMemo } from "react";
import { getAffiliateDashboardData } from "@/app/actions";
import { toast } from "sonner";
import Link from "next/link";
import {
  Wallet,
  Share2,
  Clock,
  Banknote,
  Search,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  QrCode,
  Mail,
  Edit3,
} from "lucide-react";
import { CommissionStatus } from "@prisma/client";

export default function AffiliateDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mensal");
  const [searchTerm, setSearchTerm] = useState("");
  const [origin, setOrigin] = useState("");
  const [loginSort, setLoginSort] = useState<"recentes" | "antigos" | null>(
    null,
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function loadStats() {
      const res = await getAffiliateDashboardData();
      if (res.error) toast.error(res.error);
      else setData(res);
      setLoading(false);
    }
    loadStats();
  }, []);

  const stats = useMemo(() => {
    let disponivel = 0;
    let pendente = 0;
    let pago = 0;
    const agora = new Date();

    if (data?.commissions) {
      data.commissions.forEach((c: any) => {
        if (c.userId === data.affiliate.id) return;

        if (c.status === "PAID") {
          pago += c.amount;
        } else if (c.status === "PENDING" && new Date(c.releaseDate) > agora) {
          pendente += c.amount;
        } else if (
          c.status === "AVAILABLE" ||
          (c.status === "PENDING" && new Date(c.releaseDate) <= agora)
        ) {
          disponivel += c.amount;
        }
      });
    }
    return { disponivel, pendente, pago };
  }, [data]);

  if (loading)
    return (
      <div className="flex h-[90vh] items-center justify-center flex-col gap-4">
        <div className="h-14 w-14 border-4 border-[#F28705] border-t-transparent rounded-full animate-spin shadow-lg" />
        <p className="text-[#023059] font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
          Sincronizando Funil de Vendas...
        </p>
      </div>
    );

  if (!data || !data.affiliate) return null;
  const { affiliate, clients } = data;
  const hoje = new Date();

  const {
    listMensal,
    listTrimestral,
    listAnual,
    listPix,
    listTeste,
    listLeads,
    listVencidos,
  } = useMemo(() => {
    const res = {
      listMensal: [] as any[],
      listTrimestral: [] as any[],
      listAnual: [] as any[],
      listPix: [] as any[],
      listTeste: [] as any[],
      listLeads: [] as any[],
      listVencidos: [] as any[],
    };

    clients.forEach((u: any) => {
      if (u.role === "AFILIADO") return;
      const business = u.businesses?.[0];
      if (!business) {
        res.listLeads.push(u);
        return;
      }

      const expDate = business.expiresAt ? new Date(business.expiresAt) : null;
      const planType = business.planType;
      const isMercadoPago = business.isMercadoPago;
      const subStatus = business.subscriptionStatus;
      const isExpired = expDate ? hoje > expDate : false;
      const isCancelled = subStatus === "cancelled";
      const isExAssinante = u.role === "VISITANTE" && expDate !== null;

      if (isExpired || isCancelled || isExAssinante) {
        res.listVencidos.push(u);
        return;
      }
      if (u.role === "VISITANTE" && !expDate) {
        res.listLeads.push(u);
        return;
      }
      if (!isMercadoPago) {
        res.listPix.push(u);
        return;
      }

      const jaPassouDaGarantia = (data?.commissions || []).some(
        (c: any) =>
          c.userId === u.id &&
          (c.status === "AVAILABLE" || c.status === "PAID"),
      );

      if (!jaPassouDaGarantia) {
        res.listTeste.push(u);
      } else {
        if (planType === "quarterly") res.listTrimestral.push(u);
        else if (planType === "yearly") res.listAnual.push(u);
        else res.listMensal.push(u);
      }
    });
    return res;
  }, [clients, hoje, data?.commissions]);

  const getRawList = () => {
    if (activeTab === "mensal") return listMensal;
    if (activeTab === "trimestral") return listTrimestral;
    if (activeTab === "anual") return listAnual;
    if (activeTab === "pix") return listPix;
    if (activeTab === "teste") return listTeste;
    if (activeTab === "leads") return listLeads;
    return listVencidos;
  };

  const filteredList = getRawList()
    .filter((ref: any) =>
      ref.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    // 🚀 CORTE 4.2 (LÓGICA) AQUI:
    .sort((a: any, b: any) => {
      // 🚀 ORDENAÇÃO DE LOGIN TEM PRIORIDADE SE O FILTRO ESTIVER ATIVO
      if (loginSort === "recentes")
        return (
          new Date(b.lastLogin || 0).getTime() -
          new Date(a.lastLogin || 0).getTime()
        );
      if (loginSort === "antigos")
        return (
          new Date(a.lastLogin || 0).getTime() -
          new Date(b.lastLogin || 0).getTime()
        );

      // Se não, usa a ordem padrão (vencimento)
      const expA = a.businesses?.[0]?.expiresAt
        ? new Date(a.businesses[0].expiresAt).getTime()
        : 0;
      const expB = b.businesses?.[0]?.expiresAt
        ? new Date(b.businesses[0].expiresAt).getTime()
        : 0;
      return expA - expB;
    });

  const copyLink = () => {
    const linkCompleto = `${origin}/?ref=${affiliate.referralCode}`;
    navigator.clipboard.writeText(linkCompleto);
    toast.success("Link copiado! Boas vendas!", { icon: <Share2 size={16} /> });
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 font-sans">
      {/* 1. PAINEL FINANCEIRO */}
      <div className="bg-gradient-to-br from-[#023059] to-[#011a33] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-[#F28705]">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Zap size={400} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10 items-center">
          <div className="space-y-8 flex-1 w-full">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md">
              <Wallet size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
                COMISSÃO AUTOMÁTICA (CARTÃO)
              </span>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F28705] mb-2">
                Disponível para Saque
              </p>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-emerald-400">
                {formatMoney(stats.disponivel)}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 p-2.5 rounded-[2rem] border border-white/10 max-w-lg backdrop-blur-sm">
              <div className="flex-1 px-5 py-2 w-full truncate font-mono text-[11px] text-blue-200/70 font-bold select-all">
                {origin
                  ? `${origin}/?ref=${affiliate.referralCode}`
                  : "Carregando link..."}
              </div>
              <button
                onClick={copyLink}
                className="w-full sm:w-auto bg-[#F28705] text-[#023059] px-6 py-3 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
              >
                Copiar Link
              </button>
            </div>

            {/* 🚀 O BOOST DE VENDAS DO AFILIADO AQUI */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#F28705] text-[#023059] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                <Target size={14} /> Mensal: R$ 10
              </span>
              <span className="bg-[#F28705] text-[#023059] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                <Target size={14} /> Trimestral: R$ 30
              </span>
              <span className="bg-emerald-400 text-[#023059] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-emerald-300">
                <Zap size={14} /> Anual: R$ 120
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 border-l-8 border-l-blue-500 min-w-[240px]">
              <p className="text-[10px] font-black uppercase text-gray-300 mb-2 tracking-widest flex items-center gap-2">
                <Clock size={14} /> Saldo Pendente
              </p>
              <p className="text-3xl font-black text-white">
                {formatMoney(stats.pendente)}
              </p>
              <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase">
                *Liberado após 7 dias do pagamento
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 border-l-8 border-l-gray-500 min-w-[240px]">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                <Banknote size={14} /> Já Pago
              </p>
              <p className="text-3xl font-black italic text-white/50">
                {formatMoney(stats.pago)}
              </p>
              <p className="text-[8px] font-bold text-gray-500 mt-2 uppercase">
                *Transferido p/ Você
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CRM - BUSCA E ABAS */}
      <div className="space-y-6">
        <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-100 flex items-center shadow-sm relative pr-[120px]">
          <Search className="absolute left-6 text-gray-300" size={24} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={100} // 🚀 TRAVA DE UX E PERFORMANCE
            placeholder="Buscar cliente na lista..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-full text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#F28705] transition-all text-[#023059]"
          />
          {/* 🚀 CORTE 4.2 (BOTÃO VISUAL) AQUI: */}
          <button
            onClick={() =>
              setLoginSort((prev) =>
                prev === "recentes"
                  ? "antigos"
                  : prev === "antigos"
                    ? null
                    : "recentes",
              )
            }
            className={`absolute right-6 p-2 rounded-xl transition-all border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${loginSort ? "bg-[#023059] text-emerald-400 border-[#023059]" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"}`}
          >
            <Clock size={14} />
            {loginSort
              ? loginSort === "recentes"
                ? "Ativos"
                : "Sumidos"
              : "Filtro: Login"}
          </button>
        </div>

        {/* Scroll Horizontal de Abas do Funil */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          <TabButton
            active={activeTab === "mensal"}
            onClick={() => setActiveTab("mensal")}
            label="Mensais"
            count={listMensal.length}
            color="bg-emerald-500"
          />
          <TabButton
            active={activeTab === "trimestral"}
            onClick={() => setActiveTab("trimestral")}
            label="Trimestrais"
            count={listTrimestral.length}
            color="bg-emerald-600"
          />
          <TabButton
            active={activeTab === "anual"}
            onClick={() => setActiveTab("anual")}
            label="Anuais"
            count={listAnual.length}
            color="bg-emerald-700"
          />
          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0"></div>

          <TabButton
            active={activeTab === "pix"}
            onClick={() => setActiveTab("pix")}
            label="PIX / Manuais"
            count={listPix.length}
            color="bg-purple-500"
            icon={<QrCode size={12} />}
          />

          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0"></div>

          <TabButton
            active={activeTab === "teste"}
            onClick={() => setActiveTab("teste")}
            label="Em Teste"
            count={listTeste.length}
            color="bg-[#F28705]"
          />
          <TabButton
            active={activeTab === "leads"}
            onClick={() => setActiveTab("leads")}
            label="Leads (Visitantes)"
            count={listLeads.length}
            color="bg-blue-500"
          />
          <TabButton
            active={activeTab === "vencidos"}
            onClick={() => setActiveTab("vencidos")}
            label="Vencidos / Cancelados"
            count={listVencidos.length}
            color="bg-rose-500"
          />
          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0"></div>
          <TabButton
            active={activeTab === "extrato"}
            onClick={() => setActiveTab("extrato")}
            label="Extrato"
            count={data.commissions?.length || 0}
            color="bg-emerald-500"
            icon={<Banknote size={12} />}
          />
          <TabButton
            active={activeTab === "saques"}
            onClick={() => setActiveTab("saques")}
            label="Meus Saques"
            count={data.withdrawals?.length || 0}
            color="bg-emerald-600"
            icon={<Wallet size={12} />}
          />
        </div>

        {/* 3. LISTAGEM DE CLIENTES E SAQUES E EXTRATO */}
        {activeTab === "extrato" ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-md p-6 md:p-8">
            <h2 className="text-xl font-black text-[#023059] uppercase italic tracking-tighter mb-6 flex items-center gap-2">
              <Banknote className="text-emerald-500" /> Extrato de Comissões
            </h2>

            {!data.commissions || data.commissions.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Banknote size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-black uppercase text-gray-400 text-[10px] tracking-widest">
                  Você ainda não possui comissões geradas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.commissions.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.status === "PAID" ? "bg-emerald-100 text-emerald-600" : c.status === "AVAILABLE" ? "bg-blue-100 text-blue-600" : c.status === "CANCELLED" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}
                      >
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#023059] uppercase">
                          {c.business?.name || "Loja Excluída"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                          Em:{" "}
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-xl font-black italic tracking-tighter ${c.status === "CANCELLED" ? "text-rose-400 line-through" : "text-emerald-500"}`}
                      >
                        + {formatMoney(c.amount)}
                      </p>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${c.status === "PAID" ? "text-emerald-500" : c.status === "AVAILABLE" ? "text-blue-500" : c.status === "CANCELLED" ? "text-rose-500" : "text-amber-500"}`}
                      >
                        Status:{" "}
                        {c.status === "PAID"
                          ? "Já Recebido"
                          : c.status === "AVAILABLE"
                            ? "Disponível"
                            : c.status === "CANCELLED"
                              ? "Estornado"
                              : "Pendente (Garantia)"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "saques" ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-md p-6 md:p-8">
            <h2 className="text-xl font-black text-[#023059] uppercase italic tracking-tighter mb-6 flex items-center gap-2">
              <Wallet className="text-[#F28705]" /> Meus Saques
            </h2>

            {!data.withdrawals || data.withdrawals.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Banknote size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-black uppercase text-gray-400 text-[10px] tracking-widest">
                  Você ainda não possui saques no histórico.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.withdrawals.map((saque: any) => (
                  <div
                    key={saque.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-colors hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#023059] uppercase">
                          Transferência PIX
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                          {new Date(
                            saque.paidAt || saque.createdAt,
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          às{" "}
                          {new Date(
                            saque.paidAt || saque.createdAt,
                          ).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">
                        {formatMoney(saque.amount)}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Status: Concluído
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((ref: any) => {
                const business = ref.businesses?.[0];
                const expDate = business?.expiresAt
                  ? new Date(business.expiresAt)
                  : null;
                const daysLeft = expDate
                  ? Math.ceil(
                      (expDate.getTime() - hoje.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0;

                return (
                  <div
                    key={ref.id}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col overflow-hidden group"
                  >
                    <div
                      className={`px-5 py-3 flex justify-between items-center border-b ${
                        activeTab === "leads"
                          ? "bg-blue-50 border-blue-100"
                          : activeTab === "teste"
                            ? "bg-orange-50 border-orange-100"
                            : activeTab === "vencidos"
                              ? "bg-rose-50 border-rose-100"
                              : activeTab === "pix"
                                ? "bg-purple-50 border-purple-100"
                                : "bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          activeTab === "leads"
                            ? "text-blue-600"
                            : activeTab === "teste"
                              ? "text-[#F28705]"
                              : activeTab === "vencidos"
                                ? "text-rose-600"
                                : activeTab === "pix"
                                  ? "text-purple-600 flex items-center gap-1"
                                  : "text-emerald-600"
                        }`}
                      >
                        {activeTab === "leads" ? (
                          "Falta Assinar"
                        ) : activeTab === "teste" ? (
                          "Faltam " + daysLeft + " dias para faturar"
                        ) : activeTab === "vencidos" ? (
                          "Recuperar Venda"
                        ) : activeTab === "pix" ? (
                          <>
                            <QrCode size={10} /> PIX - Restam {daysLeft} dias
                          </>
                        ) : (
                          "Ativo e Rendendo"
                        )}
                      </span>
                    </div>

                    <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="truncate max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-[#023059] text-lg uppercase leading-tight truncate">
                                {ref.name || "Sem Nome"}
                              </h3>
                              {activeTab === "teste" && (
                                <span className="bg-[#F28705] text-white text-[8px] md:text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0 shadow-sm">
                                  Trial 7 Dias
                                </span>
                              )}
                            </div>
                          </div>
                          {business && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/dashboard/editar/${business.slug}`}
                                title="Editar Loja (Modo Agência)"
                                className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
                              >
                                <Edit3 size={16} />
                              </Link>
                              <Link
                                href={`/site/${business.slug}`}
                                target="_blank"
                                title="Ver loja"
                                className="h-10 w-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center hover:bg-[#023059] hover:text-white transition-all border border-gray-200"
                              >
                                <ExternalLink size={16} />
                              </Link>
                            </div>
                          )}
                        </div>

                        {ref.role === "ASSINANTE" && expDate && (
                          <div className="mt-4 flex flex-col gap-2">
                            <div
                              className={`flex items-center gap-1.5 w-fit text-[11px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                                daysLeft <= 0
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : activeTab === "pix"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              {daysLeft <= 0 ? (
                                <AlertCircle size={14} />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              {daysLeft <= 0
                                ? `Vencido há ${Math.abs(daysLeft)} dias`
                                : `Vence em ${daysLeft} dias`}
                            </div>
                            {activeTab === "pix" && (
                              <p className="text-[9px] font-bold text-purple-500/70 leading-tight">
                                *Você deve cobrar este cliente diretamente e
                                repassar a parte da plataforma.
                              </p>
                            )}
                          </div>
                        )}

                        {ref.role === "ASSINANTE" && ref.lastLogin && (
                          <div className="mt-1 flex items-center gap-1.5 w-fit text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            <Clock size={10} className="text-blue-400" />{" "}
                            Acessou:{" "}
                            {new Date(ref.lastLogin).toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            às{" "}
                            {new Date(ref.lastLogin).toLocaleTimeString(
                              "pt-BR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 w-full mt-2">
                        <a
                          href={
                            ref.phone
                              ? `https://wa.me/55${ref.phone.replace(/\D/g, "")}?text=${encodeURIComponent(daysLeft <= 0 ? `Olá ${ref.name?.split(" ")[0]}, sua assinatura na plataforma venceu! Vamos renovar?` : activeTab === "pix" && daysLeft <= 5 ? `Olá ${ref.name?.split(" ")[0]}, passando para lembrar que sua assinatura vence em ${daysLeft} dias. Segue a chave PIX para renovação:` : `Olá ${ref.name?.split(" ")[0]}, tudo bem? Como estão os acessos na sua vitrine?`)}`
                              : "#"
                          }
                          target="_blank"
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${ref.phone ? "bg-[#25D366] text-white shadow-lg hover:bg-[#1ebd57]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                          onClick={(e) => {
                            if (!ref.phone) {
                              e.preventDefault();
                              toast.error(
                                "Este cliente não tem telefone cadastrado.",
                              );
                            }
                          }}
                        >
                          <MessageCircle size={18} />
                          <span className="hidden sm:inline">WhatsApp</span>
                          <span className="sm:hidden">WPP</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredList.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 mt-6">
                <Target size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-black uppercase text-gray-400 text-[10px] tracking-widest">
                  Nenhum cliente nesta categoria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Obs: Seu código continua com as funções TabButton, MetricCard, etc., abaixo daqui
// O arquivo está fechado corretamente no `}` da função AffiliateDashboard.

function TabButton({ active, onClick, label, count, color, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
        active
          ? `${color} text-white shadow-lg border-b-4 border-black/20 scale-105`
          : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {icon} {label}
      <span
        className={`px-2 py-0.5 rounded-full text-[9px] ${active ? "bg-white/20" : "bg-gray-100 text-gray-400"}`}
      >
        {count}
      </span>
    </button>
  );
}
