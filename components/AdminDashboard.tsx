"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  LayoutGrid,
  CalendarDays,
  X,
  AlertTriangle,
  MinusCircle,
  UserCheck,
  Eraser,
  Loader2,
  TrendingUp,
  DollarSign,
  Activity,
  Mail,
  MessageCircle,
  Award,
  Star,
  Wallet,
  UserX,
  ShieldAlert,
  Gavel,
  Timer,
} from "lucide-react";

import {
  resolveReport,
  adminAddDaysToUser,
  adminAddExactDaysToUser, // A nova função de dar dias exatos
  runGarbageCollector,
  promoteToAffiliate,
  getAffiliatePayouts,
  markAffiliateAsPaid,
  banUserAction,
  unbanUserAction,
} from "@/app/actions";

export default function AdminDashboard({ data }: { data: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [promotingUser, setPromotingUser] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const ADMIN_EMAIL = "prfabianoguedes@gmail.com";

  // --- CARREGAR PAGAMENTOS DE AFILIADOS ---
  const loadPayouts = async () => {
    const res = await getAffiliatePayouts();
    if (res.payouts) setPayouts(res.payouts);
  };

  useEffect(() => {
    if (activeTab === "payouts") loadPayouts();
  }, [activeTab]);

  // --- PROCESSAMENTO DE DADOS ---
  const {
    allUsers,
    activeSubscribers,
    visitors,
    partners,
    pendingReports,
    bannedUsers,
  } = useMemo(() => {
    const users = data.users.filter((u: any) => u.email !== ADMIN_EMAIL);
    const now = new Date();

    const active = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" &&
        u.expiresAt &&
        new Date(u.expiresAt) > now &&
        !u.isBanned,
    );
    const leads = users.filter(
      (u: any) => u.role === "VISITANTE" && !u.isBanned,
    );
    const affs = users.filter((u: any) => u.role === "AFILIADO");
    const banned = users.filter((u: any) => u.isBanned);
    const reports = data.reports.filter((r: any) => r.status === "PENDING");

    return {
      allUsers: users,
      activeSubscribers: active,
      visitors: leads,
      partners: affs,
      bannedUsers: banned,
      pendingReports: reports,
    };
  }, [data]);

  // --- FILTRO DE BUSCA INTELIGENTE ---
  const filteredData = useMemo(() => {
    let baseList = [];
    if (activeTab === "reports") return pendingReports;
    if (activeTab === "payouts") return payouts;

    switch (activeTab) {
      case "subscribers":
        baseList = activeSubscribers;
        break;
      case "visitors":
        baseList = visitors;
        break;
      case "partners":
        baseList = partners;
        break;
      case "banned":
        baseList = bannedUsers;
        break;
      default:
        baseList = allUsers;
    }

    const searchLower = searchTerm.toLowerCase();
    return baseList.filter(
      (u: any) =>
        (u.name?.toLowerCase() || "").includes(searchLower) ||
        (u.email?.toLowerCase() || "").includes(searchLower) ||
        (u.document || "").includes(searchLower),
    );
  }, [
    activeTab,
    searchTerm,
    allUsers,
    activeSubscribers,
    visitors,
    partners,
    pendingReports,
    payouts,
    bannedUsers,
  ]);

  // --- AÇÕES ADMINISTRATIVAS ---
  const handleBan = (userId: string, name: string) => {
    if (
      !confirm(
        `BANIR ${name.toUpperCase()}? Isso cancela o pagamento no Mercado Pago e bloqueia o CPF.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await banUserAction(userId);
      res.success ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      const res = await unbanUserAction(userId);
      res.success ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });
  };

  const handleResolveReport = (reportId: string) => {
    startTransition(async () => {
      const res = await resolveReport(reportId);
      res.success
        ? toast.success("Caso encerrado!")
        : toast.error("Erro ao resolver.");
      router.refresh();
    });
  };

  const handlePromote = async () => {
    if (!referralCodeInput) return toast.error("Defina um código!");
    startTransition(async () => {
      const res = await promoteToAffiliate(promotingUser.id, referralCodeInput);
      if (res.success) {
        toast.success(res.message);
        setPromotingUser(null);
        setReferralCodeInput("");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  // ⏱️ CONTROLE DE MESES (Adiciona ou Remove)
  const handleAddMonths = (e: any, userId: string, months: number) => {
    e.stopPropagation();
    if (
      months < 0 &&
      !confirm(
        "ATENÇÃO: Deseja realmente REMOVER 1 mês de acesso deste usuário?",
      )
    )
      return;

    startTransition(async () => {
      await adminAddDaysToUser(userId, months);
      router.refresh();
      toast.success(months > 0 ? "+1 Mês adicionado!" : "-1 Mês removido!");
    });
  };

  // ⏱️ CONTROLE DE DIAS (Botão de 5 Dias)
  const handleAddExactDays = (e: any, userId: string, days: number) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await adminAddExactDaysToUser(userId, days);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res?.error || "Erro ao adicionar dias.");
      }
    });
  };

  const handleConfirmPayment = async (
    affiliateId: string,
    valor: number,
    name: string,
  ) => {
    if (
      !confirm(
        `Confirmar o envio do PIX de R$ ${valor.toFixed(2)} para ${name.toUpperCase()}? O saldo será zerado.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await markAffiliateAsPaid(affiliateId);
      if (res.success) {
        toast.success(res.message);
        loadPayouts();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER 2.0 */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 rounded-3xl text-emerald-400 shadow-xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Security & Billing
              </p>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                Tafanu <span className="text-emerald-500">HQ</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por Nome, E-mail ou CPF..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 shadow-inner font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (confirm("Iniciar faxina de imagens?"))
                  runGarbageCollector().then((r) => toast.success(r.message));
              }}
              className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
              title="Limpar Imagens Inúteis"
            >
              <Eraser />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* CARDS DE PERFORMANCE */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            icon={<DollarSign />}
            label="Receita Real"
            value={`R$ ${data.receita.toFixed(2)}`}
            color="emerald"
            subValue="Soma Mensal/Anual"
          />
          <MetricCard
            icon={<Activity />}
            label="Membresia"
            value={activeSubscribers.length}
            color="blue"
            subValue="Assinantes Ativos"
          />
          <MetricCard
            icon={<Users />}
            label="Leads"
            value={visitors.length}
            color="slate"
            subValue="Visitantes / Testes"
          />
          <MetricCard
            icon={<Award />}
            label="Parceiros"
            value={partners.length}
            color="amber"
            subValue="Time de Vendas"
          />
          <MetricCard
            icon={<ShieldAlert />}
            label="Crises"
            value={pendingReports.length}
            color="rose"
            subValue="Aguardando Ação"
          />
        </section>

        {/* NAVEGAÇÃO */}
        <div className="flex p-1.5 bg-white rounded-[2rem] shadow-sm border border-slate-200 w-fit overflow-x-auto max-w-full no-scrollbar">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            label="Overview"
            icon={<LayoutGrid size={16} />}
          />
          <TabButton
            active={activeTab === "subscribers"}
            onClick={() => setActiveTab("subscribers")}
            label="Assinantes"
            icon={<CheckCircle2 size={16} />}
            count={activeSubscribers.length}
          />
          <TabButton
            active={activeTab === "visitors"}
            onClick={() => setActiveTab("visitors")}
            label="Leads"
            icon={<Users size={16} />}
            count={visitors.length}
          />
          <TabButton
            active={activeTab === "partners"}
            onClick={() => setActiveTab("partners")}
            label="Parceiros"
            icon={<Star size={16} />}
            count={partners.length}
          />
          <TabButton
            active={activeTab === "payouts"}
            onClick={() => setActiveTab("payouts")}
            label="Financeiro"
            icon={<Wallet size={16} />}
            count={payouts.length}
          />
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            label="Crises"
            icon={<AlertTriangle size={16} />}
            count={pendingReports.length}
          />
          <TabButton
            active={activeTab === "banned"}
            onClick={() => setActiveTab("banned")}
            label="Banidos"
            icon={<UserX size={16} />}
            count={bannedUsers.length}
          />
        </div>

        {/* CONTAINER PRINCIPAL */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* TABELA GERAL DE USUÁRIOS */}
          {activeTab !== "overview" &&
            activeTab !== "reports" &&
            activeTab !== "payouts" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                      <th className="p-6 text-left">Membro</th>
                      <th className="p-6 text-left">Status da Conta</th>
                      <th className="p-6 text-right">Painel de Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((user: any) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${user.isBanned ? "bg-rose-50/20" : ""}`}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${user.isBanned ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}
                            >
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p
                                className={`font-black uppercase italic ${user.isBanned ? "text-rose-600 line-through" : "text-slate-900"}`}
                              >
                                {user.name || "Sem Nome"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          {user.isBanned ? (
                            <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase italic">
                              BLACKLIST
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                expiresAt={user.expiresAt}
                                role={user.role}
                              />
                              {user.role === "ASSINANTE" && (
                                <PlanPriceBadge price={user.lastPrice} />
                              )}
                            </div>
                          )}
                        </td>
                        <td
                          className="p-6 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-3 items-center">
                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnban(user.id)}
                                className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all"
                                title="Desbanir"
                              >
                                <UserCheck size={18} />
                              </button>
                            ) : (
                              <>
                                {/* PAINEL DE CONTROLE DE TEMPO */}
                                {user.role !== "ADMIN" &&
                                  user.role !== "AFILIADO" && (
                                    <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                                      <button
                                        onClick={(e) =>
                                          handleAddMonths(e, user.id, -1)
                                        }
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                                        title="Remover 1 Mês"
                                      >
                                        <MinusCircle size={16} />
                                      </button>
                                      <button
                                        onClick={(e) =>
                                          handleAddExactDays(e, user.id, 5)
                                        }
                                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-white rounded-xl transition-all"
                                        title="Dar 5 Dias de Teste"
                                      >
                                        <Timer size={16} />
                                      </button>
                                      <button
                                        onClick={(e) =>
                                          handleAddMonths(e, user.id, 1)
                                        }
                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-xl transition-all"
                                        title="Adicionar 1 Mês"
                                      >
                                        <CalendarDays size={16} />
                                      </button>
                                    </div>
                                  )}

                                {user.role !== "AFILIADO" &&
                                  user.role !== "ADMIN" && (
                                    <button
                                      onClick={() => setPromotingUser(user)}
                                      className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-amber-100"
                                      title="Tornar Parceiro"
                                    >
                                      <Award size={18} />
                                    </button>
                                  )}

                                <button
                                  onClick={() => handleBan(user.id, user.name)}
                                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md"
                                  title="BANIR CPF"
                                >
                                  <Gavel size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <EmptyState message="Nenhum usuário listado nesta categoria." />
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* ABA OVERVIEW */}
          {activeTab === "overview" && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-black uppercase italic text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Últimos Negócios
                  Criados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allUsers
                    .flatMap((u: any) => u.businesses)
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(0, 8)
                    .map((biz: any) => (
                      <div
                        key={biz.id}
                        className="p-5 bg-slate-50 rounded-[2rem] flex items-center justify-between border border-slate-100 hover:shadow-sm transition-all"
                      >
                        <div>
                          <p className="font-black text-slate-900 italic uppercase leading-none">
                            {biz.name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1">
                            /{biz.slug}
                          </p>
                        </div>
                        <a
                          href={`/site/${biz.slug}`}
                          target="_blank"
                          className="p-2.5 bg-white text-emerald-500 rounded-xl shadow-sm border border-slate-100"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-between">
                <div>
                  <h3 className="font-black uppercase italic text-slate-500 mb-8 tracking-[0.2em] text-center text-xs">
                    Termômetro da Plataforma
                  </h3>
                  <HealthItem
                    label="Conversão (Assinantes)"
                    value={activeSubscribers.length}
                    total={allUsers.length}
                    color="bg-emerald-400"
                  />
                  <HealthItem
                    label="Potencial Oculto (Leads)"
                    value={visitors.length}
                    total={allUsers.length}
                    color="bg-amber-400"
                  />
                  <HealthItem
                    label="Parceiros"
                    value={partners.length}
                    total={allUsers.length}
                    color="bg-blue-400"
                  />
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center mt-6">
                  <p className="text-[10px] font-black text-emerald-400 uppercase italic mb-1">
                    Status Global
                  </p>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">
                    SISTEMA ONLINE
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA DENÚNCIAS */}
          {activeTab === "reports" && (
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                  <th className="p-6 text-left">Perfil Reportado</th>
                  <th className="p-6 text-left">Detalhes da Crise</th>
                  <th className="p-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingReports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-rose-50/20">
                    <td className="p-6 font-black uppercase italic text-slate-900">
                      {report.business?.name}
                    </td>
                    <td className="p-6">
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase">
                        {report.reason}
                      </span>
                      <p className="text-xs text-slate-500 mt-2 font-medium italic">
                        "{report.details}"
                      </p>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg"
                      >
                        Arquivar
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingReports.length === 0 && (
                  <EmptyState message="Céu limpo. Nenhuma denúncia." />
                )}
              </tbody>
            </table>
          )}

          {/* ABA FINANCEIRO */}
          {activeTab === "payouts" && (
            <div className="p-8 space-y-4">
              {payouts.map((p: any) => (
                <div
                  key={p.id}
                  className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase italic text-lg leading-none">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        {p.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-center bg-white px-10 py-5 rounded-[2rem] border shadow-inner">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase">
                        Vendas
                      </p>
                      <p className="font-black text-xl">{p.ativos}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase">
                        Comissão
                      </p>
                      <p className="font-black text-blue-600 text-xl">
                        {p.taxa}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase">
                        A Pagar
                      </p>
                      <p className="font-black text-emerald-600 text-2xl tracking-tighter">
                        R$ {p.valorDevido.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/55${p.phone?.replace(/\D/g, "")}`}
                      target="_blank"
                      className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      <MessageCircle />
                    </a>
                    <button
                      onClick={() =>
                        handleConfirmPayment(p.id, p.valorDevido, p.name)
                      }
                      className="px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all"
                    >
                      PAGAR VIA PIX
                    </button>
                  </div>
                </div>
              ))}
              {payouts.length === 0 && (
                <EmptyState message="Nenhum parceiro atingiu a meta de pagamento." />
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAIS (MANTIDOS INTACTOS DA SUA VERSÃO) */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${selectedUser.isBanned ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}
                >
                  {selectedUser.isBanned ? (
                    <UserX size={40} />
                  ) : (
                    <ShieldCheck size={40} />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none mb-2">
                    {selectedUser.name}
                  </h2>
                  <div className="flex gap-3">
                    <span className="px-2 py-1 bg-white rounded-lg border text-[10px] font-bold text-slate-400 tracking-tighter">
                      {selectedUser.email}
                    </span>
                    <span className="px-2 py-1 bg-white rounded-lg border text-[10px] font-bold text-slate-400 tracking-tighter">
                      CPF: {selectedUser.document || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-rose-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-10">
              {selectedUser.isBanned ? (
                <div className="p-10 bg-rose-50 border-2 border-rose-100 border-dashed rounded-[2.5rem] text-center mb-8">
                  <AlertTriangle
                    className="mx-auto text-rose-500 mb-4"
                    size={48}
                  />
                  <h4 className="font-black text-rose-600 uppercase italic text-xl">
                    Acesso Revogado
                  </h4>
                  <p className="text-sm text-rose-500 font-medium max-w-sm mx-auto mt-2">
                    CPF bloqueado. Nenhuma nova transação será aceita no Mercado
                    Pago.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <ContactAction
                    icon={<MessageCircle />}
                    label="WhatsApp"
                    href={`https://wa.me/55${selectedUser.phone?.replace(/\D/g, "")}`}
                    color="emerald"
                  />
                  <ContactAction
                    icon={<Mail />}
                    label="E-mail"
                    href={`mailto:${selectedUser.email}`}
                    color="blue"
                  />
                  <ContactAction
                    icon={<Activity />}
                    label="Log de Acesso"
                    href="#"
                    color="slate"
                  />
                </div>
              )}
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6 flex items-center gap-2">
                <LayoutGrid size={14} /> Negócios na Plataforma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUser.businesses?.map((biz: any) => (
                  <div
                    key={biz.id}
                    className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white transition-all group"
                  >
                    <div>
                      <p className="font-black text-slate-900 italic uppercase">
                        {biz.name}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-500">
                        tafanu.app/site/{biz.slug}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/editar/${biz.slug}?adminMode=true`,
                        )
                      }
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      Editar
                    </button>
                  </div>
                ))}
                {(!selectedUser.businesses ||
                  selectedUser.businesses.length === 0) && (
                  <p className="text-xs text-slate-300 font-bold italic">
                    Nenhum anúncio criado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {promotingUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
          onClick={() => setPromotingUser(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-[3rem] p-10 animate-in zoom-in-95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-inner">
                <Award size={48} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Novo Parceiro VIP
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-2">
                Personalize o código para {promotingUser.name}
              </p>
            </div>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="EX: NOME-SAO-PAULO"
                className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-black uppercase outline-none focus:ring-2 ring-amber-500/20 text-center text-lg tracking-widest"
                value={referralCodeInput}
                onChange={(e) =>
                  setReferralCodeInput(
                    e.target.value.toUpperCase().replace(/\s/g, "-"),
                  )
                }
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setPromotingUser(null)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  Abortar
                </button>
                <button
                  onClick={handlePromote}
                  disabled={isPending}
                  className="flex-[2] py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-100"
                >
                  {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "ATIVAR AFILIADO"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUBCOMPONENTES DE APOIO ---

function PlanPriceBadge({ price }: { price: number }) {
  const isTrimestral = price > 30 && price < 100;
  const isAnual = price > 100;
  return (
    <span
      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isAnual ? "bg-emerald-100 text-emerald-700" : isTrimestral ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
    >
      {isAnual ? "Anual" : isTrimestral ? "Trimestral" : "Mensal"}
    </span>
  );
}

function MetricCard({ icon, label, value, color, subValue }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <div
      className={`p-6 bg-white rounded-[2.5rem] border ${colors[color]} shadow-sm`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${colors[color].replace("border-", "")} shadow-sm`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </p>
      <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">
        {value}
      </h4>
      <p className="text-[8px] font-bold text-slate-300 uppercase mt-1 tracking-widest">
        {subValue}
      </p>
    </div>
  );
}

function ContactAction({ icon, label, href, color }: any) {
  const colors: any = {
    emerald:
      "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-100",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border-blue-100",
    slate:
      "bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white border-slate-100",
  };
  return (
    <a
      href={href}
      target="_blank"
      className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-2 ${colors[color]} group shadow-sm`}
    >
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </a>
  );
}

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-slate-900 text-white shadow-xl scale-105" : "text-slate-400 hover:bg-slate-50"}`}
    >
      {icon} {label}
      {count !== undefined && (
        <span
          className={`ml-2 px-2.5 py-0.5 rounded-full text-[9px] ${active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ expiresAt, role }: any) {
  if (role === "AFILIADO")
    return (
      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase italic border border-purple-100">
        Parceiro
      </span>
    );
  if (role === "VISITANTE")
    return (
      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase italic border border-blue-100">
        Lead
      </span>
    );
  const diff = expiresAt
    ? (new Date(expiresAt).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    : null;
  if (diff === null)
    return (
      <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase italic">
        Vitalício
      </span>
    );
  if (diff < 0)
    return (
      <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase italic border border-rose-100">
        Vencido
      </span>
    );
  return (
    <span
      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic border ${diff < 7 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
    >
      Ativo {Math.ceil(diff)}d
    </span>
  );
}

function HealthItem({ label, value, total, color }: any) {
  const percentage = Math.min((value / (total || 1)) * 100, 100);
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 italic">
        <span>{label}</span>
        <span className="text-white">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={3}
        className="py-20 text-center opacity-30 font-black uppercase tracking-[0.3em] text-[10px] italic"
      >
        {message}
      </td>
    </tr>
  );
}
