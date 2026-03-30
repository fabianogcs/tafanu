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
  QrCode, // ⬅️ Ícone novo para a aba de PIX
} from "lucide-react";

export default function AffiliateDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mensal");
  const [searchTerm, setSearchTerm] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin); // 🚀 Só captura a URL quando chegar no navegador
  }, []);

  useEffect(() => {
    async function loadStats() {
      // 🚀 Usando a nova função super otimizada que criamos
      const res = await getAffiliateDashboardData();
      if (res.error) toast.error(res.error);
      else setData(res);
      setLoading(false);
    }
    loadStats();
  }, []);

  // 🚀 CÁLCULO FINANCEIRO EXCLUSIVO DO MERCADO PAGO
  const stats = useMemo(() => {
    let disponivel = 0;
    let pendente = 0;
    let pago = 0;

    if (data?.commissions) {
      data.commissions.forEach((c: any) => {
        if (c.status === "AVAILABLE") disponivel += c.amount;
        if (c.status === "PENDING") pendente += c.amount;
        if (c.status === "PAID") pago += c.amount;
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

  // 🛡️ O FUNIL DE VENDAS PERFEITO (CRM) - VERSÃO BLINDADA
  const listMensal: any[] = [];
  const listTrimestral: any[] = [];
  const listAnual: any[] = [];
  const listPix: any[] = [];
  const listTeste: any[] = [];
  const listLeads: any[] = [];
  const listVencidos: any[] = [];

  // COLOQUE ISSO:
  clients.forEach((u: any) => {
    const expDate = u.expiresAt ? new Date(u.expiresAt) : null;
    const creationDate = new Date(u.createdAt);
    const isActive = expDate && expDate > hoje;

    if (u.role === "VISITANTE") {
      listLeads.push(u);
    } else if (u.role === "ASSINANTE") {
      if (!isActive) {
        listVencidos.push(u); // Se venceu, vai pra aba de recuperação
      } else if (!u.mpSubscriptionId) {
        listPix.push(u); // Ativação manual via Admin
      } else {
        // Lógica Automática (Mercado Pago)
        if (u.planType === "monthly") {
          const idadeConta = Math.ceil(
            (hoje.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Se for conta nova (menos de 7 dias) e plano mensal, é o TRIAL
          if (idadeConta <= 7) {
            listTeste.push(u);
          } else {
            listMensal.push(u);
          }
        } else if (u.planType === "quarterly") {
          listTrimestral.push(u);
        } else if (u.planType === "yearly") {
          listAnual.push(u);
        }
      }
    }
  });
  const getRawList = () => {
    if (activeTab === "mensal") return listMensal;
    if (activeTab === "trimestral") return listTrimestral;
    if (activeTab === "anual") return listAnual;
    if (activeTab === "pix") return listPix; // 🚀 Retorna a lista de PIX
    if (activeTab === "teste") return listTeste;
    if (activeTab === "leads") return listLeads;
    return listVencidos;
  };

  const filteredList = getRawList().filter(
    (ref: any) =>
      ref.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const copyLink = () => {
    const linkCompleto = `${origin}/?ref=${affiliate.referralCode}`; // 🚀 Usa o estado origin
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
        <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-100 flex items-center shadow-sm relative">
          <Search className="absolute left-6 text-gray-300" size={24} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente na lista..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-full text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#F28705] transition-all text-[#023059]"
          />
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

          {/* 🚀 NOVA ABA DE PIX MANUAL (Controle Privado do Afiliado) */}
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
        </div>

        {/* 3. LISTAGEM DE CLIENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((ref: any) => {
            const expDate = ref.expiresAt ? new Date(ref.expiresAt) : null;
            const daysLeft = expDate
              ? Math.ceil(
                  (expDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
                )
              : 0;
            const business = ref.businesses?.[0];

            return (
              <div
                key={ref.id}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col overflow-hidden group"
              >
                {/* CABEÇALHO DO CARD (Dinâmico por Aba) */}
                <div
                  className={`px-5 py-3 flex justify-between items-center border-b ${
                    activeTab === "leads"
                      ? "bg-blue-50 border-blue-100"
                      : activeTab === "teste"
                        ? "bg-orange-50 border-orange-100"
                        : activeTab === "vencidos"
                          ? "bg-rose-50 border-rose-100"
                          : activeTab === "pix"
                            ? "bg-purple-50 border-purple-100" // 🚀 Cor da aba PIX
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
                        <QrCode size={10} /> Pagamento Manual
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
                        <h3 className="font-black text-[#023059] text-lg uppercase leading-tight truncate">
                          {ref.name || "Sem Nome"}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-400 mt-1 truncate">
                          {ref.email}
                        </p>
                      </div>

                      {/* Botão de Ver Loja */}
                      {business && (
                        <Link
                          href={`/site/${business.slug}`}
                          target="_blank"
                          title="Ver loja"
                          className="h-10 w-10 shrink-0 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center hover:bg-[#023059] hover:text-white transition-all border border-gray-200"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                    </div>

                    {/* STATUS DE TEMPO E AVISOS */}
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

                        {/* 🚀 AVISO ESPECIAL PARA A ABA DE PIX */}
                        {activeTab === "pix" && (
                          <p className="text-[9px] font-bold text-purple-500/70 leading-tight">
                            *Você deve cobrar este cliente diretamente e
                            repassar a parte da plataforma.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOTÃO WHATSAPP - CRM COMPLETO */}
                  <a
                    href={
                      ref.phone
                        ? `https://wa.me/55${ref.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            daysLeft <= 0
                              ? `Olá ${ref.name?.split(" ")[0]}, sua assinatura na plataforma venceu! Vamos renovar?`
                              : activeTab === "pix" && daysLeft <= 5
                                ? `Olá ${ref.name?.split(" ")[0]}, passando para lembrar que sua assinatura vence em ${daysLeft} dias. Segue a chave PIX para renovação:`
                                : `Olá ${ref.name?.split(" ")[0]}, tudo bem? Como estão os acessos na sua loja?`,
                          )}`
                        : "#"
                    }
                    target="_blank"
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      ref.phone
                        ? "bg-[#25D366] text-white shadow-lg hover:bg-[#1ebd57]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
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
                    {ref.phone ? "Atendimento WhatsApp" : "Sem Telefone Salvo"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-black uppercase text-gray-400 text-[10px] tracking-widest">
              Nenhum cliente nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
