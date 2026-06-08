"use client"; // Páginas de erro no Next.js DEVEM ser client components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra o erro no console para você debugar depois
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Ops! Algo deu errado.
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Tivemos um problema técnico inesperado ao carregar esta página. Nossa
        equipe já foi notificada.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Tentar Novamente
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition"
        >
          Voltar ao Painel
        </Link>
      </div>
    </div>
  );
}
