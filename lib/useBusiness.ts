// lib/useBusiness.ts
import { useState, useEffect, useMemo } from "react";
import { normalizeBusiness } from "./normalize";

export function useBusiness(rawBusiness: any, rawHours: any) {
  // 1. Blindagem de dados
  const business = useMemo(() => normalizeBusiness(rawBusiness), [rawBusiness]);
  const realHours = useMemo(
    () => (Array.isArray(rawHours) ? rawHours : []),
    [rawHours],
  );

  // 2. Estado do Favorito Sincronizado
  const [isFavorite, setIsFavorite] = useState(business.favorites.length > 0);

  useEffect(() => {
    setIsFavorite(business.favorites.length > 0);
  }, [business.id, business.favorites]);

  // 3. Capacidades (Booleans úteis para o Layout)
  const capabilities = useMemo(() => {
    const socialPlatforms = ["instagram", "tiktok", "facebook", "website"];

    return {
      hasWhatsapp: business.whatsapp.trim() !== "",
      hasPhone: business.phone.trim() !== "", // Atalho para o layout
      hasGallery: business.gallery.length > 0,
      hasFaqs: business.faqs.length > 0,
      hasFeatures: business.features.length > 0,
      hasHours: realHours.length > 0,
      hasAddress: business.address.trim() !== "",
      hasDescription: business.description.trim() !== "",
      // Verifica se existe pelo menos uma rede social preenchida
      hasSocials: socialPlatforms.some(
        (s) => typeof business[s] === "string" && business[s].trim() !== "",
      ),
      // Lista filtrada só com as redes que existem
      availableSocials: socialPlatforms.filter(
        (s) => typeof business[s] === "string" && business[s].trim() !== "",
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
