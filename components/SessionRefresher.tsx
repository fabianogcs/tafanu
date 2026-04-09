"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionRefresher() {
  const { update, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Só tenta atualizar se o usuário estiver de fato logado
    if (status === "authenticated") {
      update().then(() => {
        // Dá um "F5" silencioso no Next.js para o servidor reconhecer o novo crachá
        router.refresh();
      });
    }
  }, [update, status, router]);

  return null; // O componente não renderiza nada na tela, trabalha nos bastidores
}
