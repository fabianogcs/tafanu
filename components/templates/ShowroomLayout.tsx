"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image"; // ✅ ADICIONE ESTA LINHA AQUI
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Heart,
  Share2,
  X,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Camera,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Video,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// --- HELPERS E ÍCONES ---
const TikTokIcon = ({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={color || "currentColor"}>
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

// --- 🚀 MOTOR DE VÍDEOS (EMBUTIDO PARA O CARD PADRÃO SHOWROOM) ---
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
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
      }
    } else if (url.includes("instagram.com")) {
      const cleanUrl = url.split("?")[0].replace(/\/$/, "");
      embedUrl = `${cleanUrl}/embed`;
      isInstagram = true;
    } else if (url.includes("tiktok.com")) {
      const videoId = url.split("/video/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
      }
    }
  } catch (e) {}

  if (!embedUrl) return null;

  if (!isLoaded) {
    return (
      <button
        aria-label="Carregar e reproduzir vídeo"
        onClick={() => setIsLoaded(true)}
        className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto rounded-3xl cursor-pointer group border border-white/10"
      >
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-xl">
          <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[20px] border-l-white ml-2"></div>
        </div>
        <span className="text-white/50 text-[10px] mt-4 font-bold uppercase tracking-widest group-hover:text-white/80 transition-colors">
          Toque para carregar
        </span>
      </button>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto rounded-3xl">
      <iframe
        src={embedUrl}
        title="Vídeo de demonstração do negócio"
        aria-label="Reprodutor de vídeo"
        className={`w-full ${isInstagram ? "h-[calc(100%+80px)] -mt-10" : "h-full"} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
};

// 🚀 COMPONENTE MÁGICO: THE MASTER RUNWAY (Design Showroom: Minimalista, rounded-3xl)
const MasterRunway = ({ feed, setSelectedIndex, theme }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -350 : 350,
        behavior: "smooth",
      });
  };
  const arrowClass = `hidden lg:flex absolute top-[50%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white border border-black/10 rounded-full shadow-xl opacity-0 group-hover/runway:opacity-100 transition-all hover:scale-110 text-slate-800`;

  return (
    <div className="relative group/runway w-full">
      <button
        aria-label="Rolar galeria para a esquerda"
        onClick={() => scroll("left")}
        className={`${arrowClass} -left-6`}
      >
        <ChevronLeft size={28} />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-4 md:gap-6 overflow-x-auto snap-x no-scrollbar pb-8 pt-2 scroll-smooth px-1"
      >
        {feed.map((item: any, i: number) => {
          // 🚀 PADRÃO SHOWROOM: rounded-3xl e shadow super clean
          const cardBaseClasses = `shrink-0 snap-center w-[220px] sm:w-[280px] md:w-[320px] aspect-[4/5] rounded-3xl overflow-hidden relative border ${theme.border} bg-black/5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lg group`;

          if (item.type === "image") {
            return (
              <motion.div
                key={`img-${i}`}
                onClick={() => setSelectedIndex(item.lightboxIndex)}
                whileHover={{ scale: 0.98 }}
                className={`${cardBaseClasses} cursor-pointer`}
                role="button"
                tabIndex={0}
                aria-label="Abrir imagem em tela cheia"
              >
                {/* ✅ TAG IMAGE OTIMIZADA PARA O CATÁLOGO */}
                <Image
                  src={item.url}
                  alt="Vitrine"
                  fill
                  quality={60}
                  sizes="(max-width: 768px) 250px, 350px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus size={32} className="text-white" />
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
        aria-label="Rolar galeria para a direita"
        onClick={() => scroll("right")}
        className={`${arrowClass} -right-6`}
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

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
    toast.success("Link copiado para a área de transferência!");
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

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${theme.border} transition-all duration-300`}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Alternar visualização da resposta"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left gap-4 outline-none bg-transparent"
      >
        <span
          className={`text-sm md:text-base font-semibold ${isOpen ? "opacity-100" : "opacity-70"}`}
        >
          {q}
        </span>
        <Plus
          size={18}
          className={`shrink-0 transition-transform duration-300 opacity-50 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-6 text-sm md:text-base leading-relaxed opacity-60">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "motion">(
    "all",
  );

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
      colorClass: "hover:text-[#2D3277] hover:bg-[#FFE600]/10",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      colorClass: "hover:text-[#EE4D2D] hover:bg-[#EE4D2D]/10",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      colorClass: "hover:text-[#EA1D2C] hover:bg-[#EA1D2C]/10",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      colorClass: "hover:text-black hover:bg-black/10",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  // 🚀 EXTRAÇÃO INTELIGENTE DO FEED PARA O SHOWROOM
  const rawFeed = useMemo(() => {
    if (business.mediaFeed && business.mediaFeed.length > 0) {
      return business.mediaFeed;
    }
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

  // Limpa links vazios e indexa as imagens pro Lightbox não quebrar
  const cleanFeed = useMemo(() => {
    let imgIndexCounter = 0;
    return rawFeed
      .filter(
        (item: any) =>
          item && typeof item.url === "string" && item.url.trim() !== "",
      )
      .map((item: any) => {
        if (item.type === "image") {
          return { ...item, lightboxIndex: imgIndexCounter++ };
        }
        return item;
      });
  }, [rawFeed]);

  // Lista pura de imagens pro Lightbox (Modal tela cheia)
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
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- HEADER CORPORATIVO (Ultrawide) --- */}
      <header className={`pt-12 md:pt-20 pb-10 border-b ${theme.border}`}>
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {business.imageUrl && (
            <div
              className={`w-28 h-28 md:w-40 md:h-40 rounded-3xl border ${theme.border} shadow-sm overflow-hidden bg-white shrink-0`}
            >
              {/* ✅ TAG IMAGE OTIMIZADA (Com priority para carregar rápido!) */}
              <div className="relative w-full h-full">
                <Image
                  src={business.imageUrl}
                  alt={`Logotipo de ${business.name}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight leading-none mb-1">
              {business.name}
            </h1>

            {business.comercial_badge && (
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-60 border border-black/10 px-4 py-1.5 rounded-md inline-block mb-2">
                {business.comercial_badge}
              </span>
            )}

            <div className="flex items-center gap-3 pt-5">
              <button
                aria-label="Compartilhar perfil ou copiar link"
                onClick={() => handleShare(business.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border ${theme.border} hover:bg-black/5 transition-colors text-xs font-bold uppercase tracking-wider`}
              >
                <Share2 size={16} /> Compartilhar
              </button>
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full border ${theme.border} hover:bg-black/5 transition-colors`}
              >
                <FavoriteButton
                  businessId={business.id}
                  isLoggedIn={isLoggedIn}
                  initialIsFavorited={isFavorited}
                  emailVerified={emailVerified}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- ESTRUTURA DE COLUNAS REFEITA (Tudo Integrado no Fluxo de 8/4) --- */}
      <main className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">
          {/* COLUNA ESQUERDA (Principal: Info -> Fotos -> Vídeos -> FAQ) */}
          <div className="lg:col-span-8 flex flex-col gap-16 md:gap-24 w-full min-w-0">
            {/* Descrição e Destaques */}
            {(hasDescription || hasFeatures) && (
              <section className="space-y-8">
                {hasDescription && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
                      Sobre a Empresa
                    </h2>
                    <p className="text-base md:text-xl font-normal leading-relaxed opacity-90 whitespace-pre-line break-words max-w-4xl">
                      {business.description}
                    </p>
                  </div>
                )}

                {hasFeatures && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {business.features
                      .filter(Boolean)
                      .map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2
                            size={18}
                            className={`shrink-0 ${theme.primary} opacity-60`}
                          />
                          <span className="text-sm md:text-base font-semibold opacity-90">
                            {f}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            )}

            {/* 🚀 THE MASTER RUNWAY (Mídia Unificada SHOWROOM) */}
            {cleanFeed.length > 0 &&
              (() => {
                const filteredFeed = cleanFeed.filter((item: any) => {
                  if (mediaFilter === "all") return true;
                  if (mediaFilter === "photos") return item.type === "image";
                  if (mediaFilter === "motion")
                    return (
                      item.type === "video" ||
                      item.type === "video_v" ||
                      item.type === "video_h"
                    );
                  return true;
                });

                if (filteredFeed.length === 0) return null;

                return (
                  <section className="w-full min-w-0 pt-2 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
                      <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                        <Camera size={14} /> Catálogo Visual
                      </h2>

                      {/* Capsula Switch (Showroom Style Minimalista) */}
                      <div
                        className={`flex items-center p-1 bg-white/50 backdrop-blur-md border ${theme.border} rounded-full shadow-sm`}
                      >
                        <button
                          onClick={() => setMediaFilter("all")}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "all" ? "bg-black/10 opacity-100" : "opacity-50 hover:opacity-100"}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setMediaFilter("photos")}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "photos" ? "bg-black/10 opacity-100" : "opacity-50 hover:opacity-100"}`}
                        >
                          Photos
                        </button>
                        <button
                          onClick={() => setMediaFilter("motion")}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "motion" ? "bg-black/10 opacity-100" : "opacity-50 hover:opacity-100"}`}
                        >
                          Motion
                        </button>
                      </div>
                    </div>

                    <MasterRunway
                      key={mediaFilter}
                      feed={filteredFeed}
                      setSelectedIndex={setSelectedIndex}
                      theme={theme}
                    />
                  </section>
                );
              })()}

            {/* FAQ Minimalista Integrado */}
            {hasFaqs && (
              <section className="w-full">
                <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                  <HelpCircle size={14} /> Dúvidas Frequentes
                </h2>
                <div className="flex flex-col max-w-4xl">
                  {faqs.map((f: any, i: number) => (
                    <AccordionItem
                      key={i}
                      q={f.q || f.question}
                      a={f.a || f.answer}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* COLUNA DIREITA (Sidebar Comercial Clean) */}
          <div className="lg:col-span-4 space-y-8 sticky top-10">
            {/* 🚀 ATENDIMENTO & LOJAS UNIFICADOS */}
            {(hasWhatsapp || hasPhone || availableSocials.length > 0) && (
              <div
                className={`p-8 md:p-10 rounded-[2rem] border ${theme.border} ${theme.cardBg} shadow-sm space-y-8`}
              >
                <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
                  Atendimento Rápido
                </h2>

                <div className="space-y-4">
                  {hasWhatsapp && (
                    <button
                      aria-label="Atendimento via WhatsApp"
                      onClick={() => handleTrackLead("whatsapp")}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors group border border-emerald-100"
                    >
                      <div className="flex items-center gap-4">
                        <MessageCircle size={22} />
                        <span className="text-sm font-bold">
                          Chamar no WhatsApp
                        </span>
                      </div>
                      <ChevronRight
                        size={18}
                        className="opacity-40 group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  )}

                  {hasPhone && (
                    <button
                      aria-label="Ligar para a empresa"
                      onClick={() => handleTrackLead("phone")}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border ${theme.border} hover:bg-black/5 transition-colors group`}
                    >
                      <div className="flex items-center gap-4">
                        <PhoneCall size={22} className="opacity-60" />
                        <span className="text-sm font-bold opacity-90">
                          {formatPhoneNumber(business.phone)}
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {availableSocials.length > 0 && (
                  <div className="pt-6 border-t border-black/5 flex justify-center gap-5">
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

                      return (
                        <a
                          key={s}
                          href={finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visitar perfil no ${s}`}
                          onClick={() =>
                            Actions.registerClickEvent(
                              business.id,
                              s.toUpperCase(),
                            )
                          }
                          className={`w-12 h-12 rounded-full border ${theme.border} flex items-center justify-center hover:bg-black/5 transition-colors opacity-70 hover:opacity-100`}
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
                )}
              </div>
            )}
            {/* Canais de Vendas Oficiais */}
            {salesChannels.length > 0 && (
              <div
                className={`p-8 md:p-10 rounded-[2rem] border ${theme.border} ${theme.cardBg} shadow-sm`}
              >
                <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-6 text-center">
                  Lojas Oficiais
                </h2>
                <div className="flex flex-col gap-3">
                  {salesChannels.map((channel) => (
                    <a
                      key={channel.key}
                      href={formatExternalLink(channel.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Comprar na loja ${channel.name}`}
                      onClick={() =>
                        Actions.registerClickEvent(
                          business.id,
                          channel.key.toUpperCase(),
                        )
                      }
                      className={`flex items-center gap-4 p-4 rounded-xl border ${theme.border} transition-all font-sans group opacity-80 hover:opacity-100 hover:shadow-md ${channel.colorClass}`}
                    >
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        {channel.icon}
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase">
                        {channel.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Endereço Seguro e Oficial */}
            {hasAddress && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização no Google Maps"
                onClick={() => Actions.registerClickEvent(business.id, "MAP")}
                className={`block p-8 md:p-10 rounded-[2rem] border ${theme.border} ${theme.cardBg} shadow-sm hover:border-black/20 transition-colors group`}
              >
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  <MapPin size={18} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">
                    Localização
                  </h2>
                </div>

                <p className="text-base font-bold leading-relaxed mb-1 opacity-90 break-words">
                  {business.address || "Endereço não cadastrado"}
                  {business.number &&
                    !business.address?.includes(business.number) &&
                    `, ${business.number}`}
                </p>

                {business.complement && (
                  <p className="text-xs font-medium opacity-70 mb-2">
                    {business.complement}
                  </p>
                )}

                <p className="text-[11px] uppercase tracking-widest opacity-50 mt-4">
                  {business.neighborhood && `${business.neighborhood} • `}
                  {business.city} {business.state ? `— ${business.state}` : ""}
                  {business.cep && ` • CEP: ${business.cep}`}
                </p>
              </a>
            )}

            {/* Horários */}
            {hasHours && (
              <div
                className={`p-8 md:p-10 rounded-[2rem] border ${theme.border} ${theme.cardBg} shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  <Clock size={18} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">
                    Horários
                  </h2>
                </div>
                <div className="space-y-3">
                  {safeHours.map((h: any, i: number) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center text-sm pb-3 border-b border-black/5 last:border-0 last:pb-0`}
                    >
                      <span className="font-semibold opacity-60 uppercase text-[11px] tracking-wider">
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
        </div>
      </main>

      {/* --- SEÇÃO FINAL (Avaliações e Report) --- */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12 pb-20 mt-10">
        <div className="w-full flex justify-center py-10 opacity-30 hover:opacity-100 transition-opacity">
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

      <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />

      {/* WHATSAPP FLUTUANTE (Discreto no canto) */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp Flutuante"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-30 w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-4 border-white/50 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle
            className="w-8 h-8 md:w-10 md:h-10"
            fill="currentColor"
          />
        </motion.button>
      )}

      {/* LIGHTBOX DE ALTA PERFORMANCE (APENAS PARA FOTOS) */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              aria-label="Fechar galeria"
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[210]"
            >
              <X size={32} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-10">
              <button
                aria-label="Imagem anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-14 h-14 items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                aria-label="Próxima imagem"
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
                  loading="eager"
                  decoding="async"
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
                  className={`max-w-full max-h-[70vh] object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-2xl`}
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
                  aria-label={`Ver miniatura ${idx + 1}`}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 snap-center ${selectedIndex === idx ? "ring-2 ring-white scale-105 opacity-100" : "opacity-40 hover:opacity-100"}`}
                >
                  {/* ✅ MINIATURAS OTIMIZADAS */}
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
