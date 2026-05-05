"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Share2,
  X,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Navigation,
  Info,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// ==========================================
// 1. ÍCONES
// ==========================================
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
  </svg>
);

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

// ==========================================
// 2. COMPONENTES DE MÍDIA
// ==========================================
const VideoEmbed = ({ url }: { url: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  let embedUrl = "";
  let isInstagram = false;

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.includes("shorts/")
          ? url.split("shorts/")[1]?.split("?")[0]
          : new URL(url).searchParams.get("v");
      if (videoId)
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
    } else if (url.includes("instagram.com")) {
      const cleanUrl = url.split("?")[0].replace(/\/$/, "");
      embedUrl = `${cleanUrl}/embed`;
      isInstagram = true;
    } else if (url.includes("tiktok.com")) {
      const videoId = url.split("/video/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    }
  } catch (e) {}

  if (!embedUrl) return null;

  if (!isLoaded) {
    return (
      <button
        aria-label="Carregar e reproduzir vídeo"
        onClick={() => setIsLoaded(true)}
        className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto rounded-2xl cursor-pointer group border border-white/10 hover:border-white/30 transition-all duration-300"
      >
        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-xl">
          <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white ml-1"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto rounded-2xl">
      <iframe
        src={embedUrl}
        className={`w-full ${isInstagram ? "h-[calc(100%+80px)] -mt-10" : "h-full"} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
};

// Galeria (MasterRunway) Otimizada e com setas no Desktop
const MasterRunway = ({ feed, setSelectedIndex, theme }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Função de Scroll Lateral
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const arrowClass = `hidden lg:flex absolute top-[40%] -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white/80 backdrop-blur-md border border-black/10 rounded-full shadow-lg opacity-0 group-hover/runway:opacity-100 transition-all hover:scale-110 hover:bg-white text-slate-800`;

  return (
    <div className="relative group/runway w-full mt-4">
      {/* Setas (Visíveis apenas em Desktop no hover) */}
      <button
        aria-label="Rolar para a esquerda"
        onClick={() => scroll("left")}
        className={`${arrowClass} -left-5`}
      >
        <ChevronLeft size={24} />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto snap-x no-scrollbar pb-4 scroll-smooth px-1"
      >
        {feed.map((item: any, i: number) => {
          const cardBaseClasses = `shrink-0 snap-center w-[140px] sm:w-[180px] md:w-[220px] aspect-square rounded-2xl overflow-hidden relative border ${theme.border} bg-black/5 shadow-sm transition-transform duration-300 hover:-translate-y-1 group`;

          if (item.type === "image") {
            return (
              <motion.div
                key={`img-${i}`}
                onClick={() => setSelectedIndex(item.lightboxIndex)}
                className={`${cardBaseClasses} cursor-pointer`}
                role="button"
                tabIndex={0}
              >
                <Image
                  src={item.url}
                  alt="Vitrine"
                  fill
                  quality={60}
                  sizes="(max-width: 768px) 160px, 280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus size={32} className="text-white drop-shadow-md" />
                </div>
              </motion.div>
            );
          }
          if (
            item.type === "video" ||
            item.type === "video_v" ||
            item.type === "video_h"
          ) {
            return (
              <div key={`vid-${i}`} className={`${cardBaseClasses}`}>
                <VideoEmbed url={item.url} />
              </div>
            );
          }
          return null;
        })}
      </div>

      <button
        aria-label="Rolar para a direita"
        onClick={() => scroll("right")}
        className={`${arrowClass} -right-5`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`border-b ${theme.border} transition-all duration-300 last:border-0`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left gap-4 outline-none bg-transparent group"
      >
        <span className="text-sm font-semibold opacity-90 group-hover:opacity-100">
          {q}
        </span>
        <Plus
          size={16}
          className={`shrink-0 transition-transform duration-300 opacity-50 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-5 text-sm leading-relaxed opacity-70">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 3. UTILITÁRIOS
// ==========================================
const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Confira o perfil de ${businessName}:`,
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

// ==========================================
// 4. LAYOUT PRINCIPAL (Google Meu Negócio Style)
// ==========================================
export default function ShowroomLayout({
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
    realHours: safeHours,
    hasWhatsapp,
    hasPhone,
    hasFaqs,
    hasFeatures,
    hasHours,
    hasAddress,
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["showroom_clean"];

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-5 h-5" />,
      url: business.mercadoLivre,
      colorClass: "text-[#2D3277] bg-[#FFE600]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      colorClass: "text-white bg-[#EE4D2D]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      colorClass: "text-white bg-[#EA1D2C]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      colorClass: "text-white bg-slate-900",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const rawFeed = useMemo(() => {
    if (business.mediaFeed && business.mediaFeed.length > 0)
      return business.mediaFeed;
    const oldGallery = (business.gallery || []).map((url: string) => ({
      type: "image",
      url,
    }));
    const oldVideos = (business.videos || []).map((url: string) => ({
      type: "video",
      url,
    }));
    return [...oldGallery, ...oldVideos];
  }, [business.mediaFeed, business.gallery, business.videos]);

  const cleanFeed = useMemo(() => {
    let imgIndexCounter = 0;
    return rawFeed
      .filter(
        (item: any) =>
          item && typeof item.url === "string" && item.url.trim() !== "",
      )
      .map((item: any) => {
        if (item.type === "image")
          return { ...item, lightboxIndex: imgIndexCounter++ };
        return item;
      });
  }, [rawFeed]);

  const lightboxImages = useMemo(() => {
    return cleanFeed
      .filter((item: any) => item.type === "image")
      .map((item: any) => item.url);
  }, [cleanFeed]);

  const safeSetIndex = useCallback(
    (next: number) => {
      if (lightboxImages.length === 0) return;
      setSelectedIndex((next + lightboxImages.length) % lightboxImages.length);
    },
    [lightboxImages.length],
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
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapDestination)}`;

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- CAPA E TOPO (ESTILO GMB) --- */}
      <div className={`w-full h-40 md:h-56 ${theme.bgHero} relative`}>
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:scale-105 transition-all shadow-sm"
          >
            <Share2 size={18} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:scale-105 transition-all shadow-sm">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative -mt-16 md:-mt-20 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end">
          {business.imageUrl && (
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${theme.border} bg-white shadow-xl overflow-hidden relative shrink-0 z-10`}
            >
              <Image
                src={business.imageUrl}
                alt="Logo"
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">
              {business.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-sm font-medium opacity-70">
                {business.urban_tag || business.city || "Negócio Local"}
              </span>

              {/* Lógica Corrigida para evitar frase duplicada! */}
              {business.comercial_badge &&
                business.comercial_badge !== business.urban_tag && (
                  <>
                    <span className="opacity-40">•</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${theme.primary} flex items-center gap-1`}
                    >
                      <CheckCircle2 size={12} /> {business.comercial_badge}
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS (Barra de Ações Rápidas) --- */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8 border-b border-black/5 pb-8">
          {hasWhatsapp && (
            <button
              onClick={() => handleTrackLead("whatsapp")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full ${theme.bgAction} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
              >
                <MessageCircle size={20} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                WhatsApp
              </span>
            </button>
          )}
          {hasPhone && (
            <button
              onClick={() => handleTrackLead("phone")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full border ${theme.border} ${theme.cardBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <PhoneCall size={20} className={theme.primary} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                Ligar
              </span>
            </button>
          )}
          {hasAddress && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => Actions.registerClickEvent(business.id, "MAP")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full border ${theme.border} ${theme.cardBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Navigation size={20} className={theme.primary} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                Rota
              </span>
            </a>
          )}
        </div>
      </div>

      {/* --- CORPO PRINCIPAL (2 Colunas) --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
        {/* COLUNA ESQUERDA: Visão Geral */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {hasDescription && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                <Info size={18} className={theme.primary} /> Visão Geral
              </h2>
              <p className="text-sm md:text-base leading-relaxed opacity-80 whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {cleanFeed.length > 0 && (
            <div
              className={`p-6 pb-2 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-2 flex items-center gap-2 opacity-90">
                Fotos e Vídeos
              </h2>
              <MasterRunway
                feed={cleanFeed}
                setSelectedIndex={setSelectedIndex}
                theme={theme}
              />
            </div>
          )}

          {hasFeatures && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-4 flex items-center gap-2 opacity-90">
                O que oferecemos
              </h2>
              <div className="flex flex-col gap-3">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* O shrink-0 garante que o ícone nunca perca o seu tamanho original */}
                      <CheckCircle2
                        size={18}
                        className={`shrink-0 ${theme.primary} mt-0.5`}
                        strokeWidth={2.5}
                      />
                      <span className="text-sm font-medium opacity-80">
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasFaqs && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-2 flex items-center gap-2 opacity-90">
                Perguntas Frequentes
              </h2>
              <div className="flex flex-col">
                {faqs.map((f: any, i: number) => (
                  <AccordionItem
                    key={i}
                    q={f.q || f.question}
                    a={f.a || f.answer}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Detalhes Práticos */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
          {(hasAddress || hasHours) && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm flex flex-col gap-6`}
            >
              {hasAddress && (
                <div>
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                    <MapPin size={18} className={theme.primary} /> Endereço
                  </h2>
                  <p className="text-sm font-semibold opacity-90 leading-snug">
                    {business.address || "Endereço não cadastrado"}
                    {business.number &&
                      !business.address?.includes(business.number) &&
                      `, ${business.number}`}
                  </p>
                  {business.complement && (
                    <p className="text-xs font-medium opacity-60 mt-1">
                      {business.complement}
                    </p>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {business.neighborhood && `${business.neighborhood} • `}
                    {business.city}{" "}
                    {business.state ? `— ${business.state}` : ""}
                  </p>

                  {/* Botão de navegação integrado no próprio cartão de endereço */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      Actions.registerClickEvent(business.id, "MAP")
                    }
                    className={`mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl ${theme.bgSecondary} ${theme.primary} border ${theme.border} hover:opacity-80 transition-all`}
                  >
                    <Navigation size={14} /> Traçar Rota
                  </a>
                </div>
              )}

              {hasHours && (
                <div
                  className={`${hasAddress ? "pt-5 border-t border-black/5" : ""}`}
                >
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                    <Clock size={18} className={theme.primary} /> Horários
                  </h2>
                  <div className="space-y-2.5">
                    {safeHours.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs md:text-sm"
                      >
                        <span className="font-semibold opacity-60 capitalize">
                          {h.day}
                        </span>
                        <span
                          className={`font-bold ${h.isClosed ? "text-rose-500" : "opacity-90"}`}
                        >
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Social e Web */}
          {(availableSocials.length > 0 || salesChannels.length > 0) && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm flex flex-col gap-5`}
            >
              {availableSocials.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-3">
                    Redes Sociais
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {availableSocials.map((s) => {
                      const username = business[s];
                      if (!username) return null;
                      const finalUrl =
                        username.startsWith("http") ||
                        username.startsWith("www")
                          ? formatExternalLink(username)
                          : s === "instagram"
                            ? `https://instagram.com/${username.replace("@", "")}`
                            : s === "facebook"
                              ? `https://facebook.com/${username.replace("@", "")}`
                              : s === "tiktok"
                                ? `https://tiktok.com/@${username.replace("@", "")}`
                                : formatExternalLink(username);
                      return (
                        <a
                          key={s}
                          href={finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            Actions.registerClickEvent(
                              business.id,
                              s.toUpperCase(),
                            )
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.bgSecondary} border ${theme.border} hover:opacity-80 transition-opacity`}
                        >
                          {s === "instagram" ? (
                            <Instagram size={14} />
                          ) : s === "facebook" ? (
                            <Facebook size={14} />
                          ) : s === "tiktok" ? (
                            <TikTokIcon className="w-3.5 h-3.5" />
                          ) : (
                            <Globe size={14} />
                          )}
                          <span className="text-xs font-semibold capitalize opacity-80">
                            {s}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {salesChannels.length > 0 && (
                <div
                  className={`${availableSocials.length > 0 ? "pt-4 border-t border-black/5" : ""}`}
                >
                  <h2 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-3">
                    Onde Comprar
                  </h2>
                  <div className="flex flex-col gap-2">
                    {salesChannels.map((channel) => (
                      <a
                        key={channel.key}
                        href={formatExternalLink(channel.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          Actions.registerClickEvent(
                            business.id,
                            channel.key.toUpperCase(),
                          )
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-sans group hover:opacity-90 ${channel.colorClass}`}
                      >
                        <div className="w-5 h-5">{channel.icon}</div>
                        <span className="text-xs font-bold tracking-widest uppercase">
                          {channel.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className="ml-auto opacity-50"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- RODAPÉ --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-20">
        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>
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

      <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />

      {/* --- WHATSAPP FLUTUANTE UNIVERSAL (Estilo App/Flutuante em todas as telas) --- */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle size={28} />
        </motion.button>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[210]">
              <X size={32} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-14 h-14 items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-14 h-14 items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronRight size={28} />
              </button>
              {lightboxImages[selectedIndex] && (
                <motion.img
                  key={selectedIndex}
                  src={lightboxImages[selectedIndex]}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                    else if (info.offset.x < -80)
                      safeSetIndex(selectedIndex + 1);
                  }}
                  className="max-w-full max-h-[70vh] object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-3 px-6 pb-6 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 snap-center ${selectedIndex === idx ? "ring-2 ring-white scale-105 opacity-100" : "opacity-40 hover:opacity-100"}`}
                >
                  <Image
                    src={img || "/og-default.png"}
                    alt="Thumbnail"
                    fill
                    sizes="64px"
                    className="object-cover"
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
