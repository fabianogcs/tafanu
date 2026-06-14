"use client";

import {
  useState,
  useTransition,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import AdminModals from "./AdminModals";
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
  MessageCircle,
  KeyRound,
  Zap,
  Eye,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
} from "lucide-react";

import {
  approveComment,
  resolveReport,
  adminAddDaysToBusiness,
  adminAddExactDaysToBusiness,
  runGarbageCollector,
  promoteToAffiliate,
  getAffiliatePayouts,
  markAffiliateAsPaid,
  banUserAction,
  unbanUserAction,
  deleteComment,
  assignUserToAffiliate,
  adminActivateVisitor,
  forceResetPasswordAdmin,
  transferBusinessToUser,
} from "@/app/actions";

type AdminData = {
  users: any[];
  reports: any[];
  flaggedComments: any[];
  historicoSaques: any[]; // 🚀 ADICIONADO
  businessOwnerMap: Record<string, string>;
  metricas: {
    mrrBruto: number; // 🚀 NOME ATUALIZADO
    mrrLiquido: number; // 🚀 NOME ATUALIZADO
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
  const searchParams = useSearchParams(); // 🚀 NOVO
  const [isPending, startTransition] = useTransition();
  const [mainTab, setMainTab] = useState<
    "overview" | "users" | "affiliates" | "security"
  >("overview");
  const [subTab, setSubTab] = useState("subscribers");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [promotingUser, setPromotingUser] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [assignCodeInput, setAssignCodeInput] = useState("");
  const [transferSlugInput, setTransferSlugInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ADMIN_EMAIL = adminEmail || "";

  // 🚀 LÓGICA DE FILTRO UNIFICADA (Limpa e Direta)
  const [metricSort, setMetricSort] = useState<
    "views" | "leads" | "favs" | "login" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const [baseUrl, setBaseUrl] = useState("https://tafanu.com.br");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);

      // 🚀 A CONEXÃO COM O SERVIDOR: Atualiza a URL invisivelmente!
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.length > 2) {
        params.set("q", searchTerm); // Se digitou mais de 2 letras, avisa o servidor
      } else {
        params.delete("q"); // Se apagou, volta para os 1000 recentes
      }

      // O "{ scroll: false }" garante que a tela não pisque nem role pra cima
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    }, 500); // 500ms para dar tempo de você terminar de digitar

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, router]);

  const loadPayouts = useCallback(async () => {
    const res = await getAffiliatePayouts();
    if (res.payouts) setPayouts(res.payouts);
  }, []);

  useEffect(() => {
    if (mainTab === "affiliates" || mainTab === "overview") loadPayouts();
  }, [mainTab, loadPayouts]);

  const segments = useMemo(() => {
    const agora = new Date();

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

    let result = [...list];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          (u.document || "").includes(q),
      );
    }

    // 🚀 O MOTOR INTELIGENTE: Pega o que você clicou e a setinha!
    const dir = sortDirection === "desc" ? 1 : -1;

    if (metricSort === "views") {
      result.sort((a, b) => ((b.totalViews || 0) - (a.totalViews || 0)) * dir);
    } else if (metricSort === "leads") {
      result.sort((a, b) => ((b.totalLeads || 0) - (a.totalLeads || 0)) * dir);
    } else if (metricSort === "favs") {
      result.sort((a, b) => ((b.totalFavs || 0) - (a.totalFavs || 0)) * dir);
    } else if (metricSort === "login") {
      result.sort((a, b) => {
        const timeA = new Date(a.lastLogin || 0).getTime();
        const timeB = new Date(b.lastLogin || 0).getTime();
        return (timeB - timeA) * dir; // "desc" = recentes primeiro, "asc" = antigos primeiro
      });
    }

    return result;
  }, [debouncedSearch, subTab, segments, metricSort, sortDirection]);

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

  const handleResetPassword = (userId: string, name: string) => {
    if (
      !confirm(
        `Redefinir a senha de ${name.toUpperCase()}? Uma nova senha segura e aleatória será gerada.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await forceResetPasswordAdmin(userId);
      res.success ? toast.success(res.message) : toast.error(res.error);
    });
  };

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
      let cleanCode = assignCodeInput.trim();
      if (cleanCode.includes("?ref=")) {
        cleanCode = cleanCode.split("?ref=")[1].split("&")[0];
      }
      cleanCode = cleanCode.toUpperCase();

      const res = await assignUserToAffiliate(selectedUser.id, cleanCode);
      if (res.success) {
        toast.success(res.message);
        setAssignCodeInput("");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  const handleTransferBusiness = () => {
    if (!transferSlugInput)
      return toast.error("Digite o link ou o slug da vitrine pronta!");

    startTransition(async () => {
      let cleanSlug = transferSlugInput.trim();
      if (cleanSlug.includes("/site/")) {
        cleanSlug = cleanSlug
          .split("/site/")[1]
          .split("?")[0]
          .replace(/\/$/, "");
      }

      const res = await transferBusinessToUser(cleanSlug, selectedUser.id);
      if (res.success) {
        toast.success(res.message);
        setTransferSlugInput("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

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

  const isAffiliate = selectedUser?.role === "AFILIADO";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* 1. HEADER GLOBAL */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100"
              title="Voltar ao Painel Normal"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="p-3 bg-slate-900 rounded-2xl text-emerald-400 shadow-md">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Central de Comando
              </p>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                Tafanu <span className="text-emerald-500">HQ</span>
              </h1>
            </div>
          </div>
          <button
            onClick={handleGarbageCollection}
            className="px-5 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            title="Apagar imagens órfãs do servidor"
          >
            <Eraser size={16} /> Faxina de Imagens
          </button>
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
              count: segments.all.length - segments.affiliates.length,
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

        {/* TABS NÍVEL 2 - USERS */}
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

        {/* TABS NÍVEL 2 - AFFILIATES */}
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
              {
                key: "history", // 🚀 NOVA ABA
                label: "Histórico de Saques",
                count: data.historicoSaques?.length || 0,
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

        {/* TABS NÍVEL 2 - SECURITY */}
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

        {/* CONTEÚDO PRINCIPAL */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* OVERVIEW */}
          {mainTab === "overview" && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="MRR Líquido"
                  value={formatMoney(data.metricas.mrrLiquido)}
                  icon={<TrendingUp size={18} />}
                  color="emerald"
                />
                <MetricCard
                  label="MRR Bruto"
                  value={formatMoney(data.metricas.mrrBruto)}
                  icon={<Wallet size={18} />}
                  color="blue"
                />
                <MetricCard
                  label="Comissões P/ Pagar"
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

          {/* MEMBROS E CRM */}
          {mainTab === "users" && (
            <div className="flex flex-col bg-slate-50/30">
              {/* ACTION BAR */}
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white">
                <div className="relative w-full lg:w-[400px]">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar nome, e-mail, documento..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 text-sm font-bold text-slate-800 border border-slate-200 transition-all placeholder:font-medium placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {debouncedSearch && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md uppercase">
                      {filteredUsers.length} achados
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest mr-2 shrink-0">
                    Ranking:
                  </span>

                  {/* 🚀 BOTÕES DE FILTRO UNIFICADOS */}
                  <button
                    onClick={() =>
                      setMetricSort(metricSort === "views" ? null : "views")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm ${metricSort === "views" ? "bg-slate-900 text-emerald-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Eye
                      size={14}
                      className={
                        metricSort === "views"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    />{" "}
                    Visitas
                  </button>

                  <button
                    onClick={() =>
                      setMetricSort(metricSort === "leads" ? null : "leads")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm ${metricSort === "leads" ? "bg-slate-900 text-emerald-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    <MessageCircle
                      size={14}
                      className={
                        metricSort === "leads"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    />{" "}
                    Leads
                  </button>

                  <button
                    onClick={() =>
                      setMetricSort(metricSort === "favs" ? null : "favs")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm ${metricSort === "favs" ? "bg-slate-900 text-amber-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Star
                      size={14}
                      className={
                        metricSort === "favs"
                          ? "text-amber-400"
                          : "text-slate-400"
                      }
                    />{" "}
                    Fãs
                  </button>

                  <div className="w-px h-6 bg-slate-200 mx-1 shrink-0 hidden md:block" />

                  <button
                    onClick={() =>
                      setMetricSort(metricSort === "login" ? null : "login")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm ${metricSort === "login" ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Clock size={14} /> Acessos
                  </button>

                  {/* 🚀 BOTÃO UNIVERSAL DE INVERTER ORDEM */}
                  {metricSort && (
                    <button
                      onClick={() =>
                        setSortDirection((prev) =>
                          prev === "desc" ? "asc" : "desc",
                        )
                      }
                      className="px-3 py-3 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm bg-slate-900 text-white hover:bg-slate-800 ml-1"
                      title="Inverter Ordem"
                    >
                      {sortDirection === "desc" ? (
                        <ArrowDown size={14} className="text-emerald-400" />
                      ) : (
                        <ArrowUp size={14} className="text-rose-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* TABELA DE MEMBROS */}
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[850px] bg-white">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="p-4 text-left">Membro</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-center">Desempenho</th>
                      <th className="p-4 text-right">Vencimento</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${user.isBanned ? "bg-rose-50/30" : ""}`}
                      >
                        <td className="p-4">
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
                              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge
                            role={user.role}
                            expiresAt={user.derivedExpiresAt}
                            isBanned={user.isBanned}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-4">
                            <div
                              className="flex items-center gap-1.5 text-[11px] font-black text-slate-600"
                              title="Visitas no perfil"
                            >
                              <Eye size={14} className="text-slate-400" />{" "}
                              {user.totalViews || 0}
                            </div>
                            <div
                              className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600"
                              title="Cliques no Whats/Tel"
                            >
                              <MessageCircle
                                size={14}
                                className="text-emerald-400"
                              />{" "}
                              {user.totalLeads || 0}
                            </div>
                            <div
                              className="flex items-center gap-1.5 text-[11px] font-black text-amber-500"
                              title="Favoritos"
                            >
                              <Star size={14} className="text-amber-400" />{" "}
                              {user.totalFavs || 0}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-[11px] font-bold text-slate-500">
                            {user.derivedExpiresAt
                              ? new Date(
                                  user.derivedExpiresAt,
                                ).toLocaleDateString("pt-BR")
                              : "—"}
                          </p>
                          {user.lastLogin && (
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                              Acesso:{" "}
                              {new Date(user.lastLogin).toLocaleDateString(
                                "pt-BR",
                              )}
                            </p>
                          )}
                        </td>
                        <td
                          className="p-4 text-right"
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
                              className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase flex items-center gap-1.5 ml-auto"
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
                          colSpan={5}
                          className="py-16 text-center text-[11px] font-black uppercase text-slate-300 tracking-widest"
                        >
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PARCEIROS */}
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
                      <div className="p-4 space-y-3">
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
                            >
                              {copiedId === u.id ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <Info size={13} /> Detalhes
                          </button>
                          <button
                            onClick={() => handleBan(u.id, u.name)}
                            className="px-3 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1.5"
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
{/* HISTÓRICO DE SAQUES GERAL (ADMIN) */}
          {mainTab === "affiliates" && subTab === "history" && (
            <div className="p-6 space-y-4">
              {!data.historicoSaques || data.historicoSaques.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300">
                  <Wallet size={40} className="mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest">Nenhum saque realizado ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="pb-4">Data</th>
                        <th className="pb-4">Parceiro</th>
                        <th className="pb-4">Valor Pago</th>
                        <th className="pb-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.historicoSaques.map((saque: any) => (
                        <tr key={saque.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-[11px] font-bold text-slate-500">
                            {new Date(saque.paidAt || saque.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4">
                            <p className="text-[12px] font-black uppercase text-slate-700">{saque.affiliate?.name || "Desconhecido"}</p>
                            <p className="text-[10px] font-medium text-slate-400">{saque.affiliate?.email}</p>
                          </td>
                          <td className="py-4 text-emerald-600 font-black">
                            {formatMoney(saque.amount)}
                          </td>
                          <td className="py-4 text-right">
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit ml-auto">
                              <CheckCircle2 size={12} /> Pago
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                        <span className="font-bold text-slate-700">Motivo:</span> {r.reason}
                      </p>
                      {r.details && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {r.details}
                        </p>
                      )}
                      
                      {/* 🚀 EXIBE QUEM FEZ A DENÚNCIA */}
                      {r.reporter ? (
                        <p className="text-[10px] text-amber-600 mt-2 font-bold bg-amber-50 inline-block px-2 py-1 rounded-md border border-amber-100">
                          🕵️‍♂️ Denunciado por: {r.reporter.name} ({r.reporter.email})
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-2">
                          👤 Denúncia anônima ou de usuário excluído
                        </p>
                      )}

                      <p className="text-[10px] text-slate-300 mt-1.5">
                        Em: {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {r.business?.slug && (
                        <a
                          href={`/site/${r.business.slug}`}
                          target="_blank"
                          className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-slate-200 transition-all"
                        >
                          <ExternalLink size={13} /> Ver Loja
                        </a>
                      )}
                      
                      {/* 🚀 BOTÃO DE BANIR O DENUNCIANTE FALSO (SPAM) */}
                      {r.reporter && (
                        <button
                          onClick={() => handleBan(r.reporter.id, r.reporter.name)}
                          disabled={isPending}
                          className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 border border-rose-100"
                          title="Banir o usuário que fez a denúncia"
                        >
                          <UserX size={13} /> Banir Autor
                        </button>
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

      {/* =============================================================== */}
      {/* 3. MODAIS (Extraídos para arquivo externo para limpeza) */}
      {/* =============================================================== */}
      <AdminModals
        selectedUser={selectedUser}
        closeUser={closeUser}
        isAffiliate={isAffiliate}
        baseUrl={baseUrl}
        copiedId={copiedId}
        copyAffiliateLink={copyAffiliateLink}
        assignCodeInput={assignCodeInput}
        setAssignCodeInput={setAssignCodeInput}
        handleAssignAffiliate={handleAssignAffiliate}
        transferSlugInput={transferSlugInput}
        setTransferSlugInput={setTransferSlugInput}
        handleTransferBusiness={handleTransferBusiness}
        isPending={isPending}
        handleAddTime={handleAddTime}
        handleAddDays={handleAddDays}
        handleActivateVisitor={handleActivateVisitor}
        handleResetPassword={handleResetPassword}
        setPromotingUser={setPromotingUser}
        handleBan={handleBan}
        promotingUser={promotingUser}
        referralCodeInput={referralCodeInput}
        setReferralCodeInput={setReferralCodeInput}
        handlePromote={handlePromote}
      />
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
