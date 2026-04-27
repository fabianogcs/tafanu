"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image"; // ✅ ADICIONE ESTA LINHA AQUI
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Instagram,
  Facebook,
  Globe,
  X,
  MessageCircle,
  Share2,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  Video,
  Sparkles,
  Plus,
  HelpCircle,
  Store,
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

// --- 🚀 MOTOR DE VÍDEOS (OTIMIZADO COM LAZY LOAD E ACESSIBILIDADE) ---
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

  // A FACHADA: Mostra apenas um botão de play falso antes do clique
  if (!isLoaded) {
    return (
      <button
        aria-label="Carregar e reproduzir vídeo"
        onClick={() => setIsLoaded(true)}
        className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto rounded-[1.5rem] cursor-pointer group border border-white/10"
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

  // O VÍDEO REAL: Só carrega depois que clicou
  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto rounded-[1.5rem]">
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

// 🚀 COMPONENTE MÁGICO: THE MASTER RUNWAY (Mosaico Misto com Cartões Padronizados Urban)
const MasterRunway = ({
  feed,
  setSelectedIndex,
  cardBg,
  border,
  shadow,
}: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
  };
  const arrowClass = `hidden md:flex absolute top-[50%] -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full shadow-md opacity-0 group-hover/runway:opacity-100 transition-all hover:scale-105 bg-white text-slate-800 border border-slate-200`;

  return (
    <div className="relative group/runway w-full">
      <button
        aria-label="Rolar galeria para a esquerda"
        onClick={() => scroll("left")}
        className={`${arrowClass} -left-4 lg:-left-6`}
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto snap-x no-scrollbar pb-6 pt-2 scroll-smooth px-1"
      >
        {feed.map((item: any, i: number) => {
          // 🚀 PADRÃO DE TAMANHO ABSOLUTO URBAN (4:5)
          const cardBaseClasses = `shrink-0 snap-center w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[280px] aspect-[4/5] ${cardBg} overflow-hidden relative border ${border} rounded-[1.5rem] ${shadow} hover:shadow-md transition-all duration-300 cursor-pointer group`;

          if (item.type === "image") {
            return (
              <motion.div
                key={`img-${i}`}
                onClick={() => setSelectedIndex(item.lightboxIndex)}
                whileHover={{ scale: 1.02 }}
                className={`${cardBaseClasses}`}
                role="button"
                tabIndex={0}
                aria-label="Abrir imagem em tela cheia"
              >
                {/* ✅ TAG IMAGE OTIMIZADA PARA O CATÁLOGO */}
                <Image
                  src={item.url || "/og-default.png"}
                  alt="Foto da vitrine do negócio"
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
        className={`${arrowClass} -right-4 lg:-right-6`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const handleShare = async (name: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({ title: name, text: `Confira ${name}:`, url });
      return;
    } catch (err) {}
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado com sucesso!");
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
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "motion">(
    "all",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business?.theme] ||
    businessThemes["urban_gold"];
  const isLight =
    theme.bgPage.includes("f8fafc") || theme.bgPage.includes("ffffff");

  const bgHero = theme.bgHero || "bg-gradient-to-r from-purple-500 to-pink-500";
  const cardBg = theme.cardBg || "bg-white";
  const border = theme.border || "border-slate-100";
  const shadow = theme.shadow || "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]";
  const primary = theme.primary || "text-current";
  const bgAction = theme.bgAction || "bg-current text-white";

  const addressBase = business?.address || "";
  const hasNumberInAddress =
    business?.number && addressBase.includes(business.number);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : `${business.address || ""}, ${business.city || ""}, ${business.state || ""}`.trim(),
  )}`;

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-5 h-5" />,
      url: business.mercadoLivre,
      colorClass: "bg-[#FFE600] text-[#2D3277]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      colorClass: "bg-[#EE4D2D] text-white",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      colorClass: "bg-[#EA1D2C] text-white",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      colorClass: "bg-slate-900 text-white",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  // 🚀 EXTRAÇÃO INTELIGENTE DO FEED PARA O URBAN
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

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-current selection:text-white`}
    >
      {/* --- HEADER LANDING PAGE (NOVA ORDEM MOBILE & DESKTOP) --- */}
      <header
        className={`relative w-full pt-10 pb-20 md:pt-16 md:pb-28 px-4 md:px-8 flex flex-col ${bgHero} rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-20`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-white/20 blur-[80px] mix-blend-overlay" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-black/10 blur-[80px] mix-blend-overlay" />
        </div>

        <div className="w-full max-w-7xl mx-auto flex justify-end relative z-30 mb-8 md:mb-16">
          <div className="flex items-center gap-2 bg-white/20 p-1.5 rounded-full backdrop-blur-md border border-white/30 text-white">
            <button
              aria-label="Compartilhar perfil no WhatsApp ou copiar link"
              onClick={() => handleShare(business.name)}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="w-[1px] h-5 bg-white/30" />
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16">
          {business.urban_tag && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden flex justify-center w-full order-1"
            >
              <span className="px-5 py-2 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-white/30 shadow-sm text-center">
                {business.urban_tag}
              </span>
            </motion.div>
          )}

          {business.imageUrl && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center md:justify-end relative order-2 md:order-2"
            >
              <div className="relative w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] border-4 border-white/30 rotate-6 scale-105 transition-transform" />
                <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] border-4 border-white/20 -rotate-6 scale-105 transition-transform" />
                {/* ✅ TAG IMAGE OTIMIZADA (Com priority para carregar rápido!) */}
                <Image
                  src={business.imageUrl}
                  alt={`Logotipo da empresa ${business.name}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 bg-white"
                />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col items-center md:items-start text-center md:text-left order-3 md:order-1">
            {business.urban_tag && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:block mb-6"
              >
                <span className="px-5 py-2 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-white/30 shadow-sm">
                  {business.urban_tag}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.1] mb-4 md:mb-6"
            >
              {business.name}
            </motion.h1>

            {hasDescription && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-xl text-white/90 font-medium leading-relaxed mb-8 max-w-xl"
              >
                {business.description}
              </motion.p>
            )}

            {hasWhatsapp && (
              <motion.button
                aria-label="Entrar em contato via WhatsApp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => handleTrackLead("whatsapp")}
                className={`px-8 py-4 bg-white ${theme.primary} rounded-full font-extrabold text-sm md:text-base tracking-wide shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-3`}
              >
                FALE CONOSCO <ChevronRight size={20} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* --- CORPO PRINCIPAL COM ARQUITETURA OTIMIZADA --- */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col gap-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* COLUNA ESQUERDA (Destaques, Galeria, FAQ) */}
          <div className="lg:col-span-8 flex flex-col gap-10 md:gap-14 w-full min-w-0">
            {/* Redes Sociais */}
            {availableSocials.length > 0 && (
              <div className="flex gap-3 md:gap-4 flex-wrap justify-center md:justify-start">
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
                      aria-label={`Visitar perfil no ${s}`}
                      onClick={() =>
                        Actions.registerClickEvent(business.id, s.toUpperCase())
                      }
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${cardBg} border ${border} ${shadow} flex items-center justify-center transition-all duration-300 hover:scale-110 ${theme.primary}`}
                    >
                      {s === "instagram" ? (
                        <Instagram
                          className="w-5 h-5 md:w-6 md:h-6"
                          strokeWidth={1.5}
                        />
                      ) : s === "facebook" ? (
                        <Facebook
                          className="w-5 h-5 md:w-6 md:h-6"
                          strokeWidth={1.5}
                        />
                      ) : s === "tiktok" ? (
                        <TikTokIcon className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Globe
                          className="w-5 h-5 md:w-6 md:h-6"
                          strokeWidth={1.5}
                        />
                      )}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Destaques */}
            {hasFeatures && (
              <section className="space-y-6">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight opacity-90 flex items-center justify-center md:justify-start gap-3">
                  <Sparkles
                    className={`w-5 h-5 md:w-6 md:h-6 ${theme.primary}`}
                    strokeWidth={2}
                  />{" "}
                  Nossos Diferenciais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.features
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <div
                        key={i}
                        className={`w-full p-4 md:p-5 ${cardBg} border ${border} ${shadow} rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div
                          className={`w-2 h-2 md:w-2.5 md:h-2.5 shrink-0 rounded-full ${theme.bgAction}`}
                        />
                        <span className="font-semibold text-sm md:text-base leading-snug opacity-80">
                          {f}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* 🚀 THE MASTER RUNWAY (Mídia Unificada URBAN) */}
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
                      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight opacity-90 flex items-center gap-3">
                        <Camera
                          className={`w-5 h-5 md:w-6 md:h-6 ${theme.primary}`}
                          strokeWidth={2}
                        />
                        Catálogo Visual
                      </h2>

                      {/* Capsula Switch (Urban Style) */}
                      <div
                        className={`flex items-center p-1 ${cardBg} border ${border} rounded-full ${shadow}`}
                      >
                        <button
                          onClick={() => setMediaFilter("all")}
                          className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "all" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setMediaFilter("photos")}
                          className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "photos" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                        >
                          Photos
                        </button>
                        <button
                          onClick={() => setMediaFilter("motion")}
                          className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${mediaFilter === "motion" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                        >
                          Motion
                        </button>
                      </div>
                    </div>

                    <MasterRunway
                      key={mediaFilter}
                      feed={filteredFeed}
                      setSelectedIndex={setSelectedIndex}
                      cardBg={cardBg}
                      border={border}
                      shadow={shadow}
                    />
                  </section>
                );
              })()}

            {/* FAQ */}
            {hasFaqs && (
              <section className="space-y-6 pt-6">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight opacity-90 flex items-center justify-center md:justify-start gap-3">
                  <HelpCircle
                    className={`w-5 h-5 md:w-6 md:h-6 ${theme.primary}`}
                    strokeWidth={2}
                  />{" "}
                  Suporte e Dúvidas
                </h2>
                <div className="flex flex-col gap-3">
                  {faqs.map((f: any, i: number) => (
                    <div
                      key={i}
                      className={`${cardBg} border ${border} ${shadow} rounded-2xl overflow-hidden transition-all duration-300`}
                    >
                      <button
                        aria-expanded={openFaq === i}
                        aria-label="Alternar visualização da resposta"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                      >
                        <span className="text-sm md:text-base font-bold opacity-90 pr-4">
                          {f.q || f.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-transform duration-300 ${theme.primary} ${openFaq === i ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div
                              className={`px-5 md:px-6 pb-5 pt-2 font-medium opacity-70 text-sm leading-relaxed border-t ${border}`}
                            >
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* COLUNA DIREITA (Sidebar Comercial Clean) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
            {/* 🚀 ATENDIMENTO & LOJAS UNIFICADOS */}
            {(hasWhatsapp || hasPhone || salesChannels.length > 0) && (
              <div
                className={`p-6 md:p-8 rounded-[2rem] border ${border} ${cardBg} ${shadow} space-y-5`}
              >
                {/* Contatos Pessoais */}
                {(hasWhatsapp || hasPhone) && (
                  <>
                    <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 text-center mb-2">
                      Atendimento
                    </h2>
                    <div className="space-y-3">
                      {hasWhatsapp && (
                        <button
                          onClick={() => handleTrackLead("whatsapp")}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-emerald-100 group"
                        >
                          <div className="flex items-center gap-3">
                            <MessageCircle size={20} strokeWidth={2} />
                            <span className="text-xs md:text-sm font-bold">
                              WhatsApp
                            </span>
                          </div>
                          <ChevronRight
                            size={18}
                            strokeWidth={2}
                            className="opacity-50 group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      )}
                      {hasPhone && (
                        <button
                          onClick={() => handleTrackLead("phone")}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border ${border} hover:bg-slate-50 transition-colors group`}
                        >
                          <div className="flex items-center gap-3">
                            <Phone
                              size={20}
                              strokeWidth={2}
                              className={`opacity-50 ${primary}`}
                            />
                            <span className="text-xs md:text-sm font-bold opacity-80 tracking-widest">
                              {formatPhoneNumber(business.phone)}
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Lojas Oficiais embutidas */}
                {salesChannels.length > 0 && (
                  <div
                    className={`pt-5 ${hasWhatsapp || hasPhone ? `border-t ${border}` : ""} flex flex-col gap-3`}
                  >
                    <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 text-center mb-1">
                      Nossas Lojas
                    </h2>
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
                        className={`flex items-center gap-3 p-3 md:p-4 rounded-xl ${channel.colorClass} hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-sm`}
                      >
                        <div className={`transition-transform duration-300`}>
                          {channel.icon}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">
                          {channel.name}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Endereço Clean */}
            {hasAddress && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização no Google Maps"
                onClick={() => Actions.registerClickEvent(business.id, "MAP")}
                className={`block p-6 md:p-8 rounded-[2rem] border ${border} ${cardBg} ${shadow} hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3 mb-5 opacity-40">
                  <MapPin size={18} strokeWidth={2} />
                  <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    Localização
                  </h2>
                </div>
                <p className="text-sm md:text-base font-bold leading-relaxed mb-1 opacity-90 break-words">
                  {business.address || "Endereço não cadastrado"}
                  {business.number &&
                    !business.address?.includes(business.number) &&
                    `, ${business.number}`}
                </p>
                {business.complement && (
                  <p className="text-xs md:text-sm font-medium opacity-60 mb-4">
                    {business.complement}
                  </p>
                )}
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold pt-4 border-t border-slate-100">
                  {business.neighborhood && `${business.neighborhood} • `}{" "}
                  {business.city} {business.state ? `• ${business.state}` : ""}
                </p>
              </a>
            )}

            {/* Horários */}
            {hasHours && (
              <div
                className={`p-6 md:p-8 rounded-[2rem] border ${border} ${cardBg} ${shadow}`}
              >
                <div className="flex items-center gap-3 mb-5 opacity-40">
                  <Clock size={18} strokeWidth={2} />
                  <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    Horários
                  </h2>
                </div>
                <div className="space-y-3">
                  {realHours.map((h: any, i: number) => (
                    <div
                      key={i}
                      className={`flex justify-between font-bold text-[10px] md:text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0`}
                    >
                      <span className="opacity-50 uppercase tracking-widest">
                        {h.day}
                      </span>
                      <span
                        className={h.isClosed ? "text-red-500" : "opacity-90"}
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
      <div className="max-w-4xl mx-auto w-full px-6 md:px-12 pb-20">
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

      {/* WHATSAPP FLUTUANTE */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp Flutuante"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-30 w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all`}
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
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              aria-label="Fechar galeria"
              className="absolute top-8 right-8 text-white/50 hover:text-white hover:scale-110 transition-all z-[230]"
            >
              <X size={40} strokeWidth={2} />
            </button>
            <div className="flex-grow flex items-center justify-center relative w-full px-4 pt-10">
              <button
                aria-label="Imagem anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-12 w-16 h-16 items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md"
              >
                <ChevronLeft size={32} strokeWidth={2} />
              </button>
              <button
                aria-label="Próxima imagem"
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-12 w-16 h-16 items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md"
              >
                <ChevronRight size={32} strokeWidth={2} />
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
                  className={`max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing z-[210]`}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-4 px-10 pb-8 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  aria-label={`Ver miniatura ${idx + 1}`}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all snap-center ${selectedIndex === idx ? "ring-2 ring-white scale-110 opacity-100 shadow-xl" : "opacity-30 hover:opacity-100"}`}
                >
                  {/* ✅ MINIATURAS OTIMIZADAS */}
                  <Image
                    src={img || "/og-default.png"}
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
