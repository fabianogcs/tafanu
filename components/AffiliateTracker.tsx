"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref"); // Busca o ?ref= na URL

  useEffect(() => {
    if (ref) {
      // Salva o código no navegador por tempo indeterminado
      localStorage.setItem("tafanu_affiliate_ref", ref);
      console.log("Afiliado rastreado:", ref);
    }
  }, [ref]);

  return null; // Este componente não aparece na tela, ele só trabalha no fundo
}
