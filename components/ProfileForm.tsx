"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions";
import { cpf, cnpj } from "cpf-cnpj-validator";
import {
  Loader2,
  Save,
  User,
  Mail,
  KeyRound,
  ShieldAlert,
  Smartphone,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteBusinessModal from "@/components/DeleteBusinessModal";

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!user.password); // Só mostra se não tem senha

  // --- MÁSCARAS ---
  const maskPhone = (v: string) => {
    if (!v) return "";
    v = v.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    }
    return v;
  };

  const maskDoc = (v: string) => {
    if (!v) return "";
    v = v.replace(/\D/g, "");
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const docRaw = formData.get("document") as string;
    const docClean = (docRaw || "").replace(/\D/g, "");
    const phoneClean = ((formData.get("phone") as string) || "").replace(
      /\D/g,
      "",
    );

    if (user.role === "ASSINANTE") {
      if (!docClean) {
        alert("⚠️ O CPF ou CNPJ é obrigatório para assinantes.");
        return;
      }
      if (phoneClean.length < 10) {
        alert("⚠️ Forneça um número de WhatsApp válido.");
        return;
      }
    }

    if (docClean.length > 0) {
      const isValid =
        docClean.length <= 11 ? cpf.isValid(docClean) : cnpj.isValid(docClean);
      if (!isValid) {
        alert(
          `❌ O ${docClean.length <= 11 ? "CPF" : "CNPJ"} informado é inválido.`,
        );
        return;
      }
    }
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (newPass && newPass !== confirmPass) {
      alert("❌ As senhas novas não coincidem! Verifique e tente novamente.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfile(formData);

      if (res?.error) {
        alert(`⚠️ ${res.error}`);
      } else {
        router.refresh();
        const form = event.target as HTMLFormElement;
        form
          .querySelectorAll('input[type="password"]')
          .forEach((i: any) => (i.value = ""));
        alert("✅ Perfil atualizado com sucesso!");
        setShowWelcome(false); // Esconde o banner após o primeiro save
      }
    } catch (error) {
      alert("❌ Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }
  // --- FUNÇÃO PARA CANCELAR ASSINATURA ---
  async function handleCancelSubscription() {
    const confirmar = confirm(
      "Deseja realmente cancelar sua assinatura? Seu negócio deixará de aparecer para os visitantes.",
    );
    if (!confirmar) return;

    setIsSaving(true);
    try {
      // IMPORTANTE: Adicione o import { cancelSubscriptionAction } no topo do arquivo
      // @ts-ignore
      const res = await cancelSubscriptionAction();

      if (res.success) {
        alert("Sua assinatura foi cancelada. Você agora é um Visitante.");
        router.refresh(); // Atualiza a tela para sumir o botão de cancelar
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert("Erro ao processar.");
    } finally {
      setIsSaving(false);
    }
  }
  const businessSlug = user.businesses?.[0]?.slug || "none";

  return (
    <div className="w-full space-y-10 pb-20">
      {/* BANNER DIDÁTICO DE BOAS-VINDAS (ONBOARDING) */}
      {showWelcome && (
        <div className="bg-[#023059] p-8 rounded-[40px] shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-700">
          <div className="absolute top-[-20px] right-[-20px] text-[#F28705] opacity-10 rotate-12">
            <Sparkles size={160} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 bg-[#F28705] rounded-3xl flex items-center justify-center shadow-xl shrink-0 animate-bounce">
              <User size={40} className="text-[#023059]" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Seja bem-vindo, {user.name?.split(" ")[0]}!
              </h2>
              <p className="text-gray-300 font-bold text-sm leading-relaxed max-w-xl">
                Você entrou com o Google, mas para sua conta ficar completa,
                pedimos que
                <span className="text-[#F28705]"> atualize seu WhatsApp</span> e
                <span className="text-[#F28705]"> crie uma senha</span> de
                acesso manual logo abaixo.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="w-full space-y-12">
        <div className="flex flex-col gap-10">
          {/* SEÇÃO 1: PESSOAL */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <User size={18} className="text-[#F28705]" />
              <h2 className="text-sm font-black text-[#023059] uppercase tracking-tighter">
                Informações de Perfil
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <input
                  name="name"
                  defaultValue={user.name}
                  className="w-full p-5 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-[#F28705]/10 font-bold text-[#023059] shadow-sm transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${!user.phone ? "text-[#F28705]" : "text-gray-400"}`}
                >
                  <Smartphone size={12} /> WhatsApp{" "}
                  {user.role === "ASSINANTE" && "*"}
                  {!user.phone && (
                    <span className="ml-2 animate-pulse">(Obrigatório)</span>
                  )}
                </label>
                <input
                  name="phone"
                  defaultValue={maskPhone(user.phone || "")}
                  onChange={(e) => (e.target.value = maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className={`w-full p-5 border rounded-3xl outline-none focus:ring-4 font-bold text-[#023059] shadow-sm transition-all ${!user.phone ? "bg-orange-50 border-orange-100 focus:ring-[#F28705]/20" : "bg-white border-gray-100 focus:ring-indigo-50"}`}
                  required={user.role === "ASSINANTE"}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DOCUMENTAÇÃO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldAlert size={18} className="text-[#F28705]" />
              <h2 className="text-sm font-black text-[#023059] uppercase tracking-tighter">
                Documentação e Acesso
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label
                  className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${!user.document ? "text-[#F28705]" : "text-gray-400"}`}
                >
                  <FileText size={12} /> CPF ou CNPJ{" "}
                  {user.role === "ASSINANTE" && "*"}
                </label>
                <input
                  name="document"
                  defaultValue={maskDoc(user.document || "")}
                  onChange={(e) => (e.target.value = maskDoc(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full p-5 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-[#023059]"
                  required={user.role === "ASSINANTE"}
                />
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Mail size={12} /> E-mail (Somente Leitura)
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="w-full p-5 bg-gray-100 border border-gray-200 rounded-3xl font-bold text-gray-400 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: SEGURANÇA E SENHA */}
          {/* SEÇÃO 3: SEGURANÇA E SENHA */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#023059] uppercase">
                    Segurança da Conta
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Trocar Senha?
                  </p>
                </div>
              </div>
              {!user.password && (
                <span className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-100 text-[#F28705] text-[9px] font-black rounded-full uppercase">
                  <Info size={12} /> Definir Primeira Senha
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {" "}
              {/* Mudamos para 3 colunas no desktop */}
              {/* 1. SENHA ATUAL (Só aparece se ele já tem uma) */}
              {user.password ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Senha Atual
                  </label>
                  <input
                    name="currentPassword"
                    type="password"
                    placeholder="Senha de hoje"
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-[#023059]"
                  />
                </div>
              ) : (
                <div className="bg-indigo-50 p-6 rounded-3xl flex items-center gap-4 md:col-span-1">
                  <p className="text-[10px] font-bold text-indigo-900 leading-tight italic">
                    Como você entrou via Google, defina sua senha ao lado.
                  </p>
                </div>
              )}
              {/* 2. NOVA SENHA */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nova Senha
                </label>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="Mínimo 6 dígitos"
                  className="w-full p-5 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-[#023059]"
                />
              </div>
              {/* 3. CONFIRMAR NOVA SENHA (O Campo Novo!) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Confirmar Nova Senha
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita a nova senha"
                  className="w-full p-5 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-[#023059]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-auto px-10 h-16 bg-[#023059] text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-[#F28705] hover:text-[#023059] active:scale-95 disabled:opacity-50 shadow-lg"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Gravar Alterações
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* SEÇÃO DE GESTÃO DE PLANO */}
      <div className="pt-10 border-t border-gray-100 mt-10">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert size={18} className="text-indigo-500" />
          <h2 className="text-sm font-black text-[#023059] uppercase tracking-tighter">
            Plano e Assinatura
          </h2>
        </div>

        {user.role === "ASSINANTE" ? (
          <div className="p-8 border-2 border-indigo-100 rounded-[40px] bg-indigo-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-black text-[#023059] uppercase text-sm flex items-center gap-2 justify-center md:justify-start">
                <Sparkles size={16} className="text-[#F28705]" /> Assinatura
                Parceiro Ativa
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Você tem acesso total ao portal. O cancelamento rebaixará sua
                conta para Visitante.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelSubscription}
              className="px-8 py-4 bg-white border-2 border-red-100 text-red-600 text-[10px] font-black uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              Cancelar Assinatura
            </button>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-[40px] bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-black text-gray-400 uppercase text-sm">
                Conta Visitante
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Você ainda não é um parceiro assinante.
              </p>
            </div>
            <a
              href="/anunciar"
              className="px-8 py-4 bg-[#023059] text-white text-[10px] font-black uppercase rounded-2xl hover:bg-[#F28705] transition-all"
            >
              Seja um Parceiro
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
