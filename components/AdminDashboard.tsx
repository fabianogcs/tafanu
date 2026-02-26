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
  Info,
  Link as LinkIcon,
  CreditCard,
  Edit3,
  Clock,
  History,
} from "lucide-react";

import {
  resolveReport,
  adminAddDaysToUser,
  adminAddExactDaysToUser,
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

  // --- CARREGAR PAGAMENTOS ---
  const loadPayouts = async () => {
    const res = await getAffiliatePayouts();
    if (res.payouts) setPayouts(res.payouts);
  };

  useEffect(() => {
    if (activeTab === "payouts") loadPayouts();
  }, [activeTab]);

  // --- O NOVO CÉREBRO DE PROCESSAMENTO DE DADOS ---
  const {
    allUsers,
    activeSubscribers,
    trialSubscribers,
    expiredSubscribers,
    visitors,
    partners,
    pendingReports,
    bannedUsers,
  } = useMemo(() => {
    const users = data.users.filter((u: any) => u.email !== ADMIN_EMAIL);
    const now = new Date();

    // Vencidos (No Limbo Nunca Mais)
    const expired = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" &&
        u.expiresAt &&
        new Date(u.expiresAt) < now &&
        !u.isBanned,
    );

    // Todos que estão com a assinatura rodando (maior que agora)
    const running = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" &&
        u.expiresAt &&
        new Date(u.expiresAt) >= now &&
        !u.isBanned,
    );

    // Separando quem tá "Em Teste" (menos de 7 dias) de quem tá "Ativo Full" (mais de 7 dias)
    const trials = running.filter((u: any) => {
      const diffDays =
        (new Date(u.expiresAt).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    const actives = running.filter((u: any) => {
      const diffDays =
        (new Date(u.expiresAt).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays > 7;
    });

    const leads = users.filter(
      (u: any) => u.role === "VISITANTE" && !u.isBanned,
    );
    const affs = users.filter((u: any) => u.role === "AFILIADO");
    const banned = users.filter((u: any) => u.isBanned);
    const reports = data.reports.filter((r: any) => r.status === "PENDING");

    return {
      allUsers: users,
      activeSubscribers: actives,
      trialSubscribers: trials,
      expiredSubscribers: expired,
      visitors: leads,
      partners: affs,
      bannedUsers: banned,
      pendingReports: reports,
    };
  }, [data]);

  // --- BUSCA GLOBAL MODO DEUS ---
  const filteredData = useMemo(() => {
    if (activeTab === "reports") return pendingReports;
    if (activeTab === "payouts") return payouts;

    // SE DIGITOU ALGO NA BUSCA: Ignora a aba e caça em todo o banco de dados
    if (searchTerm.trim().length > 0) {
      const searchLower = searchTerm.toLowerCase();
      return allUsers.filter(
        (u: any) =>
          (u.name?.toLowerCase() || "").includes(searchLower) ||
          (u.email?.toLowerCase() || "").includes(searchLower) ||
          (u.document || "").includes(searchLower),
      );
    }

    // SE A BUSCA TÁ VAZIA: Mostra a aba normal
    switch (activeTab) {
      case "subscribers":
        return activeSubscribers;
      case "trials":
        return trialSubscribers;
      case "expired":
        return expiredSubscribers;
      case "visitors":
        return visitors;
      case "partners":
        return partners;
      case "banned":
        return bannedUsers;
      default:
        return allUsers;
    }
  }, [
    activeTab,
    searchTerm,
    allUsers,
    activeSubscribers,
    trialSubscribers,
    expiredSubscribers,
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
        `BANIR ${name.toUpperCase()}? Isso cancela o pagamento no MP e bloqueia o CPF.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await banUserAction(userId);
      res.success ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
      setSelectedUser(null);
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      const res = await unbanUserAction(userId);
      res.success ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
      setSelectedUser(null);
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
        if (selectedUser)
          setSelectedUser({
            ...selectedUser,
            role: "AFILIADO",
            referralCode: referralCodeInput,
          });
      } else toast.error(res.error);
    });
  };

  // ⏱️ CONTROLE DE MESES (MODAL NÃO FECHA MAIS!)
  const handleAddMonths = (e: any, userId: string, months: number) => {
    e.stopPropagation();
    if (
      months < 0 &&
      !confirm("ATENÇÃO: Deseja realmente REMOVER 1 mês deste usuário?")
    )
      return;

    startTransition(async () => {
      await adminAddDaysToUser(userId, months);
      toast.success(months > 0 ? "+1 Mês adicionado!" : "-1 Mês removido!");
      router.refresh();

      // Atualiza a telinha ao vivo sem fechar!
      setSelectedUser((prev: any) => {
        if (!prev) return prev;
        const base =
          prev.expiresAt && new Date(prev.expiresAt) > new Date()
            ? new Date(prev.expiresAt)
            : new Date();
        const newDate = new Date(base);
        newDate.setMonth(newDate.getMonth() + months);
        return { ...prev, expiresAt: newDate, role: "ASSINANTE" };
      });
    });
  };

  // ⏱️ CONTROLE DE DIAS (1 DIA) (MODAL NÃO FECHA MAIS!)
  const handleAddExactDays = (e: any, userId: string, days: number) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await adminAddExactDaysToUser(userId, days);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();

        // Atualiza a telinha ao vivo sem fechar!
        setSelectedUser((prev: any) => {
          if (!prev) return prev;
          const base =
            prev.expiresAt && new Date(prev.expiresAt) > new Date()
              ? new Date(prev.expiresAt)
              : new Date();
          const newDate = new Date(base);
          newDate.setDate(newDate.getDate() + days);
          return { ...prev, expiresAt: newDate, role: "ASSINANTE" };
        });
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
        `Confirmar o envio do PIX de R$ ${valor.toFixed(2)} para ${name.toUpperCase()}?`,
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

  const getSelectedUserAffiliateData = () => {
    if (!selectedUser || selectedUser.role !== "AFILIADO") return null;
    return (
      payouts.find((p) => p.id === selectedUser.id) || {
        ativos: 0,
        taxa: 0,
        valorDevido: 0,
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
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
                placeholder="Busca Global (Qualquer e-mail/CPF)..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 shadow-inner font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (confirm("Iniciar faxina de imagens órfãs?"))
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
        {/* NAVEGAÇÃO SUPERIOR - AGORA COM ABAS PARA TESTES E VENCIDOS */}
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
            label="Ativos"
            icon={<CheckCircle2 size={16} />}
            count={activeSubscribers.length}
          />
          <TabButton
            active={activeTab === "trials"}
            onClick={() => setActiveTab("trials")}
            label="Em Teste"
            icon={<Clock size={16} />}
            count={trialSubscribers.length}
          />
          <TabButton
            active={activeTab === "expired"}
            onClick={() => setActiveTab("expired")}
            label="Vencidos"
            icon={<History size={16} />}
            count={expiredSubscribers.length}
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
            active={activeTab === "banned"}
            onClick={() => setActiveTab("banned")}
            label="Banidos"
            icon={<UserX size={16} />}
            count={bannedUsers.length}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* TABELA DE USUÁRIOS */}
          {activeTab !== "overview" &&
            activeTab !== "reports" &&
            activeTab !== "payouts" && (
              <div className="overflow-x-auto">
                {searchTerm && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 text-center text-xs font-black tracking-widest uppercase">
                    Resultados da Busca Global Ativados
                  </div>
                )}
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                      <th className="p-6 text-left">Membro</th>
                      <th className="p-6 text-left">Status da Conta</th>
                      <th className="p-6 text-right">Ações</th>
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
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                              >
                                <Info size={14} /> Raio-X
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <EmptyState message="Nenhum usuário listado nesta categoria/busca." />
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* OVERVIEW GERAL */}
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
                    label="Conversão (Total Pagantes)"
                    value={activeSubscribers.length + trialSubscribers.length}
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
                    label="Inadimplentes (Vencidos)"
                    value={expiredSubscribers.length}
                    total={allUsers.length}
                    color="bg-rose-400"
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

          {/* FINANCEIRO E OUTRAS ABAS INALTERADAS... */}
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
                        A Pagar
                      </p>
                      <p className="font-black text-emerald-600 text-2xl tracking-tighter">
                        R$ {p.valorDevido.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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

      {/* 🚀 O NOVO RAIO-X REFORÇADO COM CONTROLE DE TEMPO FIXO 🚀 */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl overflow-y-auto"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-slate-50 border-b flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div
                  className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-lg ${selectedUser.isBanned ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}
                >
                  {selectedUser.isBanned ? (
                    <UserX size={48} />
                  ) : (
                    <ShieldCheck size={48} />
                  )}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none mb-2">
                    {selectedUser.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 bg-white rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Mail size={12} /> {selectedUser.email}
                    </span>
                    <span className="px-3 py-1 bg-white rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <CreditCard size={12} /> CPF:{" "}
                      {selectedUser.document || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* O DE QUEM É ESSE ASSINANTE? (ORIGEM) */}
              <div className="bg-slate-100/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-500 rounded-xl">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Origem / Indicação
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedUser.referredBy ||
                      selectedUser.referralCode ||
                      "Orgânico (Veio Direto / Sem Afiliado)"}
                  </p>
                </div>
              </div>

              {/* CONTROLES DE TEMPO DINÂMICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">
                    Status da Conta
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge
                      expiresAt={selectedUser.expiresAt}
                      role={selectedUser.role}
                    />
                  </div>
                  {selectedUser.expiresAt && (
                    <p className="text-sm font-medium text-slate-500">
                      Vencimento Atual:{" "}
                      <span className="font-black text-lg text-slate-900 ml-2">
                        {new Date(selectedUser.expiresAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </p>
                  )}
                </div>

                {/* CONTROLE 1 DIA E 1 MES SEM FECHAR */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex flex-col justify-center gap-3 relative">
                  {isPending && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                      <Loader2 className="animate-spin text-emerald-500" />
                    </div>
                  )}

                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    Soma e Subtração de Tempo
                  </h3>

                  {!selectedUser.isBanned && selectedUser.role !== "ADMIN" ? (
                    <div className="flex flex-wrap gap-2">
                      <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-fit">
                        <button
                          onClick={(e) =>
                            handleAddMonths(e, selectedUser.id, -1)
                          }
                          className="px-4 py-3 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all border-r border-slate-100 font-bold text-xs"
                          title="Tirar 1 Mês"
                        >
                          - 1 Mês
                        </button>
                        <button
                          onClick={(e) =>
                            handleAddExactDays(e, selectedUser.id, -1)
                          }
                          className="px-4 py-3 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all border-r border-slate-100 font-bold text-xs"
                          title="Tirar 1 Dia"
                        >
                          - 1 Dia
                        </button>
                        <button
                          onClick={(e) =>
                            handleAddExactDays(e, selectedUser.id, 1)
                          }
                          className="px-4 py-3 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all border-r border-slate-100 font-bold text-xs"
                          title="Somar 1 Dia"
                        >
                          + 1 Dia
                        </button>
                        <button
                          onClick={(e) =>
                            handleAddMonths(e, selectedUser.id, 1)
                          }
                          className="px-4 py-3 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all font-bold text-xs"
                          title="Somar 1 Mês"
                        >
                          + 1 Mês
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-slate-400">
                      Tempo de admin/banido não pode ser mexido.
                    </p>
                  )}
                </div>
              </div>

              {/* LISTA DE ANÚNCIOS DO USUÁRIO */}
              <div>
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                  <LayoutGrid size={14} /> Anúncios Deste Usuário
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedUser.businesses?.map((biz: any) => (
                    <div
                      key={biz.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white transition-all shadow-sm gap-4"
                    >
                      <div>
                        <p className="font-black text-slate-900 italic uppercase text-lg">
                          {biz.name}
                        </p>
                        <a
                          href={`/site/${biz.slug}`}
                          target="_blank"
                          className="text-[10px] font-bold text-emerald-500 hover:underline"
                        >
                          tafanu.app/site/{biz.slug}
                        </a>
                      </div>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/editar/${biz.slug}?adminMode=true`,
                          )
                        }
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all shadow-md"
                      >
                        Editar Anúncio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AFILIADO AQUI MANTIDO NORMALMENTE */}
    </div>
  );
}

// --- SUBCOMPONENTES ---
function PlanPriceBadge({ price }: { price: number }) {
  return null;
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

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-slate-900 text-white shadow-xl scale-105" : "text-slate-400 hover:bg-slate-50"}`}
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
