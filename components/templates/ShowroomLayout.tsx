"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Heart,
  Share2,
  Loader2,
  X,
  Instagram,
  Facebook,
  Globe,
  PhoneCall,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Camera,
  MessageCircle,
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";
import FavoriteButton from "@/components/FavoriteButton";

// --- HELPERS ---
const TikTokIcon = ({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={color || "currentColor"}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
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
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
};

const formatPhoneNumber = (phone: string) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
};

const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

const StickerTitle = ({ text, theme }: any) => (
  // Adicionei "mt-8" para descer e "mb-8" para dar espaço do conteúdo abaixo
  <div className="inline-flex items-center gap-2 mt-10 mb-8">
    <div className={`w-3 h-3 ${theme.bgAction}`} />
    <span
      // Mudei de "text-[10px]" para "text-sm" (que é 14px) para aumentar um pouco
      className={`text-sm font-black uppercase tracking-[0.2em] ${theme.subTextColor}`}
    >
      {text}
    </span>
  </div>
);

export default function ShowroomLayout({
  business: rawBusiness,
  theme: propTheme,
  realHours: rawHours,
  fullAddress,
  isLoggedIn, // ⬅️ Adicionado
  isFavorited, // ⬅️ Adicionado
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
    hasGallery,
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["showroom_clean"];
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
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-0 selection:bg-black selection:text-white transition-colors duration-700`}
    >
      {/* --- HEADER --- */}
      <header
        className={`relative pt-28 pb-10 w-full ${theme.bgPage} border-b border-black/10`}
      >
        {/* Pílula de Ações */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-0.5 md:gap-1 bg-white/90 backdrop-blur-md p-1 md:p-1.5 rounded-full border border-black/10 shadow-xl">
            {/* Botão de Compartilhar */}
            <button
              onClick={() => handleShare(business.name)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all text-slate-700"
            >
              <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>

            {/* Divisor */}
            <div className="w-[1px] h-3 md:h-4 bg-black/10 mx-0.5" />

            {/* O NOVO Botão de Favoritar (Entra aqui) */}
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
            />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          {business.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white"
            >
              <img
                src={business.imageUrl}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            </motion.div>
          )}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900"
            >
              {business.name}
            </motion.h1>
            {business.luxe_quote && (
              <p className="text-sm md:text-xl font-medium italic opacity-40">
                {business.luxe_quote}
              </p>
            )}
          </div>

          {/* REDES SOCIAIS INTELIGENTES */}
          {availableSocials.length > 0 && (
            <div className="flex flex-wrap gap-3">
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
                    className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all border border-black/5"
                  >
                    {s === "instagram" ? (
                      <Instagram size={20} color="#E1306C" />
                    ) : s === "facebook" ? (
                      <Facebook size={20} color="#1877F2" />
                    ) : s === "tiktok" ? (
                      <TikTokIcon className="w-5 h-5" color="#000" />
                    ) : (
                      <Globe size={20} color="#06b6d4" />
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-12 mt-8">
        {/* --- SOBRE (FIX DO VAZAMENTO E ENTERS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {hasDescription && (
            <section className="md:col-span-8 p-8 md:p-12 bg-white border border-black/5 shadow-sm rounded-3xl overflow-hidden">
              <StickerTitle text="Concept" theme={theme} />
              <p className="text-xl md:text-3xl font-light leading-snug whitespace-pre-line break-words w-full">
                {business.description}
              </p>
            </section>
          )}
          {hasFeatures && (
            <section className="md:col-span-4 p-8 md:p-12 bg-slate-50 border border-black/5 shadow-sm rounded-3xl">
              <StickerTitle text="Spec" theme={theme} />
              <ul className="space-y-4">
                {business.features
                  .filter(Boolean)
                  .map((f: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 font-bold uppercase text-xs md:text-sm tracking-widest opacity-70"
                    >
                      <div className={`w-2 h-2 ${theme.bgAction}`} /> {f}
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>

        {/* GALERIA MOSAICO */}
        {hasGallery && (
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Camera size={20} /> Showroom
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ scale: 0.99 }}
                  className={`relative overflow-hidden rounded-3xl cursor-pointer shadow-lg border border-black/5 group ${i === 0 ? "col-span-2 row-span-2" : ""} ${i === 3 ? "md:row-span-2" : ""}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Showroom"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={32} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ (COM FIX DE TEXTO) */}
        {hasFaqs && (
          <section className="space-y-6">
            <StickerTitle text="Perguntas Frequentes" theme={theme} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {faqs.map((f: any, i: number) => (
                <div
                  key={i}
                  className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-md transition-shadow overflow-hidden"
                >
                  <h4
                    className={`font-black uppercase text-sm mb-3 ${theme.primary} break-words`}
                  >
                    {f.q || f.question}
                  </h4>
                  <p className="text-sm opacity-60 leading-relaxed italic whitespace-pre-line break-words">
                    {f.a || f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTATOS (DOBRADINHA: CARD + BOTÃO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasPhone && (
            <button
              onClick={() => handleTrackLead("phone")}
              className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex flex-col justify-between h-64 group border-none"
            >
              <StickerTitle text="Call" theme={theme} />
              <div className="text-left">
                <p className="text-3xl font-black italic mb-2">
                  {formatPhoneNumber(business.phone)}
                </p>
                <p className="text-[10px] uppercase opacity-40 tracking-[0.3em]">
                  Toque para ligar
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${theme.bgAction} flex items-center justify-center self-end group-hover:scale-110 transition-transform`}
              >
                <PhoneCall size={20} />
              </div>
            </button>
          )}

          {hasWhatsapp && (
            <button
              onClick={() => handleTrackLead("whatsapp")}
              className="p-8 bg-[#25D366]/5 border border-[#25D366]/20 text-slate-900 rounded-[2.5rem] flex flex-col justify-between h-64 group hover:border-[#25D366] transition-all"
            >
              <StickerTitle text="Direct" theme={theme} />
              <div className="text-left">
                <p className="text-3xl font-black italic mb-2">WhatsApp</p>
                <p className="text-[10px] uppercase opacity-40 tracking-[0.3em]">
                  Chamar Agora
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center self-end group-hover:scale-110 transition-transform">
                <MessageCircle size={20} fill="currentColor" />
              </div>
            </button>
          )}

          {hasAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || business.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 bg-neutral-100 rounded-[2.5rem] flex flex-col justify-between h-64 group border border-black/5"
            >
              <StickerTitle text="Location" theme={theme} />
              <div className="text-left">
                <p className="text-xl font-black uppercase leading-tight mb-2 break-words">
                  {business.address}
                </p>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">
                  {business.city} — {business.state}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${theme.bgAction} text-white flex items-center justify-center self-end group-hover:scale-110 transition-transform`}
              >
                <MapPin size={20} />
              </div>
            </a>
          )}
        </div>

        {hasHours && (
          <div
            className={`max-w-xl mx-auto w-full p-8 bg-white border border-black/5 rounded-[2.5rem] shadow-sm`}
          >
            <StickerTitle text="Hours" theme={theme} />
            <div className="space-y-3">
              {safeHours.map((h: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs font-bold uppercase tracking-tight pb-2 border-b border-black/5 last:border-0"
                >
                  <span className="opacity-40">{h.day}</span>
                  <span className={h.isClosed ? "text-rose-500" : ""}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full flex justify-center py-12 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>
        <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />
      </main>

      {/* WHATSAPP FLUTUANTE (Z-INDEX 30) */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: 1 }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 z-30 w-14 h-14 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-4 border-white/20 hover:bg-emerald-600 transition-colors`}
        >
          <MessageCircle
            className="w-8 h-8 md:w-10 md:h-10"
            fill="currentColor"
          />
        </motion.button>
      )}

      {/* LIGHTBOX (Z-INDEX 200) */}
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
              <X size={32} />
            </button>
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex - 1);
                }}
                className="hidden md:flex absolute left-8 w-16 h-16 items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeSetIndex(selectedIndex + 1);
                }}
                className="hidden md:flex absolute right-8 w-16 h-16 items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220]"
              >
                <ChevronRight size={32} />
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
                className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-2xl cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              />
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
