"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Layout,
  ChevronRight,
  ChevronLeft,
  Quote,
  Heart,
  Share2,
  Loader2,
  X,
  Plus,
  ShieldCheck,
  HelpCircle,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  Maximize2,
  Camera,
  Video,
  Play,
  MessageCircle,
} from "lucide-react";
import * as Actions from "@/app/actions";
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
// --- MOTOR DE VÍDEOS EMBED (YOUTUBE, INSTAGRAM, TIKTOK) ---
const VideoEmbed = ({ url }: { url: string }) => {
  let embedUrl = "";
  let isVertical = false;

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
      className={`w-full overflow-hidden rounded-[2rem] bg-black/5 border border-black/5 shadow-md ${isVertical ? "aspect-[9/16] max-w-[350px] mx-auto" : "aspect-video"}`}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
// --- LÓGICA DE COMPARTILHAMENTO NATIVO + BLINDAGEM ---
const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";

  // 1. Tenta o Compartilhamento Nativo (Mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Confira o perfil de ${businessName} no Tafanu:`,
        url: url,
      });
      return; // Sucesso no compartilhamento nativo
    } catch (err) {
      console.warn("Compartilhamento nativo cancelado ou falhou.");
    }
  }

  // 2. Fallback: Lógica Blindada de Cópia (PC ou Navegadores Internos)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
      return;
    } catch (err) {}
  }

  // 3. Fallback do Fallback: Textarea (Extrema Segurança)
  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    toast.success("Link copiado!");
  } catch (err) {
    toast.error("Erro ao copiar link.");
  }
  document.body.removeChild(textArea);
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

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`mb-3 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} overflow-hidden transition-all duration-300 shadow-sm`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex justify-between items-center text-left gap-4 outline-none bg-transparent border-none"
      >
        <span
          className={`text-xs md:text-sm font-black uppercase tracking-tight ${isOpen ? theme.primary : "opacity-80"}`}
        >
          {q}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? `${theme.bgAction} rotate-45 text-white` : `${theme.bgSecondary} ${theme.primary}`}`}
        >
          <Plus size={16} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 text-xs md:text-sm font-medium leading-relaxed opacity-60 italic border-t border-black/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
}: any) {
  const {
    business,
    realHours,
    isFavorite,
    setIsFavorite,
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

  const [activeTab, setActiveTab] = useState<"perfil" | "infos">("perfil");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const footerTriggerRef = useRef<HTMLDivElement | null>(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["comercial_blue"];

  const address = fullAddress || business.address || "";

  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];

  const videos = Array.isArray(business.videos) // 🚀 PUXANDO OS VÍDEOS
    ? business.videos.filter(Boolean)
    : [];

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  // LISTA INTELIGENTE DE LOJAS
  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-4 h-4" />,
      url: business.mercadoLivre,
      colorClass:
        "bg-[#FFE600] text-[#2D3277] border-transparent hover:brightness-105",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-4 h-4" />,
      url: business.shopee,
      colorClass:
        "bg-[#EE4D2D] text-white border-transparent hover:brightness-105",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-4 h-4" />,
      url: business.ifood,
      colorClass:
        "bg-[#EA1D2C] text-white border-transparent hover:brightness-105",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-4 h-4" />,
      url: business.shein,
      colorClass: "bg-slate-900 text-white border-transparent hover:bg-black",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const safeSetIndex = useCallback(
    (next: number) => {
      if (gallery.length === 0) return;
      const index = (next + gallery.length) % gallery.length;
      setSelectedIndex(index);
    },
    [gallery.length],
  );

  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      const rawNumber =
        type === "whatsapp" ? business.whatsapp : business.phone;
      const cleanNumber = (rawNumber || "").replace(/\D/g, "");
      if (!cleanNumber) return;

      const formattedNumber = cleanNumber.startsWith("55")
        ? cleanNumber
        : `55${cleanNumber}`;

      const message = `Olá! Vi o perfil de ${business?.name || "sua empresa"} no Tafanu.`;

      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`
          : `tel:${cleanNumber}`;
      try {
        // 🚀 NOVO ESPIÃO AQUI!
        await Actions.registerClickEvent(business.id, type.toUpperCase());
      } catch (e) {
      } finally {
        window.location.href = targetUrl;
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? "hidden" : "unset";
  }, [selectedIndex]);

  // --- PREPARAÇÃO DO ENDEREÇO PARA O MAPA ---
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

  // URL Oficial de Rotas com Origem Inteligente via GPS do usuário
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapDestination)}`;
  // ------------------------------------------

  if (!theme) return null;

  return (
    <div
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden`}
    >
      {/* --- HEADER --- */}
      <header
        className={`relative pt-10 pb-8 w-full ${theme.bgPage} border-b ${theme.border}`}
      >
        {/* Pílula de Ações */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
          <div className="flex items-center gap-0.5 md:gap-1 bg-white/90 backdrop-blur-md p-1 md:p-1.5 rounded-full border border-black/10 shadow-md">
            <button
              onClick={() => handleShare(business.name)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all text-slate-700"
            >
              <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>
            <div className="w-[1px] h-3 md:h-4 bg-black/10 mx-0.5" />
            <div className="scale-75 md:scale-100">
              <FavoriteButton
                businessId={business.id}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={isFavorited}
                key={isFavorited ? "favorited" : "not-favorited"}
                emailVerified={emailVerified}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {business.imageUrl && (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.2rem] border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 flex items-center justify-center">
                <img
                  src={business.imageUrl}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              </div>
            )}
            <div className="flex flex-col items-center md:items-start space-y-3">
              {business.comercial_badge && (
                <span
                  className={`${theme.bgAction} px-3 py-1 rounded-md text-[9px] md:text-xs font-black uppercase tracking-widest text-white shadow-md inline-block`}
                >
                  {business.comercial_badge}
                </span>
              )}
              <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter leading-none theme.textColor">
                {business.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* --- MENU TABS --- */}
      <div className="sticky top-4 z-30 px-4 my-8 md:my-12 flex justify-center">
        {/* Adicionei gap-1 para separar os botões e deixei o fundo um pouco mais "visível" */}
        <div className="bg-slate-900/95 backdrop-blur-xl p-1.5 md:p-2 rounded-full border border-black/10 shadow-2xl flex gap-1">
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              /* O segredo: active:scale-95 (efeito clique) e hover:bg-white/10 (ilumina ao tocar) */
              className={`relative px-8 md:px-14 py-3 md:py-3.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === t
                  ? "text-white shadow-md"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="tab"
                  className={`absolute inset-0 ${theme.bgAction} rounded-full z-0`}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                {t === "perfil" ? (
                  <Layout size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}{" "}
                {t}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {hasDescription && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-14 shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary}`}
                    >
                      <Quote size={20} />
                    </div>
                    <h3 className="text-sm md:text-lg font-black uppercase italic opacity-60">
                      Nossa História
                    </h3>
                  </div>
                  <p className="text-xl md:text-3xl font-normal leading-relaxed opacity-90 break-words whitespace-pre-line">
                    {business.description}
                  </p>
                </section>
              )}
              {hasFeatures && (
                <section className="space-y-6">
                  {/* 1. O Título Padronizado */}
                  <div>
                    <h3 className="text-sm md:text-lg font-black uppercase italic opacity-60">
                      Destaques
                    </h3>
                  </div>

                  {/* 2. O Grid que trava o tamanho dos cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {business.features
                      .filter(Boolean)
                      .map((f: string, i: number) => (
                        <div
                          key={i}
                          className={`w-full h-full px-4 py-3 md:px-5 md:py-4 rounded-2xl border ${theme.border} ${theme.cardBg} flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform`}
                        >
                          <CheckCircle2
                            size={16}
                            className={`shrink-0 ${theme.primary}`}
                          />
                          <span className="text-[10px] md:text-xs font-black uppercase italic leading-tight opacity-90">
                            {f}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {gallery.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-60 italic">
                      Vitrine
                    </h3>
                    <Camera size={20} className="opacity-40" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {gallery.map((img: string, i: number) => (
                      <motion.div
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square rounded-[2rem] overflow-hidden cursor-pointer shadow-md group border border-black/5"
                      >
                        <img
                          src={img}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt="Galeria"
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* 🚀 SEÇÃO DE VÍDEOS EMBED */}
              {videos.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-60 italic">
                      Vídeos
                    </h3>
                    <Video size={20} className="opacity-40" />
                  </div>
                  <div
                    className={`grid gap-6 ${videos.some((v: string) => v.includes("shorts") || v.includes("instagram") || v.includes("tiktok")) ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}
                  >
                    {videos.map((vid: string, i: number) => (
                      <VideoEmbed key={i} url={vid} />
                    ))}
                  </div>
                </section>
              )}
              {/* FIM DA SEÇÃO DE VÍDEOS */}
            </motion.div>
          )}

          {activeTab === "infos" && (
            <motion.div
              key="infos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {faqs.length > 0 && (
                <section className="w-full">
                  {/* Título ajustado para o novo padrão legível */}
                  <div className="flex items-center gap-3 mb-6">
                    <HelpCircle size={20} className={theme.primary} />
                    <h3 className="text-sm md:text-lg font-black uppercase italic opacity-60">
                      Dúvidas Frequentes
                    </h3>
                  </div>

                  {/* O SEGREDO: Duas colunas independentes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
                    {/* COLUNA ESQUERDA (Pega a pergunta 1, 3, 5...) */}
                    <div className="flex flex-col">
                      {faqs.map((f: any, i: number) => {
                        if (i % 2 !== 0) return null; // Pula as ímpares
                        return (
                          <AccordionItem
                            key={i}
                            q={f.q || f.question}
                            a={f.a || f.answer}
                            theme={theme}
                          />
                        );
                      })}
                    </div>

                    {/* COLUNA DIREITA (Pega a pergunta 2, 4, 6...) */}
                    <div className="flex flex-col">
                      {faqs.map((f: any, i: number) => {
                        if (i % 2 === 0) return null; // Pula as pares
                        return (
                          <AccordionItem
                            key={i}
                            q={f.q || f.question}
                            a={f.a || f.answer}
                            theme={theme}
                          />
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {hasHours && (
                  <div
                    className={`${theme.cardBg} p-8 md:p-12 rounded-[2.5rem] border ${theme.border} shadow-md`}
                  >
                    <div className="flex items-center gap-2 mb-8 opacity-30 text-[10px] font-bold uppercase tracking-widest">
                      <Clock size={14} /> Horários
                    </div>
                    <div className="space-y-4">
                      {realHours.map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2.5 border-b border-black/5 last:border-0"
                        >
                          <span className="text-[11px] font-black uppercase opacity-40 italic">
                            {h.day}
                          </span>
                          <span
                            className={`text-xs md:text-lg font-black italic ${h.isClosed ? "text-rose-500" : ""}`}
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-6 ${!hasHours ? "md:col-span-2 max-w-2xl mx-auto w-full" : ""}`}
                >
                  {/* BLOCO DE CONTATOS (LIGAÇÃO, WHATSAPP, REDES E LOJAS) */}
                  {(hasWhatsapp ||
                    hasPhone ||
                    availableSocials.length > 0 ||
                    salesChannels.length > 0) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-md space-y-6`}
                    >
                      {hasPhone && (
                        <button
                          onClick={() => handleTrackLead("phone")}
                          className="w-full flex items-center justify-between group bg-transparent border-none outline-none"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-sm group-hover:scale-105 transition-transform`}
                            >
                              <PhoneCall size={20} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase opacity-40">
                                Ligar Agora
                              </h4>
                              <p className="text-base md:text-xl font-black italic">
                                {formatPhoneNumber(business.phone)}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={20}
                            className="opacity-20 group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      )}

                      {hasWhatsapp && (
                        <button
                          onClick={() => handleTrackLead("whatsapp")}
                          className="w-full flex items-center justify-between group bg-transparent border-none outline-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                              <MessageCircle size={20} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase opacity-40">
                                Atendimento Online
                              </h4>
                              <p className="text-base md:text-xl font-black italic">
                                Iniciar Conversa
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={20}
                            className="opacity-20 group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      )}

                      {availableSocials.length > 0 && (
                        <div className="flex items-center justify-center gap-6 pt-6 border-t border-black/5">
                          {availableSocials.map((s) => {
                            const username = business[s];
                            if (!username) return null;

                            const isUrl =
                              username.startsWith("http") ||
                              username.startsWith("www");

                            let finalUrl = isUrl
                              ? username.startsWith("http")
                                ? username
                                : `https://${username}`
                              : s === "instagram"
                                ? `https://instagram.com/${username.replace("@", "")}`
                                : s === "facebook"
                                  ? `https://facebook.com/${username}`
                                  : s === "tiktok"
                                    ? `https://tiktok.com/@${username.replace("@", "")}`
                                    : formatExternalLink(username);

                            return (
                              <motion.a
                                key={s}
                                href={finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={async () => {
                                  try {
                                    await Actions.registerClickEvent(
                                      business.id,
                                      s.toUpperCase(),
                                    );
                                  } catch (e) {}
                                }} // 🚀 ESPIÃO AQUI
                                whileHover={{ y: -3 }}
                                className="opacity-60 hover:opacity-100 transition-opacity"
                              >
                                {s === "instagram" ? (
                                  <Instagram size={24} color="#E1306C" />
                                ) : s === "facebook" ? (
                                  <Facebook size={24} color="#1877F2" />
                                ) : s === "tiktok" ? (
                                  <TikTokIcon className="w-6 h-6" />
                                ) : (
                                  <Globe size={24} color="#06b6d4" />
                                )}
                              </motion.a>
                            );
                          })}
                        </div>
                      )}

                      {/* LOJAS OFICIAIS (Inseridas no card de Contato) */}
                      {salesChannels.length > 0 && (
                        <div className="pt-6 border-t border-black/5">
                          <h4 className="text-[10px] font-black uppercase opacity-40 mb-4 text-center">
                            Nossas Lojas Oficiais
                          </h4>
                          <div className="flex flex-wrap justify-center gap-2">
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
                                } // 🚀 ESPIÃO AQUI
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm transition-all duration-300 font-sans group ${channel.colorClass}`}
                              >
                                <div className="transition-transform duration-300 group-hover:scale-110">
                                  {channel.icon}
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase">
                                  {channel.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {hasAddress && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        Actions.registerClickEvent(business.id, "MAP")
                      }
                      /* Mantendo as classes perfeitas do tema Comercial */
                      className={`p-6 md:p-8 ${theme.cardBg} rounded-[2.5rem] flex flex-col gap-6 h-full group border ${theme.border} shadow-sm transition-all hover:shadow-md`}
                    >
                      {/* ÍCONE COM TAMANHO AJUSTADO */}
                      <div
                        className={`w-12 h-12 rounded-xl ${theme.bgAction} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0`}
                      >
                        <MapPin size={22} />
                      </div>

                      <div className="text-left space-y-2">
                        <h4
                          className={`text-[10px] font-black uppercase opacity-40 tracking-widest ${theme.textColor}`}
                        >
                          Localização
                        </h4>

                        {/* ENDEREÇO PRINCIPAL E COMPLEMENTO */}
                        <p
                          className={`text-sm md:text-base font-black uppercase italic leading-tight ${theme.textColor}`}
                        >
                          {business.address || "Endereço não cadastrado"}
                          {business.number &&
                            !business.address?.includes(business.number) &&
                            `, ${business.number}`}
                        </p>

                        {business.complement && (
                          <p className="text-[11px] font-medium opacity-70">
                            {business.complement}
                          </p>
                        )}

                        {/* BAIRRO, CIDADE, ESTADO E CEP */}
                        <p
                          className={`text-[10px] font-bold opacity-40 uppercase tracking-widest ${theme.textColor}`}
                        >
                          {business.neighborhood &&
                            `${business.neighborhood} • `}
                          {business.city}{" "}
                          {business.state ? `— ${business.state}` : ""}
                          {business.cep && ` • CEP: ${business.cep}`}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- REPORTAR (DISCRETO) --- */}
        <div className="w-full flex justify-center mt-20 mb-10 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>

        {/* --- SEÇÃO DE AVALIAÇÕES (FINAL DA PÁGINA) --- */}
        <div className="max-w-4xl mx-auto w-full pb-20">
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
      </main>

      {/* WHATSAPP FLUTUANTE (AJUSTE DESKTOP) */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          // 🚀 MUDANÇA: Tamanho mobile (w-16 h-16), margens desktop (md:bottom-10 md:right-10), sombra 2xl e efeito de clique (active:scale-95)
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-4 border-white/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
        >
          {/* 🚀 MUDANÇA: Ícone ajustado para w-8 h-8 no mobile */}
          <MessageCircle
            className="w-8 h-8 md:w-10 md:h-10"
            fill="currentColor"
          />
        </motion.button>
      )}

      {/* --- LIGHTBOX (THUMBS E SWIPE) --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white z-[210] hover:bg-white/10 rounded-full transition-colors">
              <X size={32} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronRight size={32} />
              </button>

              {gallery[selectedIndex] && (
                <motion.img
                  key={selectedIndex}
                  src={gallery[selectedIndex]}
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                    else if (info.offset.x < -80)
                      safeSetIndex(selectedIndex + 1);
                  }}
                  className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain shadow-2xl rounded-lg pointer-events-auto cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>

            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-3 px-6 pb-6 overflow-x-auto no-scrollbar pointer-events-auto snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center ${selectedIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40"}`}
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    alt="Thumbnail"
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
