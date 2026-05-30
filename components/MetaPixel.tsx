"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MetaPixel() {
  const pathname = usePathname();
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // 1. Verifica se já existe permissão gravada no navegador
    const checkConsent = () => {
      if (localStorage.getItem("tafanu-cookie-consent") === "true") {
        setHasConsent(true);
      }
    };

    checkConsent();

    // 2. Fica "escutando" o exato segundo em que o usuário clica em "Aceitar"
    window.addEventListener("cookie-consent-accepted", checkConsent);
    return () =>
      window.removeEventListener("cookie-consent-accepted", checkConsent);
  }, []);

  useEffect(() => {
    // 3. O BLOQUEIO: Só dispara se tiver ID da Vercel E o usuário tiver aceitado os cookies
    if (!pixelId || !hasConsent) return;

    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(pixelId); // Inicia legalmente
        ReactPixel.pageView(); // Registra a métrica limpa e sem duplicação
      });
  }, [pathname, pixelId, hasConsent]);

  // 4. Retorna nulo pois a tag <Script> ilegal foi extirpada.
  return null;
}
