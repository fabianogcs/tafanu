"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image"; // ✅ ADICIONE ESTA LINHA AQUI
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Instagram,
  Facebook,
  Globe,
  X,
  Share2,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// --- HELPERS E ÍCONES ---
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

// --- 🚀 MOTOR DE VÍDEOS (EMBUTIDO PARA O CARD PADRÃO) ---
const VideoEmbed = ({ url }: { url: string }) => {
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
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
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

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto">
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

// 🚀 COMPONENTE MÁGICO: THE MASTER RUNWAY (Tamanho Refinado e Margens Ajustadas)
const MasterRunway = ({
  feed,
  setSelectedIndex,
  themeBorder,
  isLight,
}: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
  };
  const arrowClass = `hidden md:flex absolute top-[50%] -translate-y-1/2 z-20 w-14 h-14 items-center justify-center rounded-full opacity-0 group-hover/runway:opacity-100 transition-all duration-500 hover:scale-105 bg-current/5 border ${themeBorder} text-current backdrop-blur-md shadow-2xl hover:bg-current/10`;

  return (
    <div className="relative group/runway w-full">
      {/* Setas jogadas para fora no desktop para não cobrir o card */}
      <button
        onClick={() => scroll("left")}
        className={`${arrowClass} -left-4 lg:-left-8`}
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-4 md:gap-6 overflow-x-auto snap-x no-scrollbar pb-10 md:pb-16 pt-4 scroll-smooth px-6 md:px-2 lg:px-0"
      >
        {feed.map((item: any, i: number) => {
          // 🚀 PADRÃO DE TAMANHO REDUZIDO E ELEGANTE (Instagram se adapta automaticamente)
          const cardBaseClasses = `shrink-0 snap-center w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[4/5] relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.3)] border-[0.5px] ${themeBorder} transition-all duration-700 hover:-translate-y-2 group bg-black/5`;

          if (item.type === "image") {
            return (
              <motion.div
                key={`img-${i}`}
                onClick={() => setSelectedIndex(item.lightboxIndex)}
                className={`${cardBaseClasses} cursor-pointer`}
              >
                {/* ✅ TAG IMAGE OTIMIZADA PARA O CATÁLOGO */}
                <Image
                  src={item.url}
                  alt="Showcase"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <Plus
                    size={48}
                    className="text-white drop-shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500"
                    strokeWidth={1}
                  />
                </div>
              </motion.div>
            );
          }

          // Se for VÍDEO (Youtube, Reels, Tiktok), usa a exata mesma caixa e proporção
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
        onClick={() => scroll("right")}
        className={`${arrowClass} -right-4 lg:-right-8`}
      >
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>
    </div>
  );
};

const handleShare = async (name: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({ title: name, text: `Experience ${name}:`, url });
      return;
    } catch (err) {}
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard.");
  }
};

const formatPhoneNumber = (phone?: string | null) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  const matchFixo = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchFixo) return `(${matchFixo[1]}) ${matchFixo[2]}-${matchFixo[3]}`;
  return phone || "";
};

const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

// --- ACORDEÃO LUXO ---
const LuxeAccordion = ({ q, a, primary, themeBorder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${themeBorder} transition-all duration-500 py-3`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left gap-6 outline-none bg-transparent group"
      >
        <span
          className={`text-lg md:text-2xl font-serif italic ${isOpen ? primary : "opacity-90"} group-hover:opacity-100 transition-colors`}
        >
          {q}
        </span>
        <div
          className={`w-8 h-8 rounded-full border border-current/10 flex items-center justify-center transition-all duration-500 group-hover:border-current/30 ${isOpen ? primary : ""}`}
        >
          {isOpen ? (
            <Minus size={16} strokeWidth={1.5} />
          ) : (
            <Plus size={16} strokeWidth={1.5} />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-8 pt-2 text-sm md:text-base font-light leading-loose opacity-70 tracking-wide max-w-3xl whitespace-pre-line break-words pl-2">
              {a}
            </div>
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
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "motion">(
    "all",
  );

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme || businessThemes[business?.theme] || businessThemes["luxe_rose"];

  const isLight = ![
    "#0b090a",
    "#000000",
    "#111111",
    "#0a0a0a",
    "#0f0a0c",
    "#020617",
    "#022c22",
    "#170505",
  ].some((c) => theme.bgPage.toLowerCase().includes(c));

  const border = "border-current/10";
  const primary = theme.primary || "text-current";
  const bgAction = theme.bgAction || "bg-current text-white";
  const bgHero = theme.bgHero || theme.bgPage;

  // MATERIAIS DE VIDRO
  const glassBg = isLight ? "bg-white/60" : "bg-black/30";
  const glassBorder = isLight ? "border-black/5" : "border-white/10";
  const cardShadow = isLight
    ? "shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]"
    : "shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)]";

  const addressBase = business?.address || "";
  const hasNumberInAddress =
    business?.number && addressBase.includes(business.number);
  const safeAddress =
    fullAddress ||
    `${addressBase}${!hasNumberInAddress && business?.number ? `, ${business.number}` : ""} ${business?.complement || ""}`;

  // 🚀 EXTRAÇÃO INTELIGENTE DO FEED (Puxa direto do banco a ordem do cliente!)
  const rawFeed = useMemo(() => {
    // Se ele usou o novo painel, pega a ordem que ele fez lá
    if (business.mediaFeed && business.mediaFeed.length > 0) {
      return business.mediaFeed;
    }
    // Se ele é um usuário velho que não atualizou o perfil ainda, junta as fotos e vídeos avulsos
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
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-5 h-5" />,
      url: business.mercadoLivre,
      hover: "hover:text-[#FFE600]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      hover: "hover:text-[#EE4D2D]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      hover: "hover:text-[#EA1D2C]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      hover: "hover:opacity-100",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      const rawNumber =
        type === "whatsapp" ? business.whatsapp : business.phone;
      const cleanNumber = (rawNumber || "").replace(/\D/g, "");
      if (!cleanNumber) return;
      const numberWithDDI = cleanNumber.startsWith("55")
        ? cleanNumber
        : `55${cleanNumber}`;
      const message = `Olá. Gostaria de atendimento via Tafanu para a marca ${business?.name || ""}.`;
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

  const mapDestination =
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : `${business.address || ""}, ${business.city || ""}, ${business.state || ""}`.trim();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapDestination)}`;

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-current selection:text-${isLight ? "white" : "black"} transition-colors duration-1000`}
    >
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-[0] opacity-[0.06] blur-[120px] rounded-full mix-blend-screen"
        style={{
          backgroundColor: theme.previewColor || "currentColor",
        }}
      />

      <header
        className={`relative w-full pt-16 pb-10 md:pt-32 md:pb-24 px-4 md:px-8 flex flex-col items-center justify-center ${bgHero} shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] z-30 min-h-[50vh] md:min-h-[70vh]`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 mix-blend-overlay">
          <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-white/20 blur-[120px]" />
          <div className="absolute -bottom-[50%] -right-[20%] w-[100%] h-[100%] rounded-full bg-black/40 blur-[120px]" />
        </div>

        <div className="absolute top-6 md:top-8 right-4 md:right-8 z-40">
          <div
            className={`flex items-center gap-3 bg-current/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-current/10 backdrop-blur-xl shadow-lg text-current/80 hover:text-current transition-colors`}
          >
            <button
              onClick={() => handleShare(business.name)}
              className="transition-all hover:scale-110"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
            </button>
            <div className="w-[1px] h-4 bg-current/20" />
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>

        <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-5 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-5 md:mb-8 w-full px-2 flex justify-center"
          >
            <span
              className={`inline-block max-w-[95%] text-[9px] md:text-xs font-sans font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase text-current/90 drop-shadow-sm bg-current/5 px-5 py-3 rounded-2xl md:rounded-full border border-current/10 leading-relaxed text-balance`}
            >
              {business.urban_tag || business.city || "Boutique"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-[7rem] font-serif italic tracking-tight text-current leading-[1.05] mb-4 md:mb-8 font-medium px-4 drop-shadow-sm"
          >
            {business.name}
          </motion.h1>

          {hasDescription && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="text-sm md:text-lg font-light text-current/80 max-w-3xl leading-relaxed mb-6 md:mb-10 px-4 text-balance"
            >
              {business.description}
            </motion.p>
          )}

          {business.imageUrl && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              className="relative z-30"
            >
              <div
                className={`w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-current/10 p-1.5 shadow-xl bg-current/5 backdrop-blur-xl`}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {/* ✅ TAG IMAGE OTIMIZADA (Com priority para carregar rápido!) */}
                  <Image
                    src={business.imageUrl}
                    alt="Logo"
                    fill
                    priority
                    sizes="(max-width: 768px) 120px, 150px"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* ==========================================
          🚀 THE MASTER RUNWAY (Vitrine Unificada Padronizada)
          ========================================== */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-12 pt-20 md:pt-32 relative z-20">
        {cleanFeed.length > 0 &&
          (() => {
            // A Lógica do Filtro atuando no Feed
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
              <div className="w-full mb-12 md:mb-24">
                <div className="flex flex-col items-center text-center mb-8 px-4">
                  <h3 className="text-3xl md:text-5xl font-serif italic tracking-tight opacity-90 flex items-center gap-4 mb-8">
                    <Sparkles
                      className={`w-6 h-6 md:w-8 md:h-8 ${primary}`}
                      strokeWidth={1.5}
                    />
                    The Collection
                  </h3>

                  <div className="flex items-center p-1 bg-current/5 border border-current/10 rounded-full backdrop-blur-md">
                    <button
                      onClick={() => setMediaFilter("all")}
                      className={`px-5 md:px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "all" ? bgAction : "text-current/50 hover:text-current"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMediaFilter("photos")}
                      className={`px-5 md:px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "photos" ? bgAction : "text-current/50 hover:text-current"}`}
                    >
                      Photos
                    </button>
                    <button
                      onClick={() => setMediaFilter("motion")}
                      className={`px-5 md:px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "motion" ? bgAction : "text-current/50 hover:text-current"}`}
                    >
                      Motion
                    </button>
                  </div>
                </div>

                <div className="w-full">
                  <MasterRunway
                    key={mediaFilter}
                    feed={filteredFeed}
                    setSelectedIndex={setSelectedIndex}
                    themeBorder={border}
                    isLight={isLight}
                  />
                </div>
              </div>
            );
          })()}
      </section>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-20 flex flex-col gap-24 md:gap-32 relative z-10 border-t border-current/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div className="lg:col-span-7 flex flex-col gap-20 md:gap-32 w-full min-w-0">
            {hasFeatures && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90 pb-6 border-b border-current/10">
                  Signatures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {business.features
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <Sparkles
                          size={18}
                          className={`shrink-0 mt-0.5 opacity-40 ${primary} group-hover:opacity-100 transition-opacity`}
                          strokeWidth={1.5}
                        />
                        <span className="font-light text-base md:text-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {f}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.section>
            )}

            {hasFaqs && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-8"
              >
                <div className="flex flex-col items-start">
                  <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90 pb-6 border-b border-current/10 w-full">
                    Inquiries
                  </h3>
                </div>
                <div className="flex flex-col">
                  {faqs.map((f: any, i: number) => (
                    <LuxeAccordion
                      key={i}
                      q={f.q || f.question}
                      a={f.a || f.answer}
                      primary={primary}
                      themeBorder={border}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-10">
            <div
              className={`p-8 md:p-10 rounded-[2rem] ${glassBg} border ${glassBorder} backdrop-blur-xl ${cardShadow} flex flex-col`}
            >
              {(hasWhatsapp || hasPhone) && (
                <div className="flex flex-col pb-8">
                  <h3 className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase opacity-40 mb-6">
                    The Concierge
                  </h3>
                  <div className="space-y-4">
                    {hasWhatsapp && (
                      <button
                        onClick={() => handleTrackLead("whatsapp")}
                        className={`w-full flex items-center justify-between p-5 rounded-xl ${bgAction} transition-all duration-500 hover:scale-[1.02] shadow-lg group`}
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle size={18} strokeWidth={1.5} />
                          <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
                            Book via WhatsApp
                          </span>
                        </div>
                        <ChevronRight
                          size={18}
                          strokeWidth={1.5}
                          className="opacity-60 group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    )}
                    {hasPhone && (
                      <button
                        onClick={() => handleTrackLead("phone")}
                        className={`w-full flex items-center justify-between p-5 rounded-xl border border-current/20 hover:bg-current/5 transition-all duration-300 group`}
                      >
                        <div className="flex items-center gap-3">
                          <Phone
                            size={18}
                            strokeWidth={1.5}
                            className={`opacity-60 ${primary}`}
                          />
                          <span className="text-xs md:text-sm font-bold opacity-80 tracking-widest">
                            {formatPhoneNumber(business.phone)}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {hasAddress && (
                <div
                  className={`flex flex-col py-8 ${hasWhatsapp || hasPhone ? "border-t border-current/10" : ""}`}
                >
                  <h3 className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase opacity-40 mb-6">
                    Location
                  </h3>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      Actions.registerClickEvent(business.id, "MAP")
                    }
                    className="block group"
                  >
                    <p className="text-base md:text-lg font-light leading-relaxed mb-2 opacity-90 transition-opacity group-hover:opacity-100">
                      {business.address || "Address not provided"}
                      {business.number &&
                        !business.address?.includes(business.number) &&
                        `, ${business.number}`}
                    </p>
                    {business.complement && (
                      <p className="text-sm font-serif italic opacity-60 mb-4">
                        {business.complement}
                      </p>
                    )}
                    <p className="text-[10px] font-sans uppercase tracking-[0.2em] opacity-40 font-bold mt-2">
                      {business.neighborhood && `${business.neighborhood} • `}{" "}
                      {business.city}{" "}
                      {business.state ? `• ${business.state}` : ""}
                    </p>
                    <div
                      className={`mt-5 flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold ${primary} opacity-60 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0`}
                    >
                      Get Directions <ChevronRight size={14} strokeWidth={2} />
                    </div>
                  </a>
                </div>
              )}

              {hasHours && (
                <div
                  className={`flex flex-col py-8 ${hasWhatsapp || hasPhone || hasAddress ? "border-t border-current/10" : ""}`}
                >
                  <h3 className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase opacity-40 mb-6">
                    Opening Hours
                  </h3>
                  <div className="space-y-4">
                    {realHours.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-end font-light text-xs md:text-sm pb-2"
                      >
                        <span className="opacity-50 uppercase tracking-widest text-[10px] font-bold">
                          {h.day}
                        </span>
                        <div className="flex-grow mx-3 border-b border-dotted border-current/20 mb-1" />
                        <span
                          className={
                            h.isClosed
                              ? "opacity-40 italic"
                              : "opacity-90 font-medium"
                          }
                        >
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(salesChannels.length > 0 || availableSocials.length > 0) && (
                <div
                  className={`flex flex-col pt-8 ${hasWhatsapp || hasPhone || hasAddress || hasHours ? "border-t border-current/10" : ""}`}
                >
                  {salesChannels.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-6">
                        Directories
                      </h3>
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
                          className={`flex items-center justify-between py-3 group border-b border-current/5 last:border-0`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`opacity-50 group-hover:opacity-100 transition-opacity ${channel.hover} scale-110`}
                            >
                              {channel.icon}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                              {channel.name}
                            </span>
                          </div>
                          <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-50 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {availableSocials.length > 0 && (
                    <div
                      className={`pt-8 ${salesChannels.length > 0 ? "border-t border-current/10 mt-6" : ""}`}
                    >
                      <div className="flex gap-6 justify-center">
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
                              className="opacity-40 hover:opacity-100 hover:-translate-y-1 transition-all"
                            >
                              {s === "instagram" ? (
                                <Instagram
                                  className="w-6 h-6"
                                  strokeWidth={1.5}
                                />
                              ) : s === "facebook" ? (
                                <Facebook
                                  className="w-6 h-6"
                                  strokeWidth={1.5}
                                />
                              ) : s === "tiktok" ? (
                                <TikTokIcon className="w-6 h-6" />
                              ) : (
                                <Globe className="w-6 h-6" strokeWidth={1.5} />
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="max-w-4xl mx-auto w-full px-6 md:px-12 pb-32">
        <div className="w-full flex justify-center py-16 opacity-20 hover:opacity-100 transition-opacity border-t border-current/10">
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

      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 z-30 w-14 h-14 md:w-16 md:h-16 rounded-full ${bgAction} flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all`}
        >
          <MessageCircle
            className="w-6 h-6 md:w-7 md:h-7"
            fill="currentColor"
            strokeWidth={1.5}
          />
        </motion.button>
      )}

      {/* LIGHTBOX (Apenas Imagens) */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-all z-[230]">
              <X size={40} strokeWidth={1} />
            </button>
            <div className="flex-grow flex items-center justify-center relative w-full px-4 pt-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-12 w-16 h-16 items-center justify-center bg-transparent rounded-full text-white/30 hover:text-white border border-white/10 hover:border-white/30 transition-all z-[220]"
              >
                <ChevronLeft size={40} strokeWidth={1} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-12 w-16 h-16 items-center justify-center bg-transparent rounded-full text-white/30 hover:text-white border border-white/10 hover:border-white/30 transition-all z-[220]"
              >
                <ChevronRight size={40} strokeWidth={1} />
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
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                    else if (info.offset.x < -80)
                      safeSetIndex(selectedIndex + 1);
                  }}
                  className={`max-w-full max-h-[80vh] object-contain shadow-2xl cursor-grab active:cursor-grabbing rounded-lg z-[210]`}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-6 px-10 pb-8 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-20 overflow-hidden transition-all snap-center rounded-lg ${selectedIndex === idx ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-black" : "opacity-30 hover:opacity-100"}`}
                >
                  {/* ✅ MINIATURAS OTIMIZADAS */}
                  <Image
                    src={img}
                    alt="Thumb"
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
