"use client";

import { useState } from "react";
import { resetPassword } from "@/app/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NewPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Substitua APENAS a função handleSubmit dentro de nova-senha/page.tsx

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    if (!token) {
      setError("Token inválido.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    // Chama a Server Action
    const result = await resetPassword(token, formData);

    if (result?.error) {
      // Se deu erro, paramos de carregar e mostramos o erro
      setError(result.error);
      setIsSaving(false);
    } else if (result?.success) {
      // --- A CORREÇÃO ESTÁ AQUI ---
      // Se deu certo, avisamos o usuário e redirecionamos
      alert("Senha alterada com sucesso!");
      router.push("/login");
    } else {
      // Caso genérico de falha
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-4">
        <div>
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900">Link Inválido</h1>
          <p className="text-gray-500 mb-4">
            Este link de recuperação parece estar quebrado.
          </p>
          <Link
            href="/login"
            className="text-tafanu-blue font-bold hover:underline"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-tafanu-blue">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Criar Nova Senha
          </h1>
          <p className="text-gray-500 text-sm">
            Digite sua nova senha abaixo para recuperar o acesso.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
              Nova Senha
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-tafanu-blue outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
              Confirme a Senha
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-tafanu-blue outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-tafanu-blue hover:bg-blue-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Salvar Nova Senha"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
