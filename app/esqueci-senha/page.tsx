"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "@/app/actions";

export default function EsqueciSenhaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await sendPasswordResetEmail(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      setIsSuccess(true);
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        {/* BOTÃO VOLTAR */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao Login
        </Link>

        {isSuccess ? (
          /* TELA DE SUCESSO */
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none">
              E-mail Enviado!
            </h1>
            <p className="text-slate-500 font-medium mb-8">
              Enviamos um link de recuperação para o seu e-mail. Por favor,
              verifique sua caixa de entrada e também a pasta de spam.
            </p>
          </div>
        ) : (
          /* FORMULÁRIO */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <KeyRound size={32} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none">
              Recuperar <br /> <span className="text-tafanu-blue">Senha.</span>
            </h1>
            <p className="text-slate-400 font-medium mb-8">
              Digite o e-mail cadastrado na sua conta. Vamos enviar um link para
              você criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >
                  E-mail Cadastrado
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
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest italic disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Enviar Link de Acesso"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
