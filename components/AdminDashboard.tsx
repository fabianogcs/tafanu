"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Users,
  Store,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  LayoutGrid,
  CalendarDays,
  UserPlus,
  X,
  Eye,
  AlertTriangle,
  MinusCircle,
  UserCheck,
  Eraser,
  Loader2,
  Download,
  TrendingUp,
  DollarSign,
  Activity,
  Mail,
  PhoneCall,
  MessageCircle,
  Copy,
  Award,
  Star,
  Wallet,
  ArrowRight,
} from "lucide-react";

import {
  resolveReport,
  adminAddDaysToUser,
  runGarbageCollector,
  promoteToAffiliate,
  getAffiliatePayouts, // ⬅️ Nova
  markAffiliateAsPaid, // ⬅️ Nova
} from "@/app/actions";

export default function AdminDashboard({ data }: { data: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  // Estados de Pagamentos
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Estados para Promoção de Afiliado
  const [promotingUser, setPromotingUser] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const ADMIN_EMAIL = "prfabianoguedes@gmail.com";

  // --- BUSCA DE PAGAMENTOS (LOGICA NOVA) ---
  const loadPayouts = async () => {
    setLoadingPayouts(true);
    const res = await getAffiliatePayouts();
    if (res.payouts) setPayouts(res.payouts);
    setLoadingPayouts(false);
  };

  useEffect(() => {
    if (activeTab === "payouts") loadPayouts();
  }, [activeTab]);

  // --- PROCESSAMENTO DE DADOS (EXISTENTE + MELHORIAS) ---
  const {
    allUsers,
    activeSubscribers,
    expiredSubscribers,
    visitors,
    partners,
    pendingReports,
    totalInstalls,
    totalViews,
    projectedRevenue,
  } = useMemo(() => {
    const users = data.users.filter((u: any) => u.email !== ADMIN_EMAIL);
    const now = new Date();

    const active = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" && u.expiresAt && new Date(u.expiresAt) > now,
    );
    const expired = users.filter(
      (u: any) =>
        u.role === "ASSINANTE" && u.expiresAt && new Date(u.expiresAt) < now,
    );
    const leads = users.filter((u: any) => u.role === "VISITANTE");
    const affs = users.filter((u: any) => u.role === "AFILIADO");
    const reports = data.reports.filter((r: any) => r.status === "PENDING");

    const installs = users.reduce(
      (acc: number, u: any) =>
        acc +
        (u.businesses?.reduce(
          (sum: number, b: any) => sum + (b.installs || 0),
          0,
        ) || 0),
      0,
    );

    const views = users.reduce(
      (acc: number, u: any) =>
        acc +
        (u.businesses?.reduce(
          (sum: number, b: any) => sum + (b.views || 0),
          0,
        ) || 0),
      0,
    );

    return {
      allUsers: users,
      activeSubscribers: active,
      expiredSubscribers: expired,
      visitors: leads,
      partners: affs,
      pendingReports: reports,
      totalInstalls: installs,
      totalViews: views,
      projectedRevenue: active.length * 29.9,
    };
  }, [data, ADMIN_EMAIL]);

  // --- FILTRO DE BUSCA ---
  const filteredData = useMemo(() => {
    let baseList = [];
    switch (activeTab) {
      case "subscribers":
        baseList = activeSubscribers;
        break;
      case "expired":
        baseList = expiredSubscribers;
        break;
      case "visitors":
        baseList = visitors;
        break;
      case "partners":
        baseList = partners;
        break;
      case "reports":
        return pendingReports;
      case "payouts":
        return payouts; // Nova Tab
      default:
        return [];
    }
    const searchLower = searchTerm.toLowerCase();
    return baseList.filter(
      (u: any) =>
        (u.name?.toLowerCase() || "").includes(searchLower) ||
        (u.email?.toLowerCase() || "").includes(searchLower) ||
        (u.referralCode?.toLowerCase() || "").includes(searchLower),
    );
  }, [
    activeTab,
    searchTerm,
    activeSubscribers,
    expiredSubscribers,
    visitors,
    partners,
    pendingReports,
    payouts,
  ]);

  // --- AÇÕES ---
  const handleConfirmPayment = async (
    affiliateId: string,
    valor: number,
    name: string,
  ) => {
    if (
      !confirm(
        `Confirmar que pagou R$ ${valor.toFixed(2)} para ${name}? Isso zerará o saldo dele.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await markAffiliateAsPaid(affiliateId);
      if (res.success) {
        toast.success(res.message);
        loadPayouts(); // Recarrega a lista
      } else {
        toast.error(res.error);
      }
    });
  };

  const handlePromote = async () => {
    if (!referralCodeInput) return toast.error("Digite um código!");
    startTransition(async () => {
      const res = await promoteToAffiliate(promotingUser.id, referralCodeInput);
      if (res.success) {
        toast.success(res.message);
        setPromotingUser(null);
        setReferralCodeInput("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRunFaxina = async () => {
    if (!confirm("Isso apagará imagens sem uso. Prosseguir?")) return;
    setIsCleaning(true);
    try {
      const result = await runGarbageCollector();
      result.error ? toast.error(result.error) : toast.success(result.message);
    } catch {
      toast.error("Erro crítico na faxina.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAddDays = async (e: any, userId: string, months: number) => {
    e.stopPropagation();
    if (confirm("Confirmar alteração de tempo?")) {
      startTransition(async () => {
        await adminAddDaysToUser(userId, months);
        router.refresh();
        toast.success("Tempo atualizado!");
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER SUPREMO */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-lg shadow-slate-200">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Administração
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
                placeholder="Buscar..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 transition-all font-medium shadow-inner"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleRunFaxina}
              className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all shadow-sm"
            >
              {isCleaning ? <Loader2 className="animate-spin" /> : <Eraser />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* GRID DE MÉTRICAS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign />}
            label="Receita Mensal"
            value={`R$ ${projectedRevenue.toFixed(2)}`}
            color="emerald"
            subValue="Estimada"
          />
          <MetricCard
            icon={<Activity />}
            label="Conversão"
            value={`${((activeSubscribers.length / (allUsers.length || 1)) * 100).toFixed(1)}%`}
            color="amber"
            subValue="Taxa Leads"
          />
          <MetricCard
            icon={<Award />}
            label="Parceiros"
            value={partners.length}
            color="blue"
            subValue="Afiliados"
          />
          <MetricCard
            icon={<Download />}
            label="Instalações"
            value={totalInstalls}
            color="purple"
            subValue="Apps Ativos"
          />
        </section>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex p-1.5 bg-white rounded-[2rem] shadow-sm border border-slate-200 w-fit overflow-x-auto max-w-full no-scrollbar">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            label="Painel"
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
            active={activeTab === "partners"}
            onClick={() => setActiveTab("partners")}
            label="Parceiros"
            icon={<Star size={16} />}
            count={partners.length}
          />
          <TabButton
            active={activeTab === "payouts"}
            onClick={() => setActiveTab("payouts")}
            label="Pagamentos"
            icon={<Wallet size={16} />}
            count={payouts.length}
          />
          <TabButton
            active={activeTab === "visitors"}
            onClick={() => setActiveTab("visitors")}
            label="Leads"
            icon={<UserPlus size={16} />}
            count={visitors.length}
          />
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            label="Crises"
            icon={<AlertTriangle size={16} />}
            count={pendingReports.length}
          />
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === "overview" && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-black uppercase italic text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Atividade Recente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.users
                    .flatMap((u: any) => u.businesses)
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(0, 6)
                    .map((biz: any) => (
                      <div
                        key={biz.id}
                        className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-emerald-500 shadow-sm">
                            <Store size={20} />
                          </div>
                          <p className="font-bold text-slate-900 truncate max-w-[120px]">
                            {biz.name}
                          </p>
                        </div>
                        <a
                          href={`/site/${biz.slug}`}
                          target="_blank"
                          className="p-2 bg-white rounded-lg text-slate-400 hover:text-emerald-500 transition-all"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                <h3 className="font-black uppercase italic text-slate-400 mb-6 tracking-widest text-sm text-center">
                  Saúde do Ecossistema
                </h3>
                <div className="space-y-8">
                  <HealthItem
                    label="Usuários Ativos"
                    value={activeSubscribers.length}
                    total={allUsers.length}
                    color="bg-emerald-500"
                  />
                  <HealthItem
                    label="Base de Parceiros"
                    value={partners.length}
                    total={allUsers.length}
                    color="bg-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic text-slate-900">
                    Fechamento de Comissões
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Regra: 30 dias de carência (Pagamento R$ 29,90 confirmado)
                  </p>
                </div>
                <button
                  onClick={loadPayouts}
                  className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                >
                  {loadingPayouts ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Clock size={18} />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {payouts.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                        <Wallet size={28} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase italic leading-none">
                          {p.name || "Sem Nome"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {p.email}
                        </p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase mt-1">
                          PIX Pendente
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-8 text-center bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                          Ativos
                        </p>
                        <p className="font-black text-slate-900">{p.ativos}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                          Taxa
                        </p>
                        <p className="font-black text-blue-600">{p.taxa}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                          Valor
                        </p>
                        <p className="font-black text-emerald-600 text-lg">
                          R$ {p.valorDevido.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/55${p.phone?.replace(/\D/g, "")}`}
                        target="_blank"
                        className="p-4 bg-white border border-slate-200 text-emerald-500 rounded-2xl hover:bg-emerald-50 transition-all"
                      >
                        <MessageCircle size={20} />
                      </a>
                      <button
                        onClick={() =>
                          handleConfirmPayment(p.id, p.valorDevido, p.name)
                        }
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all shadow-lg"
                      >
                        Pagar e Resetar
                      </button>
                    </div>
                  </div>
                ))}
                {payouts.length === 0 && !loadingPayouts && (
                  <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest text-xs">
                    Sem pagamentos para processar
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== "overview" &&
            activeTab !== "payouts" &&
            activeTab !== "reports" && (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                    <th className="p-6 text-left">Identificação</th>
                    <th className="p-6 text-left">Contatos</th>
                    <th className="p-6 text-left">Status Financeiro</th>
                    <th className="p-6 text-right">Controle HQ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((user: any) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-6">
                        <p className="font-black text-slate-900 uppercase italic group-hover:text-emerald-600 transition-colors">
                          {user.name || "N/A"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {user.email}
                        </p>
                        {user.referralCode && (
                          <span className="mt-1 inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black">
                            CÓD: {user.referralCode}
                          </span>
                        )}
                      </td>
                      <td className="p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/55${user.phone?.replace(/\D/g, "")}`}
                            target="_blank"
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <a
                            href={`mailto:${user.email}`}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                          >
                            <Mail size={16} />
                          </a>
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusBadge
                          expiresAt={user.expiresAt}
                          role={user.role}
                        />
                      </td>
                      <td
                        className="p-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {user.role !== "AFILIADO" &&
                            user.role !== "ADMIN" && (
                              <button
                                onClick={() => setPromotingUser(user)}
                                className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                              >
                                <Award size={18} />
                              </button>
                            )}
                          <button
                            onClick={(e) => handleAddDays(e, user.id, 1)}
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <CalendarDays size={18} />
                          </button>
                          <button
                            onClick={(e) => handleAddDays(e, user.id, -1)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </main>

      {/* MODAL SUPORTE */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-900">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 italic uppercase leading-none mb-1">
                    {selectedUser.name || "Usuário"}
                  </h2>
                  <p className="text-sm text-slate-400 font-bold">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                <ContactAction
                  icon={<MessageCircle />}
                  label="WhatsApp"
                  value={selectedUser.phone}
                  href={`https://wa.me/55${selectedUser.phone?.replace(/\D/g, "")}`}
                  color="emerald"
                />
                <ContactAction
                  icon={<PhoneCall />}
                  label="Ligar"
                  value={selectedUser.phone}
                  href={`tel:${selectedUser.phone}`}
                  color="slate"
                />
                <ContactAction
                  icon={<Mail />}
                  label="E-mail"
                  value={selectedUser.email}
                  href={`mailto:${selectedUser.email}`}
                  color="blue"
                />
              </div>
              <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-4">
                Negócios Sob Gestão
              </h3>
              <div className="space-y-3">
                {selectedUser.businesses?.map((biz: any) => (
                  <div
                    key={biz.id}
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-emerald-400">
                        {biz.imageUrl ? (
                          <img
                            src={biz.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store />
                        )}
                      </div>
                      <p className="font-black text-slate-900 italic uppercase">
                        {biz.name}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/editar/${biz.slug}?adminMode=true`,
                        )
                      }
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 transition-all"
                    >
                      Admin Mode
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROMOVER PARCEIRO */}
      {promotingUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setPromotingUser(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Award size={32} />
              </div>
              <h2 className="text-xl font-black uppercase italic text-slate-900">
                Novo Parceiro
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Configurando acesso para {promotingUser.name}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">
                  Código do Afiliado
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: ANTONIO-VIP"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold uppercase outline-none focus:ring-2 ring-amber-500/20"
                  value={referralCodeInput}
                  onChange={(e) =>
                    setReferralCodeInput(
                      e.target.value.toUpperCase().replace(/\s/g, "-"),
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPromotingUser(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePromote}
                  disabled={isPending}
                  className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Ativar Parceiro"
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

function MetricCard({ icon, label, value, color, subValue }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}
      >
        {icon}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
        {label}
      </p>
      <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
        {value}
      </h4>
      <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">
        {subValue}
      </p>
    </div>
  );
}

function ContactAction({ icon, label, value, href, color }: any) {
  const colors: any = {
    emerald:
      "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white",
    slate: "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white",
  };
  return (
    <a
      href={href}
      className={`p-4 rounded-2xl border border-slate-100 transition-all flex flex-col items-center gap-1 ${colors[color]}`}
    >
      <div className="opacity-70">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </a>
  );
}

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
    >
      {icon} {label}
      {count !== undefined && (
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-[8px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
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
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 italic">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
