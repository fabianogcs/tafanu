"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setAffiliateCookie } from "@/app/actions"; // ⬅️ Vamos criar isso no próximo passo

export default function AffiliateTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      // 🚀 Chama o servidor para gravar o Cookie de forma segura
      setAffiliateCookie(ref);
      console.log("💎 Afiliado rastreado de forma segura:", ref);
    }
  }, [ref]);

  return null;
}
