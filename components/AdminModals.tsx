"use client";

import { toast } from "sonner";
import {
  ExternalLink, // 🚀 ADICIONE AQUI!
  X,
  UserX,
  User,
  Mail,
  CreditCard,
  MessageCircle,
  Zap,
  Link as LinkIcon,
  Store,
  Eye,
  Star,
  CalendarPlus,
  KeyRound,
  Award,
  Gavel,
  Check,
  Copy,
  Loader2,
  Link2,
} from "lucide-react";

// Trazemos o StatusBadge para cá para os modais poderem usá-lo sem problemas
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

interface AdminModalsProps {
  selectedUser: any;
  closeUser: () => void;
  isAffiliate: boolean;
  baseUrl: string;
  copiedId: string | null;
  copyAffiliateLink: (code: string, id: string) => void;
  assignCodeInput: string;
  setAssignCodeInput: (val: string) => void;
  handleAssignAffiliate: () => void;
  transferSlugInput: string;
  setTransferSlugInput: (val: string) => void;
  handleTransferBusiness: () => void;
  isPending: boolean;
  handleAddTime: (
    e: React.MouseEvent,
    businessId: string,
    months: number,
  ) => void;
  handleAddDays: (
    e: React.MouseEvent,
    businessId: string,
    days: number,
  ) => void;
  handleActivateVisitor: (
    e: React.MouseEvent,
    userId: string,
    days: number,
  ) => void;
  handleResetPassword: (userId: string, name: string) => void;
  setPromotingUser: (user: any) => void;
  handleBan: (userId: string, name: string) => void;
  promotingUser: any;
  referralCodeInput: string;
  setReferralCodeInput: (val: string) => void;
  handlePromote: () => void;
}

export default function AdminModals({
  selectedUser,
  closeUser,
  isAffiliate,
  baseUrl,
  copiedId,
  copyAffiliateLink,
  assignCodeInput,
  setAssignCodeInput,
  handleAssignAffiliate,
  transferSlugInput,
  setTransferSlugInput,
  handleTransferBusiness,
  isPending,
  handleAddTime,
  handleAddDays,
  handleActivateVisitor,
  handleResetPassword,
  setPromotingUser,
  handleBan,
  promotingUser,
  referralCodeInput,
  setReferralCodeInput,
  handlePromote,
}: AdminModalsProps) {
  return (
    <>
      {/* 1. MODAL RAIO-X — ASSINANTE */}
      {selectedUser && !isAffiliate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeUser}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Status (Melhor Loja)
                  </p>
                  <StatusBadge
                    role={selectedUser.role}
                    expiresAt={selectedUser.derivedExpiresAt}
                    isBanned={selectedUser.isBanned}
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Vencimento Distante
                  </p>
                  <p className="font-black text-slate-800">
                    {selectedUser.derivedExpiresAt
                      ? new Date(
                          selectedUser.derivedExpiresAt,
                        ).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <a
                  href={
                    selectedUser.phone
                      ? `https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${selectedUser.name?.split(" ")[0]}, aqui é do suporte Tafanu. Tudo bem?`)}`
                      : "#"
                  }
                  target="_blank"
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedUser.phone ? "bg-[#25D366] text-white shadow-sm hover:bg-[#1ebd57]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
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

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Origem da Venda
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedUser.affiliate?.name ? (
                      <span className="text-purple-600">
                        Indicado por: {selectedUser.affiliate.name}
                      </span>
                    ) : (
                      selectedUser.referredBy || "Orgânico"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder={
                      selectedUser.affiliateId
                        ? "Trocar parceiro..."
                        : "Código ou Link"
                    }
                    value={assignCodeInput}
                    onChange={(e) => setAssignCodeInput(e.target.value)}
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

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 my-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 flex items-center gap-1.5">
                    <Zap size={12} /> Transplante de Vitrine
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700/80 leading-tight max-w-sm">
                    Cole o link de uma loja já montada (com fotos, textos e
                    views). O sistema passará tudo para esta conta sem quebrar a
                    assinatura atual!
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-emerald-200 w-full md:w-auto shadow-sm">
                  <input
                    type="text"
                    placeholder="Link ou slug da loja..."
                    value={transferSlugInput}
                    onChange={(e) => setTransferSlugInput(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs font-bold px-2 w-full md:w-48 text-slate-700 placeholder:text-slate-300"
                  />
                  <button
                    onClick={handleTransferBusiness}
                    disabled={isPending}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <LinkIcon size={12} />
                    )}
                    Aplicar
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Store size={13} /> Lojas e Assinaturas (
                  {selectedUser.businesses?.length || 0})
                </p>
                <div className="flex flex-col gap-4">
                  {selectedUser.businesses?.map((biz: any) => {
                    const views = biz.views || 0;
                    const leads =
                      (biz.whatsapp_clicks || 0) + (biz.phone_clicks || 0);
                    const favs = biz._count?.favorites || 0;
                    return (
                      <div
                        key={biz.id}
                        className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-900 text-lg uppercase italic tracking-tight">
                              {biz.name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase border border-slate-200">
                                Plano: {biz.planType || "Nenhum"}
                              </span>
                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border ${biz.expiresAt && new Date(biz.expiresAt) > new Date() ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}
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
                          <div className="flex gap-2 w-full md:w-auto">
                            <a
                              href={`/site/${biz.slug}`}
                              target="_blank"
                              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <ExternalLink size={12} /> Ver Loja
                            </a>
                            <a
                              href={`/dashboard/editar/${biz.slug}`}
                              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all text-center"
                            >
                              Editar
                            </a>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                              <Eye size={12} /> Visitas
                            </p>
                            <p className="text-lg font-black text-slate-800">
                              {views}
                            </p>
                          </div>
                          <div className="text-center border-l border-r border-slate-200">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                              <MessageCircle size={12} /> Leads
                            </p>
                            <p className="text-lg font-black text-emerald-600">
                              {leads}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                              <Star size={12} /> Fãs
                            </p>
                            <p className="text-lg font-black text-rose-500">
                              {favs}
                            </p>
                          </div>
                        </div>
                        {!selectedUser.isBanned &&
                          (selectedUser.role === "ASSINANTE" ||
                            selectedUser.role === "VISITANTE") && (
                            <div className="flex items-center gap-2 flex-wrap pt-2 mt-2 border-t border-slate-100">
                              <CalendarPlus
                                size={16}
                                className="text-slate-400 mr-2"
                              />
                              <button
                                onClick={(e) => handleAddTime(e, biz.id, -1)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"
                              >
                                −1 mês
                              </button>
                              <button
                                onClick={(e) => handleAddDays(e, biz.id, -1)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"
                              >
                                −1 dia
                              </button>
                              <button
                                onClick={(e) => handleAddDays(e, biz.id, 1)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                              >
                                +1 dia
                              </button>
                              <button
                                onClick={(e) => handleAddTime(e, biz.id, 1)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                              >
                                +1 mês
                              </button>
                              <button
                                onClick={(e) => handleAddTime(e, biz.id, 3)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white"
                              >
                                +3 meses
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                  {(!selectedUser.businesses ||
                    selectedUser.businesses.length === 0) && (
                    <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center bg-slate-50/50">
                      <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest">
                        Este membro ainda não tem vitrine.
                      </p>
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

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleResetPassword(selectedUser.id, selectedUser.name)
                  }
                  className="w-full px-3 py-3 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all border border-blue-100 flex items-center justify-center gap-1.5"
                  title="Gera uma nova senha aleatória"
                >
                  <KeyRound size={14} /> Gerar Nova Senha
                </button>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setPromotingUser(selectedUser)}
                    className="flex-1 px-3 py-3 bg-amber-50 text-amber-600 rounded-xl text-[11px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all border border-amber-100 flex items-center justify-center gap-1.5"
                  >
                    <Award size={13} /> Promover a Parceiro
                  </button>
                  <button
                    onClick={() =>
                      handleBan(selectedUser.id, selectedUser.name)
                    }
                    className="flex-1 px-3 py-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1.5"
                  >
                    <Gavel size={13} /> Banir Usuário
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL RAIO-X — AFILIADO */}
      {selectedUser && isAffiliate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeUser}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
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

              <div className="flex gap-2 w-full">
                <a
                  href={
                    selectedUser.phone
                      ? `https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${selectedUser.name?.split(" ")[0]}, aqui é do Tafanu HQ. Como estão as suas vendas de afiliado?`)}`
                      : "#"
                  }
                  target="_blank"
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedUser.phone ? "bg-[#25D366] text-white shadow-sm hover:bg-[#1ebd57]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
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

      {/* 3. MODAL PROMOVER PARCEIRO */}
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
    </>
  );
}
