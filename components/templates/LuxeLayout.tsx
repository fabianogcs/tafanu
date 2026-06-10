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
        window.location.href = targetUrl;
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
        className={`relative w-full pt-16 pb-10 md:pt-32 md:pb-24 px-4 md:px-8 flex flex-col items-center justify-center ${bgHero} shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] z-30 min-h-[50vh] md:min-h-[70vh] text-white`}
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -bottom-[50%] -right-[20%] w-[100%] h-[100%] rounded-full bg-black/40 blur-[120px]" />
        </div>

        <div className="absolute top-6 md:top-8 right-4 md:right-8 z-40">
          <div
            className={`flex items-center gap-3 bg-current/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-current/10 backdrop-blur-xl shadow-lg text-current/80 hover:text-current transition-colors`}
          >
            <button
              aria-label="Compartilhar perfil no WhatsApp ou copiar link"
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
            className="mb-5 md:mb-8 w-full px-2 flex flex-col items-center justify-center gap-3"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span
                className={`inline-block max-w-[95%] text-[9px] md:text-xs font-sans font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase text-current/90 drop-shadow-sm bg-current/5 px-5 py-3 rounded-2xl md:rounded-full border border-current/10 leading-relaxed text-balance`}
              >
                {business.urban_tag || business.city || "Boutique"}
              </span>

              {/* O Pinguinho Minimalista ON/OFF (Sem bordas grosseiras para combinar com o Luxe) */}
              {realHours.length > 0 && (
                <span
                  className={`flex items-center gap-2 px-4 py-3 rounded-full text-[9px] md:text-xs font-black tracking-widest uppercase bg-current/5 border border-current/10 backdrop-blur-md shadow-sm ${
                    isOpen ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpen
                        ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        : "bg-rose-500"
                    }`}
                  />
                  {isOpen ? "Aberto Agora" : "Fechado"}
                </span>
              )}
            </div>
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
                    alt={`Logotipo da empresa ${business.name}`}
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
          🚀 THE MASTER RUNWAY (GALERIA INTELIGENTE)
          ========================================== */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-12 pt-20 md:pt-32 relative z-20">
        {cleanFeed.length > 0 && (
          <div className="w-full mb-12 md:mb-24">
            <div className="flex flex-col items-center text-center mb-8 px-4">
              <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight opacity-90 flex items-center gap-4 mb-8">
                <Sparkles
                  className={`w-6 h-6 md:w-8 md:h-8 ${primary}`}
                  strokeWidth={1.5}
                />
                {business.showroom_collection || "The Collection"}
              </h2>

              {/* 🚀 SÓ MOSTRA AS ABAS SE TIVER OS DOIS TIPOS DE MÍDIA */}
              {hasPhotos && hasVideos && (
                <div className="flex items-center p-1 bg-current/5 border border-current/10 rounded-full backdrop-blur-md">
                  <button
                    onClick={() => setUserMediaFilter("photos")}
                    className={`px-5 md:px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "photos" ? bgAction : "text-current/50 hover:text-current"}`}
                  >
                    Fotos
                  </button>
                  <button
                    onClick={() => setUserMediaFilter("motion")}
                    className={`px-5 md:px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "motion" ? bgAction : "text-current/50 hover:text-current"}`}
                  >
                    Vídeos
                  </button>
                </div>
              )}
            </div>

            <div className="w-full">
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

      <main className="w-full flex flex-col items-center relative z-10">
        {/* ==========================================
            FAIXA 1: DESTAQUES (Agora com 2 colunas compactas no Mobile)
        ========================================== */}
        {hasFeatures && (
          <section
            className={`w-full py-16 md:py-20 px-4 md:px-12 border-t ${border}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-10 md:space-y-16"
            >
              <h2 className="text-4xl md:text-6xl font-serif italic tracking-tight opacity-90 flex flex-col items-center gap-4">
                <span
                  className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase ${primary} not-italic mb-2 md:mb-4`}
                >
                  Os Detalhes
                </span>
                Destaques
              </h2>
              {/* 🚀 A MÁGICA AQUI: grid-cols-2 no mobile, gaps e paddings ajustados para caber perfeitamente */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-12 md:gap-y-16 w-full mt-4 md:mt-8">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex flex-col items-center text-center gap-4 md:gap-6 group p-3 md:p-6 rounded-3xl hover:bg-current/5 transition-all duration-500"
                    >
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${theme.bgSecondary} flex items-center justify-center border ${border} shadow-lg group-hover:scale-110 transition-transform duration-500`}
                      >
                        <Sparkles
                          className={`w-5 h-5 md:w-6 md:h-6 ${primary}`}
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="font-light text-xs sm:text-sm md:text-lg leading-relaxed opacity-80 group-hover:opacity-100 px-1">
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ==========================================
            FAIXA 2: ATENDIMENTO (Concierge)
        ========================================== */}
        {(hasWhatsapp || hasPhone) && (
          <section
            className={`w-full py-16 md:py-24 px-6 md:px-12 ${theme.bgHero} relative overflow-hidden flex justify-center items-center`}
          >
            <div
              className={`absolute inset-0 ${glassBg} backdrop-blur-md opacity-30`}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`relative z-10 w-full max-w-3xl flex flex-col items-center text-center`}
            >
              <h2 className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase mb-6 opacity-60">
                Como podemos ajudar?
              </h2>
              <h3 className="text-4xl md:text-6xl font-serif italic mb-16 drop-shadow-lg">
                Atendimento
              </h3>
              <div className="w-full flex flex-col sm:flex-row gap-5 justify-center">
                {hasWhatsapp && (
                  <button
                    onClick={() => handleTrackLead("whatsapp")}
                    className={`flex-1 flex items-center justify-center gap-4 p-5 md:p-6 rounded-[2rem] bg-current/5 backdrop-blur-md border border-current/20 text-current hover:bg-current/10 transition-all duration-500 hover:scale-[1.05] shadow-lg group`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors`}
                    >
                      <MessageCircle
                        size={20}
                        strokeWidth={1.5}
                        className={primary}
                      />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase">
                      WhatsApp
                    </span>
                  </button>
                )}
                {hasPhone && (
                  <button
                    onClick={() => handleTrackLead("phone")}
                    className={`flex-1 flex items-center justify-center gap-4 p-5 md:p-6 rounded-[2rem] bg-current/5 backdrop-blur-md border border-current/20 text-current hover:bg-current/10 transition-all duration-500 hover:scale-[1.05] shadow-lg group`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors`}
                    >
                      <Phone size={20} strokeWidth={1.5} className={primary} />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Ligar Agora
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* ==========================================
            FAIXA 3: PERGUNTAS FREQUENTES (FAQs) - MOVIDA!
        ========================================== */}
        {hasFaqs && (
          <section
            className={`w-full py-16 md:py-24 px-6 md:px-12 ${theme.bgSecondary} border-b ${border}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight opacity-90 pb-6 border-b border-current/10 w-full text-center">
                Perguntas Frequentes
              </h2>
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
            </motion.div>
          </section>
        )}

        {/* ==========================================
            FAIXA 4: COMPRAR ONLINE (Marketplaces)
        ========================================== */}
        {salesChannels.length > 0 && (
          <section className={`w-full py-16 md:py-20 px-6 md:px-12`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto flex flex-col items-center"
            >
              <div className="w-full flex flex-col items-center">
                <h2
                  className={`text-xs font-sans font-bold tracking-[0.4em] uppercase mb-10 text-center opacity-60`}
                >
                  Comprar Online
                </h2>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
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
                      className={`flex items-center gap-4 px-8 py-5 rounded-full border border-current/10 bg-current/5 hover:bg-current/10 transition-all duration-300 hover:-translate-y-1 group`}
                    >
                      <div
                        className={`opacity-80 group-hover:opacity-100 transition-opacity ${channel.hover}`}
                      >
                        {channel.icon}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity mt-0.5">
                        {channel.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ==========================================
            FAIXA 5: LOCALIZAÇÃO, REDES SOCIAIS E HORÁRIOS
        ========================================== */}
        {(hasAddress || hasHours || availableSocials.length > 0) && (
          <section
            className={`w-full py-16 md:py-24 px-6 md:px-12 ${theme.bgSecondary} border-t ${border} shadow-inner`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
            >
              {/* LADO ESQUERDO: Endereço + Redes Sociais */}
              <div className="lg:col-span-6 flex flex-col gap-8 md:gap-10">
                {hasAddress && (
                  <div
                    className={`p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} border ${border} shadow-xl flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-500`}
                  >
                    <div>
                      <div
                        className={`w-14 h-14 rounded-full ${theme.bgSecondary} flex items-center justify-center mb-6 border ${border}`}
                      >
                        <Globe size={20} className={primary} />
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          Actions.registerClickEvent(business.id, "MAP")
                        }
                        className="block"
                      >
                        <h2
                          className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase mb-4 opacity-50`}
                        >
                          Localização
                        </h2>
                        <p className="text-xl md:text-2xl lg:text-3xl font-serif italic leading-snug mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                          {business.address || "Endereço não informado"}
                          {business.number &&
                            !business.address?.includes(business.number) &&
                            `, ${business.number}`}
                        </p>
                        {business.complement && (
                          <p className="text-sm md:text-base font-light opacity-60 mb-4">
                            {business.complement}
                          </p>
                        )}
                        <p className="text-[9px] md:text-[10px] font-sans uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-50 font-bold bg-current/5 inline-block px-4 py-2.5 rounded-lg mb-6 leading-relaxed">
                          {business.neighborhood &&
                            `${business.neighborhood} • `}{" "}
                          {business.city}{" "}
                          {business.state ? `• ${business.state}` : ""}{" "}
                          {business.cep ? `• ${business.cep}` : ""}
                        </p>
                        <div
                          className={`inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold px-6 py-3.5 rounded-full ${bgAction} shadow-md group-hover:scale-[1.03] transition-all`}
                        >
                          Como Chegar <ChevronRight size={14} strokeWidth={2} />
                        </div>
                      </a>
                    </div>
                  </div>
                )}

                {/* Redes Sociais logo abaixo do Endereço preenchendo o espaço */}
                {availableSocials.length > 0 && (
                  <div
                    className={`p-8 md:p-10 rounded-[2.5rem] ${theme.cardBg} border ${border} shadow-xl flex flex-col items-center justify-center`}
                  >
                    <h2
                      className={`text-[10px] font-sans font-bold tracking-[0.4em] uppercase mb-6 text-center ${primary}`}
                    >
                      Siga-nos
                    </h2>
                    <div className="flex flex-wrap gap-4 md:gap-5 justify-center w-full">
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
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-current/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group ${theme.bgSecondary}`}
                          >
                            <div className="opacity-60 group-hover:opacity-100 transition-opacity">
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
                                <Globe strokeWidth={1.5} className="w-5 h-5" />
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* LADO DIREITO: Horários */}
              {hasHours && (
                <div className="lg:col-span-6">
                  <div
                    className={`h-full p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} border ${border} shadow-xl flex flex-col hover:-translate-y-1 transition-transform duration-500`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full ${theme.bgSecondary} flex items-center justify-center mb-6 border ${border}`}
                    >
                      <Clock size={20} className={primary} />
                    </div>
                    <h2 className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase opacity-50 mb-8">
                      Horário de Funcionamento
                    </h2>
                    <div className="space-y-6 flex-grow">
                      {realHours.map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-end font-light text-sm group"
                        >
                          <span
                            className={`uppercase tracking-widest text-[11px] font-bold ${h.isClosed ? "opacity-30" : "opacity-70 group-hover:opacity-100"}`}
                          >
                            {h.day}
                          </span>
                          <div className="flex-grow mx-4 border-b border-dashed border-current/20 mb-1.5 opacity-50" />
                          <span
                            className={
                              h.isClosed
                                ? "opacity-30 italic"
                                : `opacity-100 font-medium ${primary}`
                            }
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </section>
        )}
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
