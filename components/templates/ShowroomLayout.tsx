"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Share2,
  Instagram,
  Facebook,
  Globe,
  Phone,
  PhoneCall,
  MapPin,
  Camera,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Navigation,
  Info,
  ChevronRight,
  Layout,
  Store,
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

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`border-b ${theme.border} transition-all duration-300 last:border-0`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left gap-4 outline-none bg-transparent group"
      >
        <span className="text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
          {q}
        </span>
        <Plus
          size={18}
          className={`shrink-0 transition-transform duration-300 opacity-40 ${theme.primary} ${isOpen ? "rotate-45 opacity-100" : ""}`}
        />
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
            <div className="pb-5 text-sm leading-relaxed opacity-70 whitespace-pre-line">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 4. LAYOUT PRINCIPAL (Showroom Profissional)
// ==========================================
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
  isOpen,
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);
  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["showroom_clean"];

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
      colorClass:
        "text-[#2D3277] bg-[#FFE600] border-transparent hover:shadow-[0_4px_12px_rgba(255,230,0,0.3)]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      colorClass:
        "text-white bg-[#EE4D2D] border-transparent hover:shadow-[0_4px_12px_rgba(238,77,45,0.3)]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      colorClass:
        "text-white bg-[#EA1D2C] border-transparent hover:shadow-[0_4px_12px_rgba(234,29,44,0.3)]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      colorClass:
        "text-white bg-slate-900 border-transparent hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
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

  // Variáveis para Layout de Botões Superiores
  const hasStoreLink =
    (isExternalLink && actionLink) ||
    (rawBusiness.menuMode === "PDF" && rawBusiness.catalogPdf);
  const hasContact = hasWhatsapp || hasPhone;

  return (
    <div
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- CAPA E TOPO (Showroom Original Style) --- */}
      <div
        className={`w-full h-40 md:h-56 ${theme.bgHero} relative overflow-hidden`}
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
        <div className="absolute inset-0 pointer-events-none bg-black/10" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-slate-800 transition-all shadow-sm"
          >
            <Share2 size={18} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-slate-800 transition-all shadow-sm cursor-pointer">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>

      {/* --- HEADER DO PERFIL (FIX MOBILE: Apenas Avatar sobrepõe a capa) --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative mb-6 z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-5 w-full">
            {/* Bloco 1: Avatar e Badge (O Avatar "puxa" a margem negativa sozinho) */}
            <div className="flex items-end justify-between w-full md:w-auto -mt-8 md:-mt-12 relative z-20">
              {business.imageUrl && (
                <div
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden relative shrink-0`}
                >
                  <Image
                    src={business.imageUrl}
                    alt="Logo"
                    fill
                    priority
                    sizes="(max-width: 768px) 112px, 160px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Badge Aberto/Fechado no Mobile (Fica inteligentemente ao lado do avatar) */}
              <div className="md:hidden pb-1">
                {safeHours.length > 0 && (
                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      isOpen
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                        : "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm"
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

            {/* Bloco 2: Textos (Ficam seguros na área branca no mobile, longe da capa) */}
            <div className="flex flex-col items-start pb-1 mt-1 md:mt-0 w-full">
              {/* 🚀 CIRURGIA DEV: Título com Selo Verificado no Showroom Clean */}
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-none text-slate-900 drop-shadow-sm mb-1.5 flex items-center gap-2 flex-wrap">
                <span>{business.name}</span>
                {(business.isVerified || rawBusiness.isVerified) && (
                  <span
                    title="Empresa Verificada pelo Tafanu"
                    className="shrink-0 inline-flex"
                  >
                    <BadgeCheck
                      size={28}
                      className="fill-emerald-500 text-white shrink-0 shadow-sm rounded-full w-6 h-6 md:w-7 md:h-7"
                    />
                  </span>
                )}
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                {business.urban_tag && (
                  <span
                    className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${theme.primary}`}
                  >
                    {business.urban_tag}
                  </span>
                )}
                {business.comercial_badge &&
                  business.comercial_badge !== business.urban_tag && (
                    <>
                      <span className="opacity-30 text-slate-500">•</span>
                      <span
                        className={`text-[10px] md:text-xs font-semibold flex items-center gap-1 ${theme.primary}`}
                      >
                        <CheckCircle2 size={12} /> {business.comercial_badge}
                      </span>
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* Badge Aberto/Fechado no Desktop (Fica alinhado à direita) */}
          <div className="hidden md:block pb-1 shrink-0">
            {safeHours.length > 0 && (
              <span
                className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                    : "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm"
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

      {/* ==========================================
          🚀 CTAs DE ALTA CONVERSÃO (3.0 Vibe)
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
                className={`relative overflow-hidden flex w-full justify-center items-center gap-2 px-4 py-3.5 md:py-4 rounded-xl text-[11px] md:text-sm font-bold tracking-wide uppercase text-white ${theme.bgAction} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
                  {rawBusiness.menuMode === "DIGITAL"
                    ? "Fazer Pedido"
                    : rawBusiness.menuMode === "AGENDA"
                      ? "Agendar"
                      : "Catálogo"}
                  <ChevronRight size={16} strokeWidth={2.5} />
                </span>
              </button>
            )}

            {/* BOTÃO 2: CONTATO RÁPIDO (WhatsApp ou Telefone) */}
            {hasContact && (
              <button
                onClick={() =>
                  handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")
                }
                className={`relative overflow-hidden flex w-full justify-center items-center gap-2 px-4 py-3.5 md:py-4 rounded-xl text-[11px] md:text-sm font-bold tracking-wide uppercase transition-all active:scale-95 shadow-sm border hover:-translate-y-0.5 hover:shadow-md ${
                  hasWhatsapp
                    ? "bg-[#25D366] text-white border-[#25D366]/30 hover:bg-[#20bd5a]"
                    : `bg-white ${theme.primary} border-black/5 hover:bg-black/5`
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {hasWhatsapp ? (
                    <MessageCircle size={18} strokeWidth={2.5} />
                  ) : (
                    <PhoneCall size={18} strokeWidth={2.5} />
                  )}
                  Contato
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- CORPO PRINCIPAL (Grid Moderno) --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
        {/* COLUNA ESQUERDA: Informações do Negócio */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {hasDescription && (
            <div
              className={`p-6 md:p-8 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-sm md:text-base font-bold mb-3 flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                <Store size={18} className={theme.primary} /> Sobre nós
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {cleanFeed.length > 0 && (
            <div
              className={`p-6 md:p-8 pb-4 md:pb-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                  <Camera size={18} className={theme.primary} /> Galeria
                </h2>

                {hasPhotos && hasVideos && (
                  <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setUserMediaFilter("photos")}
                      className={`px-4 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeMediaFilter === "photos" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Fotos
                    </button>
                    <button
                      onClick={() => setUserMediaFilter("motion")}
                      className={`px-4 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeMediaFilter === "motion" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Vídeos
                    </button>
                  </div>
                )}
              </div>

              <div className="-mx-2 md:mx-0">
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
                  variant="showroom"
                  themeBorder={theme.border}
                  cardBg={theme.cardBg}
                />
              </div>
            </div>
          )}

          {hasFeatures && (
            <div
              className={`p-6 md:p-8 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                <CheckCircle2 size={18} className={theme.primary} /> Destaques
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2 hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 ${theme.primary} mt-0.5`}
                        strokeWidth={2.5}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasFaqs && (
            <div
              className={`p-6 md:p-8 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                <HelpCircle size={18} className={theme.primary} /> Perguntas
                Frequentes
              </h2>
              <div className="flex flex-col">
                {faqs.map((f: any, i: number) => (
                  <AccordionItem
                    key={i}
                    q={f.q || f.question}
                    a={f.a || f.answer}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: O "Knowledge Panel" (GMB Style) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* CARTÃO MASTER DE INFORMAÇÕES */}
          {(hasAddress ||
            hasHours ||
            availableSocials.length > 0 ||
            hasPhone) && (
            <div
              className={`rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm flex flex-col overflow-hidden`}
            >
              {hasAddress && (
                <div
                  className={`p-6 md:p-7 ${hasHours || availableSocials.length > 0 || hasPhone ? `border-b ${theme.border}` : ""}`}
                >
                  <h2 className="text-sm md:text-base font-bold mb-3 flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                    <MapPin size={16} className={theme.primary} /> Endereço
                  </h2>
                  <p className="text-sm font-medium text-slate-700 leading-snug">
                    {business.address || "Endereço não cadastrado"}
                    {business.number &&
                      !business.address?.includes(business.number) &&
                      `, ${business.number}`}
                  </p>
                  {business.complement && (
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {business.complement}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">
                    {business.neighborhood && `${business.neighborhood} • `}
                    {business.city}{" "}
                    {business.state ? `— ${business.state}` : ""}
                  </p>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      Actions.registerClickEvent(business.id, "MAP")
                    }
                    className={`mt-4 inline-flex items-center justify-center w-full gap-2 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-95`}
                  >
                    <Navigation size={14} strokeWidth={2.5} /> Traçar Rota
                  </a>
                </div>
              )}

              {hasHours && (
                <div
                  className={`p-6 md:p-7 ${availableSocials.length > 0 || hasPhone ? `border-b ${theme.border}` : ""}`}
                >
                  <h2 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                    <Clock size={16} className={theme.primary} /> Horários
                  </h2>
                  <div className="space-y-3">
                    {safeHours.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-semibold text-slate-500 capitalize tracking-wide">
                          {h.day}
                        </span>
                        <span
                          className={`font-bold ${h.isClosed ? "text-rose-500" : "text-slate-800"}`}
                        >
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(availableSocials.length > 0 || hasPhone) && (
                <div className="p-6 md:p-7 bg-slate-50/50">
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
                        <a
                          key={s}
                          href={finalUrl}
                          target="_blank"
                          title={s}
                          rel="noopener noreferrer"
                          onClick={() =>
                            Actions.registerClickEvent(
                              business.id,
                              s.toUpperCase(),
                            )
                          }
                          className={`flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${theme.primary}`}
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

                    {hasPhone && (
                      <button
                        onClick={() => handleTrackLead("phone")}
                        title="Ligar"
                        className={`flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${theme.primary}`}
                      >
                        <Phone size={20} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOJAS OFICIAIS */}
          {salesChannels.length > 0 && (
            <div
              className={`rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm overflow-hidden`}
            >
              <div className="p-6 md:p-7">
                <h2 className="text-sm md:text-base font-bold mb-4 text-slate-800 uppercase tracking-wider">
                  Onde Comprar
                </h2>
                <div className="flex flex-col gap-3">
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
                      className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all font-medium text-slate-700 group`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {channel.icon}
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase">
                        {channel.name}
                      </span>
                      <ChevronRight
                        size={16}
                        className="ml-auto text-slate-400 group-hover:text-slate-600 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RODAPÉ --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-20">
        <div className="w-full flex justify-center py-6 opacity-40 hover:opacity-100 transition-opacity">
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
          businessRating={business.rating}
        />
      </div>

      <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />

      {/* 🚀 LÓGICA DO FAB: WhatsApp fallback para Telefone */}
      {(hasWhatsapp || hasPhone) && (
        <motion.button
          aria-label={hasWhatsapp ? "Abrir WhatsApp" : "Ligar"}
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead(hasWhatsapp ? "whatsapp" : "phone")}
          className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all ${
            hasWhatsapp
              ? "bg-[#25D366] text-white"
              : `${theme.bgAction} text-white`
          }`}
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
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
