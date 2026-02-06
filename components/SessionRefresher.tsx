"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionRefresher() {
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. Força o NextAuth a buscar os dados novos no banco
    update().then(() => {
      console.log("Sessão atualizada com sucesso!");
      // 2. Recarrega a página visualmente para garantir que tudo pegou
      router.refresh();
    });
  }, []);

  return null; // Este componente não aparece na tela
}
