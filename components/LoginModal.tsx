"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ⬅️ IMPORTAMOS O PORTAL AQUI
import { toast } from "sonner";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  MailWarning,
  X,
} from "lucide-react";
import {
  registerUser,
  loginUser,
  resendVerificationEmail,
} from "@/app/actions";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // ⬅️ NOVO ESTADO: Garante que o Portal só renderize no navegador (evita erro no Next.js)
  const [mounted, setMounted] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    setMounted(true); // ⬅️ Avisa que o componente carregou no navegador
    const savedRef = localStorage.getItem("tafanu_affiliate_ref");
    if (savedRef) setAffiliateCode(savedRef);
  }, []);

  // Se não estiver aberto ou não tiver carregado no navegador, não mostra nada
  if (!isOpen || !mounted) return null;

  async function handleResendEmail() {
    if (!unverifiedEmail) return;
    setIsResending(true);
    const res = await resendVerificationEmail(unverifiedEmail);
    if (res.success) {
      toast.success(res.success);
      setShowResend(false);
    } else {
      toast.error(res.error || "Erro ao reenviar link.");
    }
    setIsResending(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLoginError("");
    setShowResend(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isLogin) {
      const result = await loginUser(formData);

      if (result?.error) {
        setLoginError(result.error);
        if (result.notVerified) {
          setShowResend(true);
          setUnverifiedEmail(result.email || (formData.get("email") as string));
        } else {
          toast.error(result.error);
        }
        setIsLoading(false);
      } else {
        toast.success("Login realizado com sucesso!");
        window.location.reload();
      }
    } else {
      const registerResult = await registerUser(formData);

      if (registerResult?.error) {
        toast.error(registerResult.error);
        setIsLoading(false);
        return;
      }

      if (registerResult?.success) {
        const loginResult = await loginUser(formData);

        if (loginResult?.error) {
          toast.success("Conta criada! Verifique seu e-mail para ativar.");
          setIsLogin(true);
          setLoginError("Verifique sua caixa de entrada para ativar a conta.");
          setShowResend(true);
          setUnverifiedEmail(formData.get("email") as string);
          setIsLoading(false);
        } else {
          toast.success("Conta criada com sucesso!");
          window.location.reload();
        }
      }
    }
  }

  // 🚀 MÁGICA DO PORTAL: Envia o HTML lá para a raiz do <body>
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Clica fora para fechar */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="mb-8 mt-2 pr-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter leading-none">
            {isLogin ? "Faça Login" : "Crie sua conta"}
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            {isLogin
              ? "Acesse para salvar seus favoritos."
              : "Junte-se à maior rede de negócios."}
          </p>
        </div>

        {/* --- ALERTA DE E-MAIL --- */}
        {loginError && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <MailWarning className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm font-bold text-orange-800 leading-tight">
                {loginError}
              </p>
            </div>
            {showResend && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                {isResending ? "Enviando..." : "Reenviar link"}
              </button>
            )}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="callbackUrl" value={currentUrl} />
          <input
            type="hidden"
            name="affiliateCode"
            value={affiliateCode || ""}
          />

          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                <User size={18} />
              </div>
              <input
                name="name"
                type="text"
                required
                placeholder="Nome Completo"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
              <Mail size={18} />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="E-mail Profissional"
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setLoginError("");
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
            >
              {isLogin ? "Criar nova conta" : "Já tenho conta"}
            </button>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest italic mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Cadastrar"
            )}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <span className="relative z-10 text-[9px] uppercase font-black text-slate-300 bg-white px-4">
            Ou continue com
          </span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
        </div>

        <GoogleLoginButton redirectTo={currentUrl} />
      </div>
    </div>,
    document.body, // ⬅️ O destino do Portal!
  );
}
