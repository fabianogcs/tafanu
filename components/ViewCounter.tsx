"use client";

import { useEffect, useRef } from "react";
import { incrementViews } from "@/app/actions";

export default function ViewCounter({
  businessId,
  userId,
}: {
  businessId: string;
  userId?: string;
}) {
  const hasCounted = useRef(false);

  useEffect(() => {
    // 1. Verificamos se temos o ID da empresa e se ainda não contamos nesta sessão
    if (businessId && !hasCounted.current) {
      hasCounted.current = true; // Trava imediatamente para evitar double-click do React

      // 2. Chama a action (que agora aceita userId como undefined/anônimo)
      incrementViews(businessId, userId).catch((err) => {
        console.error("Erro ao incrementar views:", err);
      });
    }
    // Removemos o userId daqui. Só queremos rodar quando o businessId mudar (nova página)
  }, [businessId]);

  return null;
}
