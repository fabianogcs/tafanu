"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Instagram,
  Facebook,
  Globe,
  X,
  Terminal,
  MessageCircle,
  Share2,
  Heart,
  Plus,
  Loader2,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  ShoppingBag,
  Store,
  Video,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// --- HELPERS ---
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

// --- COMPONENTE DE MAPA INTERATIVO PREMIUM ---
const MapEmbed = ({
  destination,
  radius,
  glassBorder,
}: {
  destination: string;
  radius: string;
  glassBorder: string;
}) => {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      className={`w-full h-[350px] md:h-[450px] relative overflow-hidden ${radius} border ${glassBorder} shadow-2xl group`}
    >
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        className="grayscale-[0.5] contrast-[1.1] opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent shadow-[inset_0_0_60px_rgba(0,0,0,0.2)]" />
    </div>
  );
};

// --- MOTOR DE VÍDEOS EMBED (URBAN REC // SYS) ---
const VideoEmbed = ({
  url,
  radius,
  glassBg,
  glassBorder,
  primaryColorClass,
}: {
  url: string;
  radius: string;
  glassBg: string;
  glassBorder: string;
  primaryColorClass: string;
}) => {
  let embedUrl = "";
  let isVertical = false;
  let isInstagram = false;

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
      isInstagram = true; // 🚀 Marcamos que é Insta para o corte!
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
      className={`relative group w-full mb-8 break-inside-avoid ${isVertical ? "max-w-[350px] mx-auto" : ""}`}
    >
      <div
        className={`relative flex flex-col overflow-hidden ${glassBg} border ${glassBorder} shadow-2xl ${radius} backdrop-blur-md transition-all duration-500 hover:border-current group-hover:shadow-[0_0_30px_currentColor] ${primaryColorClass}`}
      >
        {/* Cabeçalho REC // SYS */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-current/20 bg-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-70">
              REC // SYS
            </span>
          </div>
          <div className="flex gap-1.5 opacity-40">
            <div className="w-1.5 h-3.5 border-l-2 border-current skew-x-12" />
            <div className="w-1.5 h-3.5 border-l-2 border-current skew-x-12" />
            <div className="w-1.5 h-3.5 border-l-2 border-current skew-x-12" />
          </div>
        </div>

        {/* 🚀 O CORTE MÁGICO: overflow-hidden na caixa e h-[calc(100%+95px)] no iframe do Instagram */}
        <div
          className={`w-full relative overflow-hidden bg-black/50 ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}
        >
          <iframe
            src={embedUrl}
            className={`absolute top-0 left-0 w-full border-0 pointer-events-auto ${isInstagram ? "h-[calc(100%+95px)]" : "h-full"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
};

const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Confira ${businessName}:`,
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

export default function UrbanLayout({
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business?.theme] ||
    businessThemes["urban_cyber"];

  const isLight =
    theme.bgPage.includes("f8fafc") || theme.bgPage.includes("ffffff");
  const glassBg = theme.cardBg || (isLight ? "bg-white/90" : "bg-white/5");
  const glassBorder = isLight ? "border-slate-200" : "border-white/10";
  const glassDivider = isLight ? "border-slate-200" : "border-white/5";
  const mutedText = isLight ? "text-slate-600" : "text-white/70";

  const radius = theme.radius || "rounded-xl";
  const shadow = theme.shadow || "shadow-2xl";

  const addressBase = business?.address || "";
  const hasNumberInAddress =
    business?.number && addressBase.includes(business.number);

  const safeAddress =
    fullAddress ||
    `${addressBase}${!hasNumberInAddress && business?.number ? `, ${business.number}` : ""} ${business?.complement || ""}`;

  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];

  const videos = Array.isArray(business.videos)
    ? business.videos.filter(Boolean)
    : [];

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-4 h-4 md:w-5 md:h-5" />,
      url: business.mercadoLivre,
      colorClass: "text-[#FFE600] group-hover:text-[#FFE600]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-4 h-4 md:w-5 md:h-5" />,
      url: business.shopee,
      colorClass: "text-[#EE4D2D] group-hover:text-[#EE4D2D]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-4 h-4 md:w-5 md:h-5" />,
      url: business.ifood,
      colorClass: "text-[#EA1D2C] group-hover:text-[#EA1D2C]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-4 h-4 md:w-5 md:h-5" />,
      url: business.shein,
      colorClass: isLight
        ? "text-slate-900 group-hover:text-slate-900"
        : "text-white group-hover:text-white",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

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
      const message = `Olá! Vi o perfil de ${business?.name || "sua empresa"} no Tafanu e gostaria de mais informações.`;

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
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-white/20 selection:text-white`}
    >
      <div className="hidden md:block fixed inset-0 pointer-events-none z-[10] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* --- HEADER URBANO --- */}
      <header className="relative w-full pt-32 pb-24 md:pt-48 md:pb-40 px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent ${isLight ? "to-white/60" : "to-black/40"}`}
          />
          <div
            className={`absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay ${isLight ? "invert" : ""}`}
            style={{
              backgroundImage:
                "radial-gradient(circle, white 2px, transparent 2.5px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-30">
          <div
            className={`flex items-center gap-1 ${isLight ? "bg-white/80 border-slate-200" : "bg-black/40 border-white/10"} backdrop-blur-xl p-2 rounded-full border shadow-xl`}
          >
            <button
              onClick={() => handleShare(business.name)}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-white/10 text-white"}`}
            >
              <Share2 className="w-[20px] h-[20px]" />
            </button>
            <div
              className={`w-[1px] h-6 ${isLight ? "bg-slate-300" : "bg-white/20"} mx-2`}
            />
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          {business.imageUrl && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: -3 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-10 md:mb-16 relative z-30"
            >
              <div
                className={`w-32 h-32 md:w-48 md:h-48 rounded-3xl ${glassBg} border-4 md:border-8 ${glassBorder} shadow-2xl overflow-hidden p-1.5`}
              >
                <img
                  src={business.imageUrl}
                  className="w-full h-full object-cover rounded-2xl"
                  alt="Logo"
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative z-20 w-full"
          >
            <h1
              className={`font-black uppercase italic tracking-tighter ${theme.textColor} break-words text-[clamp(4rem,14vw,10rem)] leading-[0.8] drop-shadow-2xl px-2`}
            >
              {business.name}
            </h1>
          </motion.div>

          {business.urban_tag && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "circOut" }}
              className="relative z-30 mt-12 md:mt-20 origin-center inline-flex justify-center w-full px-4"
            >
              <div
                className={`px-8 py-4 md:px-16 md:py-5 ${theme.bgAction} font-black uppercase tracking-widest md:tracking-[0.5em] text-xs md:text-xl -skew-x-[12deg] shadow-[8px_8px_0px_rgba(0,0,0,0.3)] border-y ${glassBorder} whitespace-normal break-words text-center max-w-full`}
              >
                <span className="block skew-x-[12deg]">
                  {business.urban_tag}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div
          className={`absolute bottom-0 w-px h-24 md:h-32 bg-gradient-to-t ${isLight ? "from-slate-300" : "from-white/30"} to-transparent z-10`}
        />
      </header>

      {/* 🚀 O GRANDE UPGRADE DE ESPAÇAMENTO ACONTECE AQUI NO MAIN */}
      <main className="container mx-auto px-4 md:px-8 relative z-30 flex flex-col gap-24 md:gap-40 pb-32 mt-16 md:mt-24">
        {/* REDES & LOJAS */}
        <div className="flex flex-col gap-8 md:gap-12">
          {availableSocials.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 md:gap-6 flex-wrap justify-center"
            >
              {availableSocials.map((s) => {
                const username = business[s];
                if (!username) return null;
                const finalUrl =
                  username.startsWith("http") || username.startsWith("www")
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
                      Actions.registerClickEvent(business.id, s.toUpperCase())
                    }
                    className={`w-14 h-14 md:w-20 md:h-20 ${glassBg} border flex items-center justify-center transition-all duration-300 ${radius} hover:scale-110 hover:-translate-y-2 hover:shadow-xl ${theme.primary} ${glassBorder} md:backdrop-blur-md`}
                  >
                    {s === "instagram" ? (
                      <Instagram className="w-6 h-6 md:w-8 md:h-8" />
                    ) : s === "facebook" ? (
                      <Facebook className="w-6 h-6 md:w-8 md:h-8" />
                    ) : s === "tiktok" ? (
                      <TikTokIcon className="w-6 h-6 md:w-8 md:h-8" />
                    ) : (
                      <Globe className="w-6 h-6 md:w-8 md:h-8" />
                    )}
                  </a>
                );
              })}
            </motion.div>
          )}

          {salesChannels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 w-full max-w-3xl mx-auto"
            >
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
                  className={`flex items-center gap-3 px-5 py-3 md:px-8 md:py-4 rounded-full ${glassBg} md:backdrop-blur-md border ${glassBorder} hover:scale-105 hover:-translate-y-1 transition-all duration-300 group shadow-lg hover:shadow-2xl`}
                >
                  <div
                    className={`transition-transform duration-300 group-hover:scale-110 ${channel.colorClass} opacity-80 group-hover:opacity-100`}
                  >
                    {channel.icon}
                  </div>
                  <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                    {channel.name}
                  </span>
                </a>
              ))}
            </motion.div>
          )}
        </div>

        {/* SOBRE */}
        {hasDescription && (
          <section className="relative w-full max-w-6xl mx-auto">
            <div
              className={`${glassBg} md:backdrop-blur-md border ${glassBorder} p-10 md:p-20 lg:p-24 ${radius} ${shadow}`}
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12 md:mb-16 border-b-2 border-current pb-6 opacity-30 flex items-center gap-5">
                <Terminal className="w-8 h-8 md:w-10 md:h-10" /> Sobre
              </h2>
              <p className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed whitespace-pre-line break-words">
                {business.description}
              </p>
            </div>
          </section>
        )}

        {/* DESTAQUES */}
        {hasFeatures && (
          <section className="w-full max-w-7xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter opacity-30 flex items-center gap-4 border-b-2 border-current pb-6 mb-12 md:mb-16">
              <Terminal className="w-8 h-8 md:w-10 md:h-10" /> DESTAQUES_
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {business.features.filter(Boolean).map((f: string, i: number) => (
                <div
                  key={i}
                  className={`w-full p-6 md:p-10 ${glassBg} md:backdrop-blur-md border ${glassBorder} ${radius} flex items-center gap-6 group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500`}
                >
                  <div
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 shrink-0 rounded-full ${theme.bgAction} shadow-lg`}
                  />
                  <span className="font-bold text-sm md:text-base uppercase tracking-widest leading-tight opacity-90">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GALERIA */}
        {hasGallery && (
          <section className="w-full max-w-7xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter flex items-center gap-5 opacity-80 mb-12 md:mb-16">
              <Camera className="w-10 h-10 md:w-12 md:h-12" /> VISUAL_FEED_
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className={`aspect-square ${glassBg} md:backdrop-blur-md overflow-hidden cursor-pointer group relative border ${glassBorder} ${radius} shadow-xl hover:shadow-2xl transition-all duration-500`}
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    alt="Gallery"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus
                      size={48}
                      className="text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* VÍDEOS (Agora com separação inteligente) */}
        {videos.length > 0 &&
          (() => {
            // O Robô que separa os formatos
            const horizontalVideos = videos.filter(
              (vid: string) =>
                (vid.includes("youtube.com") || vid.includes("youtu.be")) &&
                !vid.includes("shorts"),
            );
            const verticalVideos = videos.filter(
              (vid: string) =>
                vid.includes("shorts") ||
                vid.includes("instagram.com") ||
                vid.includes("tiktok.com"),
            );

            return (
              <section className="w-full max-w-7xl mx-auto">
                <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter flex items-center gap-5 opacity-80 mb-12 md:mb-16">
                  <Video className="w-10 h-10 md:w-12 md:h-12" /> MOTION_FEED_
                </h3>

                {/* YouTube (Sempre no topo, telas largas) */}
                {horizontalVideos.length > 0 && (
                  <div className="mb-12 md:mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      {horizontalVideos.map((vid: string, i: number) => (
                        <VideoEmbed
                          key={`h-${i}`}
                          url={vid}
                          radius={radius}
                          glassBg={glassBg}
                          glassBorder={glassBorder}
                          primaryColorClass={theme.primary}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Instagram / TikTok (Sempre embaixo, formato espelho) */}
                {verticalVideos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {verticalVideos.map((vid: string, i: number) => (
                      <VideoEmbed
                        key={`v-${i}`}
                        url={vid}
                        radius={radius}
                        glassBg={glassBg}
                        glassBorder={glassBorder}
                        primaryColorClass={theme.primary}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })()}

        {/* FAQS */}
        {hasFaqs && (
          <section className="w-full max-w-7xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter opacity-30 flex items-center gap-4 border-b-2 border-current pb-6 mb-12 md:mb-16">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10" /> DÚVIDAS
              FREQUENTES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div className="flex flex-col gap-6 md:gap-8">
                {faqs.map((f: any, i: number) => {
                  if (i % 2 !== 0) return null;
                  return (
                    <div
                      key={i}
                      className={`${glassBg} md:backdrop-blur-md border ${glassBorder} ${radius} overflow-hidden shadow-lg`}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                      >
                        <span className="text-lg md:text-xl font-bold uppercase italic tracking-wide opacity-90 pr-4">
                          {f.q || f.question}
                        </span>
                        <ChevronDown
                          className={`w-6 h-6 md:w-8 md:h-8 shrink-0 transition-transform duration-300 ${theme.primary} ${openFaq === i ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div
                              className={`px-6 md:px-8 pb-8 pt-4 ${mutedText} border-t ${glassDivider} font-medium leading-relaxed text-base md:text-lg`}
                            >
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-6 md:gap-8">
                {faqs.map((f: any, i: number) => {
                  if (i % 2 === 0) return null;
                  return (
                    <div
                      key={i}
                      className={`${glassBg} md:backdrop-blur-md border ${glassBorder} ${radius} overflow-hidden shadow-lg`}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                      >
                        <span className="text-lg md:text-xl font-bold uppercase italic tracking-wide opacity-90 pr-4">
                          {f.q || f.question}
                        </span>
                        <ChevronDown
                          className={`w-6 h-6 md:w-8 md:h-8 shrink-0 transition-transform duration-300 ${theme.primary} ${openFaq === i ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div
                              className={`px-6 md:px-8 pb-8 pt-4 ${mutedText} border-t ${glassDivider} font-medium leading-relaxed text-base md:text-lg`}
                            >
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CONTATO & HORÁRIOS */}
        <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {hasPhone && (
              <button
                onClick={() => handleTrackLead("phone")}
                className={`w-full ${glassBg} md:backdrop-blur-md border ${glassBorder} p-8 md:p-12 ${radius} ${shadow} flex items-center gap-6 md:gap-8 group hover:-translate-y-1 hover:border-current transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${isLight ? "bg-slate-100" : "bg-white/5"} border ${glassBorder} flex items-center justify-center ${theme.primary} transition-all`}
                >
                  <Phone className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-left">
                  <p className="text-xs md:text-sm font-black opacity-40 tracking-[0.2em] uppercase mb-2">
                    Voice Line
                  </p>
                  <p className="text-xl md:text-3xl font-bold italic uppercase tracking-wide">
                    {formatPhoneNumber(business.phone)}
                  </p>
                </div>
              </button>
            )}

            {hasWhatsapp && (
              <button
                onClick={() => handleTrackLead("whatsapp")}
                className={`w-full ${glassBg} md:backdrop-blur-md border border-[#25D366]/30 p-8 md:p-12 ${radius} ${shadow} flex items-center gap-6 md:gap-8 group hover:-translate-y-1 hover:border-[#25D366] transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] transition-all`}
                >
                  <MessageCircle
                    className="w-8 h-8 md:w-10 md:h-10"
                    fill="currentColor"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs md:text-sm font-black opacity-40 tracking-[0.2em] uppercase mb-2">
                    Direct Chat
                  </p>
                  <p className="text-xl md:text-3xl font-bold italic uppercase tracking-wide">
                    Chamar no Whats
                  </p>
                </div>
              </button>
            )}

            {hasAddress && (
              <div className="space-y-6 md:space-y-8">
                <MapEmbed
                  destination={mapDestination}
                  radius={radius}
                  glassBorder={glassBorder}
                />

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => Actions.registerClickEvent(business.id, "MAP")}
                  className={`relative w-full overflow-hidden ${glassBg} md:backdrop-blur-md border ${glassBorder} p-8 md:p-12 ${radius} ${shadow} flex items-center gap-6 md:gap-8 group hover:border-current hover:-translate-y-1 transition-all duration-500`}
                >
                  <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]" />

                  <div
                    className={`relative z-10 w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl ${isLight ? "bg-slate-100" : "bg-white/5"} border ${glassBorder} flex items-center justify-center ${theme.primary} group-hover:scale-110 group-hover:shadow-[0_0_30px_currentColor] transition-all duration-500`}
                  >
                    <MapPin className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="relative z-10 text-left flex-1">
                    <p className="text-xs md:text-sm font-black opacity-50 tracking-[0.2em] uppercase mb-2 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      GPS Navigation
                    </p>
                    <p className="text-xl md:text-3xl font-black italic uppercase tracking-wide leading-tight">
                      {business.address || "Endereço não cadastrado"}
                      {business.number &&
                        !business.address?.includes(business.number) &&
                        `, ${business.number}`}
                    </p>
                    <p className="text-sm md:text-base opacity-60 uppercase tracking-widest mt-3 font-medium">
                      {business.neighborhood} • {business.city}
                      {business.complement && (
                        <span className="block normal-case mt-2 italic opacity-80">
                          "{business.complement}"
                        </span>
                      )}
                    </p>
                  </div>

                  <div
                    className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0 flex items-center justify-center border ${glassBorder} ${isLight ? "bg-white" : "bg-white/10"} group-hover:bg-current group-hover:text-black transition-all duration-300 shadow-xl`}
                  >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                </a>
              </div>
            )}
          </div>

          {hasHours && (
            <div
              className={`lg:col-span-5 ${glassBg} md:backdrop-blur-md p-10 md:p-14 border ${glassBorder} ${radius} ${shadow}`}
            >
              <h3 className="text-3xl md:text-4xl font-black uppercase italic mb-12 border-b-2 border-current pb-4 flex items-center gap-4 opacity-80">
                <Clock className="w-8 h-8 md:w-10 md:h-10" /> HORÁRIOS
              </h3>
              <div className="space-y-6 md:space-y-8">
                {realHours.map((h: any, i: number) => (
                  <div
                    key={i}
                    className={`flex justify-between border-b ${glassDivider} font-black uppercase italic py-3 md:py-4 text-sm md:text-base`}
                  >
                    <span className="opacity-40">{h.day}</span>
                    <span
                      className={
                        h.isClosed
                          ? "text-red-500 line-through"
                          : isLight
                            ? "text-slate-900"
                            : "text-white"
                      }
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* FIM DA EXPANSÃO */}

        <div className="w-full flex justify-center py-10 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>

        <div className="w-full max-w-6xl mx-auto pb-12">
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

        <div ref={footerTriggerRef} className="h-10 w-full" />
      </main>

      {hasWhatsapp && (
        <motion.button
          animate={isFooterVisible ? { scale: 0 } : { scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 z-30 w-20 h-20 md:w-24 md:h-24 bg-[#25D366] text-white flex items-center justify-center border-4 ${isLight ? "border-white" : "border-black"} ${radius} shadow-2xl md:shadow-[0_0_40px_rgba(37,211,102,0.6)]`}
        >
          <MessageCircle size={40} fill="currentColor" />
        </motion.button>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-all">
              <X size={48} />
            </button>
            <div className="flex-grow flex items-center justify-center relative w-full px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-12 w-20 h-20 items-center justify-center bg-white/5 rounded-full text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md border border-white/10 shadow-2xl"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-12 w-20 h-20 items-center justify-center bg-white/5 rounded-full text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md border border-white/10 shadow-2xl"
              >
                <ChevronRight size={48} />
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
                  className={`max-w-full max-h-[75vh] object-contain border-4 ${theme.border} shadow-2xl ${radius}`}
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
                  className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all snap-center ${selectedIndex === idx ? "border-white scale-110 shadow-xl" : "border-transparent opacity-30"}`}
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
