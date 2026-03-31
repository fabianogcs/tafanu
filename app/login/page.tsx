"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  Loader2,
  Sparkles,
  MailWarning, // ⬅️ Adicionado para o ícone de erro
} from "lucide-react";
import { registerUser, loginUser, resendVerificationEmail } from "../actions"; // ⬅️ resendVerificationEmail adicionado aqui
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // --- 🛡️ NOVOS ESTADOS PARA A TRAVA DE E-MAIL ---
  const [loginError, setLoginError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  // ----------------------------------------------

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- LÓGICA DO GPS REVISADA ---
  const success = searchParams.get("success");
  const intent = searchParams.get("intent");
  const callbackUrl = searchParams.get("callbackUrl");

  const [showSuccess, setShowSuccess] = useState(false);

  // 🛡️ Função inteligente para decidir o roteamento com base no cargo real
  const getDestination = (role?: string) => {
    if (callbackUrl) return callbackUrl;
    if (intent === "assinante") return "/checkout";
    if (role === "ADMIN" || role === "ASSINANTE" || role === "AFILIADO")
      return "/dashboard";
    return "/"; // VISITANTE vai para a home
  };

  // --- VERIFICAÇÃO DE SESSÃO DINÂMICA ---
  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session?.user) {
        const role = session.user.role as string | undefined;
        router.replace(getDestination(role));
      } else {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [router, callbackUrl, intent]);

  // --- MANTIDA: CONFIGURAÇÃO DE LOGIN/CADASTRO ---
  useEffect(() => {
    if (success === "true") {
      setShowSuccess(true);
      setIsLogin(true);
    }
    if (intent === "assinante" || callbackUrl === "/checkout") {
      setIsLogin(false);
    }
  }, [success, intent, callbackUrl]);

  useEffect(() => {
    // Ele vai lá no "caderninho" (localStorage) e vê se o espião anotou algo
    const savedRef = localStorage.getItem("tafanu_affiliate_ref");
    if (savedRef) {
      setAffiliateCode(savedRef);
    }
  }, []);

  // --- NOVA FUNÇÃO PARA REENVIAR O E-MAIL ---
  async function handleResendEmail() {
    if (!unverifiedEmail) return;
    setIsResending(true);
    const res = await resendVerificationEmail(unverifiedEmail);
    if (res.success) {
      toast.success(res.success);
      setShowResend(false); // Esconde o botão após enviar
    } else {
      toast.error(res.error || "Erro ao reenviar link.");
    }
    setIsResending(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // Limpa erros anteriores
    setLoginError("");
    setShowResend(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isLogin) {
      const result = await loginUser(formData);

      if (result?.error) {
        // 🛡️ AQUI TRATAMOS O ERRO DA TRAVA
        setLoginError(result.error);
        if (result.notVerified) {
          setShowResend(true);
          setUnverifiedEmail(result.email || (formData.get("email") as string));
        } else {
          toast.error(result.error);
        }
        setIsLoading(false);
      } else {
        // Busca a sessão recém-criada para saber o cargo antes de redirecionar
        const session = await getSession();
        const role = session?.user?.role as string | undefined;
        window.location.assign(getDestination(role));
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
          // Se deu erro ao logar logo após o cadastro, é porque caiu na trava de verificação (o que é esperado!)
          toast.success("Conta criada! Verifique seu e-mail para ativar.");
          setIsLogin(true);
          // Preenche a caixa de erro para ele já ver o botão de reenvio
          setLoginError("Verifique sua caixa de entrada para ativar a conta.");
          setShowResend(true);
          setUnverifiedEmail(formData.get("email") as string);
          setIsLoading(false);
        } else {
          // Caso você libere o cadastro sem trava no futuro (ex: via Google)
          toast.success("Conta criada! Redirecionando...");
          setTimeout(async () => {
            const session = await getSession();
            const role = session?.user?.role as string | undefined;
            window.location.assign(getDestination(role));
          }, 500);
        }
      }
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-tafanu-blue">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 mt-[-20px]">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter leading-none">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-slate-400 font-medium">
              {isLogin
                ? "Acesse seu painel agora."
                : "Junte-se à maior rede de negócios da região."}
            </p>
          </div>

          {/* --- 🛡️ CAIXA DE ALERTA DE E-MAIL NÃO VERIFICADO --- */}
          {loginError && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
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
                  {isResending ? "Enviando..." : "Reenviar link de ativação"}
                </button>
              )}
            </div>
          )}
          {/* -------------------------------------------------- */}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* MANTIDO: O BILHETE DO GPS PARA O SERVIDOR */}
            <input type="hidden" name="callbackUrl" value={getDestination()} />
            <input
              type="hidden"
              name="affiliateCode"
              value={affiliateCode || ""}
            />

            {!isLogin && (
              <div className="space-y-1">
                {/* 🚀 AJUSTE: htmlFor adicionado */}
                <label
                  htmlFor="name"
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                    <User size={18} />
                  </div>
                  <input
                    id="name" // 🚀 AJUSTE: id conectado ao label
                    name="name"
                    type="text"
                    required
                    autoComplete="name" // 🚀 AJUSTE: autoComplete adicionado
                    placeholder="Ex: João Silva"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              {/* 🚀 AJUSTE: htmlFor adicionado */}
              <label
                htmlFor="email"
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              {/* 🚀 AJUSTE: htmlFor adicionado */}
              <label
                htmlFor="password"
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  id="password" // 🚀 AJUSTE: id conectado ao label
                  name="password"
                  type="password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"} // 🚀 AJUSTE: Inteligente para login/cadastro
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pr-1 px-1">
              <Link
                href="/esqueci-senha"
                className="text-[10px] font-bold text-slate-400 hover:text-tafanu-blue transition-colors uppercase tracking-widest"
              >
                Esqueci a senha
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowSuccess(false);
                  setLoginError(""); // Limpa o erro ao trocar de tela
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-tafanu-blue transition-colors uppercase tracking-tight"
              >
                {isLogin ? "Novo por aqui? " : "Já tem conta? "}
                <span className="text-tafanu-blue underline ml-1">
                  {isLogin ? "Cadastre-se" : "Fazer Login"}
                </span>
              </button>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-tafanu-blue text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest italic"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : isLogin ? (
                "Entrar na Conta"
              ) : (
                "Criar Conta"
              )}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <span className="relative z-10 text-[10px] uppercase font-black text-slate-400 bg-white px-4">
              Ou continue com
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
          </div>

          <GoogleLoginButton redirectTo={getDestination()} />
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-[#050814] relative items-center justify-center text-white p-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tafanu-action opacity-10 rounded-full blur-[120px]"></div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-8 leading-[0.9]">
            DOMINE O <br />
            <span className="text-tafanu-action">MERCADO LOCAL.</span>
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed">
            Tudo o que você precisa para ser encontrado e fechar mais vendas
            pelo WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
