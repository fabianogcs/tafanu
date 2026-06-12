"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image"; // ✅ ADICIONE ESTA LINHA AQUI
import { motion, AnimatePresence, useInView } from "framer-motion";
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

// --- ACORDEÃO LUXO ---
const LuxeAccordion = ({ q, a, primary, themeBorder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${themeBorder} transition-all duration-500 py-3`}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Alternar visualização da resposta"
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // 🚀 ESTADO DO MODAL DE PDF
  // 🚀 O filtro inteligente começa nulo
  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

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

  // ==========================================
  // 🚀 CÉREBRO DA GALERIA: LÓGICA CONDICIONAL
  // ==========================================
  const hasPhotos = cleanFeed.some((item: any) => item.type === "image");
  const hasVideos = cleanFeed.some((item: any) =>
    ["video", "video_v", "video_h"].includes(item.type),
  );
  // Se o usuário não clicou em nada, o sistema escolhe: Fotos 1º, se não tiver, Vídeos.
  const activeMediaFilter =
    userMediaFilter || (hasPhotos ? "photos" : "motion");

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
    if (selectedIndex !== null || isPdfModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex, isPdfModalOpen]); // 🚀 AGORA ELE TRAVA A TELA QUANDO O PDF ABRIR TAMBÉM

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

      {/* ==========================================
          🚀 LUXE HERO BANNER: Cartão Flutuante & Dynamic Focus
          ========================================== */}
      <header
        className={`relative w-full overflow-hidden transition-colors duration-1000 ${
          business.coverImage ? theme.bgPage : bgHero
        } shadow-sm`}
      >
        {/* === ESTRUTURA MOBILE === */}
        <div className="block md:hidden relative w-full">
          {/* 1. Área do Topo (Capa ou Fundo Reduzido) */}
          <div
            className={`relative w-full z-0 ${business.coverImage ? "h-[45vh]" : "h-[25vh]"}`}
          >
            {business.coverImage ? (
              <Image
                src={business.coverImage}
                alt={`Destaque de ${business.name}`}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : (
              /* Fundo limpo com degradê quando não há foto (sem monogramas) */
              <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            )}

            {/* Botões de Ação no Topo do Mobile */}
            <div className="absolute top-6 right-4 z-30">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-colors ${business.coverImage ? "bg-black/20 border-white/20 text-white/90" : "bg-current/5 border-current/10 text-current/80"}`}
              >
                <button
                  onClick={() => handleShare(business.name)}
                  className="p-1"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div
                  className={`w-[1px] h-3 ${business.coverImage ? "bg-white/20" : "bg-current/20"}`}
                />
                <div className="scale-90">
                  <FavoriteButton
                    businessId={business.id}
                    isLoggedIn={isLoggedIn}
                    initialIsFavorited={isFavorited}
                    emailVerified={emailVerified}
                  />
                </div>
              </div>
            </div>

            {/* Sombra de Transição para o Cartão APENAS se tiver foto */}
            {business.coverImage && (
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            )}
          </div>

          {/* 2. O Cartão Flutuante de Texto Mobile */}
          {/* Se não tem foto, o cartão fica transparente e mescla com o fundo, criando uma tela limpa */}
          <div
            className={`relative z-20 w-full px-6 pt-16 pb-14 rounded-t-[2.5rem] flex flex-col items-center text-center ${
              business.coverImage
                ? `-mt-24 shadow-[0_-15px_40px_rgba(0,0,0,0.05)] ${theme.bgPage}`
                : `-mt-12 bg-transparent`
            }`}
          >
            {/* Logo Centralizada */}
            {business.imageUrl && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden p-1 shadow-2xl backdrop-blur-xl border ${theme.border} bg-white/95 dark:bg-black/95`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden border border-current/10">
                    <Image
                      src={business.imageUrl}
                      alt={`Logo`}
                      fill
                      priority
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            <h1
              className={`text-4xl font-serif italic tracking-tight leading-[1.1] ${theme.textColor} mb-3 font-medium mt-1`}
            >
              {business.name}
            </h1>

            <div className="flex flex-col items-center gap-3 mb-6">
              <span
                className={`text-[9px] font-sans font-bold tracking-[0.3em] uppercase opacity-80 ${primary}`}
              >
                {business.urban_tag || business.city || "Boutique"}
              </span>

              {realHours.length > 0 && (
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                  />
                  <span
                    className={`text-[8px] font-bold tracking-widest uppercase ${isOpen ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {isOpen ? "Aberto Agora" : "Fechado"}
                  </span>
                </div>
              )}
            </div>
            {/* 🚀 AJUSTE 1: BIO DO MOBILE MAIOR E MAIS PRESENTE */}
            {hasDescription && (
              <p
                className={`text-sm md:text-base font-medium opacity-80 ${theme.textColor} leading-[1.7] mb-8 max-w-sm text-balance drop-shadow-sm`}
              >
                {business.description}
              </p>
            )}

            {/* Botões Mobile */}
            <div className="w-full flex flex-col gap-3 max-w-xs">
              {rawBusiness.catalogPdf && (
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className={`w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase rounded-full ${bgAction} shadow-md active:scale-[0.98] transition-all`}
                >
                  Explorar Menu <ChevronRight size={14} strokeWidth={2} />
                </button>
              )}
              {hasWhatsapp && (
                <button
                  onClick={() => handleTrackLead("whatsapp")}
                  className={`w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase rounded-full text-current bg-white/60 dark:bg-black/40 backdrop-blur-md border border-current/30 shadow-sm active:scale-[0.98] transition-all`}
                >
                  Contato Rápido{" "}
                  <Sparkles size={14} strokeWidth={1.5} className={primary} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === ESTRUTURA DESKTOP === */}
        <div className="hidden md:flex flex-row min-h-[85vh] relative">
          {/* Compartilhar / Favoritar no Desktop (Fixo no topo direito) */}
          <div className="absolute top-8 right-8 z-30">
            <div
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-colors ${business.coverImage ? "bg-black/20 border-white/20 text-white/90 hover:text-white" : "bg-current/5 border-current/10 text-current/80 hover:text-current"}`}
            >
              <button
                onClick={() => handleShare(business.name)}
                className="transition-all hover:scale-110"
              >
                <Share2 className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div
                className={`w-[1px] h-4 ${business.coverImage ? "bg-white/20" : "bg-current/20"}`}
              />
              <FavoriteButton
                businessId={business.id}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={isFavorited}
                emailVerified={emailVerified}
              />
            </div>
          </div>

          {/* LÓGICA CONDICIONAL: COM CAPA (Dividido) vs SEM CAPA (Centralizado) */}
          {business.coverImage ? (
            <>
              {/* LADO ESQUERDO: Texto Editorial */}
              <div
                className={`relative flex flex-col justify-center items-center text-center p-16 z-20 w-[45%] shrink-0 ${theme.bgPage}`}
              >
                {business.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="mb-4 relative flex flex-col items-center"
                  >
                    <div
                      className={`w-36 h-36 rounded-full overflow-hidden p-1.5 shadow-2xl backdrop-blur-xl border ${theme.border} bg-white/50 dark:bg-black/20`}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden border border-current/10">
                        <Image
                          src={business.imageUrl}
                          alt={`Logo`}
                          fill
                          priority
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div
                      className={`w-px h-8 mt-4 ${theme.border} bg-current/20`}
                    />
                  </motion.div>
                )}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.1 }}
                  className={`text-6xl lg:text-7xl font-serif italic tracking-tight leading-[1.05] ${theme.textColor} mb-4 font-medium`}
                >
                  {business.name}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="flex flex-col items-center gap-4 mb-8"
                >
                  <span
                    className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase opacity-90 ${primary}`}
                  >
                    {business.urban_tag || business.city || "Boutique"}
                  </span>
                  {realHours.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                      />
                      <span
                        className={`text-[9px] font-bold tracking-widest uppercase ${isOpen ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {isOpen ? "Aberto Agora" : "Fechado"}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* 🚀 AJUSTE 2: BIO DO DESKTOP (COM CAPA) MAIOR E MAIS PRESENTE */}
                {hasDescription && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className={`text-lg font-medium opacity-80 ${theme.textColor} max-w-md leading-[1.8] mb-10 text-balance`}
                  >
                    {business.description}
                  </motion.p>
                )}

                {/* Botões Desktop */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="w-full max-w-xs flex flex-col gap-4"
                >
                  {rawBusiness.catalogPdf && (
                    <button
                      onClick={() => setIsPdfModalOpen(true)}
                      className={`w-full h-14 flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.2em] uppercase rounded-full ${bgAction} shadow-lg hover:-translate-y-0.5 transition-all`}
                    >
                      Explorar Menu <ChevronRight size={14} strokeWidth={2} />
                    </button>
                  )}
                  {hasWhatsapp && (
                    <button
                      onClick={() => handleTrackLead("whatsapp")}
                      className={`w-full h-14 flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.2em] uppercase rounded-full text-current bg-white/60 dark:bg-black/40 backdrop-blur-md border border-current/30 shadow-sm hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-0.5 transition-all`}
                    >
                      Contato Rápido{" "}
                      <Sparkles
                        size={14}
                        strokeWidth={1.5}
                        className={primary}
                      />
                    </button>
                  )}
                </motion.div>
              </div>

              {/* LADO DIREITO: Fotografia Editorial */}
              <div className="relative z-10 w-[55%] h-auto min-h-full">
                <Image
                  src={business.coverImage}
                  alt={`Destaque Visual`}
                  fill
                  priority
                  sizes="60vw"
                  className="object-cover object-center"
                />
                <div
                  className={`absolute inset-y-0 left-0 w-32 z-10 pointer-events-none ${theme.bgPage}`}
                  style={{
                    maskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                  }}
                />
              </div>
            </>
          ) : (
            /* LÓGICA CENTRALIZADA (Quando não tem capa no Desktop) */
            <div className="w-full flex flex-col justify-center items-center text-center p-16 z-20">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

              {business.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="mb-5 relative flex flex-col items-center"
                >
                  <div
                    className={`w-40 h-40 rounded-full overflow-hidden p-1.5 shadow-2xl backdrop-blur-xl border ${theme.border} bg-white/50 dark:bg-black/20`}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-current/10">
                      <Image
                        src={business.imageUrl}
                        alt={`Logo`}
                        fill
                        priority
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div
                    className={`w-px h-10 mt-5 ${theme.border} bg-current/20`}
                  />
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.1 }}
                className={`text-7xl lg:text-8xl font-serif italic tracking-tight leading-[1.05] ${theme.textColor} mb-6 font-medium drop-shadow-sm max-w-4xl`}
              >
                {business.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex flex-col items-center gap-4 mb-10"
              >
                <span
                  className={`text-[12px] font-sans font-bold tracking-[0.4em] uppercase opacity-90 ${primary}`}
                >
                  {business.urban_tag || business.city || "Boutique"}
                </span>
                {realHours.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                    />
                    <span
                      className={`text-[10px] font-bold tracking-widest uppercase ${isOpen ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isOpen ? "Aberto Agora" : "Fechado"}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* 🚀 AJUSTE 3: BIO DO DESKTOP CENTRALIZADO (SEM CAPA) ENORME E IMPONENTE */}
              {hasDescription && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className={`text-xl md:text-2xl font-normal opacity-85 ${theme.textColor} max-w-3xl leading-[1.8] mb-12 text-balance drop-shadow-sm`}
                >
                  {business.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="flex gap-6"
              >
                {rawBusiness.catalogPdf && (
                  <button
                    onClick={() => setIsPdfModalOpen(true)}
                    className={`flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.2em] uppercase px-10 py-5 rounded-full ${bgAction} shadow-lg hover:-translate-y-1 transition-all`}
                  >
                    Explorar Menu <ChevronRight size={14} strokeWidth={2} />
                  </button>
                )}
                {hasWhatsapp && (
                  <button
                    onClick={() => handleTrackLead("whatsapp")}
                    className={`flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.2em] uppercase px-10 py-5 rounded-full text-current bg-white/60 dark:bg-black/40 backdrop-blur-md border border-current/30 shadow-lg hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-1 transition-all`}
                  >
                    Contato Rápido{" "}
                    <Sparkles size={14} strokeWidth={1.5} className={primary} />
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </header>
      {/* ==========================================
          🚀 THE MASTER RUNWAY (Edge-to-Edge Luxe)
          ========================================== */}
      <section className="w-full pt-2 md:pt-20 pb-6 md:pb-10 relative z-20 overflow-hidden bg-gradient-to-b from-transparent via-current/[0.02] to-transparent">
        {/* Ambient Glow no fundo da galeria para não ficar um branco morto */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {cleanFeed.length > 0 && (
          <div className="w-full relative z-10">
            {/* Header da Galeria - Apenas as Abas agora */}
            <div className="flex flex-col items-center text-center px-6">
              {/* 🚀 ABAS DE FOTOS/VÍDEOS */}
              {hasPhotos && hasVideos && (
                <div className="flex items-center p-1 bg-current/5 border border-current/10 rounded-full backdrop-blur-md mb-6 md:mb-10">
                  <button
                    onClick={() => setUserMediaFilter("photos")}
                    className={`px-6 py-2.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${
                      activeMediaFilter === "photos"
                        ? bgAction
                        : "text-current/50 hover:text-current"
                    }`}
                  >
                    Fotos
                  </button>
                  <button
                    onClick={() => setUserMediaFilter("motion")}
                    className={`px-6 py-2.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${
                      activeMediaFilter === "motion"
                        ? bgAction
                        : "text-current/50 hover:text-current"
                    }`}
                  >
                    Vídeos
                  </button>
                </div>
              )}
            </div>

            {/* O Carrossel Master Runway - Agora preenchendo a tela toda */}
            <div className="w-full px-0 md:px-6 lg:px-12">
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
              />
            </div>
          </div>
        )}
      </section>

      <main className="w-full flex flex-col items-center relative z-10 px-4 md:px-8 lg:px-12 pb-20 md:pb-32">
        <div className="w-full max-w-[1300px] flex flex-col gap-5 md:gap-6 mt-2">
          {/* 🚀 BENTO 1: A ESSÊNCIA (Destaques) */}
          {hasFeatures && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className={`w-full p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-start gap-8 md:gap-12`}
            >
              <div className="shrink-0 text-left flex flex-col items-start">
                <span
                  className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase ${primary} mb-2`}
                >
                  A Essência
                </span>
                <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90">
                  Os Detalhes
                </h2>
              </div>
              <div className="hidden lg:block w-px h-16 bg-current/10 shrink-0" />
              <div className="flex flex-wrap justify-start gap-x-8 gap-y-5 w-full">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 cursor-default group"
                    >
                      <Sparkles
                        className={`w-4 h-4 ${primary} opacity-50 group-hover:opacity-100 transition-opacity`}
                        strokeWidth={1.5}
                      />
                      <span
                        className={`text-sm md:text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity tracking-wide ${theme.textColor}`}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* 🚀 O GRID PRINCIPAL: INTELIGENTE E RESPONSIVO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 w-full items-start">
            {/* ==========================================
                COLUNA ESQUERDA (Atendimento e Compras)
                -> Inteligência: Se a direita estiver vazia, ocupa 12 colunas.
                ========================================== */}
            {(hasWhatsapp ||
              hasPhone ||
              availableSocials.length > 0 ||
              salesChannels.length > 0) && (
              <div
                className={`flex flex-col gap-5 md:gap-6 ${hasHours || hasAddress ? "lg:col-span-7" : "lg:col-span-12"}`}
              >
                {/* Concierge & Redes Sociais */}
                {(hasWhatsapp || hasPhone || availableSocials.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true }}
                    className={`w-full p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg flex flex-col`}
                  >
                    <span
                      className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase ${primary} mb-3`}
                    >
                      Contato Global
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight opacity-90 mb-8">
                      Atendimento
                    </h2>

                    {/* Botões de Contato */}
                    {(hasWhatsapp || hasPhone) && (
                      <div className="flex flex-wrap gap-4 w-full">
                        {hasWhatsapp && (
                          <button
                            onClick={() => handleTrackLead("whatsapp")}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-full border border-current/10 ${theme.bgSecondary} hover:-translate-y-1 transition-all shadow-sm group`}
                          >
                            <div
                              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-current/5 group-hover:bg-current/10 transition-colors`}
                            >
                              <MessageCircle
                                size={16}
                                strokeWidth={1.5}
                                className={primary}
                              />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase mt-0.5">
                              WhatsApp
                            </span>
                          </button>
                        )}
                        {hasPhone && (
                          <button
                            onClick={() => handleTrackLead("phone")}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-full border border-current/10 ${theme.bgSecondary} hover:-translate-y-1 transition-all shadow-sm group`}
                          >
                            <div
                              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-current/5 group-hover:bg-current/10 transition-colors`}
                            >
                              <Phone
                                size={16}
                                strokeWidth={1.5}
                                className={primary}
                              />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase mt-0.5">
                              Ligar Agora
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Siga-nos Integrado */}
                    {availableSocials.length > 0 && (
                      <div className="pt-8 mt-8 border-t border-current/10">
                        <span
                          className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase ${primary} mb-5 block`}
                        >
                          Siga-nos
                        </span>
                        <div className="flex flex-wrap gap-3">
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
                                className={`w-12 h-12 rounded-full flex items-center justify-center border border-current/10 ${theme.bgSecondary} shadow-sm hover:-translate-y-1 transition-all group`}
                              >
                                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                  {s === "instagram" ? (
                                    <Instagram
                                      strokeWidth={1.5}
                                      className="w-5 h-5"
                                    />
                                  ) : s === "facebook" ? (
                                    <Facebook
                                      strokeWidth={1.5}
                                      className="w-5 h-5"
                                    />
                                  ) : s === "tiktok" ? (
                                    <TikTokIcon className="w-5 h-5" />
                                  ) : (
                                    <Globe
                                      strokeWidth={1.5}
                                      className="w-5 h-5"
                                    />
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Comprar Online */}
                {salesChannels.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className={`w-full p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg`}
                  >
                    <span
                      className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase ${primary} mb-3 block`}
                    >
                      Boutique Digital
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90 mb-8">
                      Comprar Online
                    </h2>
                    <div className="flex flex-wrap gap-3">
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
                          className={`flex items-center gap-3 px-6 py-3.5 rounded-full border border-current/10 ${theme.bgSecondary} hover:-translate-y-1 transition-all shadow-sm group`}
                        >
                          <div
                            className={`opacity-80 group-hover:opacity-100 transition-opacity ${channel.hover}`}
                          >
                            {channel.icon}
                          </div>
                          <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5 opacity-90">
                            {channel.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ==========================================
                COLUNA DIREITA (Horários e Localização)
                -> Inteligência: Se a esquerda estiver vazia, ocupa 12 colunas.
                ========================================== */}
            {(hasHours || hasAddress) && (
              <div
                className={`flex flex-col gap-5 md:gap-6 ${hasWhatsapp || hasPhone || availableSocials.length > 0 || salesChannels.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}`}
              >
                {/* Horários Otimizados - Fim do "Buraco Branco" */}
                {hasHours && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className={`w-full p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg flex flex-col`}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className={`w-12 h-12 shrink-0 rounded-full border border-current/10 flex items-center justify-center ${theme.bgSecondary}`}
                      >
                        <Clock
                          size={18}
                          strokeWidth={1.5}
                          className={primary}
                        />
                      </div>
                      <div>
                        <span
                          className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase opacity-60 block mb-1`}
                        >
                          Agenda
                        </span>
                        <h2 className="text-2xl font-serif italic opacity-90">
                          Horários
                        </h2>
                      </div>
                    </div>
                    {/* Agora flui naturalmente, sem ser forçado a esticar */}
                    <div className="flex flex-col gap-4 w-full">
                      {realHours.map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-end font-light text-sm group"
                        >
                          <span
                            className={`uppercase tracking-widest text-[10px] font-bold ${h.isClosed ? "opacity-30" : "opacity-70 group-hover:opacity-100"}`}
                          >
                            {h.day}
                          </span>
                          <div className="flex-grow mx-4 border-b border-dashed border-current/20 mb-1.5 opacity-50" />
                          <span
                            className={
                              h.isClosed
                                ? "opacity-30 italic text-xs"
                                : `opacity-100 font-medium text-xs ${primary}`
                            }
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Localização Compacta (Abaixo dos horários) */}
                {hasAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className={`w-full p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg flex flex-col gap-6 group`}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div
                        className={`w-12 h-12 shrink-0 rounded-full border border-current/10 flex items-center justify-center ${theme.bgSecondary} group-hover:scale-110 transition-transform`}
                      >
                        <Globe
                          size={20}
                          strokeWidth={1.5}
                          className={primary}
                        />
                      </div>
                      <div className="flex-grow pt-1">
                        <span
                          className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase opacity-60 block mb-2`}
                        >
                          Localização
                        </span>
                        <p className="text-xl md:text-2xl font-serif italic leading-snug opacity-90">
                          {business.address || "Endereço não informado"}
                          {business.number &&
                            !business.address?.includes(business.number) &&
                            `, ${business.number}`}
                        </p>
                        {(business.complement ||
                          business.neighborhood ||
                          business.city) && (
                          <p className="text-xs font-light opacity-60 mt-2 leading-relaxed">
                            {business.complement && `${business.complement} • `}
                            {business.neighborhood &&
                              `${business.neighborhood} • `}
                            {business.city}{" "}
                            {business.state ? `• ${business.state}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        Actions.registerClickEvent(business.id, "MAP")
                      }
                      className={`w-full flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.2em] uppercase px-8 py-4 mt-2 rounded-[1.2rem] ${bgAction} shadow-md hover:-translate-y-0.5 transition-all`}
                    >
                      Como Chegar <ChevronRight size={14} strokeWidth={2} />
                    </a>
                  </motion.div>
                )}
              </div>
            )}

            {/* ==========================================
                FAIXA INFERIOR (FAQs)
                ========================================== */}
            {hasFaqs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className={`col-span-1 lg:col-span-12 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] ${theme.cardBg} border ${theme.border} shadow-lg mt-2 w-full`}
              >
                <div className="flex flex-col items-center text-center mb-10">
                  <span
                    className={`text-[9px] font-sans font-bold tracking-[0.4em] uppercase ${primary} mb-3`}
                  >
                    Dúvidas
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight opacity-90">
                    Perguntas Frequentes
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto flex flex-col w-full">
                  {faqs.map((f: any, i: number) => (
                    <LuxeAccordion
                      key={i}
                      q={f.q || f.question}
                      a={f.a || f.answer}
                      primary={primary}
                      themeBorder={theme.border}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <div className={`w-full ${theme.bgPage}`}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 pb-16">
          <div className="w-full flex justify-center py-10 opacity-20 hover:opacity-100 transition-opacity border-t border-current/10 mt-6">
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
      </div>

      <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />

      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp Flutuante"
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

      <TemplateLightbox
        images={lightboxImages}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={safeSetIndex}
      />

      {/* ==========================================
          🚀 MODAL DE PDF (CARDÁPIO/CATÁLOGO)
          ========================================== */}
      <AnimatePresence>
        {isPdfModalOpen && rawBusiness.catalogPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
              {/* Barra de Topo com Botão de Fechar */}
              <div className="w-full h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                  Visualização de Documento
                </span>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-rose-500 hover:text-white rounded-full transition-colors text-slate-500"
                >
                  <Plus className="rotate-45" size={20} strokeWidth={2} />
                </button>
              </div>

              {/* O Coração: O Leitor de PDF nativo do navegador */}
              <div className="flex-1 w-full bg-slate-200/50">
                <iframe
                  src={`${rawBusiness.catalogPdf}#toolbar=0`}
                  className="w-full h-full border-none"
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
