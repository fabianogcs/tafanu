"use client";

import { useState, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Loader2,
  KeyRound,
  CheckCircle2,
  Eye, // ⬅️ Adicionado
  EyeOff, // ⬅️ Adicionado
} from "lucide-react";
import { resetPassword } from "@/app/actions";

function NovaSenhaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- 👁️ ESTADOS DOS OLHINHOS DA SENHA ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    if (!token) {
      toast.error("Token inválido ou ausente.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      setIsLoading(false);
      return;
    }

    // 🚀 AQUI: Usando a exata assinatura que já existe no seu actions.ts
    const result = await resetPassword(token, formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("Senha atualizada com sucesso!");
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }

    setIsLoading(false);
  }

  if (!token) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <KeyRound size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none">
          Link Inválido
        </h1>
        <p className="text-slate-400 font-medium mb-8">
          Este link de recuperação está incompleto ou já expirou.
        </p>
        <Link
          href="/esqueci-senha"
          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest italic"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none">
          Senha Alterada!
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Sua nova senha foi salva com sucesso. Você será redirecionado para o
          login em instantes.
        </p>
        <Loader2 className="animate-spin text-tafanu-blue mx-auto" size={24} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-tafanu-blue text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <Lock size={32} />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none">
        Nova <br /> <span className="text-tafanu-blue">Senha.</span>
      </h1>
      <p className="text-slate-400 font-medium mb-8">
        Digite sua nova senha abaixo. Escolha uma senha forte e segura.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Nova Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
              <Lock size={18} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold text-slate-700"
            />
            {/* 👁️ BOTÃO DO OLHINHO */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-tafanu-blue transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Confirme a Nova Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
              <Lock size={18} />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-tafanu-blue outline-none transition-all font-bold text-slate-700"
            />
            {/* 👁️ BOTÃO DO OLHINHO */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-tafanu-blue transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-tafanu-blue text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest italic mt-4 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Salvar Senha"}
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}

// 🛡️ O Suspense protege o build da Vercel
export default function NovaSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <Suspense
          fallback={
            <Loader2
              className="animate-spin text-tafanu-blue mx-auto"
              size={32}
            />
          }
        >
          <NovaSenhaForm />
        </Suspense>
      </div>
    </div>
  );
}
