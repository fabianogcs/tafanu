"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { setInitialPassword } from "@/app/actions";
import { Lock, X, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function PasswordAlert() {
  const { data: session, update, status } = useSession();
  const [showInput, setShowInput] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🛡️ PROTEÇÃO REFORÇADA:
  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  // Se já tiver senha OU se fechamos manualmente (isVisible false)
  if (session.user.hasPassword || !isVisible) {
    return null;
  }

  const handleSave = async () => {
    // Validações com Toast + Return para parar o código
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 dígitos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      const res = await setInitialPassword(password);

      if (res.success) {
        // Esconde a caixa
        setIsVisible(false);
        // Atualiza a sessão
        await update({ hasPassword: true });
        // Feedback de Sucesso
        toast.success("Senha cadastrada com sucesso!");
      } else {
        // Erro vindo do servidor
        toast.error(res.error);
      }
    } catch (error) {
      // Erro genérico
      toast.error("Erro ao salvar senha.");
    } finally {
      setLoading(false);
    }
  };

  // ✨ FUNÇÃO PARA CAPTURAR O ENTER
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    // 🚀 Ajuste Definitivo: Força o centro matemático no celular (left-1/2 com translate) e alinha à direita no PC.
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm md:left-auto md:right-6 md:translate-x-0 z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* 🚀 Visual Premium Tafanu: Vidro fosco e paleta atualizada */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-[2rem] p-6 transition-all">
        {!showInput ? (
          <div className="flex items-start gap-4">
            <div className="bg-[#050B14] text-emerald-500 p-3.5 rounded-2xl shadow-lg shrink-0">
              <Lock size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Acesso Direto
              </h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed font-medium">
                Crie uma senha para entrar no painel sem depender do login do
                Google.
              </p>
              <button
                onClick={() => setShowInput(true)}
                className="bg-[#050B14] hover:bg-emerald-500 text-white hover:text-[#050B14] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Configurar Senha
              </button>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-300 hover:text-slate-600 transition-colors p-1 -mt-1 -mr-1"
              aria-label="Fechar alerta"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Criar Acesso
              </span>
              <button
                onClick={() => setShowInput(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {/* CAMPO DE SENHA */}
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha (mín. 6)"
                  className="w-full px-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:ring-2 ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* CAMPO DE CONFIRMAR SENHA */}
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme a senha"
                  className="w-full px-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:ring-2 ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#050B14] py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30 active:scale-95 mt-1"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <ShieldCheck size={16} /> Confirmar e Ativar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
