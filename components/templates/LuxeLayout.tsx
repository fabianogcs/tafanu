"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { toast } from "sonner";
import {
  Share2,
  X,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  Quote,
  Video,
  MessageCircle,
} from "lucide-react";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { useBusiness } from "@/lib/useBusiness";
import { businessThemes } from "@/lib/themes";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// --- HELPERS E ÍCONES ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
  </svg>
);

// Ícones Oficiais Customizados
const MeliIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.5 9.5L12 12l-2.5-2.5L7 12l5 5 5-5-2.5-2.5z" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

const ShopeeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 8H17V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4.5v13c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V8zM9 6c0-1.65 1.35-3 3-3s3 1.35 3 3v2H9V6zm6 5c0 1.1-.9 2-2 2s-2-.9-2-2H9c0 2.21 1.79 4 4 4s4-1.79 4-4h-2z" />
  </svg>
);

const IfoodIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.5 0-4.5-1.5-4.5-3.5h2c0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2h2c0 2-2 3.5-4.5 3.5zm-2-6c-.83 0-1.5-.67-1.5-1.5S8.17 7.5 9 7.5s1.5.67 1.5 1.5S9.83 10.5 9 10.5zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7.5 15 7.5s1.5.67 1.5 1.5S15.83 10.5 15 10.5z" />
  </svg>
);

const SheinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
// --- MOTOR DE VÍDEOS EMBED (YOUTUBE, INSTAGRAM, TIKTOK) ---
const VideoEmbed = ({ url }: { url: string }) => {
  let embedUrl = "";
  let isVertical = false;

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.includes("shorts/")
          ? url.split("shorts/")[1]?.split("?")[0]
          : new URL(url).searchParams.get("v");
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        isVertical = url.includes("shorts/");
      }
    } else if (url.includes("instagram.com")) {
      const cleanUrl = url.split("?")[0].replace(/\/$/, "");
      embedUrl = `${cleanUrl}/embed`;
      isVertical = true;
    } else if (url.includes("tiktok.com")) {
      const videoId = url.split("/video/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
        isVertical = true;
      }
    }
  } catch (e) {}

  if (!embedUrl) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-sm bg-black/5 border border-black/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] ${isVertical ? "aspect-[9/16] max-w-[350px] mx-auto" : "aspect-video"}`}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Conheça ${businessName}:`,
        url,
      });
      return;
    } catch (err) {}
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
};

const formatPhoneNumber = (phone: string) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  const matchFixo = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchFixo) return `(${matchFixo[1]}) ${matchFixo[2]}-${matchFixo[3]}`;
  return phone;
};

const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

const LuxeAccordion = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${theme.border} last:border-0`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left gap-4 group bg-transparent border-none outline-none"
      >
        <span
          className={`text-xl md:text-3xl font-serif italic ${isOpen ? theme.primary : theme.textColor}`}
        >
          {q}
        </span>
        <span
          className={`shrink-0 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
        >
          {isOpen ? (
            <Minus size={24} className={theme.primary} />
          ) : (
            <Plus size={24} className="opacity-40" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p
              className={`pb-10 text-base md:text-lg font-light opacity-80 leading-relaxed font-sans max-w-3xl ${theme.subTextColor} whitespace-pre-line break-words`}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LuxeLayout({
  business: rawBusiness,
  theme: propTheme,
  realHours: rawHours,
  fullAddress,
  isLoggedIn,
  isFavorited,
  emailVerified,
  currentUserId,
  isAdmin,
}: any) {
  const {
    business,
    realHours,
    hasWhatsapp,
    hasPhone,
    hasFaqs,
    hasFeatures,
    hasHours,
    hasAddress,
    hasGallery,
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const theme =
    propTheme || businessThemes[business.theme] || businessThemes["editorial"];
  const safeAddress = fullAddress || business.address;
  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];

  const videos = Array.isArray(business.videos) // 🚀 PUXANDO OS VÍDEOS
    ? business.videos.filter(Boolean)
    : [];
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  // LISTA INTELIGENTE DE LOJAS
  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-3 h-3 md:w-4 md:h-4" />,
      url: business.mercadoLivre,
      hoverClass: "hover:border-[#FFE600] hover:text-[#FFE600]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-3 h-3 md:w-4 md:h-4" />,
      url: business.shopee,
      hoverClass: "hover:border-[#EE4D2D] hover:text-[#EE4D2D]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-3 h-3 md:w-4 md:h-4" />,
      url: business.ifood,
      hoverClass: "hover:border-[#EA1D2C] hover:text-[#EA1D2C]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-3 h-3 md:w-4 md:h-4" />,
      url: business.shein,
      hoverClass: `hover:border-current hover:${theme.primary}`,
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const safeSetIndex = useCallback(
    (next: number) => {
      if (gallery.length === 0) return;
      setSelectedIndex((next + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      const rawNumber =
        type === "whatsapp" ? business.whatsapp : business.phone;
      const cleanNumber = (rawNumber || "").replace(/\D/g, "");
      if (!cleanNumber) return;

      const numberWithDDI = cleanNumber.startsWith("55")
        ? cleanNumber
        : `55${cleanNumber}`;
      const message = `Olá! Vi o perfil de ${business?.name || "sua empresa"} no Tafanu.`;
      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${numberWithDDI}?text=${encodeURIComponent(message)}`
          : `tel:${cleanNumber}`;
      try {
        // 🚀 O NOVO ESPIÃO ENTRA AQUI!
        await Actions.registerClickEvent(business.id, type.toUpperCase());
      } finally {
        window.location.href = targetUrl;
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? "hidden" : "unset";
  }, [selectedIndex]);

  // --- PREPARAÇÃO DO ENDEREÇO PARA O MAPA ---
  const addressPartsForMap = [
    business.address,
    business.number,
    business.neighborhood,
    business.city,
    business.state,
    business.cep,
  ].filter(Boolean);

  const completeAddressForMap = addressPartsForMap.join(", ");

  const mapDestination =
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : completeAddressForMap;

  // URL Oficial de Rotas: Força a Origem ser o GPS do cliente e o Destino ser a loja
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapDestination)}`;
  // ------------------------------------------

  if (!theme) return null;

  return (
    <div
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-serif pb-0 overflow-x-hidden transition-colors duration-1000`}
    >
      {/* --- HEADER LUXE: THE EXHIBITION --- */}
      <header
        className={`relative w-full min-h-[65vh] md:min-h-[75vh] flex flex-col items-center justify-center overflow-hidden ${theme.bgPage} border-b ${theme.border}`}
      >
        {/* Grid Arquitetônico */}
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-black/10 to-transparent" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-y-1/2" />
        </div>

        {/* Marca d'água Monumental */}
        {business.name && (
          <div
            className="absolute top-0 left-[-5%] text-[60vh] md:text-[80vh] leading-none font-serif italic select-none pointer-events-none opacity-[0.02] -z-0"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Pílula de Ações */}
        <div className="absolute top-6 right-6 z-30">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl px-4 py-2 rounded-full border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:bg-white/90">
            <button
              onClick={() => handleShare(business.name)}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-slate-900"
            >
              <Share2 size={16} strokeWidth={1.5} />
            </button>
            <div className="w-[1px] h-4 bg-black/10" />
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center mt-16 md:mt-24">
          {/* Overline Elegante (Sem palavras fixas, apenas a cidade se existir) */}
          {business.city && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex items-center gap-6 mb-8 md:mb-10"
            >
              <div className="w-12 md:w-24 h-[1px] bg-black/20" />
              <span className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-bold opacity-60">
                {business.city}
              </span>
              <div className="w-12 md:w-24 h-[1px] bg-black/20" />
            </motion.div>
          )}

          {/* A Logo (Agora ACIMA do texto para manter a leitura impecável) */}
          {business.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-20 flex flex-col items-center group mb-8 md:mb-12"
            >
              {/* Anéis de energia gravitacional */}
              <div className="absolute -inset-6 md:-inset-10 border border-black/10 rounded-full scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out" />
              <div className="absolute -inset-2 md:-inset-4 border border-black/5 rounded-full scale-100 group-hover:scale-[1.15] transition-transform duration-700 ease-out delay-75" />

              {/* Contêiner da Imagem */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-white bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative">
                <img
                  src={business.imageUrl}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s]"
                  alt={`Logo de ${business.name}`}
                />
              </div>
            </motion.div>
          )}

          {/* O Nome (Destaque absoluto, totalmente legível) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', serif",
            }}
            className={`text-[clamp(3rem,8vw,8rem)] font-normal uppercase tracking-[0.05em] md:tracking-[0.1em] leading-[0.9] text-center ${theme.textColor} relative z-30 drop-shadow-sm px-4`}
          >
            {business.name}
          </motion.h1>

          {/* Linha de ancoragem inferior que liga o header ao resto do site */}
          <div className="w-[1px] h-16 md:h-24 bg-gradient-to-b from-black/20 to-transparent mt-12 md:mt-16" />
        </div>
      </header>

      <main className="relative z-10 px-4 container mx-auto max-w-7xl pb-20 pt-16">
        {/* STORY & QUOTE (Layout Elegante Invertido - Ajustado) */}
        {(hasDescription || business.luxe_quote) && (
          <section className="pt-8 pb-12 md:pt-10 md:pb-16 border-b border-black/5 px-4 md:px-0 overflow-hidden">
            <div
              className={`w-full max-w-7xl mx-auto ${
                business.luxe_quote && hasDescription
                  ? "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
                  : "flex flex-col items-center text-center max-w-5xl mx-auto"
              }`}
            >
              {/* LADO ESQUERDO: O Texto Editorial */}
              {hasDescription && (
                <div
                  className={`flex flex-col ${business.luxe_quote ? "md:col-span-7 text-left md:border-r border-black/10 md:pr-12" : "items-center text-center"}`}
                >
                  <span
                    className={`text-xs md:text-sm uppercase tracking-[0.4em] font-bold block mb-4 md:mb-6 opacity-80 ${theme.primary}`}
                  >
                    Editorial
                  </span>

                  {/* Linha divisória charmosa */}
                  <div
                    className={`w-12 h-[1px] ${theme.bgAction} mb-6 md:mb-8 opacity-50 ${!business.luxe_quote ? "mx-auto" : ""}`}
                  />

                  <p className="text-lg md:text-xl font-light leading-relaxed opacity-90 whitespace-pre-wrap break-words">
                    {business.description}
                  </p>
                </div>
              )}

              {/* LADO DIREITO: A Frase de Impacto (Centralizada e Expandida) */}
              {business.luxe_quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                  /* 🚀 Removi o md:text-right e deixei text-center total, sem paddings laterais */
                  className={`relative z-0 ${!hasDescription ? "text-center" : "md:col-span-5 text-center mt-12 md:mt-0 px-0"}`}
                >
                  {/* Ícone de Aspas - Posicionado para não roubar espaço do texto */}
                  <Quote
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 md:-top-10 md:right-[-20px] md:left-auto md:translate-x-0 w-20 h-20 md:w-32 md:h-32 opacity-5 ${theme.primary} -z-10`}
                  />

                  <h2
                    /* 🚀 Fonte em 4xl (menor como pedido) e leading-[1.2] para o texto respirar e expandir */
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-serif italic leading-[1.2] opacity-95 ${theme.primary} w-full inline-block px-0`}
                  >
                    "{business.luxe_quote}"
                  </h2>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* FEATURES (Mobile 2 Colunas, Desktop Flex Centralizado) - APENAS UMA VEZ AGORA! */}
        {hasFeatures && (
          <section className="py-16 md:py-24 border-b border-black/5 px-4 md:px-0">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              {/* Título Elegante da Seção */}
              <div className="text-center mb-12 md:mb-16">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-bold block mb-4 opacity-90">
                  Exclusividade
                </span>
                <h3
                  className={`text-4xl md:text-5xl lg:text-6xl font-serif italic mb-6 opacity-90 ${theme.primary}`}
                >
                  Destaques
                </h3>
                <div
                  className={`w-12 h-[1px] ${theme.bgAction} mx-auto opacity-30`}
                />
              </div>

              {/* grid no mobile, flex no desktop */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:flex-wrap md:justify-center md:gap-6 w-full">
                {rawBusiness.features
                  .filter((f: string) => f.trim() !== "")
                  .map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center text-center w-full md:w-[220px] lg:w-[240px] min-h-[90px] sm:min-h-[100px] md:min-h-[130px] p-3 sm:p-4 md:p-8 rounded-2xl md:rounded-3xl bg-white/40 backdrop-blur-md border border-black/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] hover:bg-white/80 transition-all duration-500 cursor-default group"
                    >
                      <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] font-semibold opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed md:leading-loose text-balance break-words">
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* GALERIA */}
        {hasGallery && (
          <section className="py-24 border-b border-black/5">
            <div className="text-center mb-16">
              <h3
                className={`text-4xl md:text-7xl font-serif italic mb-4 ${theme.primary}`}
              >
                Curadoria Visual
              </h3>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
                Portfolio
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ y: -10 }}
                  className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded-sm bg-neutral-100 shadow-md"
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-110"
                    alt="Galeria"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 🚀 SEÇÃO DE VÍDEOS EMBED (ESTILO LUXE) */}
        {videos.length > 0 && (
          <section className="py-24 border-b border-black/5">
            <div className="text-center mb-16">
              <h3
                className={`text-4xl md:text-6xl font-serif italic mb-4 ${theme.primary}`}
              >
                Motion & Experiência
              </h3>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 flex items-center justify-center gap-2">
                <Video size={14} /> Cinema
              </span>
            </div>

            <div
              className={`grid gap-12 max-w-6xl mx-auto px-4 ${videos.some((v: string) => v.includes("shorts") || v.includes("instagram") || v.includes("tiktok")) ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}
            >
              {videos.map((vid: string, i: number) => (
                <VideoEmbed key={i} url={vid} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ (Ajustado: Menos espaço superior e Título Editorial) */}
        {hasFaqs && (
          <section className="pt-10 pb-24 md:pt-16 md:pb-32 border-b border-black/5 max-w-5xl mx-auto px-4 md:px-0">
            {/* Título Padronizado (Estilo Editorial) */}
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-bold block mb-4 opacity-90">
                Informações
              </span>
              <h3
                className={`text-4xl md:text-6xl font-serif italic mb-6 opacity-95 ${theme.primary}`}
              >
                Perguntas
              </h3>
              <div
                className={`w-12 h-[1px] ${theme.bgAction} mx-auto opacity-30`}
              />
            </div>

            {/* Grid de Acordeons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 items-start">
              {faqs.map((f: any, i: number) => (
                <LuxeAccordion
                  key={i}
                  q={f.q || f.question}
                  a={f.a || f.answer}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}
        {/* CONTATO & PRESENÇA (True Colors & Full Schedule) */}
        <section className="pt-24 pb-12">
          <div
            className={`p-8 md:p-16 ${theme.bgSecondary} border ${theme.border} rounded-[3rem] shadow-2xl`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
              {/* BLOCO 1: CONEXÃO (Cores Reais) */}
              <div className="space-y-10 md:border-r border-black/5 md:pr-8">
                {/* 👇 A CIRURGIA É SÓ ESTA LINHA AQUI */}
                {(hasWhatsapp || hasPhone) && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                      Concierge
                    </span>
                    <div className="space-y-6">
                      {hasWhatsapp && (
                        <button
                          onClick={() => handleTrackLead("whatsapp")}
                          className="flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                            <MessageCircle size={18} fill="currentColor" />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-widest text-[#25D366]">
                            WhatsApp Direct
                          </span>
                        </button>
                      )}
                      {hasPhone && (
                        <button
                          onClick={() => handleTrackLead("phone")}
                          className="flex items-center gap-4 group"
                        >
                          <div
                            className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-transform group-hover:scale-110`}
                          >
                            <PhoneCall size={18} className="text-slate-600" />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-widest opacity-70">
                            {formatPhoneNumber(business.phone)}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {availableSocials.length > 0 && (
                  <div className="pt-6">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block mb-4">
                      Social Media
                    </span>
                    <div className="flex gap-4 flex-wrap">
                      {availableSocials.map((s) => {
                        const username = business[s];
                        if (!username) return null;

                        const isUrl =
                          username.startsWith("http") ||
                          username.startsWith("www");
                        const finalUrl = isUrl
                          ? username.startsWith("http")
                            ? username
                            : `https://${username}`
                          : s === "instagram"
                            ? `https://instagram.com/${username.replace("@", "")}`
                            : s === "facebook"
                              ? `https://facebook.com/${username}`
                              : s === "tiktok"
                                ? `https://tiktok.com/@${username.replace("@", "")}`
                                : formatExternalLink(username);

                        const colors: any = {
                          instagram:
                            "text-[#E4405F] border-[#E4405F]/20 bg-[#E4405F]/5",
                          facebook:
                            "text-[#1877F2] border-[#1877F2]/20 bg-[#1877F2]/5",
                          tiktok: "text-black border-black/20 bg-black/5",
                          website:
                            "text-blue-500 border-blue-500/20 bg-blue-500/5",
                        };

                        return (
                          <a
                            key={s}
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            // 🚀 ESPIÃO ADICIONADO: Agora contabiliza redes e sites!
                            onClick={() => {
                              try {
                                Actions.registerClickEvent(
                                  business.id,
                                  s.toUpperCase(),
                                );
                              } catch (e) {}
                            }}
                            className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all hover:scale-110 ${colors[s] || "border-black/10"}`}
                          >
                            {s === "instagram" ? (
                              <Instagram size={20} />
                            ) : s === "facebook" ? (
                              <Facebook size={20} />
                            ) : s === "tiktok" ? (
                              <TikTokIcon className="w-5 h-5" />
                            ) : (
                              <Globe size={20} />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 🚀 BLOCO 2: SÓ APARECE SE TIVER LOJAS CADASTRADAS */}
              {salesChannels.length > 0 && (
                <div className="space-y-8 md:border-r border-black/5 md:px-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                      Boutique Online
                    </span>
                    <div className="flex flex-col gap-3">
                      {salesChannels.map((channel) => {
                        const storeColors: any = {
                          mercadoLivre:
                            "border-[#FFE600] bg-[#FFE600]/10 text-[#2D3277]",
                          shopee:
                            "border-[#EE4D2D] bg-[#EE4D2D]/5 text-[#EE4D2D]",
                          ifood:
                            "border-[#EA1D2C] bg-[#EA1D2C]/5 text-[#EA1D2C]",
                          shein: "border-black bg-black/5 text-black",
                        };
                        return (
                          <a
                            key={channel.key}
                            href={formatExternalLink(channel.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            // 🚀 ESPIÃO ADICIONADO: Agora contabiliza as lojas!
                            onClick={() => {
                              try {
                                Actions.registerClickEvent(
                                  business.id,
                                  channel.key.toUpperCase(),
                                );
                              } catch (e) {}
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 hover:shadow-md ${storeColors[channel.key] || "border-black/5"}`}
                          >
                            <div className="scale-110">{channel.icon}</div>
                            <span className="text-[10px] font-bold tracking-[0.1em] uppercase">
                              {channel.name}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* BLOCO 3: PRESENÇA (Agenda Completa) */}
              <div className="space-y-10 md:pl-8">
                {hasAddress && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                      Localização
                    </span>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        Actions.registerClickEvent(business.id, "MAP")
                      }
                      className="group block"
                    >
                      {/* Rua e Número */}
                      <p className="text-lg font-serif italic leading-snug capitalize group-hover:underline opacity-90">
                        {business.address || "Endereço não cadastrado"}
                        {business.number &&
                          !business.address?.includes(business.number) &&
                          `, ${business.number}`}
                      </p>

                      {/* Complemento */}
                      {business.complement && (
                        <p className="text-sm font-sans font-light opacity-80 mt-1">
                          {business.complement}
                        </p>
                      )}

                      {/* Bairro, Cidade, Estado e CEP */}
                      <p className="text-[10px] opacity-50 mt-3 uppercase tracking-widest leading-relaxed">
                        {business.neighborhood && `${business.neighborhood} • `}
                        {business.city}{" "}
                        {business.state ? `— ${business.state}` : ""}
                        {business.cep && ` • CEP: ${business.cep}`}
                      </p>
                    </a>
                  </div>
                )}
                {hasHours && (
                  <div className="pt-6">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                      Agenda Semanal
                    </span>
                    <div className="space-y-3">
                      {realHours.map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center border-b border-black/5 pb-2 last:border-0"
                        >
                          {/* Dia da semana: Maior e menos opaco */}
                          <span className="text-xs md:text-sm uppercase tracking-widest font-medium opacity-70">
                            {h.day}
                          </span>

                          {/* Horário: Serifado, Itálico e com Destaque */}
                          <span
                            className={`text-sm md:text-base font-serif italic ${h.isClosed ? "text-rose-500 font-bold" : "opacity-90 font-semibold"}`}
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- REPORTAR (DISCRETO) --- */}
        <div className="w-full flex justify-center py-12 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>

        {/* --- SEÇÃO DE AVALIAÇÕES (FINAL DA PÁGINA) --- */}
        <div className="max-w-4xl mx-auto w-full pb-20">
          <CommentsSection
            businessId={rawBusiness.id}
            businessOwnerId={rawBusiness.userId}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            emailVerified={emailVerified}
            themeColor={theme.primary}
            comments={rawBusiness.comments || []}
          />
        </div>

        <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />
      </main>

      {/* WHATSAPP FLUTUANTE (z-30 para o Nav) */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.2 }}
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl z-30 ring-4 ring-white/20`}
        >
          <MessageCircle size={32} strokeWidth={1.5} fill="currentColor" />
        </motion.button>
      )}

      {/* LIGHTBOX (z-200) */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/98 md:backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white z-[210] hover:scale-110 transition-transform">
              <X size={40} strokeWidth={1} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white z-[220]"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white z-[220]"
              >
                <ChevronRight size={40} />
              </button>
              {gallery[selectedIndex] && (
                <motion.img
                  key={selectedIndex}
                  src={gallery[selectedIndex]}
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                    else if (info.offset.x < -80)
                      safeSetIndex(selectedIndex + 1);
                  }}
                  className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div
              className="h-40 w-full flex items-center justify-start md:justify-center gap-4 px-10 pb-10 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-28 rounded-sm overflow-hidden border transition-all snap-center ${selectedIndex === idx ? "border-white scale-110 opacity-100" : "border-transparent opacity-30"}`}
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    alt="Thumb"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
