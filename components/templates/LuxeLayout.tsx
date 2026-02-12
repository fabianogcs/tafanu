"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { toast } from "sonner";
import {
  Heart,
  Share2,
  Loader2,
  X,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Minus,
  Check,
  Maximize2,
  Camera,
  Quote,
  MessageCircle,
} from "lucide-react";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { useBusiness } from "@/lib/useBusiness";
import { businessThemes } from "@/lib/themes";

// --- HELPERS ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
  </svg>
);

const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Conheça ${businessName}:`,
        url,
      });
      return;
    } catch (err) {}
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
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

const LuxeAccordion = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${theme.border} last:border-0`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left gap-4 group bg-transparent border-none outline-none"
      >
        <span
          className={`text-xl md:text-3xl font-serif italic ${isOpen ? theme.primary : theme.textColor}`}
        >
          {q}
        </span>
        <span
          className={`shrink-0 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
        >
          {isOpen ? (
            <Minus size={24} className={theme.primary} />
          ) : (
            <Plus size={24} className="opacity-40" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p
              className={`pb-10 text-base md:text-lg font-light opacity-80 leading-relaxed font-sans max-w-3xl ${theme.subTextColor} whitespace-pre-line break-words`}
            >
              {a}
            </p>
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const theme =
    propTheme || businessThemes[business.theme] || businessThemes["editorial"];
  const safeAddress = fullAddress || business.address;
  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

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
        if (type === "whatsapp")
          await (Actions as any).incrementWhatsappClicks?.(business.id);
        else await (Actions as any).incrementPhoneClicks?.(business.id);
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
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-serif pb-0 overflow-x-hidden transition-colors duration-1000`}
    >
      {/* --- HEADER --- */}
      <header
        className={`relative pt-16 pb-12 w-full ${theme.bgPage} border-b ${theme.border} text-center`}
      >
        {/* Pílula de Ações (Ajuste z-10 para o Nav) */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-0.5 md:gap-1 bg-white/90 backdrop-blur-md p-1 md:p-1.5 rounded-full border border-black/5 shadow-xl">
            <button
              onClick={() => handleShare(business.name)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all text-slate-700"
            >
              <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>
            <div className="w-[1px] h-3 md:h-4 bg-black/10 mx-0.5" />
            <button
              onClick={async () => {
                if (isFavoriting) return;
                setIsFavoriting(true);
                try {
                  await (Actions as any).toggleFavorite(business.id);
                  setIsFavorite(!isFavorite);
                } finally {
                  setIsFavoriting(false);
                }
              }}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all"
            >
              {isFavoriting ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-slate-400" />
              ) : (
                <Heart
                  className={`w-4 h-4 md:w-[18px] md:h-[18px] ${isFavorite ? "text-rose-500" : "text-slate-700"}`}
                  fill={isFavorite ? "currentColor" : "none"}
                />
              )}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          {business.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-24 h-24 md:w-40 md:h-40 rounded-full border border-black/5 shadow-2xl overflow-hidden mb-8"
            >
              <img
                src={business.imageUrl}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-5xl md:text-9xl font-thin tracking-tighter italic leading-none ${theme.primary} drop-shadow-sm`}
          >
            {business.name}
          </motion.h1>
          {business.luxe_quote && (
            <p className="mt-6 text-sm md:text-2xl font-light tracking-[0.2em] uppercase opacity-40 italic">
              {business.luxe_quote}
            </p>
          )}
        </div>
      </header>

      <main className="relative z-10 px-4 container mx-auto max-w-7xl pb-20 pt-16">
        {/* STORY (CONSERTO DO VAZAMENTO E QUEBRA DE LINHA) */}
        {hasDescription && (
          <section className="pb-24 md:pb-32 border-b border-black/5 flex flex-col items-center max-w-5xl mx-auto text-center">
            <span
              className={`text-[10px] uppercase tracking-[0.5em] font-bold block mb-8 ${theme.primary}`}
            >
              Editorial
            </span>
            <div className={`w-12 h-[1px] ${theme.bgAction} mb-12`} />
            <p className="text-2xl md:text-5xl font-light leading-tight italic opacity-90 whitespace-pre-line break-words w-full">
              {business.description}
            </p>
          </section>
        )}

        {/* FEATURES */}
        {hasFeatures && (
          <section className="py-24 border-b border-black/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {business.features.filter(Boolean).map((f: string, i: number) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-neutral-50/50 border border-black/5"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${theme.bgAction} text-white flex items-center justify-center shadow-lg`}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className="text-sm md:text-lg uppercase tracking-widest font-semibold">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GALERIA */}
        {hasGallery && (
          <section className="py-24 border-b border-black/5">
            <div className="text-center mb-16">
              <h3
                className={`text-4xl md:text-7xl font-serif italic mb-4 ${theme.primary}`}
              >
                Curadoria Visual
              </h3>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
                Portfolio
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ y: -10 }}
                  className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded-sm bg-neutral-100 shadow-md"
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-110"
                    alt="Galeria"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {hasFaqs && (
          <section className="py-24 border-b border-black/5 max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h3
                className={`text-4xl md:text-6xl font-serif italic mb-6 ${theme.primary}`}
              >
                Perguntas
              </h3>
              <div className={`w-12 h-[1px] ${theme.bgAction} mx-auto`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 items-start">
              {faqs.map((f: any, i: number) => (
                <LuxeAccordion
                  key={i}
                  q={f.q || f.question}
                  a={f.a || f.answer}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}

        {/* CONTATO (DOBRADINHA CARD + BOTÃO) */}
        <section className="pt-24">
          <div
            className={`p-8 md:p-24 ${theme.bgSecondary} border ${theme.border} rounded-[3rem] shadow-2xl grid md:grid-cols-2 gap-16 items-start`}
          >
            <div className="space-y-12">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">
                Atendimento Exclusivo
              </span>
              {hasPhone && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 mb-4">
                    Ligar para
                  </p>
                  <button
                    onClick={() => handleTrackLead("phone")}
                    className={`text-3xl md:text-5xl font-serif italic hover:opacity-70 transition-opacity underline decoration-1 underline-offset-[8px] ${theme.primary}`}
                  >
                    {formatPhoneNumber(business.phone)}
                  </button>
                </div>
              )}
              {hasWhatsapp && (
                <button
                  onClick={() => handleTrackLead("whatsapp")}
                  className="flex items-center gap-4 group"
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <MessageCircle size={24} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest opacity-40">
                      Direct Chat
                    </p>
                    <p className="text-xl font-bold uppercase tracking-widest">
                      Iniciar Conversa
                    </p>
                  </div>
                </button>
              )}
              {availableSocials.length > 0 && (
                <div className="flex gap-6 flex-wrap pt-8 border-t border-black/5">
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
                        className={`w-14 h-14 flex items-center justify-center rounded-full border ${theme.border} hover:bg-black/5 transition-all ${theme.primary}`}
                      >
                        {s === "instagram" ? (
                          <Instagram size={22} />
                        ) : s === "facebook" ? (
                          <Facebook size={22} />
                        ) : s === "tiktok" ? (
                          <TikTokIcon className="w-5 h-5" />
                        ) : (
                          <Globe size={22} />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`space-y-12 md:pl-16 border-t md:border-t-0 md:border-l ${theme.border} pt-12 md:pt-0`}
            >
              {hasAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                    Localização
                  </span>
                  <div className="flex gap-4">
                    <MapPin size={24} className={theme.primary} />
                    <div>
                      <p className="text-xl md:text-3xl font-light leading-snug group-hover:underline break-words">
                        {business.address}
                      </p>
                      <p className="text-sm opacity-60 mt-2 uppercase tracking-widest">
                        {business.city} — {business.state}
                      </p>
                    </div>
                  </div>
                </a>
              )}
              {hasHours && (
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 block mb-6">
                    Horários
                  </span>
                  <div className="space-y-4">
                    {realHours.map((h: any, i: number) => (
                      <div
                        key={i}
                        className={`flex justify-between font-light border-b border-dashed ${theme.border} pb-3 last:border-0`}
                      >
                        <span className="uppercase opacity-60 text-xs tracking-widest">
                          {h.day}
                        </span>
                        <span
                          className={`text-sm md:text-lg italic ${h.isClosed ? "text-rose-500" : ""}`}
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
        </section>

        <div className="w-full flex justify-center py-12 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>
        <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />
      </main>

      {/* WHATSAPP FLUTUANTE (z-30 para o Nav) */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: [1, 1.05, 1] }
          }
          transition={{ scale: { repeat: Infinity, duration: 2 } }}
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl z-30 ring-4 ring-white/20`}
        >
          <MessageCircle size={32} strokeWidth={1.5} fill="currentColor" />
        </motion.button>
      )}

      {/* LIGHTBOX (z-200) */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/98 backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white z-[210] hover:scale-110 transition-transform">
              <X size={40} strokeWidth={1} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white z-[220]"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white z-[220]"
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
                className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div
              className="h-40 w-full flex items-center justify-start md:justify-center gap-4 px-10 pb-10 overflow-x-auto no-scrollbar snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-28 rounded-sm overflow-hidden border transition-all snap-center ${selectedIndex === idx ? "border-white scale-110 opacity-100" : "border-transparent opacity-30"}`}
                >
                  <img
                    src={img}
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
