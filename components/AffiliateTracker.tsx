"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      // 🚀 Salvando com o nome exato que seu actions.ts procura: "tafanu_ref"
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `tafanu_ref=${ref}; expires=${expires.toUTCString()}; path=/`;

      // Mantemos o localStorage por compatibilidade se precisar
      localStorage.setItem("tafanu_affiliate_ref", ref);

      console.log("💎 Afiliado rastreado e salvo no Cookie (tafanu_ref):", ref);
    }
  }, [ref]);

  return null;
}
