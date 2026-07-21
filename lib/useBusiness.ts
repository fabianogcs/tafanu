// lib/useBusiness.ts
import { useState, useEffect, useMemo } from "react";
import { normalizeBusiness } from "./normalize";

export function useBusiness(rawBusiness: any, rawHours: any) {
  // 1. Blindagem de dados principal
  const business = useMemo(() => normalizeBusiness(rawBusiness), [rawBusiness]);
  const realHours = useMemo(
    () => (Array.isArray(rawHours) ? rawHours : []),
    [rawHours],
  );

  // 2. Estado do Favorito Sincronizado (Com trava de segurança contra Null)
  const safeFavorites = Array.isArray(business?.favorites)
    ? business.favorites
    : [];
  const [isFavorite, setIsFavorite] = useState(safeFavorites.length > 0);

  useEffect(() => {
    setIsFavorite(safeFavorites.length > 0);
  }, [business?.id, safeFavorites.length]);

  // 3. Capacidades (Booleans blindados contra "Tela Branca da Morte")
  const capabilities = useMemo(() => {
    // 🚀 A VACINA DOS GLOBOS:
    // Separamos as redes sociais reais dos Marketplaces para não dar vazamento na UI.
    const socialPlatforms = ["instagram", "tiktok", "facebook", "website"];

    return {
      // 🛡️ Prevenção: Garantimos que é uma string antes de aplicar o .trim()
      hasWhatsapp:
        typeof business?.whatsapp === "string" &&
        business.whatsapp.trim() !== "",
      hasPhone:
        typeof business?.phone === "string" && business.phone.trim() !== "",
      hasAddress:
        typeof business?.address === "string" && business.address.trim() !== "",
      hasDescription:
        typeof business?.description === "string" &&
        business.description.trim() !== "",

      // 🛡️ Prevenção: Garantimos que é um Array antes de ler o .length
      hasGallery:
        Array.isArray(business?.gallery) && business.gallery.length > 0,
      hasFaqs: Array.isArray(business?.faqs) && business.faqs.length > 0,
      hasFeatures:
        Array.isArray(business?.features) && business.features.length > 0,
      hasHours: realHours.length > 0,

      // Verifica se existe pelo menos uma rede social preenchida validando o tipo
      hasSocials: socialPlatforms.some(
        (s) => typeof business?.[s] === "string" && business[s].trim() !== "",
      ),

      // Lista filtrada SÓ com as redes sociais REAIS
      availableSocials: socialPlatforms.filter(
        (s) => typeof business?.[s] === "string" && business[s].trim() !== "",
      ),
    };
  }, [business, realHours]);

  return {
    business,
    realHours,
    isFavorite,
    setIsFavorite,
    ...capabilities,
  };
}
