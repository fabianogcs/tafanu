"use client";

import { useState, useCallback, useRef, useEffect } from "react";

import { motion, AnimatePresence, useInView } from "framer-motion";

import {
  Instagram,
  Facebook,
  Globe,
  X,
  Terminal,
  MessageCircle,
  Share2,
  Heart,
  Plus,
  Loader2,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  ShoppingBag,
  Store,
} from "lucide-react";

import * as Actions from "@/app/actions";

import { toast } from "sonner";

import ReportModal from "@/components/ReportModal";

import { businessThemes } from "@/lib/themes";

import { useBusiness } from "@/lib/useBusiness";

import FavoriteButton from "@/components/FavoriteButton";

import CommentsSection from "../CommentsSection";

// --- HELPERS ---

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
  </svg>
);

// Ícones Oficiais Customizados

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

const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";

  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,

        text: `Confira ${businessName}:`,

        url,
      });

      return;
    } catch (err) {}
  }

  const textArea = document.createElement("textarea");

  textArea.value = url;

  document.body.appendChild(textArea);

  textArea.select();

  document.execCommand("copy");

  document.body.removeChild(textArea);

  toast.success("Link copiado!");
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

    hasGallery,

    hasDescription,

    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const footerTriggerRef = useRef(null);

  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["urban_cyber"];

  const radius = theme.radius || "rounded-xl";

  const shadow = theme.shadow || "shadow-2xl";

  const glassEffect = "bg-white/5 md:backdrop-blur-md";

  const safeAddress = fullAddress || business.address;

  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];

  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const salesChannels = [
    {
      key: "mercadoLivre",

      name: "Mercado Livre",

      icon: <MeliIcon className="w-4 h-4" />,

      url: business.mercadoLivre,

      colorClass: "text-[#FFE600] group-hover:text-[#FFE600]",
    },

    {
      key: "shopee",

      name: "Shopee",

      icon: <ShopeeIcon className="w-4 h-4" />,

      url: business.shopee,

      colorClass: "text-[#EE4D2D] group-hover:text-[#EE4D2D]",
    },

    {
      key: "ifood",

      name: "iFood",

      icon: <IfoodIcon className="w-4 h-4" />,

      url: business.ifood,

      colorClass: "text-[#EA1D2C] group-hover:text-[#EA1D2C]",
    },

    {
      key: "shein",

      name: "Shein",

      icon: <SheinIcon className="w-4 h-4" />,

      url: business.shein,

      colorClass: "text-white group-hover:text-white",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

  const safeSetIndex = useCallback(
    (next: number) => {
      if (gallery.length === 0) return;

      setSelectedIndex((next + gallery.length) % gallery.length);
    },

    [gallery.length],
  );

  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      const rawNumber =
        type === "whatsapp" ? business.whatsapp : business.phone;

      const cleanNumber = (rawNumber || "").replace(/\D/g, "");

      if (!cleanNumber) return;

      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Olá! Vi o perfil de ${business.name} no Tafanu.`)}`
          : `tel:${cleanNumber}`;

      try {
        // 🚀 O NOVO ESPIÃO ENTRA AQUI!

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
      className={`min-h-[100dvh] ${theme.bgPage} ${theme.textColor} font-sans relative w-full overflow-x-hidden selection:bg-white/20 selection:text-white`}
    >
      <div className="hidden md:block fixed inset-0 pointer-events-none z-[10] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <header className="relative pt-20 md:pt-32 pb-0 flex flex-col items-center justify-center overflow-hidden w-full px-4 border-b border-white/10">
        {/* Pílula de Ações (Fixo e Estável) */}

        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-0.5 md:gap-1 bg-white/90 backdrop-blur-md p-1 md:p-1.5 rounded-full border border-black/10 shadow-xl">
            <button
              onClick={() => handleShare(business.name)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all text-slate-700"
            >
              <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>

            <div className="w-[1px] h-3 md:h-4 bg-black/10 mx-0.5" />

            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto text-center flex flex-col items-center">
          {business.imageUrl && (
            <div className="w-24 h-24 md:w-36 md:h-36 mb-4 md:mb-6 relative">
              <div
                className={`w-full h-full border border-white/10 overflow-hidden ${radius} ${shadow} bg-black`}
              >
                <img
                  src={business.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              </div>
            </div>
          )}

          <div className="py-8 flex items-center justify-center w-full">
            <h1
              className={`font-black uppercase italic tracking-tight ${theme.textColor} break-words px-2 text-[clamp(2.5rem,10vw,6rem)] leading-[0.9] -skew-x-[3deg] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`}
            >
              {business.name}
            </h1>
          </div>
        </div>

        {business.urban_tag && (
          <div
            className={`relative mt-12 w-full overflow-hidden ${glassEffect} py-3 border-y border-white/10`}
          >
            <div className="inline-block animate-marquee whitespace-nowrap">
              {Array(8)
                .fill(null)

                .map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl md:text-5xl font-black uppercase italic mx-12 opacity-80 ${theme.primary}`}
                  >
                    {business.urban_tag} ///
                  </span>
                ))}
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 md:px-6 relative z-30 space-y-20 md:space-y-32 pb-24 mt-10 md:mt-20">
        <div className="flex flex-col gap-4">
          {/* REDES SOCIAIS (Carregam suavemente) */}

          {availableSocials.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 flex-wrap justify-center"
            >
              {availableSocials.map((s) => {
                const user = business[s];

                const url =
                  s === "instagram"
                    ? `https://instagram.com/${user}`
                    : s === "facebook"
                      ? `https://facebook.com/${user}`
                      : s === "tiktok"
                        ? `https://tiktok.com/@${user}`
                        : formatExternalLink(user);

                return (
                  <a
                    key={s}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      Actions.registerClickEvent(business.id, s.toUpperCase())
                    } // 🚀 ESPIÃO AQUI
                    className={`w-12 h-12 md:w-14 md:h-14 ${glassEffect} border flex items-center justify-center transition-all ${radius} hover:scale-110 ${theme.primary} border-white/20`}
                  >
                    {s === "instagram" ? (
                      <Instagram size={24} />
                    ) : s === "facebook" ? (
                      <Facebook size={24} />
                    ) : s === "tiktok" ? (
                      <TikTokIcon className="w-6 h-6" />
                    ) : (
                      <Globe size={24} />
                    )}
                  </a>
                );
              })}
            </motion.div>
          )}

          {/* LOJAS (Pílulas Discretas) */}

          {salesChannels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-4 w-full max-w-xl mx-auto"
            >
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
                  className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full ${glassEffect} border border-white/10 hover:bg-white/10 hover:scale-105 hover:border-white/30 transition-all duration-300 group shadow-lg`}
                >
                  <div
                    className={`transition-transform duration-300 group-hover:scale-110 ${channel.colorClass} opacity-80 group-hover:opacity-100`}
                  >
                    {channel.icon}
                  </div>

                  <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                    {channel.name}
                  </span>
                </a>
              ))}
            </motion.div>
          )}
        </div>
        {hasDescription && (
          <section className="relative w-full max-w-5xl mx-auto">
            <div
              className={`${glassEffect} border border-white/10 p-8 md:p-16 ${radius} ${shadow}`}
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 border-b-2 border-white/10 pb-4 opacity-50 flex items-center gap-4">
                <Terminal size={32} /> Sobre
              </h2>

              <p className="text-xl md:text-3xl font-light leading-snug whitespace-pre-line break-words">
                {business.description}
              </p>
            </div>
          </section>
        )}

        {hasFeatures && (
          <section className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8">
            {/* 1. O Título que faltava */}
            <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter opacity-50 flex items-center gap-3 border-b-2 border-white/10 pb-4">
              <Terminal size={24} /> DESTAQUES_
            </h3>

            {/* 2. O Grid que força o padrão (1 coluna no celular, 2 a 3 no PC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {business.features.filter(Boolean).map((f: string, i: number) => (
                <div
                  key={i}
                  /* 3. Ajuste do card: w-full obriga a preencher a grade, paddings menores */
                  className={`w-full p-5 ${glassEffect} border border-white/10 ${radius} flex items-center gap-4 group hover:border-white/40 transition-all shadow-sm`}
                >
                  <div
                    className={`w-1.5 h-1.5 shrink-0 rounded-full ${theme.bgAction} shadow-[0_0_10px_currentColor]`}
                  />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-widest leading-tight opacity-90">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasGallery && (
          <section className="space-y-10">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Camera size={32} /> VISUAL_FEED_
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ scale: 1.02 }}
                  className={`aspect-square ${glassEffect} overflow-hidden cursor-pointer group relative border border-white/10 ${radius} ${shadow}`}
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    alt="Gallery"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus
                      size={40}
                      className="text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {hasFaqs && (
          <section className="space-y-6 md:space-y-8">
            {/* Título menor e com a linha divisória padronizada */}
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter opacity-50 flex items-center gap-3 border-b-2 border-white/10 pb-4">
              <MessageCircle size={24} /> DÚVIDAS FREQUENTES
            </h3>

            {/* O SEGREDO DEFINITIVO: Duas colunas reais e separadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* COLUNA ESQUERDA (Pega a pergunta 1, 3, 5...) */}
              <div className="flex flex-col gap-4">
                {faqs.map((f: any, i: number) => {
                  if (i % 2 !== 0) return null; // Pula as perguntas ímpares (que vão pra direita)
                  return (
                    <div
                      key={i}
                      className={`${glassEffect} border border-white/10 ${radius} overflow-hidden`}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                      >
                        <span className="text-base md:text-lg font-bold uppercase italic tracking-wide opacity-90">
                          {f.q || f.question}
                        </span>
                        <ChevronDown
                          className={`transition-transform duration-300 ${theme.primary} ${openFaq === i ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="px-5 md:px-6 pb-6 pt-2 text-white/70 border-t border-white/5 font-medium leading-relaxed text-sm md:text-base">
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* COLUNA DIREITA (Pega a pergunta 2, 4, 6...) */}
              <div className="flex flex-col gap-4">
                {faqs.map((f: any, i: number) => {
                  if (i % 2 === 0) return null; // Pula as perguntas pares (que ficaram na esquerda)
                  return (
                    <div
                      key={i}
                      className={`${glassEffect} border border-white/10 ${radius} overflow-hidden`}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                      >
                        <span className="text-base md:text-lg font-bold uppercase italic tracking-wide opacity-90">
                          {f.q || f.question}
                        </span>
                        <ChevronDown
                          className={`transition-transform duration-300 ${theme.primary} ${openFaq === i ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="px-5 md:px-6 pb-6 pt-2 text-white/70 border-t border-white/5 font-medium leading-relaxed text-sm md:text-base">
                              {f.a || f.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* --- CONTATO (DOBRADINHA: CARD + BOTÃO) --- */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {hasPhone && (
              <button
                onClick={() => handleTrackLead("phone")}
                className={`w-full ${glassEffect} border border-white/10 p-6 md:p-8 ${radius} ${shadow} flex items-center gap-5 group hover:border-white/40 transition-all`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${theme.primary} group-hover:shadow-[0_0_20px_currentColor] transition-all`}
                >
                  <Phone size={24} />
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">
                    Voice Line
                  </p>
                  <p className="text-lg md:text-xl font-bold italic uppercase tracking-wide">
                    {formatPhoneNumber(business.phone)}
                  </p>
                </div>
              </button>
            )}

            {hasWhatsapp && (
              <button
                onClick={() => handleTrackLead("whatsapp")}
                className={`w-full ${glassEffect} border border-[#25D366]/30 p-6 md:p-8 ${radius} ${shadow} flex items-center gap-5 group hover:border-[#25D366] transition-all`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:shadow-[0_0_20px_#25D366] transition-all`}
                >
                  <MessageCircle size={24} fill="currentColor" />
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">
                    Direct Chat
                  </p>
                  <p className="text-lg md:text-xl font-bold italic uppercase tracking-wide">
                    Chamar no Whats
                  </p>
                </div>
              </button>
            )}

            {hasAddress && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => Actions.registerClickEvent(business.id, "MAP")} // 🚀 ESPIÃO AQUI
                className={`w-full ${glassEffect} border border-white/10 p-6 md:p-8 ${radius} ${shadow} flex items-center gap-5 group hover:border-white/40 transition-all`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${theme.primary}`}
                >
                  <MapPin size={24} />
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">
                    Location
                  </p>
                  <p className="text-base md:text-lg font-bold italic uppercase tracking-wide">
                    {business.address?.split("-").slice(0, 2).join(" - ")}
                  </p>
                  <p className="text-[10px] md:text-xs opacity-40 uppercase tracking-widest mt-1">
                    {business.city} — {business.state}
                  </p>
                </div>
              </a>
            )}
          </div>
          {hasHours && (
            <div
              className={`lg:col-span-5 ${glassEffect} p-8 border border-white/10 ${radius} ${shadow}`}
            >
              <h3 className="text-2xl font-black uppercase italic mb-8 border-b-2 border-white/10 pb-2 flex items-center gap-3">
                <Clock size={24} /> HORÁRIOS
              </h3>

              <div className="space-y-4">
                {realHours.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-white/5 font-black uppercase italic py-2 text-xs"
                  >
                    <span className="opacity-40">{h.day}</span>

                    <span
                      className={
                        h.isClosed ? "text-red-500 line-through" : "text-white"
                      }
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>

        <div ref={footerTriggerRef} className="h-10 w-full" />
      </main>

      {/* BOTÃO FLUTUANTE (A Dobradinha Parte 2 - Ajuste z-30 para não cobrir Nav) */}

      {hasWhatsapp && (
        <motion.button
          animate={isFooterVisible ? { scale: 0 } : { scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 z-30 w-20 h-20 bg-emerald-500 text-white flex items-center justify-center border-4 border-black ${radius} md:shadow-[0_0_30px_rgba(16,185,129,0.5)]`}
        >
          <MessageCircle size={36} fill="currentColor" />
        </motion.button>
      )}

      {/* LIGHTBOX PRO (z-200 para ficar sobre tudo) */}

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-all">
              <X size={40} />
            </button>

            <div className="flex-grow flex items-center justify-center relative w-full px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-16 h-16 items-center justify-center bg-white/5 rounded-full text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md border border-white/10 shadow-2xl"
              >
                <ChevronLeft size={40} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-16 h-16 items-center justify-center bg-white/5 rounded-full text-white hover:bg-white/10 transition-all z-[220] backdrop-blur-md border border-white/10 shadow-2xl"
              >
                <ChevronRight size={40} />
              </button>

              <motion.img
                key={selectedIndex}
                src={gallery[selectedIndex]}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                  else if (info.offset.x < -80) safeSetIndex(selectedIndex + 1);
                }}
                className={`max-w-full max-h-[70vh] object-contain border-4 ${theme.border} shadow-2xl ${radius}`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div
              className="h-32 w-full flex items-center justify-start md:justify-center gap-3 px-10 pb-10 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-center ${selectedIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-30"}`}
                >
                  <img
                    src={img}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    alt="Thumb"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: inline-block;
        }

        @media (min-width: 768px) {
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;

          scrollbar-width: none;
        }
      `}</style>

      {/* SEÇÃO DE COMENTÁRIOS */}

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <CommentsSection
          businessId={rawBusiness.id}
          businessOwnerId={rawBusiness.userId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          emailVerified={emailVerified}
          themeColor={theme.primary}
          comments={rawBusiness.comments || []} // Usamos o rawBusiness para garantir que os dados do banco cheguem aqui
        />
      </div>
    </div>
  );
}
