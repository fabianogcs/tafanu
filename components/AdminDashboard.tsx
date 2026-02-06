"use client";

import { useState, useTransition } from "react";
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
  MapPin,
  Eye,
  AlertTriangle,
  MinusCircle,
  UserCheck,
  Eraser, // Icone para a faxina
  Loader2,
} from "lucide-react";
// IMPORTANTE: Adicione o runGarbageCollector aqui
import {
  resolveReport,
  adminAddDaysToUser,
  runGarbageCollector,
} from "@/app/actions";

export default function AdminDashboard({ data }: { data: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Estado novo para a Faxina
  const [isCleaning, setIsCleaning] = useState(false);

  const ADMIN_EMAIL = "prfabianoguedes@gmail.com";

  // Filtra dados brutos
  const allUsers = data.users.filter((u: any) => u.email !== ADMIN_EMAIL);
  const now = new Date();

  // --- FILTROS LÓGICOS ---
  const activeSubscribers = allUsers.filter(
    (u: any) =>
      u.role === "ASSINANTE" && (!u.expiresAt || new Date(u.expiresAt) > now),
  );

  const expiredSubscribers = allUsers.filter(
    (u: any) =>
      u.role === "ASSINANTE" && u.expiresAt && new Date(u.expiresAt) < now,
  );

  const visitors = allUsers.filter((u: any) => u.role === "VISITANTE");
  const pendingReports = data.reports.filter(
    (r: any) => r.status === "PENDING",
  );

  // --- BUSCA INTELIGENTE ---
  const filterList = (list: any[]) => {
    return list.filter((u: any) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesUser =
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower);
      const matchesBusiness = u.businesses.some((b: any) =>
        b.name.toLowerCase().includes(searchLower),
      );
      return matchesUser || matchesBusiness;
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "subscribers":
        return filterList(activeSubscribers);
      case "expired":
        return filterList(expiredSubscribers);
      case "visitors":
        return filterList(visitors);
      case "reports":
        return pendingReports;
      default:
        return [];
    }
  };

  // --- AÇÕES ---

  const handleRunFaxina = async () => {
    if (
      !confirm(
        "ATENÇÃO: Isso vai verificar todas as imagens no UploadThing. Se a imagem não estiver sendo usada em nenhum negócio no banco de dados, ELA SERÁ APAGADA.\n\nDeseja continuar?",
      )
    ) {
      return;
    }

    setIsCleaning(true);
    try {
      // AQUI: Garanta que está chamando o runGarbageCollector
      const result = await runGarbageCollector();

      if (result.error) {
        alert("Erro: " + result.error);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Erro ao tentar rodar a faxina.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAddDays = async (
    e: React.MouseEvent,
    userId: string,
    months: number,
    isActivation: boolean = false,
  ) => {
    e.stopPropagation();

    let confirmMsg = "";
    if (isActivation) {
      confirmMsg =
        "Deseja transformar este Visitante em ASSINANTE e liberar 1 mês?";
    } else {
      confirmMsg =
        months > 0
          ? "Confirmar pagamento manual? Isso liberará +1 MÊS."
          : "Correção: Deseja REMOVER 1 MÊS deste usuário?";
    }

    if (confirm(confirmMsg)) {
      startTransition(async () => {
        await adminAddDaysToUser(userId, months);
        router.refresh();
        alert(
          isActivation ? "Usuário Ativado com Sucesso!" : "Tempo atualizado.",
        );
      });
    }
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    const diffTime = new Date(dateString).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 relative">
      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-slate-900" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Master Control
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Painel <span className="text-emerald-500">Financeiro</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* BOTÃO DA FAXINA AQUI */}
          <button
            onClick={handleRunFaxina}
            disabled={isCleaning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 shadow-sm"
            title="Apagar imagens órfãs do UploadThing"
          >
            {isCleaning ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Eraser size={18} />
            )}
            <span className="text-xs uppercase tracking-wider">
              {isCleaning ? "Limpando..." : "Faxina Geral"}
            </span>
          </button>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar Cliente ou Negócio..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-emerald-500/20 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- CARDS DE NAVEGAÇÃO --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <FilterCard
            label="Visão Geral"
            count={null}
            icon={<LayoutGrid size={18} />}
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            color="slate"
          />
          <FilterCard
            label="Assinantes"
            count={activeSubscribers.length}
            icon={<CheckCircle2 size={18} />}
            isActive={activeTab === "subscribers"}
            onClick={() => setActiveTab("subscribers")}
            color="emerald"
          />
          <FilterCard
            label="Vencidos"
            count={expiredSubscribers.length}
            icon={<Clock size={18} />}
            isActive={activeTab === "expired"}
            onClick={() => setActiveTab("expired")}
            color="rose"
          />
          <FilterCard
            label="Leads/Visitantes"
            count={visitors.length}
            icon={<UserPlus size={18} />}
            isActive={activeTab === "visitors"}
            onClick={() => setActiveTab("visitors")}
            color="blue"
          />
          <FilterCard
            label="Denúncias"
            count={pendingReports.length}
            icon={<AlertTriangle size={18} />}
            isActive={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            color="amber"
          />
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="min-h-[400px]">
          {/* VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="font-black uppercase italic text-slate-400 mb-6">
                  Status Financeiro
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-600">
                      Receita Mensal (Estimada)
                    </span>
                    <span className="font-black text-2xl text-emerald-600">
                      R$ {(activeSubscribers.length * 29.9).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-800 uppercase mb-1">
                        Pagantes
                      </p>
                      <p className="text-2xl font-black text-emerald-600">
                        {activeSubscribers.length}
                      </p>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-1">
                        Potencial
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        {visitors.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                <h3 className="font-black uppercase italic text-slate-500 mb-6">
                  Radar de Negócios
                </h3>
                <div className="space-y-4">
                  {data.users
                    .flatMap((u: any) => u.businesses)
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-4 border-b border-white/10 pb-3 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <Store size={18} className="text-tafanu-action" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{b.name}</p>
                          <p className="text-[10px] uppercase tracking-wider opacity-50">
                            {b.category}
                          </p>
                        </div>
                        <a
                          href={`/site/${b.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-white/20 rounded-full transition-all"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* LISTAS */}
          {["subscribers", "expired", "visitors"].includes(activeTab) && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-6">Cliente</th>
                      <th className="p-6">Situação</th>
                      <th className="p-6">Negócios</th>
                      <th className="p-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getCurrentData().map((user: any) => {
                      const daysLeft = getDaysRemaining(user.expiresAt);
                      // VERIFICA SE É VISITANTE
                      const isVisitor = user.role === "VISITANTE";

                      return (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="p-6">
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </td>
                          <td className="p-6">
                            {isVisitor ? (
                              <Badge color="blue" text="Lead / Visitante" />
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                {daysLeft !== null ? (
                                  <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${daysLeft < 0 ? "bg-rose-100 text-rose-600" : daysLeft <= 7 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                                  >
                                    {daysLeft < 0
                                      ? `Venceu há ${Math.abs(daysLeft)} dias`
                                      : daysLeft === 0
                                        ? "Vence Hoje!"
                                        : `${daysLeft} dias restantes`}
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                    Data Manual
                                  </span>
                                )}
                                {user.expiresAt && (
                                  <span className="text-[9px] text-slate-400">
                                    {new Date(
                                      user.expiresAt,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <Store size={16} className="text-slate-300" />
                              <span className="font-bold text-sm text-slate-700">
                                {user.businesses.length}
                              </span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div
                              className="flex justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* LÓGICA CONDICIONAL DE BOTÕES */}
                              {isVisitor ? (
                                // BOTÃO ESPECIAL PARA ATIVAR VISITANTE
                                <button
                                  onClick={(e) =>
                                    handleAddDays(e, user.id, 1, true)
                                  }
                                  disabled={isPending}
                                  className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase disabled:opacity-50"
                                  title="Tornar Assinante"
                                >
                                  <UserCheck size={14} /> Ativar Assinatura
                                </button>
                              ) : (
                                // BOTÕES NORMAIS PARA ASSINANTES
                                <>
                                  <button
                                    onClick={(e) =>
                                      handleAddDays(e, user.id, 1)
                                    }
                                    disabled={isPending}
                                    className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase disabled:opacity-50"
                                    title="Adicionar 1 Mês"
                                  >
                                    <CalendarDays size={14} /> +1 Mês
                                  </button>

                                  {/* Botão Remover (Só se tiver data futura) */}
                                  {daysLeft !== null && (
                                    <button
                                      onClick={(e) =>
                                        handleAddDays(e, user.id, -1)
                                      }
                                      disabled={isPending}
                                      className="flex items-center gap-1 px-2 py-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                      title="Correção: Remover 1 Mês"
                                    >
                                      <MinusCircle size={14} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {getCurrentData().length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-10 text-center text-slate-400 italic"
                        >
                          Nenhum resultado encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DENÚNCIAS */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {pendingReports.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <ShieldCheck
                    className="mx-auto text-slate-300 mb-4"
                    size={48}
                  />
                  <p className="text-slate-400 font-bold">
                    Sem denúncias pendentes.
                  </p>
                </div>
              ) : (
                pendingReports.map((report: any) => (
                  <ReportCard key={report.id} report={report} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {selectedUser.name}
                </h2>
                <p className="text-slate-500">{selectedUser.email}</p>
                <div className="flex gap-2 mt-3">
                  <Badge
                    color={
                      selectedUser.role === "ASSINANTE" ? "emerald" : "blue"
                    }
                    text={selectedUser.role}
                  />
                  {selectedUser.document && (
                    <Badge color="slate" text="CPF/CNPJ Validado" />
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                Negócios deste usuário
              </h3>
              {selectedUser.businesses.length > 0 ? (
                <div className="space-y-3">
                  {selectedUser.businesses.map((biz: any) => (
                    <div
                      key={biz.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                          {biz.imageUrl ? (
                            <img
                              src={biz.imageUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Store size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{biz.name}</p>
                          <p className="text-xs text-slate-500 uppercase">
                            {biz.category}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`w-2 h-2 rounded-full ${biz.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                            <span className="text-[10px] font-medium text-slate-400">
                              {biz.isActive ? "Online" : "Pausado"}
                            </span>
                            <span className="text-[10px] text-slate-300">
                              •
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              <Eye size={10} /> {biz.views} views
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                        <a
                          href={`/site/${biz.slug}`}
                          target="_blank"
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:scale-105 transition-all"
                        >
                          Ver <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-slate-400 italic">
                    Este usuário ainda não criou anúncios.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-[10px] uppercase">
                ID do Usuário: {selectedUser.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTS
function FilterCard({ label, count, icon, isActive, onClick, color }: any) {
  const colorClasses: any = {
    slate: isActive
      ? "bg-slate-900 text-white ring-4 ring-slate-200"
      : "bg-white text-slate-500 hover:bg-slate-50",
    emerald: isActive
      ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
      : "bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600",
    rose: isActive
      ? "bg-rose-500 text-white ring-4 ring-rose-100"
      : "bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600",
    blue: isActive
      ? "bg-blue-500 text-white ring-4 ring-blue-100"
      : "bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600",
    amber: isActive
      ? "bg-amber-500 text-white ring-4 ring-amber-100"
      : "bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600",
  };
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border border-slate-200 shadow-sm transition-all text-left flex flex-col gap-3 group ${colorClasses[color]}`}
    >
      <div className="flex justify-between items-start w-full">
        <div
          className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-white"}`}
        >
          {icon}
        </div>
        {count !== null && <span className="text-xl font-black">{count}</span>}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

function Badge({ color, text }: any) {
  const styles: any = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${styles[color] || styles.slate}`}
    >
      {text}
    </span>
  );
}

function ReportCard({ report }: any) {
  const [loading, setLoading] = useState(false);
  const handleResolve = async () => {
    if (confirm("Resolver?")) {
      setLoading(true);
      await resolveReport(report.id);
      window.location.reload();
    }
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-rose-500 uppercase">
          {report.reason}
        </p>
        <p className="font-bold text-slate-900">{report.business.name}</p>
        <p className="text-sm text-slate-500 mt-1">"{report.details}"</p>
      </div>
      <button
        disabled={loading}
        onClick={handleResolve}
        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
      >
        {loading ? "..." : "Resolver"}
      </button>
    </div>
  );
}
