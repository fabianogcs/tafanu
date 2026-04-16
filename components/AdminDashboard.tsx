"use client";

import {
  useState,
  useTransition,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  LayoutGrid,
  X,
  UserCheck,
  Eraser,
  Loader2,
  TrendingUp,
  Mail,
  Award,
  Star,
  Wallet,
  UserX,
  ShieldAlert,
  Gavel,
  Info,
  Link as LinkIcon,
  CreditCard,
  User,
  MessageSquare,
  Trash2,
  Link2,
  Store,
  Clock,
  Copy,
  Check,
  CalendarPlus,
  MessageCircle, // 🚀 NOVO: Ícone adicionado para o botão de WhatsApp
} from "lucide-react";

import {
  approveComment,
  resolveReport,
  adminAddDaysToBusiness, // 🚀 AJUSTE: Nova função apontando para o Negócio
  adminAddExactDaysToBusiness, // 🚀 AJUSTE: Nova função apontando para o Negócio
  runGarbageCollector,
  promoteToAffiliate,
  getAffiliatePayouts,
  markAffiliateAsPaid,
  banUserAction,
  unbanUserAction,
  deleteComment,
  assignUserToAffiliate,
  adminActivateVisitor,
} from "@/app/actions";

type AdminData = {
  users: any[];
  reports: any[];
  flaggedComments: any[];
  businessOwnerMap: Record<string, string>;
  metricas: {
    faturamentoBruto: number;
    faturamentoLiquido: number;
    totalComissoesDevidas: number;
    totalPagantes: number;
  };
};

export default function AdminDashboard({
  data,
  adminEmail,
}: {
  data: AdminData;
  adminEmail?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mainTab, setMainTab] = useState<
    "overview" | "users" | "affiliates" | "security"
  >("overview");
  const [subTab, setSubTab] = useState("subscribers");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [promotingUser, setPromotingUser] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [assignCodeInput, setAssignCodeInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ADMIN_EMAIL = adminEmail || "";

  const [baseUrl, setBaseUrl] = useState("https://tafanu.vercel.app");
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // ✅ Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadPayouts = useCallback(async () => {
    const res = await getAffiliatePayouts();
    if (res.payouts) setPayouts(res.payouts);
  }, []);

  useEffect(() => {
    if (mainTab === "affiliates" || mainTab === "overview") loadPayouts();
  }, [mainTab, loadPayouts]);

  // 🚀 AJUSTE: Segmentação de usuários adaptada para o esquema Multi-Assinaturas
  const segments = useMemo(() => {
    const agora = new Date();

    // 1. Calcula a data derivada (a loja que vai demorar mais para vencer)
    const usersWithDerivedDates = data.users
      .filter((u) => u.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase())
      .map((u) => {
        let maxDate: Date | null = null;
        if (u.businesses && u.businesses.length > 0) {
          u.businesses.forEach((b: any) => {
            if (b.expiresAt) {
              const d = new Date(b.expiresAt);
              if (!maxDate || d > maxDate) maxDate = d;
            }
          });
        }
        return { ...u, derivedExpiresAt: maxDate };
      });

    // 2. Filtra usando a nova derivedExpiresAt
    const active = usersWithDerivedDates.filter(
      (u) =>
        u.role === "ASSINANTE" &&
        u.derivedExpiresAt &&
        u.derivedExpiresAt > agora &&
        !u.isBanned &&
        (u.derivedExpiresAt.getTime() - agora.getTime()) / 86400000 > 7,
    );
    const expiring = usersWithDerivedDates.filter(
      (u) =>
        u.role === "ASSINANTE" &&
        u.derivedExpiresAt &&
        u.derivedExpiresAt > agora &&
        !u.isBanned &&
        (u.derivedExpiresAt.getTime() - agora.getTime()) / 86400000 <= 7,
    );
    const expired = usersWithDerivedDates.filter(
      (u) =>
        u.role === "ASSINANTE" &&
        u.derivedExpiresAt &&
        u.derivedExpiresAt < agora &&
        !u.isBanned,
    );
    const visitors = usersWithDerivedDates.filter(
      (u) => u.role === "VISITANTE" && !u.isBanned,
    );
    const affiliates = usersWithDerivedDates.filter(
      (u) => u.role === "AFILIADO",
    );
    const banned = usersWithDerivedDates.filter((u) => u.isBanned);

    // ✅ Map para O(n) nos reports
    const businessMap = new Map(
      data.users.flatMap((u) =>
        u.businesses.map((b: any) => [b.id, { ...b, ownerName: u.name }]),
      ),
    );
    const pendingReports = data.reports
      .filter((r) => r.status === "PENDING")
      .map((r) => ({ ...r, businessDetail: businessMap.get(r.businessId) }));

    return {
      all: usersWithDerivedDates,
      active,
      expiring,
      expired,
      visitors,
      affiliates,
      banned,
      pendingReports,
    };
  }, [data.users, data.reports, ADMIN_EMAIL]);

  // ✅ filteredUsers com getSegmentList inline no useMemo
  const filteredUsers = useMemo(() => {
    const list = (() => {
      switch (subTab) {
        case "subscribers":
          return segments.active;
        case "expiring":
          return segments.expiring;
        case "expired":
          return segments.expired;
        case "visitors":
          return segments.visitors;
        case "affiliates":
          return segments.affiliates;
        case "banned":
          return segments.banned;
        default:
          return segments.all;
      }
    })();

    if (!debouncedSearch.trim()) return list;
    const q = debouncedSearch.toLowerCase();
    return segments.all.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.document || "").includes(q),
    );
  }, [debouncedSearch, subTab, segments]);

  const totalOwed = useMemo(
    () => payouts.reduce((acc, p) => acc + p.valorDevido, 0),
    [payouts],
  );

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const copyAffiliateLink = (code: string, id: string) => {
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- AÇÕES ---
  const handleBan = (userId: string, name: string) => {
    if (
      !confirm(
        `BANIR ${name.toUpperCase()}? Isso cancela o MP e bloqueia a conta.`,
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

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Apagar este comentário permanentemente?")) return;
    startTransition(async () => {
      const res = await deleteComment(commentId);
      res.success
        ? toast.success("Comentário removido!")
        : toast.error(res.error || "Erro");
      router.refresh();
    });
  };

  const handleApproveComment = (commentId: string) => {
    startTransition(async () => {
      const res = await approveComment(commentId);
      res.success
        ? toast.success("Comentário aprovado!")
        : toast.error(res.error || "Erro");
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

  const handlePromote = () => {
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

  const handleAssignAffiliate = () => {
    if (!assignCodeInput) return toast.error("Digite o código do parceiro!");
    startTransition(async () => {
      // 🚀 AJUSTE: Se o Admin colar o link inteiro, nós extraímos só a parte depois do "?ref="
      let cleanCode = assignCodeInput.trim();
      if (cleanCode.includes("?ref=")) {
        cleanCode = cleanCode.split("?ref=")[1].split("&")[0];
      }
      cleanCode = cleanCode.toUpperCase(); // Garante que vai em maiúsculo pro banco

      const res = await assignUserToAffiliate(selectedUser.id, cleanCode);
      if (res.success) {
        toast.success(res.message);
        setAssignCodeInput("");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  // 🚀 AJUSTE: Função agora espera businessId em vez de userId
  const handleAddTime = (
    e: React.MouseEvent,
    businessId: string,
    months: number,
  ) => {
    e.stopPropagation();
    if (months < 0 && !confirm("Remover tempo DESTA LOJA?")) return;
    startTransition(async () => {
      await adminAddDaysToBusiness(businessId, months);
      toast.success(
        months > 0 ? `+${months} mês adicionado na loja!` : `-1 mês removido!`,
      );
      router.refresh();
    });
  };

  // 🚀 AJUSTE: Função agora espera businessId em vez de userId
  const handleAddDays = (
    e: React.MouseEvent,
    businessId: string,
    days: number,
  ) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await adminAddExactDaysToBusiness(businessId, days);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res?.error || "Erro ao adicionar dias.");
    });
  };

  const handleActivateVisitor = (
    e: React.MouseEvent,
    userId: string,
    days: number,
  ) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await adminActivateVisitor(userId, days);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res?.error || "Erro ao ativar.");
    });
  };

  const handleConfirmPayment = (
    affiliateId: string,
    valor: number,
    name: string,
  ) => {
    if (
      !confirm(
        `Confirmar PIX de ${formatMoney(valor)} para ${name.toUpperCase()}?`,
      )
    )
      return;
    startTransition(async () => {
      const res = await markAffiliateAsPaid(affiliateId);
      if (res.success) {
        toast.success(res.message);
        setPayouts((prev) => prev.filter((p) => p.id !== affiliateId));
        router.refresh();
      } else toast.error(res.error);
    });
  };

  const handleGarbageCollection = () => {
    if (!confirm("Iniciar faxina de imagens órfãs?")) return;
    const promise = runGarbageCollector().then((res) => {
      if (res.error) throw new Error(res.error);
      return res.message;
    });
    toast.promise(promise, {
      loading: "Varrendo servidor...",
      success: (msg) => `${msg}`,
      error: (err) => err.message || "Erro na faxina.",
    });
  };

  const closeUser = () => {
    setSelectedUser(null);
    setAssignCodeInput("");
  };

  // Verifica se o usuário selecionado é afiliado
  const isAffiliate = selectedUser?.role === "AFILIADO";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Painel Admin
              </p>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Tafanu <span className="text-emerald-500">HQ</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, CPF ou Loja..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-emerald-500/20 text-sm font-medium border border-slate-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleGarbageCollection}
              className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
              title="Faxina de imagens"
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* TABS NÍVEL 1 */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-full md:w-fit max-w-full shadow-sm overflow-x-auto">
          {[
            {
              key: "overview",
              label: "Visão Geral",
              icon: <LayoutGrid size={15} />,
            },
            {
              key: "users",
              label: "Membros",
              icon: <Users size={15} />,
              count: segments.all.length - segments.affiliates.length, // 🚀 Aqui está a mágica: subtrai os afiliados do total
            },
            {
              key: "affiliates",
              label: "Parceiros",
              icon: <Star size={15} />,
              count: segments.affiliates.length,
            },
            {
              key: "security",
              label: "Segurança",
              icon: <ShieldAlert size={15} />,
              count:
                segments.pendingReports.length + data.flaggedComments.length,
              alert: true,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setMainTab(tab.key as any);
                setSubTab(
                  tab.key === "users"
                    ? "subscribers"
                    : tab.key === "affiliates"
                      ? "affiliates"
                      : tab.key === "security"
                        ? "reports"
                        : "overview",
                );
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${mainTab === tab.key ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] ${mainTab === tab.key ? (tab.alert ? "bg-rose-500" : "bg-emerald-500") : tab.alert ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TABS NÍVEL 2 */}
        {mainTab === "users" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full">
            {[
              {
                key: "subscribers",
                label: "Ativos",
                count: segments.active.length,
              },
              {
                key: "expiring",
                label: "Vencendo",
                count: segments.expiring.length,
                alert: true,
              },
              {
                key: "expired",
                label: "Vencidos",
                count: segments.expired.length,
              },
              {
                key: "visitors",
                label: "Leads",
                count: segments.visitors.length,
              },
              {
                key: "banned",
                label: "Banidos",
                count: segments.banned.length,
              },
            ].map((t) => (
              <SubTab
                key={t.key}
                active={subTab === t.key}
                onClick={() => setSubTab(t.key)}
                label={t.label}
                count={t.count}
                alert={t.alert}
              />
            ))}
          </div>
        )}

        {mainTab === "affiliates" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full">
            {[
              {
                key: "affiliates",
                label: "Parceiros",
                count: segments.affiliates.length,
              },
              {
                key: "payouts",
                label: "Fila de Pagamento",
                count: payouts.length,
              },
            ].map((t) => (
              <SubTab
                key={t.key}
                active={subTab === t.key}
                onClick={() => setSubTab(t.key)}
                label={t.label}
                count={t.count}
              />
            ))}
          </div>
        )}

        {mainTab === "security" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full">
            {[
              {
                key: "reports",
                label: "Denúncias",
                count: segments.pendingReports.length,
                alert: true,
              },
              {
                key: "comments",
                label: "Moderação",
                count: data.flaggedComments.length,
                alert: true,
              },
            ].map((t) => (
              <SubTab
                key={t.key}
                active={subTab === t.key}
                onClick={() => setSubTab(t.key)}
                label={t.label}
                count={t.count}
                alert={t.alert}
              />
            ))}
          </div>
        )}

        {/* CONTEÚDO */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* OVERVIEW */}
          {mainTab === "overview" && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Lucro Líquido"
                  value={formatMoney(data.metricas.faturamentoLiquido)}
                  icon={<TrendingUp size={18} />}
                  color="emerald"
                />
                <MetricCard
                  label="Faturamento Bruto"
                  value={formatMoney(data.metricas.faturamentoBruto)}
                  icon={<Wallet size={18} />}
                  color="blue"
                />
                <MetricCard
                  label="Comissões a Pagar"
                  value={formatMoney(data.metricas.totalComissoesDevidas)}
                  icon={<Clock size={18} />}
                  color="amber"
                />
                <MetricCard
                  label="Assinantes Ativos"
                  value={String(data.metricas.totalPagantes)}
                  icon={<Users size={18} />}
                  color="purple"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox
                  label="Vencendo (7d)"
                  value={segments.expiring.length}
                  color="amber"
                />
                <StatBox
                  label="Vencidos"
                  value={segments.expired.length}
                  color="rose"
                />
                <StatBox
                  label="Leads"
                  value={segments.visitors.length}
                  color="blue"
                />
                <StatBox
                  label="Parceiros"
                  value={segments.affiliates.length}
                  color="purple"
                />
              </div>
            </div>
          )}

          {/* TABELA DE USUÁRIOS */}
          {mainTab === "users" && (
            <div className="overflow-x-auto">
              {debouncedSearch && (
                <div className="bg-emerald-50 text-emerald-700 py-2 text-center text-[10px] font-black tracking-widest uppercase">
                  Busca global ativa — {filteredUsers.length} resultado(s)
                </div>
              )}
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-5 text-left">Membro</th>
                    <th className="p-5 text-left">Status</th>
                    <th className="p-5 text-left">Vencimento</th>
                    <th className="p-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${user.isBanned ? "bg-rose-50/30" : ""}`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${user.isBanned ? "bg-rose-100 text-rose-500" : "bg-slate-100 text-slate-500"}`}
                          >
                            {user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p
                              className={`font-black text-sm uppercase ${user.isBanned ? "text-rose-500 line-through" : "text-slate-800"}`}
                            >
                              {user.name || "Sem Nome"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <StatusBadge
                          role={user.role}
                          expiresAt={
                            user.derivedExpiresAt
                          } /* 🚀 AJUSTE: Lendo a data derivada */
                          isBanned={user.isBanned}
                        />
                      </td>
                      <td className="p-5">
                        <span className="text-[11px] font-bold text-slate-400">
                          {user.derivedExpiresAt /* 🚀 AJUSTE: Lendo a data derivada */
                            ? new Date(
                                user.derivedExpiresAt,
                              ).toLocaleDateString("pt-BR")
                            : "—"}
                        </span>
                      </td>
                      <td
                        className="p-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                            title="Desbanir"
                          >
                            <UserCheck size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase flex items-center gap-1.5"
                          >
                            <Info size={13} /> Raio-X
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-[11px] font-black uppercase text-slate-300 tracking-widest"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* PARCEIROS — CARDS */}
          {mainTab === "affiliates" && subTab === "affiliates" && (
            <div className="p-6">
              {segments.affiliates.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300">
                  <Star size={40} className="mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest">
                    Nenhum parceiro cadastrado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {segments.affiliates.map((u) => (
                    <div
                      key={u.id}
                      className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                    >
                      {/* Card header */}
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-sm border border-purple-500/30">
                              {u.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-black text-white text-sm uppercase leading-none">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-[9px] font-black uppercase border border-purple-500/30">
                            Parceiro
                          </span>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                              Indicações
                            </p>
                            <p className="text-xl font-black text-white">
                              {u.referralCount || 0}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                              Código
                            </p>
                            <code className="text-sm font-black text-emerald-400">
                              {u.referralCode || "—"}
                            </code>
                          </div>
                        </div>
                      </div>
                      {/* Card body */}
                      <div className="p-4 space-y-3">
                        {/* Link de afiliado */}
                        {u.referralCode && (
                          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2">
                            <p className="flex-1 text-[10px] font-mono text-slate-500 truncate px-1">
                              {baseUrl}/?ref={u.referralCode}
                            </p>
                            <button
                              onClick={() =>
                                copyAffiliateLink(u.referralCode, u.id)
                              }
                              className={`shrink-0 p-2 rounded-lg transition-all ${copiedId === u.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white"}`}
                              title="Copiar link"
                            >
                              {copiedId === u.id ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )}
                        {/* Ações */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <Info size={13} /> Detalhes
                          </button>
                          <button
                            onClick={() => handleBan(u.id, u.name)}
                            className="px-3 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-1.5"
                          >
                            <Gavel size={13} /> Banir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FILA DE PAGAMENTOS */}
          {mainTab === "affiliates" && subTab === "payouts" && (
            <div className="p-6 space-y-4">
              {payouts.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300">
                  <ShieldCheck size={40} className="mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest">
                    Nenhum pagamento pendente.
                  </p>
                </div>
              ) : (
                payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center">
                        <Wallet size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{p.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl border">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                          Vendas
                        </p>
                        <p className="font-black text-lg text-slate-700">
                          {p.ativos || "1+"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                          A Pagar
                        </p>
                        <p className="font-black text-xl text-emerald-600">
                          {formatMoney(p.valorDevido)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleConfirmPayment(p.id, p.valorDevido, p.name)
                      }
                      disabled={isPending}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      {isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}{" "}
                      Pagar PIX
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* DENÚNCIAS */}
          {mainTab === "security" && subTab === "reports" && (
            <div className="p-6 space-y-4">
              {segments.pendingReports.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300">
                  <ShieldCheck size={40} className="mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest">
                    Nenhuma denúncia pendente.
                  </p>
                </div>
              ) : (
                segments.pendingReports.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-black text-slate-800 uppercase text-sm">
                        {r.businessDetail?.name ||
                          r.business?.name ||
                          "Negócio desconhecido"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        <span className="font-bold">Motivo:</span> {r.reason}
                      </p>
                      {r.details && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {r.details}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-300 mt-1">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {r.business?.slug && (
                        <a
                          href={`/site/${r.business.slug}`}
                          target="_blank"
                          className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-slate-200 transition-all"
                        >
                          <ExternalLink size={13} /> Ver
                        </a>
                      )}
                      <button
                        onClick={() => handleResolveReport(r.id)}
                        disabled={isPending}
                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5 border border-emerald-100"
                      >
                        <CheckCircle2 size={13} /> Resolver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MODERAÇÃO */}
          {mainTab === "security" && subTab === "comments" && (
            <div className="p-6 space-y-4">
              {data.flaggedComments.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300">
                  <ShieldCheck size={40} className="mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest">
                    Nenhum comentário denunciado.
                  </p>
                </div>
              ) : (
                data.flaggedComments.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white transition-all"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          "{c.content}"
                        </p>
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            Por: {c.user?.name || "Anônimo"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">
                            •
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Em: {c.business?.name}
                          </span>
                          {c.business?.slug && (
                            <a
                              href={`/site/${c.business.slug}`}
                              target="_blank"
                              className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink size={10} /> Ver loja
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveComment(c.id)}
                        disabled={isPending}
                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} /> Manter
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={isPending}
                        className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-1.5"
                      >
                        <Trash2 size={13} /> Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL RAIO-X — ASSINANTE */}
      {selectedUser && !isAffiliate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeUser}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-6 bg-slate-50 border-b flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${selectedUser.isBanned ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}
                >
                  {selectedUser.isBanned ? (
                    <UserX size={32} />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
                    {selectedUser.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Mail size={11} /> {selectedUser.email}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <CreditCard size={11} /> CPF:{" "}
                      {selectedUser.document || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeUser}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status e vencimento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Status (Melhor Loja)
                  </p>
                  <StatusBadge
                    role={selectedUser.role}
                    expiresAt={
                      selectedUser.derivedExpiresAt
                    } /* 🚀 AJUSTE: Lendo a data derivada */
                    isBanned={selectedUser.isBanned}
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Vencimento Distante
                  </p>
                  <p className="font-black text-slate-800">
                    {selectedUser.derivedExpiresAt /* 🚀 AJUSTE: Lendo a data derivada */
                      ? new Date(
                          selectedUser.derivedExpiresAt,
                        ).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* 🚀 CRM ADMIN: BOTÕES DE CONTATO (CLIENTE/LEAD) */}
              <div className="flex gap-2 w-full">
                <a
                  href={
                    selectedUser.phone
                      ? `https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Olá ${selectedUser.name?.split(" ")[0]}, aqui é do suporte Tafanu. Tudo bem?`,
                        )}`
                      : "#"
                  }
                  target="_blank"
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedUser.phone
                      ? "bg-[#25D366] text-white shadow-sm hover:bg-[#1ebd57]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!selectedUser.phone) {
                      e.preventDefault();
                      toast.error("Este membro não tem telefone cadastrado.");
                    }
                  }}
                >
                  <MessageCircle size={16} /> Contatar no WhatsApp
                </a>
                <a
                  href={`mailto:${selectedUser.email}?subject=Contato%20Suporte%20Tafanu`}
                  className="w-14 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                  title="Enviar E-mail"
                >
                  <Mail size={16} />
                </a>
              </div>

              {/* Origem e Vínculo de Parceiro */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Origem da Venda
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {/* 🚀 Mostra o nome do parceiro atual ou "Orgânico" */}
                    {selectedUser.affiliate?.name ? (
                      <span className="text-purple-600">
                        Indicado por: {selectedUser.affiliate.name}
                      </span>
                    ) : (
                      selectedUser.referredBy || "Orgânico"
                    )}
                  </p>
                </div>

                {/* 🚀 REMOVIDA A TRAVA: Agora o campo sempre aparece para permitir trocas */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder={
                      selectedUser.affiliateId
                        ? "Trocar parceiro..."
                        : "Código ou Link"
                    }
                    value={assignCodeInput}
                    onChange={(e) => setAssignCodeInput(e.target.value)} // 🚀 REMOVIDO o toUpperCase() para não quebrar o link colado
                    className="bg-transparent border-none outline-none text-xs font-bold px-2 w-32 md:w-40"
                  />
                  <button
                    onClick={handleAssignAffiliate}
                    disabled={isPending}
                    className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isPending ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Link2 size={11} />
                    )}
                    {selectedUser.affiliateId ? "Trocar" : "Vincular"}
                  </button>
                </div>
              </div>

              {/* 🚀 AJUSTE: Lojas com o Gerenciador de Tempo embutido */}
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Store size={13} /> Lojas e Assinaturas (
                  {selectedUser.businesses?.length || 0})
                </p>
                <div className="flex flex-col gap-3">
                  {selectedUser.businesses?.map((biz: any) => (
                    <div
                      key={biz.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase">
                            {biz.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">
                              Plano: {biz.planType || "Nenhum"}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${biz.expiresAt && new Date(biz.expiresAt) > new Date() ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                            >
                              Validade:{" "}
                              {biz.expiresAt
                                ? new Date(biz.expiresAt).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : "Sem data"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`/site/${biz.slug}`}
                            target="_blank"
                            className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> Ver
                          </a>
                          <a
                            href={`/dashboard/editar/${biz.slug}`}
                            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all"
                          >
                            Editar
                          </a>
                        </div>
                      </div>

                      {/* Botões de controle de tempo isolados para esta loja */}
                      {!selectedUser.isBanned &&
                        (selectedUser.role === "ASSINANTE" ||
                          selectedUser.role === "VISITANTE") && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <CalendarPlus
                              size={14}
                              className="text-slate-400 mr-2"
                            />
                            <button
                              onClick={(e) => handleAddTime(e, biz.id, -1)}
                              disabled={isPending}
                              className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"
                            >
                              −1 mês
                            </button>
                            <button
                              onClick={(e) => handleAddDays(e, biz.id, -1)}
                              disabled={isPending}
                              className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"
                            >
                              −1 dia
                            </button>
                            <button
                              onClick={(e) => handleAddDays(e, biz.id, 1)}
                              disabled={isPending}
                              className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                            >
                              +1 dia
                            </button>
                            <button
                              onClick={(e) => handleAddTime(e, biz.id, 1)}
                              disabled={isPending}
                              className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                            >
                              +1 mês
                            </button>
                            <button
                              onClick={(e) => handleAddTime(e, biz.id, 3)}
                              disabled={isPending}
                              className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                            >
                              +3 meses
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
                  {(!selectedUser.businesses ||
                    selectedUser.businesses.length === 0) && (
                    <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center bg-slate-50/50">
                      <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest">
                        Este membro ainda não tem vitrine.
                      </p>

                      {/* 🚀 Botões blindados: só aparecem para Visitantes e Assinantes sem loja */}
                      {!selectedUser.isBanned &&
                        (selectedUser.role === "ASSINANTE" ||
                          selectedUser.role === "VISITANTE") && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) =>
                                handleActivateVisitor(e, selectedUser.id, 1)
                              }
                              disabled={isPending}
                              className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white shadow-sm"
                            >
                              Ativar + 1 dia
                            </button>
                            <button
                              onClick={(e) =>
                                handleActivateVisitor(e, selectedUser.id, 30)
                              }
                              disabled={isPending}
                              className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white shadow-sm"
                            >
                              Ativar + 30 dias
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ação de banir e promover parceiro */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setPromotingUser(selectedUser)}
                  className="flex-1 px-3 py-3 bg-amber-50 text-amber-600 rounded-xl text-[11px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all border border-amber-100 flex items-center justify-center gap-1.5"
                >
                  <Award size={13} /> Promover a Parceiro
                </button>
                <button
                  onClick={() => handleBan(selectedUser.id, selectedUser.name)}
                  className="flex-1 px-3 py-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1.5"
                >
                  <Gavel size={13} /> Banir Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RAIO-X — AFILIADO */}
      {selectedUser && isAffiliate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeUser}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header afiliado */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shadow-lg border border-purple-500/30">
                  <Star size={32} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    Parceiro Oficial
                  </span>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-1">
                    {selectedUser.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Mail size={11} /> {selectedUser.email}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <CreditCard size={11} /> CPF:{" "}
                      {selectedUser.document || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeUser}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Stats do parceiro */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Total de Indicações
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {selectedUser.referralCount || 0}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Código
                  </p>
                  <code className="text-xl font-black text-emerald-600">
                    {selectedUser.referralCode || "—"}
                  </code>
                </div>
              </div>

              {/* 🚀 CRM ADMIN: BOTÕES DE CONTATO (PARCEIRO) */}
              <div className="flex gap-2 w-full">
                <a
                  href={
                    selectedUser.phone
                      ? `https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Olá ${selectedUser.name?.split(" ")[0]}, aqui é do Tafanu HQ. Como estão as suas vendas de afiliado?`,
                        )}`
                      : "#"
                  }
                  target="_blank"
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedUser.phone
                      ? "bg-[#25D366] text-white shadow-sm hover:bg-[#1ebd57]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!selectedUser.phone) {
                      e.preventDefault();
                      toast.error("Este parceiro não tem telefone cadastrado.");
                    }
                  }}
                >
                  <MessageCircle size={16} /> Suporte ao Parceiro
                </a>
                <a
                  href={`mailto:${selectedUser.email}?subject=Parceria%20Tafanu`}
                  className="w-14 shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-100 shadow-sm"
                  title="Enviar E-mail"
                >
                  <Mail size={16} />
                </a>
              </div>

              {/* Link de afiliado */}
              {selectedUser.referralCode && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3">
                    Link de Indicação
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2.5">
                    <p className="flex-1 text-[11px] font-mono text-slate-600 truncate">
                      {baseUrl}/?ref={selectedUser.referralCode}
                    </p>
                    <button
                      onClick={() =>
                        copyAffiliateLink(
                          selectedUser.referralCode,
                          selectedUser.id,
                        )
                      }
                      className={`shrink-0 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${copiedId === selectedUser.id ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-emerald-500"}`}
                    >
                      {copiedId === selectedUser.id ? (
                        <>
                          <Check size={13} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Lojas do afiliado */}
              {selectedUser.businesses?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                    <Store size={13} /> Lojas ({selectedUser.businesses.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedUser.businesses.map((biz: any) => (
                      <div
                        key={biz.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase">
                            {biz.name}
                          </p>
                          <a
                            href={`/site/${biz.slug}`}
                            target="_blank"
                            className="text-[10px] text-emerald-500 font-bold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink size={10} /> /site/{biz.slug}
                          </a>
                        </div>
                        <a
                          href={`/dashboard/editar/${biz.slug}`}
                          className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all"
                        >
                          Editar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ação de banir */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleBan(selectedUser.id, selectedUser.name)}
                  className="w-full px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-2"
                >
                  <Gavel size={14} /> Banir Parceiro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROMOVER PARCEIRO */}
      {promotingUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setPromotingUser(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Award size={36} />
              </div>
              <h2 className="text-xl font-black uppercase italic">
                Novo Parceiro
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Código para {promotingUser.name?.split(" ")[0]}
              </p>
            </div>
            <input
              type="text"
              placeholder="EX: JOAO-SP"
              className="w-full px-4 py-4 bg-slate-50 rounded-xl font-black uppercase outline-none focus:ring-2 ring-amber-500/20 text-center tracking-widest mb-4"
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
                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handlePromote}
                disabled={isPending}
                className="flex-[2] py-3 bg-amber-500 text-white rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 shadow-lg"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Ativar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return (
    <div className={`p-5 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3 opacity-70">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    amber: "text-amber-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
      <p className={`text-2xl font-black ${colors[color]}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function SubTab({
  active,
  onClick,
  label,
  count,
  alert,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  alert?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border ${active ? (alert ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700") : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] ${active ? (alert ? "bg-rose-200" : "bg-emerald-200") : "bg-slate-100"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StatusBadge({
  role,
  expiresAt,
  isBanned,
}: {
  role: string;
  expiresAt?: string | Date | null;
  isBanned?: boolean;
}) {
  if (isBanned)
    return (
      <span className="px-2.5 py-1 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase">
        Banido
      </span>
    );
  if (role === "ADMIN")
    return (
      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase">
        Admin
      </span>
    );
  if (role === "AFILIADO")
    return (
      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase border border-purple-200">
        Parceiro
      </span>
    );
  if (role === "VISITANTE")
    return (
      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase border border-blue-100">
        Lead
      </span>
    );
  if (!expiresAt)
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase">
        Sem data
      </span>
    );
  const diff = (new Date(expiresAt).getTime() - Date.now()) / 86400000;
  if (diff < 0)
    return (
      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase border border-rose-100">
        Vencido
      </span>
    );
  if (diff <= 7)
    return (
      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100">
        Vence em {Math.ceil(diff)}d
      </span>
    );
  return (
    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">
      Ativo {Math.ceil(diff)}d
    </span>
  );
}
