"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
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
import VitrineCardapio from "../VitrineCardapio"; // 🚀 Importa a Máquina de Vendas

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
  isOpen, // 🚀 ADICIONADO AQUI!
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
  const [showDigitalMenu, setShowDigitalMenu] = useState(false); // 🚀 ESTADO DA LOJA DIGITAL
  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);
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
          // 🚀 SEGURO E LUCRATIVO: Abre a conversa de vendas Noutra Janela e não "mata" a Vitrine Digital
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        } else {
          // O comando nativo 'tel:' nos telemóveis não destrói a aba, chama apenas o discador.
          window.location.href = targetUrl;
        }
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    if (selectedIndex !== null || isPdfModalOpen || showDigitalMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex, isPdfModalOpen, showDigitalMenu]); // 🚀 TRAVA A TELA PRO PDF E LOJA DIGITAL

  if (!theme) return null;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-current selection:text-white`}
    >
      {/* --- HEADER LANDING PAGE (NOVA ORDEM MOBILE & DESKTOP) --- */}
      <header
        className={`relative w-full pt-10 pb-20 md:pt-16 md:pb-28 px-4 md:px-8 flex flex-col ${bgHero} rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-20 overflow-hidden text-white`}
      >
        {business.coverImage && (
          <Image
            src={business.coverImage}
            alt={`Capa de ${business.name}`}
            fill
            priority
            sizes="100vw"
            className="object-cover rounded-b-[2.5rem] md:rounded-b-[4rem]"
          />
        )}

        {/* 🚀 OVERLAY DE ALTO CONTRASTE (Garante leitura em qualquer foto) */}
        <div className="absolute inset-0 pointer-events-none rounded-b-[2.5rem] md:rounded-b-[4rem] bg-black/40" />
        <div className="absolute inset-0 pointer-events-none rounded-b-[2.5rem] md:rounded-b-[4rem] bg-gradient-to-b from-black/70 via-transparent to-black/80" />

        {/* 🚀 BOTÕES DE COMPARTILHAR E FAVORITAR FIXOS NO CANTO SUPERIOR DIREITO */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-30">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-md border border-white/30 text-white shadow-lg">
            <button
              aria-label="Compartilhar perfil"
              onClick={() => handleShare(business.name)}
              className="flex items-center justify-center transition-transform hover:scale-110"
            >
              <Share2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="w-[1px] h-4 bg-white/30" />
            <div className="flex items-center justify-center transition-transform hover:scale-110">
              <FavoriteButton
                businessId={business.id}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={isFavorited}
                emailVerified={emailVerified}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16">
          {/* 🚀 BADGE ON/OFF (Mobile - Topo, acima da imagem) */}
          {realHours.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden flex justify-center w-full order-1"
            >
              <span
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm ${
                  isOpen
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                  }`}
                />
                {isOpen ? "ON" : "OFF"}
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

          <div className="flex flex-col items-center md:items-start text-center md:text-left order-3 md:order-1 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex flex-wrap items-center gap-3 mb-6"
            >
              {business.urban_tag && (
                <span className="px-5 py-2 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-white/30 shadow-sm">
                  {business.urban_tag}
                </span>
              )}
              {/* 🚀 BADGE ON/OFF (Desktop) */}
              {realHours.length > 0 && (
                <span
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm ${
                    isOpen
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  {isOpen ? "ON" : "OFF"}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.1] mb-4"
            >
              {business.name}
            </motion.h1>

            {/* 🚀 FRASE DE IMPACTO (Mobile - Abaixo do título) */}
            {business.urban_tag && (
              <div className="flex md:hidden justify-center items-center mb-6">
                <span className="px-5 py-2 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm border border-white/30 shadow-sm text-center">
                  {business.urban_tag}
                </span>
              </div>
            )}

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              {/* 🚀 O MOTOR DE DECISÃO: LOJA DIGITAL vs PDF */}
              {((rawBusiness.menuMode === "DIGITAL" &&
                Array.isArray(rawBusiness.products) &&
                rawBusiness.products.length > 0) ||
                (rawBusiness.menuMode === "PDF" && rawBusiness.catalogPdf)) && (
                <button
                  onClick={() => {
                    if (rawBusiness.menuMode === "DIGITAL") {
                      setShowDigitalMenu(true);
                    } else {
                      setIsPdfModalOpen(true);
                    }
                  }}
                  className="relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-full font-extrabold text-sm md:text-base tracking-wide shadow-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {rawBusiness.menuMode === "DIGITAL"
                      ? "Fazer Pedido"
                      : "Catálogo Visual"}
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </span>
                </button>
              )}

              {hasWhatsapp && (
                <button
                  aria-label="Entrar em contato via WhatsApp"
                  onClick={() => handleTrackLead("whatsapp")}
                  className={`w-full sm:w-auto px-8 py-4 bg-white ${theme.primary} rounded-full font-extrabold text-sm md:text-base tracking-wide shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-3`}
                >
                  FALE CONOSCO <MessageCircle size={20} strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col gap-12 pb-4">
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
            {/* Sobre — visível no scroll para quem não leu o hero */}
            {hasDescription && !business.imageUrl && (
              <section
                className={`p-6 md:p-8 rounded-[2rem] border ${border} ${cardBg} ${shadow}`}
              >
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight opacity-90 mb-4 flex items-center gap-3">
                  <span
                    className={`w-2 h-6 md:h-8 rounded-full ${theme.bgAction} shrink-0`}
                  />
                  Sobre a empresa
                </h2>
                <p className="text-sm md:text-base leading-relaxed opacity-70 whitespace-pre-line">
                  {business.description}
                </p>
              </section>
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

            {/* 🚀 THE MASTER RUNWAY (Mídia Unificada URBAN INTELIGENTE) */}
            {cleanFeed.length > 0 &&
              (() => {
                const filteredFeed = cleanFeed.filter((item: any) => {
                  if (activeMediaFilter === "photos")
                    return item.type === "image";
                  if (activeMediaFilter === "motion")
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
                      {/* O título original é mantido intacto */}
                      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight opacity-90 flex items-center gap-3">
                        <Camera
                          className={`w-5 h-5 md:w-6 md:h-6 ${theme.primary}`}
                          strokeWidth={2}
                        />
                        Catálogo Visual
                      </h2>

                      {/* 🚀 SÓ MOSTRA AS ABAS SE TIVER OS DOIS TIPOS (sem a aba ALL) */}
                      {hasPhotos && hasVideos && (
                        <div
                          className={`flex items-center p-1 ${cardBg} border ${border} rounded-full ${shadow}`}
                        >
                          <button
                            onClick={() => setUserMediaFilter("photos")}
                            className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "photos" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                          >
                            Photos
                          </button>
                          <button
                            onClick={() => setUserMediaFilter("motion")}
                            className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "motion" ? `${theme.bgAction}` : "opacity-50 hover:opacity-100"}`}
                          >
                            Motion
                          </button>
                        </div>
                      )}
                    </div>

                    <MasterRunway
                      key={activeMediaFilter}
                      feed={filteredFeed}
                      setSelectedIndex={setSelectedIndex}
                      variant="urban"
                      themeBorder={border}
                      cardBg={cardBg}
                      cardShadow={shadow}
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

      <div className="max-w-4xl mx-auto w-full px-6 md:px-12 pb-12">
        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity border-t border-current/10 mt-4">
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

      {/* ==========================================
          🚀 MODAL DO CARRINHO (LOJA DIGITAL WHATSAPP)
          ========================================== */}
      <AnimatePresence>
        {showDigitalMenu && rawBusiness.menuMode === "DIGITAL" && (
          <VitrineCardapio
            businessName={rawBusiness.name}
            whatsapp={rawBusiness.whatsapp || rawBusiness.phone}
            themeColor={theme.previewColor}
            products={rawBusiness.products || []}
            onClose={() => setShowDigitalMenu(false)}
          />
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
