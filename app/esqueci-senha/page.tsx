"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "@/app/actions";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSending(true);
    await sendPasswordResetEmail(formData);
    setIsSending(false);
    setIsSuccess(true); // Sempre mostramos sucesso por segurança
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        {/* CABEÇALHO */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Esqueceu a senha?
          </h1>
          <p className="text-gray-500 text-sm">
            Não se preocupe. Digite seu e-mail e enviaremos um link de
            recuperação.
          </p>
        </div>

        {isSuccess ? (
          // --- MENSAGEM DE SUCESSO ---
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Verifique seu e-mail
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Se o e-mail estiver cadastrado, você receberá um link em
              instantes. Verifique também a caixa de spam.
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
              Voltar para Login
            </Link>
          </div>
        ) : (
          // --- FORMULÁRIO ---
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                <Mail size={14} /> Seu E-mail cadastrado
              </label>
              <input
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-tafanu-blue outline-none bg-gray-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-4 bg-tafanu-blue hover:bg-blue-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isSending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Enviar Link de Recuperação"
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors pt-2"
            >
              <ArrowLeft size={14} /> Voltar para Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
