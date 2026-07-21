"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Share2,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  Phone,
  MapPin,
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

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`mb-3 rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 md:p-6 flex justify-between items-center text-left gap-4 outline-none bg-transparent border-none group"
      >
        <span
          className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isOpen ? theme.primary : "opacity-80 group-hover:opacity-100"}`}
        >
          {q}
        </span>
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner ${isOpen ? `${theme.bgAction} rotate-45 text-white` : `bg-black/5 ${theme.primary}`}`}
        >
          <Plus size={16} />
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
            <div className="px-5 md:px-6 pb-6 text-sm font-medium leading-relaxed opacity-70 border-t border-black/5 pt-4 whitespace-pre-line">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 4. LAYOUT PRINCIPAL (COMERCIAL 3.0)
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

  const [activeTab, setActiveTab] = useState<"perfil" | "infos">("perfil");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);

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

  const hasPhotos = cleanFeed.some((item: any) => item.type === "image");
  const hasVideos = cleanFeed.some((item: any) =>
    ["video", "video_v", "video_h"].includes(item.type),
  );
  const activeMediaFilter =
    userMediaFilter || (hasPhotos ? "photos" : "motion");

  const isExternalLink = !!business.isExternalLink;
  const actionLink = business.actionLink || "";

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-4 h-4" />,
      url: business.mercadoLivre,
      colorClass:
        "bg-[#FFE600] text-[#2D3277] border-transparent hover:shadow-[0_4px_12px_rgba(255,230,0,0.3)]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-4 h-4" />,
      url: business.shopee,
      colorClass:
        "bg-[#EE4D2D] text-white border-transparent hover:shadow-[0_4px_12px_rgba(238,77,45,0.3)]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-4 h-4" />,
      url: business.ifood,
      colorClass:
        "bg-[#EA1D2C] text-white border-transparent hover:shadow-[0_4px_12px_rgba(234,29,44,0.3)]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-4 h-4" />,
      url: business.shein,
      colorClass:
        "bg-slate-900 text-white border-transparent hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
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
    if (selectedIndex !== null || isPdfModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex, isPdfModalOpen]);

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

  // Variável para determinar se os botões dividem espaço
  const hasStoreLink =
    (isExternalLink && actionLink) ||
    (rawBusiness.menuMode === "PDF" && rawBusiness.catalogPdf);
  const hasContact = hasWhatsapp || hasPhone;

  return (
    <div
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- HEADER HERO BANNER --- */}
      <div
        className={`relative w-full h-48 md:h-64 ${theme.bgHero || "bg-slate-200"} rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm overflow-hidden`}
      >
        {business.coverImage && (
          <Image
            src={business.coverImage}
            alt={`Capa de ${business.name}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 flex items-center gap-3">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full border border-black/5 text-slate-800 shadow-sm hover:bg-white hover:scale-105 transition-all"
          >
            <Share2 size={18} strokeWidth={2} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full border border-black/5 text-slate-800 shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>

      <header
        className={`relative w-full max-w-6xl mx-auto px-6 -mt-16 md:-mt-20 z-10 flex flex-col items-start text-left mb-6`}
      >
        <div className="flex flex-col md:flex-row items-start gap-6 w-full">
          {/* Avatar Premium */}
          {business.imageUrl && (
            <div
              className={`relative w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 ${theme.border} backdrop-blur-md shadow-xl overflow-hidden ${theme.cardBg} shrink-0`}
            >
              <Image
                src={business.imageUrl || "/og-default.png"}
                alt={`Logotipo ${business.name}`}
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col items-start pt-2 md:pt-24">
            {business.comercial_badge &&
              business.comercial_badge !== business.urban_tag && (
                <span
                  className={`${theme.bgAction} px-3 py-1 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm inline-block mb-3 text-white`}
                >
                  {business.comercial_badge}
                </span>
              )}
            <h1
              className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-none drop-shadow-sm ${theme.textColor}`}
            >
              {business.name}
            </h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap justify-start">
              {business.urban_tag && (
                <span
                  className={`text-sm font-semibold uppercase tracking-wider opacity-80 ${theme.primary}`}
                >
                  {business.urban_tag}
                </span>
              )}
              {realHours.length > 0 && (
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${
                    isOpen
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {isOpen ? "Aberto" : "Fechado"}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          🚀 CTAs DE ALTA CONVERSÃO (3.0 Vibe)
          Layout Grid para alinhar Loja e WhatsApp perfeitamente lado a lado
          ========================================== */}
      {(hasStoreLink || hasContact) && (
        <div className="w-full flex justify-center px-4 mb-8 relative z-10">
          <div
            className={`w-full max-w-[600px] grid gap-3 ${hasStoreLink && hasContact ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {/* BOTÃO 1: LOJA / CATÁLOGO */}
            {hasStoreLink && (
              <button
                onClick={() => {
                  if (isExternalLink && actionLink) {
                    Actions.registerClickEvent(business.id, "WEBSITE");
                    window.open(
                      formatExternalLink(actionLink),
                      "_blank",
                      "noopener,noreferrer",
                    );
                    return;
                  }
                  if (rawBusiness.menuMode === "PDF") {
                    setIsPdfModalOpen(true);
                  }
                }}
                className={`relative overflow-hidden flex w-full justify-center items-center gap-2 px-4 py-3.5 rounded-2xl text-[11px] md:text-xs font-bold tracking-wider uppercase text-white ${theme.bgAction} shadow-md border border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-sm">
                  {rawBusiness.menuMode === "DIGITAL"
                    ? "Fazer Pedido"
                    : rawBusiness.menuMode === "AGENDA"
                      ? "Agendar"
                      : "Explorar Menu"}
                </span>
              </button>
            )}

            {/* BOTÃO 2: CONTATO RÁPIDO (WhatsApp ou Telefone) */}
            {hasContact && (
              <button
                onClick={() =>
                  handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")
                }
                className={`relative overflow-hidden flex w-full justify-center items-center gap-2 px-4 py-3.5 rounded-2xl text-[11px] md:text-xs font-bold tracking-wider uppercase transition-all active:scale-95 shadow-sm border hover:-translate-y-0.5 hover:shadow-md ${
                  hasWhatsapp
                    ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/20"
                    : "bg-black/5 text-slate-700 border-black/10 hover:bg-black/10"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {hasWhatsapp ? (
                    <MessageCircle size={16} strokeWidth={2.5} />
                  ) : (
                    <PhoneCall size={16} strokeWidth={2.5} />
                  )}
                  Falar Conosco
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- MENU TABS --- */}
      <div className="sticky top-4 z-20 px-4 mb-8 flex justify-center">
        <div
          className={`bg-white/90 backdrop-blur-xl p-1 rounded-full border ${theme.border} shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] flex gap-1`}
        >
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-8 md:px-12 py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === t
                  ? "text-white shadow-md"
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
                  <Layout size={14} />
                ) : (
                  <ShieldCheck size={14} />
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
              className="space-y-6 md:space-y-8"
            >
              {/* HISTÓRIA */}
              {hasDescription && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-3xl p-6 md:p-10 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center ${theme.primary}`}
                    >
                      <Quote size={18} />
                    </div>
                    <h2
                      className={`text-xs md:text-sm font-bold uppercase tracking-widest opacity-50 ${theme.primary}`}
                    >
                      Nossa História
                    </h2>
                  </div>
                  <p
                    className={`text-base md:text-lg font-medium leading-relaxed opacity-80 break-words whitespace-pre-line ${theme.textColor}`}
                  >
                    {business.description}
                  </p>
                </section>
              )}

              {/* DESTAQUES */}
              {hasFeatures && (
                <section className="space-y-4">
                  <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-40 pl-2">
                    Destaques
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {business.features
                      .filter(Boolean)
                      .map((f: string, i: number) => (
                        <div
                          key={i}
                          className={`w-full px-5 py-4 rounded-2xl border ${theme.border} ${theme.cardBg} flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
                        >
                          <div
                            className={`w-8 h-8 shrink-0 rounded-full bg-black/5 flex items-center justify-center`}
                          >
                            <CheckCircle2
                              size={16}
                              className={`${theme.primary}`}
                            />
                          </div>
                          <span className="text-sm font-semibold leading-tight opacity-90">
                            {f}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* GALERIA E VÍDEOS INTELIGENTE */}
              {cleanFeed.length > 0 && (
                <section className="w-full pt-2">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center ${theme.primary}`}
                      >
                        <Camera size={18} />
                      </div>
                      <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-40">
                        Catálogo Visual
                      </h2>
                    </div>

                    {/* SÓ MOSTRA AS ABAS SE TIVER OS DOIS TIPOS DE MÍDIA */}
                    {hasPhotos && hasVideos && (
                      <div
                        className={`flex items-center p-1 ${theme.cardBg} border ${theme.border} rounded-full shadow-sm`}
                      >
                        <button
                          onClick={() => setUserMediaFilter("photos")}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${activeMediaFilter === "photos" ? `${theme.bgAction} shadow-sm text-white` : "opacity-50 hover:opacity-100"}`}
                        >
                          Fotos
                        </button>
                        <button
                          onClick={() => setUserMediaFilter("motion")}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${activeMediaFilter === "motion" ? `${theme.bgAction} shadow-sm text-white` : "opacity-50 hover:opacity-100"}`}
                        >
                          Vídeos
                        </button>
                      </div>
                    )}
                  </div>

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
                    variant="comercial"
                    themeBorder={theme.border}
                    cardBg={theme.cardBg}
                  />
                </section>
              )}

              {/* DUVIDAS FREQUENTES */}
              {faqs.length > 0 && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-3xl p-6 md:p-10 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center ${theme.primary}`}
                    >
                      <HelpCircle size={18} />
                    </div>
                    <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-40">
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
              className="space-y-6 md:space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* REDES SOCIAIS E MARKETPLACES (Limpo e Direto) */}
                  {(availableSocials.length > 0 ||
                    hasPhone ||
                    salesChannels.length > 0) && (
                    <div
                      className={`${theme.cardBg} p-6 md:p-8 rounded-3xl border ${theme.border} shadow-sm flex flex-col gap-6`}
                    >
                      {(availableSocials.length > 0 || hasPhone) && (
                        <div>
                          {/* FIX UX: text-center no título para alinhar com os ícones */}
                          <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 mb-4 text-center">
                            Canais e Sociais
                          </h2>
                          {/* FIX UX: justify-center para centralizar perfeitamente os botões */}
                          <div className="flex flex-wrap justify-center gap-3">
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
                                  title={s} // Tooltip de acessibilidade
                                  whileHover={{ y: -3 }}
                                  onClick={() =>
                                    Actions.registerClickEvent(
                                      business.id,
                                      s.toUpperCase(),
                                    )
                                  }
                                  // FIX UX: Transformamos em blocos w-12 h-12 centralizados
                                  className={`flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 border border-black/5 shadow-sm hover:shadow-md transition-shadow ${theme.primary}`}
                                >
                                  {/* Ícones aumentados de 16 para 20 */}
                                  {s === "instagram" ? (
                                    <Instagram size={20} />
                                  ) : s === "facebook" ? (
                                    <Facebook size={20} />
                                  ) : s === "tiktok" ? (
                                    <TikTokIcon className="w-5 h-5" />
                                  ) : (
                                    <Globe size={20} />
                                  )}
                                </motion.a>
                              );
                            })}

                            {/* Botão de Telefone nas Redes Sociais */}
                            {hasPhone && (
                              <motion.button
                                whileHover={{ y: -3 }}
                                onClick={() => handleTrackLead("phone")}
                                title="Ligar para nós"
                                className={`flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 border border-black/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${theme.primary}`}
                              >
                                <Phone size={20} />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )}
                      {salesChannels.length > 0 && (
                        <div
                          className={`${availableSocials.length > 0 || hasPhone ? "pt-5 border-t border-black/5" : ""}`}
                        >
                          <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
                            Lojas Oficiais
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${channel.colorClass}`}
                              >
                                <div className="transition-transform duration-300 group-hover:scale-110">
                                  {channel.icon}
                                </div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">
                                  {channel.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COLUNA DIREITA */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {(hasAddress || hasHours) && (
                    <div
                      className={`${theme.cardBg} p-6 md:p-8 rounded-3xl border ${theme.border} shadow-sm flex flex-col gap-6 transition-transform`}
                    >
                      {hasAddress && (
                        <div className="block">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center ${theme.primary} shadow-sm`}
                            >
                              <MapPin size={16} />
                            </div>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                              Localização
                            </h2>
                          </div>
                          <p className="text-sm font-bold leading-snug mb-1 opacity-90">
                            {business.address || "Endereço não cadastrado"}{" "}
                            {business.number &&
                              !business.address?.includes(business.number) &&
                              `, ${business.number}`}
                          </p>
                          {business.complement && (
                            <p className="text-xs font-medium opacity-60 mb-2">
                              {business.complement}
                            </p>
                          )}
                          <p className="text-[10px] font-semibold opacity-50 uppercase tracking-widest mt-1">
                            {business.neighborhood &&
                              `${business.neighborhood} • `}{" "}
                            {business.city}{" "}
                            {business.state ? `— ${business.state}` : ""}{" "}
                            {business.cep && ` • CEP: ${business.cep}`}
                          </p>

                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              Actions.registerClickEvent(business.id, "MAP")
                            }
                            className={`mt-4 flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-black/5 border border-black/5 hover:bg-black/10 transition-all`}
                          >
                            <Navigation size={14} /> Traçar Rota
                          </a>
                        </div>
                      )}

                      {hasHours && (
                        <div
                          className={`${hasAddress ? "pt-5 border-t border-black/5" : ""}`}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              className={`w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center ${theme.primary} shadow-sm`}
                            >
                              <Clock size={16} />
                            </div>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                              Horários
                            </h2>
                          </div>
                          <div className="space-y-2.5">
                            {realHours.map((h: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between items-center pb-2 border-b border-black/5 last:border-0 last:pb-0"
                              >
                                <span className="text-[10px] font-bold uppercase opacity-50 tracking-wider">
                                  {h.day}
                                </span>
                                <span
                                  className={`text-xs font-bold ${h.isClosed ? "text-rose-500" : "opacity-90"}`}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- RODAPÉ DE DENÚNCIA E COMENTÁRIOS --- */}
        <div className="mt-12 mb-6 w-full flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>
        <div className="max-w-4xl mx-auto w-full pb-20">
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
        </div>
        <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />
      </main>

      {/* 🚀 WHATSAPP FLUTUANTE GLOBAL (Com fallback para Phone) */}
      {(hasWhatsapp || hasPhone) && (
        <motion.button
          aria-label={hasWhatsapp ? "Abrir WhatsApp Flutuante" : "Ligar"}
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")}
          className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all ${
            hasWhatsapp
              ? "bg-[#25D366] text-white hover:bg-[#20bd5a]"
              : `${theme.bgAction} text-white`
          }`}
        >
          {hasWhatsapp ? (
            <MessageCircle
              className="w-7 h-7 md:w-8 md:h-8"
              fill="currentColor"
            />
          ) : (
            <Phone className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" />
          )}
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
            <div className="w-full max-w-5xl h-full bg-white rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
              {/* Barra de Topo com Botão de Fechar */}
              <div className="w-full h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
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
