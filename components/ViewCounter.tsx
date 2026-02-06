"use client";

import { useEffect, useRef } from "react";
import { incrementViews } from "@/app/actions"; // Ajustado para o nome correto

export default function ViewCounter({
  businessId,
  userId,
}: {
  businessId: string;
  userId?: string; // Adicionado userId
}) {
  const hasCounted = useRef(false);

  useEffect(() => {
    // Se for o dono (userId do cookie igual ao userId do negócio), a action trata.
    // Aqui só garantimos que não dispare duas vezes na mesma renderização do React.
    if (businessId && !hasCounted.current) {
      hasCounted.current = true; // Marca imediatamente para evitar duplo disparo

      incrementViews(businessId, userId).catch((err) => {
        console.error("Erro ao incrementar views:", err);
      });
    }
  }, [businessId, userId]);

  return null;
}
