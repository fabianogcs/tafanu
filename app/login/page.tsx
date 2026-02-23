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
} from "lucide-react";
import { registerUser, loginUser } from "../actions";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- MANTIDA: LÓGICA DO GPS ---
  const success = searchParams.get("success");
  const roleParam = searchParams.get("role");
  const intent = searchParams.get("intent");
  const callbackUrl = searchParams.get("callbackUrl");

  const nextStep =
    callbackUrl ||
    (intent === "assinante" || roleParam === "ASSINANTE"
      ? "/checkout"
      : "/dashboard");

  const [showSuccess, setShowSuccess] = useState(false);

  // --- MANTIDA: VERIFICAÇÃO DE SESSÃO ---
  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) {
        router.replace(nextStep);
      } else {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [router, nextStep]);

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

  // --- MANTIDA: LÓGICA DE SUBMISSÃO (O MOTOR DO LOGIN) ---
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isLogin) {
      const result = await loginUser(formData);
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        window.location.href = nextStep; // Redireciona para o destino do GPS
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
          toast.warning("Conta criada! Faça o login.");
          setIsLogin(true);
          setIsLoading(false);
        } else {
          window.location.href = nextStep; // Redireciona para o destino do GPS
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* MANTIDO: O BILHETE DO GPS PARA O SERVIDOR */}
            <input type="hidden" name="callbackUrl" value={nextStep} />
            <input
              type="hidden"
              name="affiliateCode"
              value={affiliateCode || ""}
            />

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                    <User size={18} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold"
                />
              </div>
            </div>

            {/* --- O AJUSTE: BOTÃO DE TROCA LOGO ABAIXO DA SENHA --- */}
            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowSuccess(false);
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

          <GoogleLoginButton redirectTo={nextStep} />
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
