"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { setInitialPassword } from "@/app/actions";
import { Lock, X, ShieldCheck } from "lucide-react";

export default function PasswordAlert() {
  const { data: session, update, status } = useSession();
  const [showInput, setShowInput] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🛡️ PROTEÇÃO REFORÇADA:
  // Se o status mudar para unauthenticated (deslogado), o componente retorna null imediatamente.
  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  // Se já tiver senha OU se fechamos manualmente (isVisible false)

  if (session.user.hasPassword || !isVisible) {
    return null;
  }

  // ... resto do seu código (return do visual)

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

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-2 border-indigo-100 shadow-2xl rounded-[2rem] p-6">
        {!showInput ? (
          <div className="flex items-start gap-4">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl">
              <Lock size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Acesso Direto
              </h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Crie uma senha para entrar no site sem depender do Google.
              </p>
              <button
                onClick={() => setShowInput(true)}
                className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:scale-105 transition-all"
              >
                Configurar Senha
              </button>
            </div>
            {/* Opcional: Botão X para fechar o alerta se o usuário não quiser agora */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-300 hover:text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                Criar Acesso
              </span>
              <button
                onClick={() => setShowInput(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="password"
              placeholder="Digite a senha (min. 6)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-2 ring-indigo-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirme a senha"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-2 ring-indigo-500/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
