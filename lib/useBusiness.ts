// lib/useBusiness.ts
import { useState, useEffect, useMemo } from "react";
import { normalizeBusiness, checkIsOpen } from "./normalize";

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

  // 🚀 CÁLCULO DINÂMICO EM TEMPO REAL:
  // Garante que o hook sempre reavalie o status com base no fuso horário real se a página ficar aberta
  const isOpen = useMemo(() => checkIsOpen(realHours), [realHours]);

  // 3. Capacidades (Booleans blindados contra "Tela Branca da Morte")
  const capabilities = useMemo(() => {
    const socialPlatforms = ["instagram", "tiktok", "facebook", "website"];

    return {
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

      hasActionLink:
        typeof business?.actionLink === "string" &&
        business.actionLink.trim() !== "",
      hasAgendaLink:
        typeof business?.agendaLink === "string" &&
        business.agendaLink.trim() !== "",
      hasCatalogPdf:
        typeof business?.catalogPdf === "string" &&
        business.catalogPdf.trim() !== "",

      hasGallery:
        Array.isArray(business?.gallery) && business.gallery.length > 0,
      hasFaqs: Array.isArray(business?.faqs) && business.faqs.length > 0,
      hasFeatures:
        Array.isArray(business?.features) && business.features.length > 0,
      hasHours: realHours.length > 0,

      hasSocials: socialPlatforms.some(
        (s) => typeof business?.[s] === "string" && business[s].trim() !== "",
      ),

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
    isOpen, // 🚀 RETORNA O STATUS INTELIGENTE DA MADRUGADA AQUI!
    ...capabilities,
  };
}
