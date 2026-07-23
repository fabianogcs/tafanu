"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
// 🚀 INJEÇÃO DE MOTION DESIGN: Importamos o 'Variants' para o TypeScript aprovar
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
  MessageCircle,
  Share2,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
  Camera,
  Sparkles,
  Plus,
  HelpCircle,
  X,
  ArrowRight,
  Navigation,
  BadgeCheck, // 🚀 CIRURGIA DEV: Importado para o selo de verificado
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

// 🚀 ANIMAÇÕES PADRONIZADAS
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  // 🚀 PARALLAX EFFECT
  const { scrollY } = useScroll();
  const yHeroBg = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHeroBg = useTransform(scrollY, [0, 400], [1, 0.3]);

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
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : `${business.address || ""}, ${business.city || ""}, ${business.state || ""}`.trim(),
  )}`;

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );
  const isExternalLink = !!business.isExternalLink;
  const actionLink = business.actionLink || "";

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
      .map((item: any) =>
        item.type === "image"
          ? { ...item, lightboxIndex: imgIndexCounter++ }
          : item,
      );
  }, [rawFeed]);

  const lightboxImages = useMemo(
    () =>
      cleanFeed
        .filter((item: any) => item.type === "image")
        .map((item: any) => item.url),
    [cleanFeed],
  );
  const hasPhotos = cleanFeed.some((item: any) => item.type === "image");
  const hasVideos = cleanFeed.some((item: any) =>
    ["video", "video_v", "video_h"].includes(item.type),
  );
  const activeMediaFilter =
    userMediaFilter || (hasPhotos ? "photos" : "motion");

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
        if (type === "whatsapp")
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        else window.location.href = targetUrl;
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

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-current selection:text-white`}
    >
      {/* 🚀 HEADER PARALLAX E OVERLAPS */}
      <header
        className={`relative w-full pt-12 pb-24 md:pt-20 md:pb-32 px-4 md:px-8 flex flex-col rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl z-20 text-white overflow-hidden`}
      >
        {/* Fundo Parallax */}
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
              className="object-cover"
            />
          )}
        </motion.div>

        {/* Gradiente de proteção */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />

        {/* Botões do Topo Flutuantes */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-6 right-6 md:top-8 md:right-10 z-30"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <button
              aria-label="Compartilhar perfil"
              onClick={() => handleShare(business.name)}
              className="flex items-center justify-center transition-transform hover:scale-110"
            >
              <Share2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="w-[1px] h-4 bg-white/20" />
            <div className="flex items-center justify-center transition-transform hover:scale-110">
              <FavoriteButton
                businessId={business.id}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={isFavorited}
                emailVerified={emailVerified}
              />
            </div>
          </div>
        </motion.div>

        {/* Conteúdo Hero (Stagger Effect) */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-20 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 mt-8"
        >
          {/* Imagem do Perfil com Hover Magnético */}
          {business.imageUrl && (
            <motion.div
              variants={fadeUpVariant}
              className="flex justify-center relative w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 shrink-0 group"
            >
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 rotate-3 group-hover:rotate-6 transition-all duration-500 ease-out" />
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 -rotate-3 group-hover:-rotate-6 transition-all duration-500 ease-out" />
              <Image
                src={business.imageUrl}
                alt={`Logotipo ${business.name}`}
                fill
                priority
                sizes="(max-width: 768px) 192px, (max-width: 1200px) 288px, 320px"
                className="object-cover rounded-[2.5rem] shadow-2xl relative z-10 bg-white group-hover:scale-[1.02] transition-transform duration-500"
              />
            </motion.div>
          )}

          {/* Textos da Capa */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            <motion.div
              variants={fadeUpVariant}
              className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 md:mb-6"
            >
              {business.urban_tag && (
                <span className="px-5 py-2 rounded-full bg-white/10 text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md border border-white/20">
                  {business.urban_tag}
                </span>
              )}
              {realHours.length > 0 && (
                <span
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md ${isOpen ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
                  />
                  {isOpen ? "Aberto Agora" : "Fechado"}
                </span>
              )}
            </motion.div>

            {/* 🚀 CIRURGIA DEV: Título Principal com Selo Verificado Solid no padrão Urban */}
            <motion.h1
              variants={fadeUpVariant}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-lg leading-[1.05] mb-6 flex items-center justify-center md:justify-start gap-3 flex-wrap"
            >
              <span>{business.name}</span>
              {(business.isVerified || rawBusiness.isVerified) && (
                <span
                  title="Empresa Verificada pelo Tafanu"
                  className="shrink-0 inline-flex"
                >
                  <BadgeCheck
                    size={36}
                    className="fill-emerald-500 text-white shrink-0 shadow-sm rounded-full w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                  />
                </span>
              )}
            </motion.h1>

            {hasDescription && (
              <motion.p
                variants={fadeUpVariant}
                className="text-sm md:text-lg text-white/80 font-medium leading-relaxed mb-8 max-w-2xl"
              >
                {business.description}
              </motion.p>
            )}

            {/* Ação Primária da Capa */}
            <motion.div
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
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
                  className="relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/20 backdrop-blur-lg text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {rawBusiness.menuMode === "DIGITAL"
                      ? "Acessar Loja"
                      : rawBusiness.menuMode === "AGENDA"
                        ? "Agendar Horário"
                        : "Catálogo Visual"}
                    <ChevronRight
                      size={18}
                      strokeWidth={2.5}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </button>
              )}

              {/* 🚀 LÓGICA DO BOTÃO "FALAR CONOSCO" (WhatsApp ou Telefone) */}
              {(hasWhatsapp || hasPhone) && (
                <button
                  aria-label={
                    hasWhatsapp
                      ? "Entrar em contato via WhatsApp"
                      : "Ligar para nós"
                  }
                  onClick={() =>
                    handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")
                  }
                  className={`w-full sm:w-auto px-8 py-4 bg-white ${theme.primary} rounded-full font-black text-sm tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3`}
                >
                  Fale Conosco{" "}
                  {hasWhatsapp ? (
                    <MessageCircle size={18} strokeWidth={2.5} />
                  ) : (
                    <Phone size={18} strokeWidth={2.5} />
                  )}
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* 🚀 CORPO DO SITE: Quebra de Grid e Elementos Flutuantes */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-16 flex flex-col gap-12 lg:gap-16 pb-4 relative z-30 -mt-10 md:-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start mt-4">
          {/* COLUNA ESQUERDA (Destaques, Galeria, FAQ) */}
          <div className="lg:col-span-8 flex flex-col gap-16 w-full min-w-0">
            {/* Destaques com efeito Hover */}
            {hasFeatures && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter opacity-90 flex items-center gap-3 uppercase italic">
                  <Sparkles
                    className={`w-6 h-6 md:w-8 md:h-8 ${theme.primary}`}
                    strokeWidth={2.5}
                  />
                  Diferenciais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.features
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        key={i}
                        className={`w-full p-5 md:p-6 ${cardBg} border ${border} ${shadow} rounded-[1.5rem] flex items-start gap-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg group`}
                      >
                        <div
                          className={`w-3 h-3 md:w-4 md:h-4 shrink-0 rounded-full ${theme.bgAction} mt-1 group-hover:scale-125 transition-transform`}
                        />
                        <span className="font-bold text-sm md:text-base leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {f}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            )}

            {/* THE MASTER RUNWAY (Catálogo) */}
            {cleanFeed.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full min-w-0 flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter opacity-90 flex items-center gap-3 uppercase italic">
                    <Camera
                      className={`w-6 h-6 md:w-8 md:h-8 ${theme.primary}`}
                      strokeWidth={2.5}
                    />{" "}
                    Catálogo Visual
                  </h2>
                  {hasPhotos && hasVideos && (
                    <div
                      className={`flex items-center p-1 ${cardBg} border ${border} rounded-full ${shadow}`}
                    >
                      <button
                        onClick={() => setUserMediaFilter("photos")}
                        className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${activeMediaFilter === "photos" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                      >
                        Photos
                      </button>
                      <button
                        onClick={() => setUserMediaFilter("motion")}
                        className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${activeMediaFilter === "motion" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                      >
                        Motion
                      </button>
                    </div>
                  )}
                </div>
                <div className="-mx-4 md:mx-0">
                  <MasterRunway
                    key={activeMediaFilter}
                    feed={cleanFeed.filter((item: any) =>
                      activeMediaFilter === "photos"
                        ? item.type === "image"
                        : ["video", "video_v", "video_h"].includes(item.type),
                    )}
                    setSelectedIndex={setSelectedIndex}
                    variant="urban"
                    themeBorder={border}
                    cardBg={cardBg}
                    cardShadow={shadow}
                  />
                </div>
              </motion.section>
            )}

            {/* FAQ (Acordeon Suave) */}
            {hasFaqs && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter opacity-90 flex items-center gap-3 uppercase italic">
                  <HelpCircle
                    className={`w-6 h-6 md:w-8 md:h-8 ${theme.primary}`}
                    strokeWidth={2.5}
                  />{" "}
                  Dúvidas Frequentes
                </h2>
                <div className="flex flex-col gap-4">
                  {faqs.map((f: any, i: number) => (
                    <div
                      key={i}
                      className={`${cardBg} border ${border} ${shadow} rounded-[1.5rem] overflow-hidden transition-all duration-300`}
                    >
                      <button
                        aria-expanded={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 text-left group"
                      >
                        <span className="text-sm md:text-base font-black opacity-90 pr-4">
                          {f.q || f.question}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-transform duration-500 ${openFaq === i ? "rotate-180" : ""}`}
                        >
                          <ChevronDown
                            className={`w-5 h-5 ${theme.primary}`}
                            strokeWidth={2.5}
                          />
                        </div>
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
                              className={`px-6 pb-6 pt-2 font-medium opacity-70 text-sm leading-relaxed border-t ${border}`}
                            >
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* COLUNA DIREITA (Sidebar Sticky Super Clean) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            {/* Lojas Oficiais */}
            {salesChannels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`p-8 rounded-[2.5rem] border ${border} ${cardBg} ${shadow} space-y-4 relative overflow-hidden`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl pointer-events-none ${theme.bgAction}`}
                />

                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 relative z-10 text-center">
                  Lojas Oficiais
                </h3>
                <div className="relative z-10 space-y-4">
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
                      className={`flex items-center gap-4 p-4 rounded-2xl ${channel.colorClass} hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md`}
                    >
                      {channel.icon}
                      <span className="text-xs font-black tracking-widest uppercase">
                        {channel.name}
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 🚀 ENDEREÇO & REDES SOCIAIS / TELEFONE */}
            {(hasAddress || availableSocials.length > 0 || hasPhone) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`p-5 md:p-6 rounded-[2rem] border ${border} ${cardBg} ${shadow}`}
              >
                {/* Parte 1: Endereço e Botão Rota */}
                {hasAddress && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1 opacity-40">
                      <MapPin size={20} strokeWidth={2.5} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Como Chegar
                      </h3>
                    </div>
                    <p className="text-sm md:text-base font-bold leading-snug opacity-90 break-words">
                      {business.address || "Endereço não cadastrado"}
                      {business.number &&
                        !business.address?.includes(business.number) &&
                        `, ${business.number}`}
                    </p>
                    {business.complement && (
                      <p className="text-xs font-medium opacity-60">
                        {business.complement}
                      </p>
                    )}

                    <div
                      className={`mt-2 pt-4 border-t ${border} flex flex-col gap-3`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                        {business.neighborhood && `${business.neighborhood} • `}{" "}
                        {business.city}
                      </p>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          Actions.registerClickEvent(business.id, "MAP")
                        }
                        className={`w-full py-2.5 rounded-xl ${theme.bgAction} flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md hover:scale-[1.02] transition-transform`}
                      >
                        <Navigation size={14} strokeWidth={2.5} />
                        Iniciar Rota
                      </a>
                    </div>
                  </div>
                )}

                {/* Parte 2: Redes Sociais e Telefone no Rodapé da Caixa */}
                {(availableSocials.length > 0 || hasPhone) && (
                  <div
                    className={`${hasAddress ? `mt-4 pt-4 border-t ${border}` : ""} flex flex-col gap-3`}
                  >
                    <div className="flex gap-2.5 flex-wrap justify-center">
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
                            className={`w-10 h-10 rounded-xl ${cardBg} border ${border} shadow-sm flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:rotate-3 ${theme.primary}`}
                          >
                            {s === "instagram" ? (
                              <Instagram className="w-4 h-4" strokeWidth={2} />
                            ) : s === "facebook" ? (
                              <Facebook className="w-4 h-4" strokeWidth={2} />
                            ) : s === "tiktok" ? (
                              <TikTokIcon className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" strokeWidth={2} />
                            )}
                          </a>
                        );
                      })}

                      {/* Botão de Telefone injetado nas redes */}
                      {hasPhone && (
                        <button
                          onClick={() => handleTrackLead("phone")}
                          title="Ligar"
                          className={`w-10 h-10 rounded-xl ${cardBg} border ${border} shadow-sm flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:rotate-3 ${theme.primary}`}
                        >
                          <Phone className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Horários */}
            {hasHours && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`p-8 rounded-[2.5rem] border ${border} ${cardBg} ${shadow}`}
              >
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  <Clock size={24} strokeWidth={2} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Horários
                  </h3>
                </div>
                <div className="space-y-4">
                  {realHours.map((h: any, i: number) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center font-bold text-xs pb-4 border-b border-slate-50 last:border-0 last:pb-0`}
                    >
                      <span className="opacity-50 uppercase tracking-widest">
                        {h.day}
                      </span>
                      <span
                        className={
                          h.isClosed
                            ? "text-rose-500 bg-rose-50 px-3 py-1 rounded-lg text-[10px]"
                            : "opacity-90"
                        }
                      >
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* RODAPÉ DO SAAS (Comentários e Report) */}
      <div className="max-w-4xl mx-auto w-full px-4 md:px-12 pb-12 pt-10">
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
        <div className="w-full flex justify-center pt-10 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>
      </div>

      <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />

      {/* 🚀 WHATSAPP FLUTUANTE STICKY COM FALLBACK PARA TELEFONE */}
      {(hasWhatsapp || hasPhone) && (
        <motion.button
          aria-label={hasWhatsapp ? "Abrir WhatsApp" : "Ligar"}
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")}
          className={[
            "fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all",
            hasWhatsapp
              ? "bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)]"
              : `${bgAction} shadow-xl`,
          ].join(" ")}
        >
          {hasWhatsapp ? <MessageCircle size={28} /> : <Phone size={28} />}
        </motion.button>
      )}

      {/* MODAIS (Galeria e PDF) */}
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
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
              <div className="w-full h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Catálogo / Cardápio
                </span>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-200 hover:bg-rose-500 hover:text-white rounded-full transition-colors text-slate-500"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-200/50 p-2 md:p-4">
                <iframe
                  src={`${rawBusiness.catalogPdf}#toolbar=0`}
                  className="w-full h-full border-none rounded-xl md:rounded-[2rem]"
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
