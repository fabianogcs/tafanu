"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import {
  Instagram,
  Facebook,
  Globe,
  Share2,
  Phone,
  Clock,
  MessageCircle,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import {
  TikTokIcon,
  MeliIcon,
  ShopeeIcon,
  IfoodIcon,
  SheinIcon,
  handleShare,
  formatPhoneNumber,
  formatExternalLink,
  MasterRunway,
  TemplateLightbox,
} from "./shared";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "../CommentsSection";

// 🚀 ANIMAÇÕES RESTAURADAS!
const slowFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

const slowStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};
const LuxeAccordion = ({ q, a, primary, themeBorder, cardBg }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`mb-4 rounded-2xl border ${themeBorder} ${cardBg} shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden hover:shadow-md hover:-translate-y-0.5`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Alternar visualização da resposta"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 md:p-6 flex justify-between items-center text-left gap-6 outline-none bg-transparent group"
      >
        <span
          className={`text-base md:text-lg font-semibold ${
            isOpen ? primary : "text-current opacity-90"
          } group-hover:opacity-100 transition-colors duration-300 tracking-wide`}
        >
          {q}
        </span>
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
            isOpen
              ? `border-current/50 ${primary} bg-current/5`
              : "border-current/10 group-hover:border-current/30"
          } shrink-0`}
        >
          {isOpen ? (
            <Minus size={18} strokeWidth={2} />
          ) : (
            <Plus size={18} strokeWidth={2} />
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
            <div className="px-5 md:px-6 pb-6 pt-2 text-sm md:text-base font-medium leading-relaxed opacity-70 tracking-wide max-w-3xl whitespace-pre-line break-words border-t border-current/5">
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
  isOpen,
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const { scrollY } = useScroll();
  const yHeroBg = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHeroBg = useTransform(scrollY, [0, 800], [1, 0.2]);

  const theme =
    propTheme ||
    businessThemes[business?.theme] ||
    businessThemes["luxe_blush"];

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

  // =========================================================================
  // 🚀 O FALSO VIDRO
  // =========================================================================
  const fakeGlassBg = isLight
    ? "bg-gradient-to-br from-white/60 via-white/30 to-white/10"
    : "bg-gradient-to-br from-white/10 via-black/50 to-black/80";

  const fakeGlassBorder = isLight ? "border-white/60" : "border-white/15";

  const fakeGlassShadow = isLight
    ? "shadow-[0_15px_50px_rgba(0,0,0,0.08)]"
    : "shadow-[0_15px_50px_rgba(0,0,0,0.5)]";

  const fakeGlassRing = isLight
    ? "ring-1 ring-white/50"
    : "ring-1 ring-white/10";

  const glassPanel = `${fakeGlassBg} border ${fakeGlassBorder} ${fakeGlassShadow} ${fakeGlassRing} relative`;
  // =========================================================================

  const addressBase = business?.address || "";
  const hasNumberInAddress =
    business?.number && addressBase.includes(business.number);

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
        if (item.type === "image") {
          return { ...item, lightboxIndex: imgIndexCounter++ };
        }
        return item;
      });
  }, [rawFeed]);

  const lightboxImages = useMemo(() => {
    return cleanFeed
      .filter((item: any) => item.type === "image")
      .map((item: any) => item.url);
  }, [cleanFeed]);

  const hasPhotos = cleanFeed.some((item: any) => item.type === "image");
  const hasVideos = cleanFeed.some((item: any) =>
    ["video", "video_v", "video_h"].includes(item.type),
  );
  const activeMediaFilter =
    userMediaFilter || (hasPhotos ? "photos" : "motion");

  const isExternalLink = !!business.isExternalLink;
  const actionLink = business.actionLink || "";

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
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
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
      const message = `Olá! Vi o perfil de ${business?.name || "sua empresa"} no Tafanu.`;
      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${numberWithDDI}?text=${encodeURIComponent(message)}`
          : `tel:${cleanNumber}`;

      try {
        await Actions.registerClickEvent(business.id, type.toUpperCase());
      } finally {
        if (type === "whatsapp") {
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = targetUrl;
        }
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    document.body.style.overflow =
      selectedIndex !== null || isPdfModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex, isPdfModalOpen]);

  const mapDestination =
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : `${business.address || ""}, ${business.city || ""}, ${business.state || ""}`.trim();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    mapDestination,
  )}`;

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-current selection:text-${isLight ? "white" : "black"} transition-colors duration-1000`}
    >
      {/* GLOW BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[150px] opacity-30 pointer-events-none z-[0]"
        style={{
          backgroundColor: theme.previewColor
            ? theme.previewColor.match(/#([a-zA-Z0-9]{6})/g)?.[0] || "gray"
            : "gray",
        }}
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[200px] opacity-20 pointer-events-none z-[0]"
        style={{
          backgroundColor: theme.previewColor
            ? theme.previewColor.match(/#([a-zA-Z0-9]{6})/g)?.[1] || "gray"
            : "gray",
        }}
      />

      <header className="relative w-full min-h-[auto] md:min-h-[100dvh] overflow-hidden flex flex-col items-center pb-6 md:pb-0">
        <motion.div
          style={{ y: yHeroBg, opacity: opacityHeroBg }}
          className={`absolute inset-0 z-0 ${!business.coverImage ? bgHero : ""}`}
        >
          {business.coverImage && (
            <Image
              src={business.coverImage}
              alt={`Capa de ${business.name}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
              className="object-cover object-center"
            />
          )}
        </motion.div>

        <div
          className={`absolute inset-0 z-10 ${isLight ? "bg-gradient-to-t from-white/90 via-white/40 to-transparent" : "bg-gradient-to-t from-black/95 via-black/50 to-transparent"}`}
        />

        {/* Top Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute top-6 right-6 md:top-8 md:right-10 z-40"
        >
          <div
            className={`flex items-center gap-4 md:gap-5 px-5 py-2.5 md:px-6 md:py-3 rounded-full ${glassPanel} overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 pointer-events-none bg-gradient-to-b ${isLight ? "from-white/60" : "from-white/15"} to-transparent`}
            />

            <button
              onClick={() => handleShare(business.name)}
              className="flex items-center justify-center transition-transform hover:scale-110 opacity-80 hover:opacity-100 relative z-10 outline-none"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
            </button>

            <div className="w-[1.5px] h-4 md:h-5 bg-current opacity-30 rounded-full relative z-10" />

            <div className="flex items-center justify-center opacity-80 hover:opacity-100 transition-transform hover:scale-110 md:scale-[1.15] origin-center relative z-10 outline-none">
              <FavoriteButton
                businessId={business.id}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={isFavorited}
                emailVerified={emailVerified}
              />
            </div>
          </div>
        </motion.div>

        {/* 🚀 O CARTÃO GIGANTE E A COLUNA DIREITA (Layout Flex Protegido contra Zoom) */}
        <div className="relative z-30 w-full max-w-[1800px] mx-auto px-6 md:px-10 lg:px-16 xl:px-20 flex flex-col xl:flex-row items-center justify-between pt-24 md:pt-28 pb-12 gap-12 xl:gap-16">
          {/* --- ESQUERDA: O CARTÃO HERO --- */}
          <motion.div
            variants={slowStagger}
            initial="hidden"
            animate="visible"
            className={`w-full max-w-4xl xl:max-w-[55%] 2xl:max-w-4xl ${glassPanel} px-6 py-10 md:px-12 md:py-16 lg:px-16 lg:py-20 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center md:items-start text-center md:text-left shrink-0`}
          >
            <div
              className={`absolute inset-0 rounded-[inherit] pointer-events-none ${isLight ? "bg-white/60" : "bg-[#0a0a0a]/60"}`}
            />

            <div
              className={`absolute top-0 left-0 right-0 h-32 rounded-t-[inherit] pointer-events-none bg-gradient-to-b ${isLight ? "from-white/50" : "from-white/5"} to-transparent z-0`}
            />

            {business.imageUrl && (
              <motion.div variants={slowFadeUp} className="mb-4 relative z-10">
                <div
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-full p-1 shadow-2xl border ${theme.border} bg-white/20 mx-auto md:mx-0 relative overflow-hidden`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={business.imageUrl}
                      alt={`Logo de ${business.name}`}
                      fill
                      priority
                      sizes="(max-width: 768px) 96px, 112px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              variants={slowFadeUp}
              className="flex flex-wrap items-center gap-3 mb-4 w-full justify-center md:justify-start relative z-10"
            >
              <div
                className={`xl:hidden px-4 py-2 rounded-full ${isLight ? "bg-black/5" : "bg-white/10"} border border-current/10 flex items-center shadow-sm`}
              >
                <span
                  className={`text-[10px] md:text-xs font-sans font-black tracking-[0.3em] uppercase ${primary}`}
                >
                  {business.urban_tag || business.city || "Exclusive"}
                </span>
              </div>

              {realHours.length > 0 && (
                <div
                  className={`px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm ${isOpen ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"}`}
                  />
                  <span
                    className={`text-[10px] md:text-xs font-black tracking-[0.2em] uppercase ${isOpen ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {isOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.h1
              variants={slowFadeUp}
              className="text-4xl md:text-5xl lg:text-[4rem] font-serif italic tracking-tight leading-[1.05] mb-4 font-light drop-shadow-md w-full relative z-10"
            >
              {business.name}
            </motion.h1>

            {hasDescription && (
              <motion.p
                variants={slowFadeUp}
                className="text-base md:text-xl font-medium leading-relaxed mb-6 w-full text-balance text-current drop-shadow-sm relative z-10"
              >
                {business.description}
              </motion.p>
            )}

            <motion.div
              variants={slowFadeUp}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center md:justify-start relative z-10"
            >
              {((isExternalLink && actionLink) ||
                (rawBusiness.menuMode === "PDF" && rawBusiness.catalogPdf)) && (
                <button
                  onClick={() => {
                    if (isExternalLink && actionLink) {
                      Actions.registerClickEvent(business.id, "WEBSITE");
                      window.open(
                        formatExternalLink(actionLink),
                        "_blank",
                        "noopener,noreferrer",
                      );
                    } else if (rawBusiness.menuMode === "PDF") {
                      setIsPdfModalOpen(true);
                    }
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-full ${bgAction} shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  {rawBusiness.menuMode === "DIGITAL"
                    ? "Acessar Loja"
                    : rawBusiness.menuMode === "AGENDA"
                      ? "Agendar Horário"
                      : "Ver Catálogo"}{" "}
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              )}

              {/* 🚀 LOGICA DE CONTATO: Prioriza WhatsApp. Se não tiver, vira Telefone. */}
              {(hasWhatsapp || hasPhone) && (
                <button
                  onClick={() =>
                    handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")
                  }
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase px-8 py-4 rounded-full border border-current/20 shadow-md active:scale-[0.98] transition-all backdrop-blur-md ${
                    isLight
                      ? "bg-white/90 hover:bg-white text-current"
                      : "bg-black/40 hover:bg-black/70 text-white"
                  }`}
                >
                  {hasWhatsapp ? (
                    <MessageCircle
                      size={16}
                      strokeWidth={2.5}
                      className={primary}
                    />
                  ) : (
                    <Phone size={16} strokeWidth={2.5} className={primary} />
                  )}{" "}
                  Falar Conosco
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* --- DIREITA: ASSINATURA EDITORIAL + GALERIA (Apenas Desktop) --- */}
          <motion.div
            variants={slowStagger}
            initial="hidden"
            animate="visible"
            className="hidden xl:flex flex-col items-center w-full max-w-[550px] 2xl:max-w-[700px] gap-8 shrink-0"
          >
            <div className="flex items-center gap-6 w-full justify-center opacity-80 drop-shadow-md">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "60px", opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="h-[1px] bg-current"
              />
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, x: -10 }}
                animate={{ clipPath: "inset(0 0 0 0)", opacity: 1, x: 0 }}
                transition={{ duration: 2.5, delay: 1.2, ease: "easeOut" }}
                className="text-[11px] md:text-xs font-sans font-black tracking-[0.5em] uppercase whitespace-nowrap"
              >
                {business.urban_tag || business.city || "Exclusive"}
              </motion.div>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "60px", opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="h-[1px] bg-current"
              />
            </div>

            {cleanFeed.length > 0 && (
              <motion.div
                variants={slowFadeUp}
                className="w-full flex flex-col gap-6"
              >
                {hasPhotos && hasVideos && (
                  <div className="flex items-center justify-center p-1 border border-current/10 rounded-full w-max mx-auto bg-black/5 dark:bg-white/5 backdrop-blur-md">
                    <button
                      onClick={() => setUserMediaFilter("photos")}
                      className={`px-5 py-2 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${activeMediaFilter === "photos" ? bgAction : "opacity-50 hover:opacity-100"}`}
                    >
                      Fotos
                    </button>
                    <button
                      onClick={() => setUserMediaFilter("motion")}
                      className={`px-5 py-2 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${activeMediaFilter === "motion" ? bgAction : "opacity-50 hover:opacity-100"}`}
                    >
                      Vídeos
                    </button>
                  </div>
                )}

                <div className="w-full relative">
                  <MasterRunway
                    key={activeMediaFilter}
                    feed={cleanFeed.filter((item: any) => {
                      if (activeMediaFilter === "photos")
                        return item.type === "image";
                      if (activeMediaFilter === "motion")
                        return ["video", "video_v", "video_h"].includes(
                          item.type,
                        );
                      return true;
                    })}
                    setSelectedIndex={setSelectedIndex}
                    variant="luxe"
                    themeBorder="border-none"
                    cardBg="bg-transparent"
                    cardShadow="shadow-none"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center relative z-20 pt-2 md:pt-16 pb-12 gap-6 md:gap-16 lg:gap-20">
        {cleanFeed.length > 0 && (
          <section className="xl:hidden w-full relative overflow-hidden pt-0 pb-6 md:py-8">
            <div className="max-w-[1300px] mx-auto w-full flex flex-col items-start px-6 lg:px-12 mb-6">
              <div className="flex flex-row items-center justify-between w-full">
                <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90 text-left">
                  Galeria
                </h2>
                {hasPhotos && hasVideos && (
                  <div className="flex items-center p-1 border border-current/10 rounded-full bg-black/5 dark:bg-white/5">
                    <button
                      onClick={() => setUserMediaFilter("photos")}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${activeMediaFilter === "photos" ? bgAction : "opacity-50 hover:opacity-100"}`}
                    >
                      Fotos
                    </button>
                    <button
                      onClick={() => setUserMediaFilter("motion")}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${activeMediaFilter === "motion" ? bgAction : "opacity-50 hover:opacity-100"}`}
                    >
                      Vídeos
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-[1500px] mx-auto">
              <MasterRunway
                key={activeMediaFilter}
                feed={cleanFeed.filter((item: any) => {
                  if (activeMediaFilter === "photos")
                    return item.type === "image";
                  if (activeMediaFilter === "motion")
                    return ["video", "video_v", "video_h"].includes(item.type);
                  return true;
                })}
                setSelectedIndex={setSelectedIndex}
                variant="luxe"
                themeBorder={border}
                cardBg="bg-transparent"
                cardShadow="shadow-none"
              />
            </div>
          </section>
        )}

        <div className="w-full max-w-[1300px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="flex flex-col gap-8 lg:gap-16 w-full">
            {hasFeatures && (
              <motion.div
                variants={slowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className={`p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] ${glassPanel} flex flex-col gap-8`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-20 rounded-t-[inherit] pointer-events-none bg-gradient-to-b ${isLight ? "from-white/40" : "from-white/5"} to-transparent`}
                />

                <div className="flex flex-col gap-2 relative z-10">
                  <motion.span
                    variants={slowFadeUp}
                    className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary}`}
                  >
                    Nossa Essência
                  </motion.span>
                  <motion.h2
                    variants={slowFadeUp}
                    className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90"
                  >
                    Os Diferenciais
                  </motion.h2>
                </div>
                <div className="flex flex-col gap-5 relative z-10">
                  {business.features
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <motion.div
                        key={i}
                        variants={slowFadeUp}
                        className="flex items-start gap-4 border-t border-current/10 pt-5 group"
                      >
                        <Sparkles
                          className={`w-5 h-5 ${primary} opacity-60 group-hover:opacity-100 transition-all shrink-0 mt-1`}
                          strokeWidth={1.5}
                        />
                        <span className="text-lg md:text-xl font-light opacity-90 leading-relaxed tracking-wide">
                          {f}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {salesChannels.length > 0 && (
              <motion.div
                variants={slowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-5"
              >
                <motion.span
                  variants={slowFadeUp}
                  className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary}`}
                >
                  Boutique Digital
                </motion.span>
                <motion.h2
                  variants={slowFadeUp}
                  className="text-3xl md:text-4xl font-serif italic opacity-90 mb-2"
                >
                  Lojas Oficiais
                </motion.h2>
                <div className="flex flex-col gap-3">
                  {salesChannels.map((channel: any) => (
                    <motion.a
                      variants={slowFadeUp}
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
                      className={`flex items-center justify-between p-6 rounded-[2rem] ${glassPanel} hover:opacity-80 transition-all group`}
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-10 rounded-t-[inherit] pointer-events-none bg-gradient-to-b ${isLight ? "from-white/40" : "from-white/5"} to-transparent`}
                      />

                      <div className="flex items-center gap-5 relative z-10">
                        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                          {channel.icon}
                        </div>
                        <span className="text-base md:text-lg font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100">
                          {channel.name}
                        </span>
                      </div>
                      <ChevronRight
                        size={20}
                        strokeWidth={1.5}
                        className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10"
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {(hasAddress || availableSocials.length > 0 || hasPhone) && (
              <motion.div
                variants={slowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-5"
              >
                <motion.span
                  variants={slowFadeUp}
                  className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary}`}
                >
                  Localização
                </motion.span>
                <motion.h2
                  variants={slowFadeUp}
                  className="text-3xl md:text-4xl font-serif italic opacity-90 mb-2"
                >
                  Onde Estamos
                </motion.h2>

                {/* 🚀 FIX UX: Altura e paddings reduzidos (gap-6 e p-8) */}
                <motion.div
                  variants={slowFadeUp}
                  className={`p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] ${glassPanel} flex flex-col gap-6`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-20 rounded-t-[inherit] pointer-events-none bg-gradient-to-b ${isLight ? "from-white/40" : "from-white/5"} to-transparent`}
                  />

                  {hasAddress && (
                    <>
                      <div className="flex flex-col gap-3 relative z-10">
                        <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90">
                          {business.address || "Endereço não cadastrado"}
                          {business.number &&
                            !business.address?.includes(business.number) &&
                            `, ${business.number}`}
                        </p>
                        {business.complement && (
                          <p className="text-base font-medium opacity-50">
                            {business.complement}
                          </p>
                        )}
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                          {business.neighborhood &&
                            `${business.neighborhood} • `}{" "}
                          {business.city}{" "}
                          {business.state ? `• ${business.state}` : ""}
                        </p>
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          Actions.registerClickEvent(business.id, "MAP")
                        }
                        className={`w-full py-4 rounded-full ${bgAction} flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform relative z-10`}
                      >
                        <Navigation size={16} strokeWidth={2} /> Iniciar Rota
                      </a>
                    </>
                  )}

                  {/* 🚀 LOGICA DE SOCIAIS + TELEFONE (SOLTOS NO RODAPÉ DO CARTÃO) */}
                  {(availableSocials.length > 0 || hasPhone) && (
                    <div
                      className={`${hasAddress ? "pt-6 border-t border-current/10" : ""} flex flex-col gap-5 items-center relative z-10`}
                    >
                      <div className="flex gap-4 flex-wrap justify-center">
                        {availableSocials.map((s: string) => {
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
                              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-current/20 hover:bg-current/10 transition-all hover:scale-110"
                            >
                              {s === "instagram" ? (
                                <Instagram
                                  strokeWidth={1.5}
                                  className="w-5 h-5 md:w-6 md:h-6 opacity-80"
                                />
                              ) : s === "facebook" ? (
                                <Facebook
                                  strokeWidth={1.5}
                                  className="w-5 h-5 md:w-6 md:h-6 opacity-80"
                                />
                              ) : s === "tiktok" ? (
                                <TikTokIcon className="w-5 h-5 md:w-6 md:h-6 opacity-80" />
                              ) : (
                                <Globe
                                  strokeWidth={1.5}
                                  className="w-5 h-5 md:w-6 md:h-6 opacity-80"
                                />
                              )}
                            </a>
                          );
                        })}

                        {/* Botão de Telefone Solto na Galeria de Sociais */}
                        {hasPhone && (
                          <button
                            onClick={() => handleTrackLead("phone")}
                            title="Ligar"
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-current/20 hover:bg-current/10 transition-all hover:scale-110"
                          >
                            <Phone
                              strokeWidth={1.5}
                              className="w-5 h-5 md:w-6 md:h-6 opacity-80"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-8 lg:gap-16 w-full">
            {hasHours && (
              <motion.div
                variants={slowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-5"
              >
                <motion.span
                  variants={slowFadeUp}
                  className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary}`}
                >
                  Agenda
                </motion.span>
                <motion.h2
                  variants={slowFadeUp}
                  className="text-3xl md:text-4xl font-serif italic opacity-90 mb-2"
                >
                  Horários
                </motion.h2>
                <motion.div
                  variants={slowFadeUp}
                  className={`p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] ${glassPanel} flex flex-col gap-5`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-20 rounded-t-[inherit] pointer-events-none bg-gradient-to-b ${isLight ? "from-white/40" : "from-white/5"} to-transparent`}
                  />

                  {realHours.map((h: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between font-light text-base md:text-xl group py-2 relative z-10"
                    >
                      <span
                        className={`uppercase tracking-widest text-[10px] md:text-xs font-bold ${h.isClosed ? "opacity-30" : "opacity-70 group-hover:opacity-100"}`}
                      >
                        {h.day}
                      </span>
                      <div className="flex-grow mx-4 border-b border-dotted border-current/20 opacity-50" />
                      <span
                        className={
                          h.isClosed
                            ? "opacity-30 italic text-sm"
                            : `opacity-100 font-medium ${theme.textColor}`
                        }
                      >
                        {h.time}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {hasFaqs && (
              <motion.div
                variants={slowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-3"
              >
                <motion.span
                  variants={slowFadeUp}
                  className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary}`}
                >
                  FAQ
                </motion.span>
                <motion.h2
                  variants={slowFadeUp}
                  className="text-3xl md:text-4xl font-serif italic opacity-90 mb-4"
                >
                  Perguntas Frequentes
                </motion.h2>

                <motion.div variants={slowFadeUp} className="flex flex-col">
                  {faqs.map((f: any, i: number) => (
                    <LuxeAccordion
                      key={i}
                      q={f.q || f.question}
                      a={f.a || f.answer}
                      primary={primary}
                      themeBorder={border}
                      cardBg={theme.cardBg}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <div className={`w-full relative z-10 border-t border-current/5 mt-6`}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 pb-16 pt-12">
          <CommentsSection
            businessId={rawBusiness.id}
            businessOwnerId={rawBusiness.userId}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            emailVerified={emailVerified}
            themeColor={theme.primary}
            comments={rawBusiness.comments || []}
            businessRating={business.rating}
          />
          <div className="w-full flex justify-center py-8 opacity-20 hover:opacity-100 transition-opacity">
            <ReportModal businessSlug={business.slug} />
          </div>
        </div>
      </div>

      <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />

      {/* 🚀 LÓGICA DO WHATSAPP FLUTUANTE (Também vira Telefone se não tiver zap) */}
      {(hasWhatsapp || hasPhone) && (
        <motion.button
          aria-label={hasWhatsapp ? "Abrir WhatsApp" : "Ligar"}
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")}
          className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full ${hasWhatsapp ? "bg-[#25D366] text-white shadow-[0_15px_40px_rgba(37,211,102,0.4)]" : `${bgAction} shadow-xl`} flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 border border-white/20`}
        >
          {hasWhatsapp ? (
            <MessageCircle
              className="w-7 h-7 md:w-8 md:h-8"
              fill="currentColor"
              strokeWidth={1.5}
            />
          ) : (
            <Phone
              className="w-7 h-7 md:w-8 md:h-8"
              fill="currentColor"
              strokeWidth={1.5}
            />
          )}
        </motion.button>
      )}

      <TemplateLightbox
        images={lightboxImages}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={safeSetIndex}
      />

      <AnimatePresence>
        {isPdfModalOpen && rawBusiness.catalogPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-4xl h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative shadow-2xl">
              <div className="w-full h-20 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Visualização de Documento
                </span>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-200 hover:bg-rose-500 hover:text-white rounded-full transition-colors text-slate-500"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-200/50 p-3 md:p-5">
                <iframe
                  src={`${rawBusiness.catalogPdf}#toolbar=0`}
                  className="w-full h-full border-none rounded-xl shadow-inner"
                  title="Catálogo PDF"
                />
              </div>
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
