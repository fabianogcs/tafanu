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
  MapPin,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Navigation,
  Info,
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
      className={`border-b ${theme.border} transition-all duration-300 last:border-0`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left gap-4 outline-none bg-transparent group"
      >
        <span className="text-sm font-semibold opacity-90 group-hover:opacity-100">
          {q}
        </span>
        <Plus
          size={16}
          className={`shrink-0 transition-transform duration-300 opacity-50 ${isOpen ? "rotate-45" : ""}`}
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
            <div className="pb-5 text-sm leading-relaxed opacity-70">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 4. LAYOUT PRINCIPAL (Google Meu Negócio Style)
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
    businessThemes[business.theme] ||
    businessThemes["showroom_clean"];

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-5 h-5" />,
      url: business.mercadoLivre,
      colorClass: "text-[#2D3277] bg-[#FFE600]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-5 h-5" />,
      url: business.shopee,
      colorClass: "text-white bg-[#EE4D2D]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-5 h-5" />,
      url: business.ifood,
      colorClass: "text-white bg-[#EA1D2C]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-5 h-5" />,
      url: business.shein,
      colorClass: "text-white bg-slate-900",
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

  // ==========================================
  // 🚀 CÉREBRO DA GALERIA: LÓGICA CONDICIONAL E TÍTULO
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
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- CAPA E TOPO (ESTILO GMB) --- */}
      <div
        className={`w-full h-40 md:h-56 ${theme.bgHero} relative overflow-hidden`}
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
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:scale-105 transition-all shadow-sm"
          >
            <Share2 size={18} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:scale-105 transition-all shadow-sm">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative -mt-16 md:-mt-20 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end">
          {business.imageUrl && (
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${theme.border} bg-white shadow-xl overflow-hidden relative shrink-0 z-10`}
            >
              <Image
                src={business.imageUrl}
                alt="Logo"
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">
              {business.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-sm font-medium opacity-70">
                {business.urban_tag || business.city || "Negócio Local"}
              </span>
              {safeHours.length > 0 && (
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    isOpen
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {isOpen ? "● Aberto" : "● Fechado"}
                </span>
              )}

              {/* Lógica Corrigida para evitar frase duplicada! */}
              {business.comercial_badge &&
                business.comercial_badge !== business.urban_tag && (
                  <>
                    <span className="opacity-40">•</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${theme.primary} flex items-center gap-1`}
                    >
                      <CheckCircle2 size={12} /> {business.comercial_badge}
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS (Barra de Ações Rápidas) --- */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8 border-b border-black/5 pb-8">
          {hasWhatsapp && (
            <button
              onClick={() => handleTrackLead("whatsapp")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full ${theme.bgAction} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
              >
                <MessageCircle size={20} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                WhatsApp
              </span>
            </button>
          )}
          {hasPhone && (
            <button
              onClick={() => handleTrackLead("phone")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full border ${theme.border} ${theme.cardBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <PhoneCall size={20} className={theme.primary} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                Ligar
              </span>
            </button>
          )}
          {hasAddress && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => Actions.registerClickEvent(business.id, "MAP")}
              className={`flex flex-col items-center gap-2 flex-1 min-w-[80px] max-w-[100px] group`}
            >
              <div
                className={`w-12 h-12 rounded-full border ${theme.border} ${theme.cardBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Navigation size={20} className={theme.primary} />
              </div>
              <span className="text-[10px] font-semibold uppercase opacity-80 group-hover:opacity-100">
                Rota
              </span>
            </a>
          )}
        </div>
      </div>

      {/* --- CORPO PRINCIPAL (2 Colunas) --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
        {/* COLUNA ESQUERDA: Visão Geral */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {hasDescription && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                <Info size={18} className={theme.primary} /> Visão Geral
              </h2>
              <p className="text-sm md:text-base leading-relaxed opacity-80 whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {cleanFeed.length > 0 && (
            <div
              className={`p-6 pb-2 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                {/* 🚀 TÍTULO FIXO E CLEAN */}
                <h2 className="text-base font-bold flex items-center gap-2 opacity-90">
                  Galeria
                </h2>

                {/* 🚀 SÓ MOSTRA AS ABAS SE TIVER OS DOIS TIPOS */}
                {hasPhotos && hasVideos && (
                  <div className="flex items-center p-0.5 bg-black/5 rounded-full">
                    <button
                      onClick={() => setUserMediaFilter("photos")}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeMediaFilter === "photos" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-100"}`}
                    >
                      Fotos
                    </button>
                    <button
                      onClick={() => setUserMediaFilter("motion")}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeMediaFilter === "motion" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-100"}`}
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
                    return ["video", "video_v", "video_h"].includes(item.type);
                  return true;
                })}
                setSelectedIndex={setSelectedIndex}
                variant="showroom"
                themeBorder={theme.border}
                cardBg={theme.cardBg}
              />
            </div>
          )}
          {hasFeatures && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-4 flex items-center gap-2 opacity-90">
                O que oferecemos
              </h2>
              <div className="flex flex-col gap-3">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* O shrink-0 garante que o ícone nunca perca o seu tamanho original */}
                      <CheckCircle2
                        size={18}
                        className={`shrink-0 ${theme.primary} mt-0.5`}
                        strokeWidth={2.5}
                      />
                      <span className="text-sm font-medium opacity-80">
                        {f}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasFaqs && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm`}
            >
              <h2 className="text-base font-bold mb-2 flex items-center gap-2 opacity-90">
                Perguntas Frequentes
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

        {/* COLUNA DIREITA: Detalhes Práticos */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
          {(hasAddress || hasHours) && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm flex flex-col gap-6`}
            >
              {hasAddress && (
                <div>
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                    <MapPin size={18} className={theme.primary} /> Endereço
                  </h2>
                  <p className="text-sm font-semibold opacity-90 leading-snug">
                    {business.address || "Endereço não cadastrado"}
                    {business.number &&
                      !business.address?.includes(business.number) &&
                      `, ${business.number}`}
                  </p>
                  {business.complement && (
                    <p className="text-xs font-medium opacity-60 mt-1">
                      {business.complement}
                    </p>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {business.neighborhood && `${business.neighborhood} • `}
                    {business.city}{" "}
                    {business.state ? `— ${business.state}` : ""}
                  </p>

                  {/* Botão de navegação integrado no próprio cartão de endereço */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      Actions.registerClickEvent(business.id, "MAP")
                    }
                    className={`mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl ${theme.bgSecondary} ${theme.primary} border ${theme.border} hover:opacity-80 transition-all`}
                  >
                    <Navigation size={14} /> Traçar Rota
                  </a>
                </div>
              )}

              {hasHours && (
                <div
                  className={`${hasAddress ? "pt-5 border-t border-black/5" : ""}`}
                >
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 opacity-90">
                    <Clock size={18} className={theme.primary} /> Horários
                  </h2>
                  <div className="space-y-2.5">
                    {safeHours.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs md:text-sm"
                      >
                        <span className="font-semibold opacity-60 capitalize">
                          {h.day}
                        </span>
                        <span
                          className={`font-bold ${h.isClosed ? "text-rose-500" : "opacity-90"}`}
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

          {/* Social e Web */}
          {(availableSocials.length > 0 || salesChannels.length > 0) && (
            <div
              className={`p-6 rounded-[1.5rem] ${theme.cardBg} border ${theme.border} shadow-sm flex flex-col gap-5`}
            >
              {availableSocials.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-3">
                    Redes Sociais
                  </h2>
                  <div className="flex flex-wrap gap-2">
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
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.bgSecondary} border ${theme.border} hover:opacity-80 transition-opacity`}
                        >
                          {s === "instagram" ? (
                            <Instagram size={14} />
                          ) : s === "facebook" ? (
                            <Facebook size={14} />
                          ) : s === "tiktok" ? (
                            <TikTokIcon className="w-3.5 h-3.5" />
                          ) : (
                            <Globe size={14} />
                          )}
                          <span className="text-xs font-semibold capitalize opacity-80">
                            {s}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {salesChannels.length > 0 && (
                <div
                  className={`${availableSocials.length > 0 ? "pt-4 border-t border-black/5" : ""}`}
                >
                  <h2 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-3">
                    Onde Comprar
                  </h2>
                  <div className="flex flex-col gap-2">
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
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-sans group hover:opacity-90 ${channel.colorClass}`}
                      >
                        <div className="w-5 h-5">{channel.icon}</div>
                        <span className="text-xs font-bold tracking-widest uppercase">
                          {channel.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className="ml-auto opacity-50"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- RODAPÉ --- */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-20">
        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity">
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

      <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />

      {/* --- WHATSAPP FLUTUANTE UNIVERSAL (Estilo App/Flutuante em todas as telas) --- */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle size={28} />
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
