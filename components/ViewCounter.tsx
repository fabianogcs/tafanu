"use client";

import { useEffect, useRef } from "react";
import { incrementViews } from "@/app/actions";

export default function ViewCounter({ businessId }: { businessId: string }) {
  const hasCounted = useRef(false);

  useEffect(() => {
    // 1. Verificamos se temos o ID da empresa e se ainda não contamos no carregamento da tela
    if (businessId && !hasCounted.current) {
      hasCounted.current = true; // Trava para o React não disparar 2x rápido demais

      // 2. Chama a action enviando APENAS o ID da empresa
      incrementViews(businessId).catch((err) => {
        console.error("Erro ao incrementar views:", err);
      });
    }
  }, [businessId]);

  return null;
}
