"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SessionRefresher() {
  const { update, status } = useSession();
  const router = useRouter();

  // 🚀 A TRAVA DE AÇO: useRef não reseta quando o Next.js dá o refresh na tela
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Só roda se estiver logado e se a trava estiver aberta
    if (status === "authenticated" && !hasRefreshed.current) {
      const syncSession = async () => {
        try {
          // Tranca a porta IMEDIATAMENTE antes de fazer qualquer coisa
          hasRefreshed.current = true;

          await update();
          router.refresh();
          console.log("✅ [SessionRefresher] Crachá atualizado com sucesso.");
        } catch (error) {
          console.error("❌ [SessionRefresher] Erro ao sincronizar:", error);
        }
      };

      syncSession();
    }
  }, [status, update, router]);

  return null;
}
