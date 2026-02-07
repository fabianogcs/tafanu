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
  ShieldCheck,
} from "lucide-react";
import { registerUser, loginUser } from "../actions";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
// Importamos o getSession do cliente para verificar sem recarregar a página toda hora
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // Estado para evitar piscar a tela de login enquanto verifica
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const roleParam = searchParams.get("role");
  const [showSuccess, setShowSuccess] = useState(false);

  // --- LÓGICA DE DESTINO (O "GPS" do Funil) ---
  const nextStep = roleParam === "ASSINANTE" ? "/checkout" : "/";

  // 1. VERIFICAÇÃO DE SESSÃO (Novo!)
  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) {
        // Se já está logado, tchau!
        router.replace(nextStep);
      } else {
        // Se não está logado, libera a tela
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [router, nextStep]);

  useEffect(() => {
    if (success === "true") {
      setShowSuccess(true);
      setIsLogin(true);
    }
    if (roleParam === "ASSINANTE") {
      setIsLogin(false);
    }
  }, [success, roleParam]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isLogin) {
      // --- LOGIN NORMAL ---
      const result = await loginUser(formData);
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        // Sucesso no login, o server action redireciona,
        // mas por segurança podemos forçar aqui caso o server action demore
        // router.push(nextStep);
      }
    } else {
      // --- CADASTRO INTELIGENTE ---
      // 1. Cria a conta (sem tentar logar, para não dar erro)
      const registerResult = await registerUser(formData);

      if (registerResult?.error) {
        toast.error(registerResult.error);
        setIsLoading(false);
        return;
      }

      // 2. Se criou com sucesso, faz o login automático IMEDIATAMENTE
      if (registerResult?.success) {
        const loginResult = await loginUser(formData);

        if (loginResult?.error) {
          toast.warning("Conta criada! Agora é só fazer login para entrar.");
          setIsLogin(true);
          setIsLoading(false);
        } else {
          // O loginUser faz o redirect no servidor
          if (roleParam === "ASSINANTE") {
            router.push("/checkout");
          }
        }
      }
    }
  }

  // Se estiver checando a sessão, mostra um loading bonito em tela cheia
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-tafanu-blue" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="mb-12 block group">
            <span className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-tafanu-blue transition-colors">
              Tafanu
            </span>
          </Link>

          {showSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle size={24} />
              <div>
                <p className="font-black uppercase text-xs tracking-wider">
                  Tudo certo!
                </p>
                <p className="text-sm font-medium">Conta criada com sucesso.</p>
              </div>
            </div>
          )}

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">
              {isLogin
                ? "Bem-vindo de volta"
                : roleParam === "ASSINANTE"
                  ? "Vamos crescer?"
                  : "Crie sua conta"}
            </h1>
            <p className="text-slate-400 font-medium">
              {isLogin
                ? "Acesse seu painel"
                : roleParam === "ASSINANTE"
                  ? "Crie sua conta em segundos para garantir a oferta de R$ 1,00."
                  : "Explore os melhores serviços da sua região."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="hidden"
                name="role"
                value={roleParam || "VISITANTE"}
              />
            )}

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                    <User size={18} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required={!isLogin}
                    placeholder="Seu nome"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold text-slate-900 placeholder:font-normal"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold text-slate-900 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Senha
                </label>
                {isLogin && (
                  <Link
                    href="/esqueci-senha"
                    className="text-[10px] font-bold text-tafanu-blue uppercase tracking-wider hover:underline"
                  >
                    Esqueceu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold text-slate-900 placeholder:font-normal"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-tafanu-blue hover:bg-[#0f172a] text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Acessando...
                </>
              ) : (
                <>
                  {isLogin
                    ? "Entrar na Conta"
                    : roleParam === "ASSINANTE"
                      ? "Criar e Ir para Pagamento"
                      : "Criar Conta Grátis"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-white px-4 text-slate-400">
                Ou continue com
              </span>
            </div>
          </div>

          <GoogleLoginButton redirectTo={nextStep} />

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">
              {isLogin ? "Novo por aqui?" : "Já é parceiro?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowSuccess(false);
                }}
                className="font-black text-tafanu-blue hover:underline ml-1"
              >
                {isLogin ? "Crie sua conta" : "Fazer Login"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-[#0f172a] relative overflow-hidden items-center justify-center text-white p-12">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tafanu-action opacity-5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tafanu-blue opacity-10 rounded-full blur-[100px] -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          {roleParam === "ASSINANTE" ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/10 border border-white/10 text-tafanu-action font-black text-[10px] uppercase tracking-[0.3em] mb-8">
                <Sparkles size={14} /> Passo Final
              </div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
                Você está a um passo <br /> do sucesso.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Crie sua conta para liberar o pagamento promocional de{" "}
                <strong className="text-white">R$ 1,00</strong> e colocar sua
                empresa no topo das buscas da sua cidade.
              </p>
              <div className="flex gap-4 opacity-70">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                  <ShieldCheck size={16} className="text-tafanu-action" /> Dados
                  Seguros
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                  <Sparkles size={16} className="text-tafanu-action" /> Ativação
                  Imediata
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
                Seu guia local <br /> definitivo.
              </h2>
              <div className="mt-8 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                <p className="italic text-slate-300 mb-6 font-medium text-lg">
                  "O Tafanu mudou a forma como encontro serviços. A praticidade
                  de chamar no WhatsApp direto é incomparável."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tafanu-blue rounded-full flex items-center justify-center font-bold text-white border-2 border-tafanu-action">
                    RS
                  </div>
                  <div>
                    <p className="font-bold text-white">Ricardo Silva</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                      Usuário Verificado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
