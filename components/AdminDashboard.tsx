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
  Clock,
  History,
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
  AlertTriangle,
  User, // ⬅️ Ícone do Usuário para o card de denúncias
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

  // --- NOVO SISTEMA DE ABAS (ORGANIZADO) ---
  const [mainCategory, setMainCategory] = useState("overview");
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

  // --- PROCESSAMENTO DE DADOS ---
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

    const expired = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" &&
        u.expiresAt &&
        new Date(u.expiresAt) < now &&
        !u.isBanned,
    );
    const running = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" &&
        u.expiresAt &&
        new Date(u.expiresAt) >= now &&
        !u.isBanned,
    );

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

    // 🕵️‍♂️ MÁGICA AQUI: Cruzando os dados da denúncia com o dono do anúncio!
    const reports = data.reports
      .filter((r: any) => r.status === "PENDING")
      .map((report: any) => {
        let foundBusiness = null;
        let foundOwner = null;

        // Procura em todos os usuários quem é o dono desse businessId
        for (const u of data.users) {
          if (u.businesses) {
            const biz = u.businesses.find(
              (b: any) => b.id === report.businessId,
            );
            if (biz) {
              foundBusiness = biz;
              foundOwner = u;
              break;
            }
          }
        }

        return {
          ...report,
          business: foundBusiness,
          owner: foundOwner,
        };
      });

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

  // --- BUSCA GLOBAL ---
  const filteredData = useMemo(() => {
    if (activeTab === "reports") return pendingReports;
    if (activeTab === "payouts") return payouts;

    if (searchTerm.trim().length > 0) {
      const searchLower = searchTerm.toLowerCase();
      return allUsers.filter(
        (u: any) =>
          (u.name?.toLowerCase() || "").includes(searchLower) ||
          (u.email?.toLowerCase() || "").includes(searchLower) ||
          (u.document || "").includes(searchLower),
      );
    }

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
        ? toast.success("Caso encerrado com sucesso!")
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

  const handleAddExactDays = (e: any, userId: string, days: number) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await adminAddExactDaysToUser(userId, days);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();
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
      } else toast.error(res.error);
    });
  };

  const handleGarbageCollection = () => {
    if (
      !confirm(
        "Iniciar faxina de imagens órfãs? O servidor fará uma varredura.",
      )
    )
      return;

    const promise = runGarbageCollector().then((res) => {
      if (res.error) throw new Error(res.error);
      return res.message;
    });

    toast.promise(promise, {
      loading: "Analisando servidor... isso pode levar alguns segundos.",
      success: (msg) => `${msg}`,
      error: (err) => err.message || "Erro ao rodar faxina.",
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

  const allBusinesses = useMemo(() => {
    return allUsers
      .flatMap((u: any) => u.businesses)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [allUsers]);

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
                Painel Administrativo
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
                placeholder="Busca Global (E-mail/CPF)..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 shadow-inner font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleGarbageCollection}
              className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
              title="Limpar Imagens Inúteis (Garbage Collector)"
            >
              <Eraser />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* --- MENU NÍVEL 1: CATEGORIAS PRINCIPAIS --- */}
        <div className="flex p-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 w-fit overflow-x-auto max-w-full no-scrollbar">
          <TabButton
            active={mainCategory === "overview"}
            onClick={() => {
              setMainCategory("overview");
              setActiveTab("overview");
            }}
            label="Visão Geral"
            icon={<LayoutGrid size={16} />}
          />
          <TabButton
            active={mainCategory === "users"}
            onClick={() => {
              setMainCategory("users");
              setActiveTab("subscribers");
            }}
            label="Membros"
            icon={<Users size={16} />}
          />
          <TabButton
            active={mainCategory === "affiliates"}
            onClick={() => {
              setMainCategory("affiliates");
              setActiveTab("partners");
            }}
            label="Parceiros"
            icon={<Star size={16} />}
          />
          <TabButton
            active={mainCategory === "security"}
            onClick={() => {
              setMainCategory("security");
              setActiveTab("reports");
            }}
            label="Segurança"
            icon={<ShieldAlert size={16} />}
            count={
              pendingReports.length > 0 ? pendingReports.length : undefined
            }
            alertMode={pendingReports.length > 0}
          />
        </div>

        {/* --- MENU NÍVEL 2: SUB-ABAS --- */}
        {mainCategory === "users" && (
          <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar animate-in fade-in duration-300">
            <SubTabButton
              active={activeTab === "subscribers"}
              onClick={() => setActiveTab("subscribers")}
              label="Ativos"
              count={activeSubscribers.length}
            />
            <SubTabButton
              active={activeTab === "trials"}
              onClick={() => setActiveTab("trials")}
              label="Vencendo"
              count={trialSubscribers.length}
            />
            <SubTabButton
              active={activeTab === "expired"}
              onClick={() => setActiveTab("expired")}
              label="Vencidos"
              count={expiredSubscribers.length}
            />
            <SubTabButton
              active={activeTab === "visitors"}
              onClick={() => setActiveTab("visitors")}
              label="Leads"
              count={visitors.length}
            />
          </div>
        )}

        {mainCategory === "affiliates" && (
          <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar animate-in fade-in duration-300">
            <SubTabButton
              active={activeTab === "partners"}
              onClick={() => setActiveTab("partners")}
              label="Ver Parceiros"
              count={partners.length}
            />
            <SubTabButton
              active={activeTab === "payouts"}
              onClick={() => setActiveTab("payouts")}
              label="Fila de Pagamentos"
              count={payouts.length}
            />
          </div>
        )}

        {mainCategory === "security" && (
          <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar animate-in fade-in duration-300">
            <SubTabButton
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              label="Denúncias"
              count={pendingReports.length}
              alertMode
            />
            <SubTabButton
              active={activeTab === "banned"}
              onClick={() => setActiveTab("banned")}
              label="Lista Negra (Banidos)"
              count={bannedUsers.length}
            />
          </div>
        )}

        {/* --- ÁREA DE CONTEÚDO --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* TABELA PADRÃO */}
          {activeTab !== "overview" &&
            activeTab !== "reports" &&
            activeTab !== "payouts" && (
              <div className="overflow-x-auto animate-in fade-in duration-500">
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
                      <EmptyState message="Nenhum registro encontrado nesta categoria." />
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-black uppercase italic text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Últimos Negócios
                  Criados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allBusinesses.length === 0 ? (
                    <EmptyCardState message="Nenhum negócio criado ainda." />
                  ) : (
                    allBusinesses.slice(0, 8).map((biz: any) => (
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
                    ))
                  )}
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

          {/* DENÚNCIAS (REPORTS) - AGORA COM O RAIO-X DO CULPADO! */}
          {activeTab === "reports" && (
            <div className="p-8 space-y-4 animate-in fade-in duration-500">
              {pendingReports.length === 0 ? (
                <EmptyCardState message="Tudo limpo! Nenhuma denúncia pendente." />
              ) : (
                pendingReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="p-6 bg-rose-50 border border-rose-200 rounded-[2rem] flex flex-col justify-between gap-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                          <AlertTriangle size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-rose-900 uppercase italic">
                            {report.reason}
                          </h4>
                          <p className="text-sm font-medium text-rose-700 mt-1">
                            {report.details ||
                              "Nenhum detalhe adicional fornecido."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start shrink-0">
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          disabled={isPending}
                          className="px-6 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                        >
                          {isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Encerrar Caso
                        </button>
                      </div>
                    </div>

                    {/* DADOS DO ALVO DA DENÚNCIA */}
                    {report.business && report.owner ? (
                      <div className="mt-2 pt-4 border-t border-rose-200/60 flex flex-col sm:flex-row gap-6 justify-between">
                        <div>
                          <p className="text-[10px] font-black text-rose-800/60 uppercase tracking-widest">
                            Alvo da Denúncia:
                          </p>
                          <a
                            href={`/site/${report.business.slug}`}
                            target="_blank"
                            className="text-sm font-black italic text-rose-700 hover:text-rose-900 flex items-center gap-1 underline decoration-rose-300 underline-offset-4 mt-1"
                          >
                            {report.business.name} <ExternalLink size={14} />
                          </a>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-rose-800/60 uppercase tracking-widest">
                            Criador do Anúncio:
                          </p>
                          <button
                            onClick={() => setSelectedUser(report.owner)}
                            className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white flex items-center gap-2 mt-1 bg-white/50 px-4 py-2 rounded-xl border border-rose-200 shadow-sm transition-all"
                          >
                            <User size={14} /> {report.owner.name}{" "}
                            <span className="text-[10px] font-normal opacity-50">
                              ({report.owner.email})
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 pt-4 border-t border-rose-200/60">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                          ID do Local: {report.businessId} (Este anúncio já foi
                          excluído do sistema)
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAGAMENTOS (PAYOUTS) */}
          {activeTab === "payouts" && (
            <div className="p-8 space-y-4 animate-in fade-in duration-500">
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
                <EmptyCardState message="Nenhum parceiro atingiu a meta de pagamento." />
              )}
            </div>
          )}
        </div>
      </main>

      {/* RAIO-X DO USUÁRIO */}
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
                    <>
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.role !== "AFILIADO" && (
                          <button
                            onClick={() => setPromotingUser(selectedUser)}
                            className="px-4 py-2 bg-amber-100 text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                          >
                            <Award size={14} /> Tornar Parceiro
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleBan(selectedUser.id, selectedUser.name)
                          }
                          className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-rose-600 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Gavel size={14} /> Banir CPF
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs font-bold text-slate-400">
                      Tempo de admin/banido não pode ser mexido.
                    </p>
                  )}
                </div>
              </div>

              {selectedUser.role === "AFILIADO" && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem]">
                  <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Wallet size={14} /> Raio-X do Parceiro
                  </h3>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                        Código / Link
                      </p>
                      <p className="font-black text-emerald-900 flex items-center gap-2 bg-white px-3 py-1 rounded-lg mt-1 border border-emerald-100">
                        {selectedUser.referralCode}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `tafanu.app/?ref=${selectedUser.referralCode}`,
                            );
                            toast.success("Link copiado!");
                          }}
                          className="text-emerald-500 hover:text-emerald-700"
                        >
                          <LinkIcon size={14} />
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                        Vendas Ativas
                      </p>
                      <p className="font-black text-2xl text-emerald-900">
                        {getSelectedUserAffiliateData()?.ativos}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                        A Receber
                      </p>
                      <p className="font-black text-2xl text-emerald-600">
                        R${" "}
                        {getSelectedUserAffiliateData()?.valorDevido.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

      {/* MODAL NOVO AFILIADO */}
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

// --- SUBCOMPONENTES ---

function TabButton({ active, onClick, label, icon, count, alertMode }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-6 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-slate-900 text-white shadow-xl scale-105" : "text-slate-400 hover:bg-slate-50"}`}
    >
      {icon} {label}
      {count !== undefined && (
        <span
          className={`ml-2 px-2.5 py-0.5 rounded-full text-[9px] ${active ? (alertMode ? "bg-rose-500 text-white" : "bg-emerald-500 text-white") : alertMode ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SubTabButton({ active, onClick, label, count, alertMode }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border ${
        active
          ? alertMode
            ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
            : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
          : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] ${active ? (alertMode ? "bg-rose-200" : "bg-emerald-200") : "bg-slate-100"}`}
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
        className="py-20 text-center opacity-40 font-black uppercase tracking-[0.3em] text-[10px] italic"
      >
        {message}
      </td>
    </tr>
  );
}

function EmptyCardState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center opacity-40 font-black uppercase tracking-[0.3em] text-[10px] italic w-full">
      {message}
    </div>
  );
}
