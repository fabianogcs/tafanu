"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailAction } from "@/app/actions";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MailQuestion,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verificando seu e-mail...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("O link de verificação parece estar incompleto ou ausente.");
      return;
    }

    const verify = async () => {
      // Pequeno delay para não dar susto no usuário com a troca de tela rápida
      const result = await verifyEmailAction(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.success);
        // Redireciona após 4 segundos para dar tempo de ler
        setTimeout(() => router.push("/login"), 4000);
      } else {
        setStatus("error");
        setMessage(result.error || "Não conseguimos validar seu e-mail agora.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center border border-slate-100 relative overflow-hidden">
        {/* Detalhe estético: uma linha sutil no topo que muda de cor conforme o status */}
        <div
          className={`absolute top-0 left-0 w-full h-2 ${
            status === "loading"
              ? "bg-tafanu-blue"
              : status === "success"
                ? "bg-green-500"
                : "bg-red-500"
          } opacity-20`}
        />

        {status === "loading" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-tafanu-blue animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-tafanu-blue rounded-full animate-ping" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                Validando Acesso
              </h1>
              <p className="text-slate-500 font-medium text-sm">{message}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-green-100 p-5 rounded-full shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                Tudo Pronto!
              </h1>
              <p className="text-slate-600 font-bold text-sm leading-relaxed px-4">
                {message}
              </p>
            </div>
            <div className="w-full pt-4 space-y-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-black py-5 px-8 rounded-2xl hover:bg-tafanu-blue transition-all uppercase text-xs tracking-widest group"
              >
                Fazer Login{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <p className="text-[10px] text-slate-400 font-medium">
                Você será levado ao login automaticamente em instantes...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-red-50 p-5 rounded-full shadow-inner">
              <MailQuestion className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                Link Inválido
              </h1>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                {message}
              </p>
            </div>

            <div className="w-full pt-4 space-y-6">
              <Link
                href="/login"
                className="flex items-center justify-center w-full bg-slate-100 text-slate-700 font-black py-5 px-8 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
              >
                Tentar entrar na minha conta
              </Link>

              <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100">
                <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                  DICA: Se o seu link expirou, tente fazer login normalmente. Se
                  o e-mail não estiver verificado, você poderá solicitar um novo
                  envio por lá!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      }
    >
      <VerificarEmailContent />
    </Suspense>
  );
}
