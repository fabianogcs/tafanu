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
  Camera,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Layout,
  ShieldCheck,
  Quote,
  Navigation,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// ==========================================
// 1. ÍCONES E SVGs
// ==========================================
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

// ==========================================
// 2. COMPONENTES MODULARES
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
        className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto rounded-[2rem] cursor-pointer group border border-white/10"
      >
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:bg-white/30 transition-all">
          <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[20px] border-l-white ml-2"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto rounded-[2rem]">
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

const MasterRunway = ({ feed, setSelectedIndex, theme }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -350 : 350,
        behavior: "smooth",
      });
  };
  const arrowClass = `hidden lg:flex absolute top-[50%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white/90 backdrop-blur-md border border-black/10 rounded-full shadow-xl opacity-0 group-hover/runway:opacity-100 transition-all hover:scale-110 text-slate-800`;

  return (
    <div className="relative group/runway w-full mt-6">
      <button
        aria-label="Esquerda"
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
          const cardBaseClasses = `shrink-0 snap-center w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[4/5] rounded-[2.5rem] overflow-hidden relative border ${theme.border} bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group`;
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
                  src={item.url || "/og-default.png"}
                  alt="Vitrine"
                  fill
                  quality={60}
                  sizes="(max-width: 768px) 250px, 350px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Plus size={36} className="text-white drop-shadow-lg" />
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
        aria-label="Direita"
        onClick={() => scroll("right")}
        className={`${arrowClass} -right-6`}
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`mb-4 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left gap-4 outline-none bg-transparent border-none group"
      >
        <span
          className={`text-sm font-black uppercase tracking-tight transition-colors duration-300 ${isOpen ? theme.primary : "opacity-80 group-hover:opacity-100"}`}
        >
          {q}
        </span>
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner ${isOpen ? `${theme.bgAction} rotate-45 text-white` : `${theme.bgSecondary} ${theme.primary}`}`}
        >
          <Plus size={18} />
        </div>
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
            <div className="px-6 pb-6 text-sm font-medium leading-relaxed opacity-70 border-t border-black/5 pt-4 whitespace-pre-line">
              {a}
            </div>
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
        text: `Confira o perfil de ${businessName} no Tafanu:`,
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
// 4. LAYOUT PRINCIPAL (COMERCIAL LUXE)
// ==========================================
export default function ComercialLayout({
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
    isFavorite,
    setIsFavorite,
    hasWhatsapp,
    hasPhone,
    hasFaqs,
    hasFeatures,
    hasHours,
    hasAddress,
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [activeTab, setActiveTab] = useState<"perfil" | "infos">("perfil");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "motion">(
    "all",
  );

  const footerTriggerRef = useRef<HTMLDivElement | null>(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["comercial_pearl"];

  const address = fullAddress || business.address || "";
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

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

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-4 h-4" />,
      url: business.mercadoLivre,
      colorClass:
        "bg-[#FFE600] text-[#2D3277] border-transparent hover:shadow-[0_5px_15px_rgba(255,230,0,0.3)]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-4 h-4" />,
      url: business.shopee,
      colorClass:
        "bg-[#EE4D2D] text-white border-transparent hover:shadow-[0_5px_15px_rgba(238,77,45,0.3)]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-4 h-4" />,
      url: business.ifood,
      colorClass:
        "bg-[#EA1D2C] text-white border-transparent hover:shadow-[0_5px_15px_rgba(234,29,44,0.3)]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-4 h-4" />,
      url: business.shein,
      colorClass:
        "bg-slate-900 text-white border-transparent hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

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
      const formattedNumber = cleanNumber.startsWith("55")
        ? cleanNumber
        : `55${cleanNumber}`;
      const message = `Olá! Vi o perfil de ${business?.name || "sua empresa"} no Tafanu.`;
      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`
          : `tel:${cleanNumber}`;
      try {
        await Actions.registerClickEvent(business.id, type.toUpperCase());
      } catch (e) {
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
      {/* --- HEADER HERO BANNER (NOVA IDENTIDADE LUXE) --- */}
      <div
        className={`relative w-full h-56 md:h-72 ${theme.bgHero || "bg-slate-200"} rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-sm overflow-hidden`}
      >
        {/* Padrão/Brilho sutil no fundo da capa */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent mix-blend-overlay" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl opacity-30" />

        {/* Botões de Partilha e Favorito no topo */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 flex gap-2">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white shadow-lg hover:bg-white/40 transition-all"
          >
            <Share2 size={18} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white shadow-lg hover:bg-white/40 transition-all">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>

      <header className="relative w-full max-w-6xl mx-auto px-6 -mt-20 md:-mt-24 z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
          {/* Avatar Flutuante Premium */}
          {business.imageUrl && (
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] border-[6px] md:border-[8px] border-white/90 backdrop-blur-md shadow-2xl overflow-hidden bg-white shrink-0">
              <Image
                src={business.imageUrl || "/og-default.png"}
                alt={`Logotipo ${business.name}`}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start pt-4 md:pt-0">
            {/* Evitando Duplicação de Badge e Urban Tag */}
            {business.comercial_badge &&
              business.comercial_badge !== business.urban_tag && (
                <span
                  className={`${theme.bgAction} px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-md inline-block mb-3`}
                >
                  {business.comercial_badge}
                </span>
              )}
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight leading-none drop-shadow-sm`}
            >
              {business.name}
            </h1>
            {business.urban_tag && (
              <span className="mt-2 text-sm font-bold uppercase tracking-widest opacity-60">
                {business.urban_tag}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* --- MENU TABS (Glassmorphism e z-20 para não conflitar com a Navbar) --- */}
      <div className="sticky top-6 z-20 px-4 mb-10 flex justify-center">
        <div
          className={`bg-white/80 backdrop-blur-xl p-1.5 rounded-full border ${theme.border} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex gap-1`}
        >
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-8 md:px-14 py-3.5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === t
                  ? "text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-800 hover:bg-black/5"
              }`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="active-tab"
                  className={`absolute inset-0 ${theme.bgAction} rounded-full z-0`}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t === "perfil" ? (
                  <Layout size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}{" "}
                {t}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-6xl">
        <AnimatePresence mode="wait">
          {/* ======================= ABA PERFIL ======================= */}
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 md:space-y-12"
            >
              {/* HISTÓRIA */}
              {hasDescription && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 transition-all hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                    >
                      <Quote size={20} />
                    </div>
                    <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40">
                      {" "}
                      Nossa História{" "}
                    </h2>
                  </div>
                  <p className="text-lg md:text-2xl font-medium leading-relaxed opacity-90 break-words whitespace-pre-line text-slate-700">
                    {business.description}
                  </p>
                </section>
              )}

              {/* DESTAQUES */}
              {hasFeatures && (
                <section className="space-y-6">
                  <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40 pl-2">
                    {" "}
                    Destaques{" "}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {business.features
                      .filter(Boolean)
                      .map((f: string, i: number) => (
                        <div
                          key={i}
                          className={`w-full px-5 py-5 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all`}
                        >
                          <div
                            className={`w-10 h-10 shrink-0 rounded-full ${theme.bgSecondary} flex items-center justify-center`}
                          >
                            <CheckCircle2
                              size={18}
                              className={`${theme.primary}`}
                            />
                          </div>
                          <span className="text-sm font-bold leading-tight opacity-90">
                            {" "}
                            {f}{" "}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* GALERIA E VÍDEOS */}
              {cleanFeed.length > 0 && (
                <section className="w-full pt-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                      >
                        <Camera size={20} />
                      </div>
                      <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40">
                        {" "}
                        Catálogo Visual{" "}
                      </h2>
                    </div>

                    <div
                      className={`flex items-center p-1.5 ${theme.cardBg} border ${theme.border} rounded-full shadow-sm`}
                    >
                      <button
                        onClick={() => setMediaFilter("all")}
                        className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${mediaFilter === "all" ? `${theme.bgAction} shadow-md` : "opacity-50 hover:opacity-100"}`}
                      >
                        {" "}
                        All{" "}
                      </button>
                      <button
                        onClick={() => setMediaFilter("photos")}
                        className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${mediaFilter === "photos" ? `${theme.bgAction} shadow-md` : "opacity-50 hover:opacity-100"}`}
                      >
                        {" "}
                        Photos{" "}
                      </button>
                      <button
                        onClick={() => setMediaFilter("motion")}
                        className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${mediaFilter === "motion" ? `${theme.bgAction} shadow-md` : "opacity-50 hover:opacity-100"}`}
                      >
                        {" "}
                        Motion{" "}
                      </button>
                    </div>
                  </div>
                  <MasterRunway
                    key={mediaFilter}
                    feed={cleanFeed.filter((item: any) => {
                      if (mediaFilter === "all") return true;
                      if (mediaFilter === "photos")
                        return item.type === "image";
                      if (mediaFilter === "motion")
                        return (
                          item.type === "video" ||
                          item.type === "video_v" ||
                          item.type === "video_h"
                        );
                      return true;
                    })}
                    setSelectedIndex={setSelectedIndex}
                    theme={theme}
                  />
                </section>
              )}

              {/* DUVIDAS FREQUENTES (MOVIDO PARA AQUI) */}
              {faqs.length > 0 && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 transition-all hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                    >
                      <HelpCircle size={20} />
                    </div>
                    <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40">
                      Dúvidas Frequentes
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2">
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
            </motion.div>
          )}

          {/* ======================= ABA INFOS E CONTATOS ======================= */}
          {activeTab === "infos" && (
            <motion.div
              key="infos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* COLUNA ESQUERDA (Atendimento, Social, Lojas) */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* ATENDIMENTO ONLINE */}
                  {(hasWhatsapp || hasPhone) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform`}
                    >
                      <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 text-center md:text-left">
                        {" "}
                        Atendimento Rápido{" "}
                      </h2>
                      <div className="space-y-4">
                        {hasWhatsapp && (
                          <button
                            onClick={() => handleTrackLead("whatsapp")}
                            className="w-full flex items-center justify-between group bg-white border border-[#25D366]/20 p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                                <MessageCircle size={24} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                                  {" "}
                                  Chamar no{" "}
                                </h4>
                                <p className="text-lg md:text-xl font-black text-[#25D366]">
                                  {" "}
                                  WhatsApp{" "}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={24}
                              className="opacity-20 group-hover:translate-x-2 transition-transform text-[#25D366]"
                            />
                          </button>
                        )}
                        {hasPhone && (
                          <button
                            onClick={() => handleTrackLead("phone")}
                            className={`w-full flex items-center justify-between group ${theme.bgSecondary} border ${theme.border} p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-14 h-14 rounded-2xl ${theme.bgAction} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                              >
                                <PhoneCall size={24} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                                  {" "}
                                  Ligar Agora{" "}
                                </h4>
                                <p
                                  className={`text-lg md:text-xl font-black ${theme.primary}`}
                                >
                                  {" "}
                                  {formatPhoneNumber(business.phone)}{" "}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={24}
                              className={`opacity-20 group-hover:translate-x-2 transition-transform ${theme.primary}`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* REDES SOCIAIS E MARKETPLACES */}
                  {(availableSocials.length > 0 ||
                    salesChannels.length > 0) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 flex flex-col gap-8`}
                    >
                      {availableSocials.length > 0 && (
                        <div>
                          <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-5">
                            {" "}
                            Redes Sociais{" "}
                          </h2>
                          <div className="flex flex-wrap gap-4">
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
                                <motion.a
                                  key={s}
                                  href={finalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ y: -5 }}
                                  onClick={() =>
                                    Actions.registerClickEvent(
                                      business.id,
                                      s.toUpperCase(),
                                    )
                                  }
                                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${theme.bgSecondary} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}
                                >
                                  <div className={`${theme.primary}`}>
                                    {s === "instagram" ? (
                                      <Instagram size={20} />
                                    ) : s === "facebook" ? (
                                      <Facebook size={20} />
                                    ) : s === "tiktok" ? (
                                      <TikTokIcon className="w-5 h-5" />
                                    ) : (
                                      <Globe size={20} />
                                    )}
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest opacity-80">
                                    {s}
                                  </span>
                                </motion.a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {salesChannels.length > 0 && (
                        <div
                          className={`${availableSocials.length > 0 ? "pt-6 border-t border-black/5" : ""}`}
                        >
                          <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-5">
                            {" "}
                            Lojas Oficiais{" "}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 group ${channel.colorClass}`}
                              >
                                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                  {" "}
                                  {channel.icon}{" "}
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase">
                                  {" "}
                                  {channel.name}{" "}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COLUNA DIREITA (Endereço, Horários) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  {/* LOCALIZAÇÃO E HORÁRIOS */}
                  {(hasAddress || hasHours) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 flex flex-col gap-8 hover:-translate-y-1 transition-transform`}
                    >
                      {hasAddress && (
                        <div className="block">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-10 h-10 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner group-hover:scale-110 transition-transform`}
                            >
                              <MapPin size={18} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                              {" "}
                              Localização{" "}
                            </h2>
                          </div>
                          <p className="text-sm md:text-base font-black italic leading-snug mb-1 opacity-90">
                            {business.address || "Endereço não cadastrado"}{" "}
                            {business.number &&
                              !business.address?.includes(business.number) &&
                              `, ${business.number}`}
                          </p>
                          {business.complement && (
                            <p className="text-xs font-medium opacity-60 mb-3">
                              {business.complement}
                            </p>
                          )}
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2 bg-black/5 inline-block px-3 py-1.5 rounded-md">
                            {business.neighborhood &&
                              `${business.neighborhood} • `}{" "}
                            {business.city}{" "}
                            {business.state ? `— ${business.state}` : ""}{" "}
                            {business.cep && ` • CEP: ${business.cep}`}
                          </p>

                          {/* LINK DIRETO DE NAVEGAÇÃO */}
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              Actions.registerClickEvent(business.id, "MAP")
                            }
                            className={`mt-6 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl ${theme.bgSecondary} ${theme.primary} border ${theme.border} hover:opacity-80 transition-all`}
                          >
                            <Navigation size={16} /> Traçar Rota
                          </a>
                        </div>
                      )}

                      {hasHours && (
                        <div
                          className={`${hasAddress ? "pt-6 border-t border-black/5" : ""}`}
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`w-10 h-10 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                            >
                              <Clock size={18} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                              {" "}
                              Horários{" "}
                            </h2>
                          </div>
                          <div className="space-y-3">
                            {realHours.map((h: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between items-center pb-2.5 border-b border-black/5 last:border-0 last:pb-0"
                              >
                                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                                  {" "}
                                  {h.day}{" "}
                                </span>
                                <span
                                  className={`text-xs md:text-sm font-black italic ${h.isClosed ? "text-rose-500" : "opacity-90"}`}
                                >
                                  {" "}
                                  {h.time}{" "}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- RODAPÉ DE DENÚNCIA E COMENTÁRIOS --- */}
        <div className="mt-16 mb-8 w-full flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>
        <div className="max-w-4xl mx-auto w-full pb-24">
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
      </main>

      {/* WHATSAPP FLUTUANTE GLOBAL */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp Flutuante"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] border-4 border-white hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle
            className="w-8 h-8 md:w-10 md:h-10"
            fill="currentColor"
          />
        </motion.button>
      )}

      {/* --- LIGHTBOX OTIMIZADO --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              aria-label="Fechar galeria"
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white z-[210] hover:bg-white/10 rounded-full transition-all"
            >
              <X size={32} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220] backdrop-blur-md"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220] backdrop-blur-md"
              >
                <ChevronRight size={32} />
              </button>
              {lightboxImages[selectedIndex] && (
                <motion.img
                  key={selectedIndex}
                  src={lightboxImages[selectedIndex]}
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                    else if (info.offset.x < -80)
                      safeSetIndex(selectedIndex + 1);
                  }}
                  className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain shadow-2xl rounded-2xl pointer-events-auto cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-3 px-6 pb-6 overflow-x-auto no-scrollbar pointer-events-auto snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center ${selectedIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"}`}
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
