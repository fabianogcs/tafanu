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
  MessageCircle,
} from "lucide-react";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness";

// --- HELPERS ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5a6.5 6.5 0 0 1-11.41 4.28 6.5 6.5 0 0 1 4.41-10.74c.15-.02.3-.02.45-.02V16a2.5 2.5 0 1 0 2.5 2.5V0l.18.02Z" />
  </svg>
);

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
            key="content" // Chave única para o AnimatePresence não se perder
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }} // Garante que o conteúdo não "vaze" enquanto abre
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
  const [isFavoriting, setIsFavoriting] = useState(false);
  const footerTriggerRef = useRef<HTMLDivElement | null>(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["comercial_blue"];
  const safeAddress = fullAddress || business.address;
  const gallery = Array.isArray(business.gallery)
    ? business.gallery.filter(Boolean)
    : [];
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

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
      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Olá! Vi o perfil de ${business.name} no Tafanu.`)}`
          : `tel:${cleanNumber}`;
      try {
        if (type === "whatsapp")
          await (Actions as any).incrementWhatsappClicks?.(business.id);
        else await (Actions as any).incrementPhoneClicks?.(business.id);
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

  if (!theme) return null;

  return (
    <div
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden`}
    >
      {/* --- HEADER (LOGICA DE SHARE ATUALIZADA) --- */}
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

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {business.imageUrl && (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.2rem] border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 flex items-center justify-center">
                <img
                  src={business.imageUrl}
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
              <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter leading-none text-slate-900">
                {business.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* --- MENU TABS --- */}
      <div className="sticky top-4 z-40 px-4 my-8 md:my-12 flex justify-center">
        <div className="bg-slate-950/90 backdrop-blur-2xl p-1 md:p-2 rounded-full border border-white/10 shadow-2xl flex">
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-8 md:px-14 py-3 md:py-4 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="tab"
                  className={`absolute inset-0 ${theme.bgAction} rounded-full z-0 shadow-lg`}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 font-bold">
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
                <div className="flex flex-wrap gap-3 justify-center">
                  {business.features
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <div
                        key={i}
                        className={`px-5 py-3 rounded-2xl border ${theme.border} ${theme.cardBg} flex items-center gap-3 shadow-md`}
                      >
                        <CheckCircle2 size={14} className={theme.primary} />
                        <span className="text-[10px] md:text-xs font-black uppercase italic">
                          {f}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {gallery.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">
                      Vitrine
                    </h3>
                    <Camera size={16} className="opacity-20" />
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
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt="Galeria"
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
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
                  <div className="flex items-center gap-3 mb-6">
                    <HelpCircle size={20} className={theme.primary} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                      Dúvidas
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
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
                  {(hasWhatsapp || hasPhone || availableSocials.length > 0) && (
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
                                WhatsApp
                              </h4>
                              <p className="text-base md:text-xl font-black italic">
                                Conversar
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
                            // Lógica para transformar "usuario" em "link.com/usuario"
                            const username = business[s];
                            let finalUrl = "";

                            if (s === "instagram")
                              finalUrl = `https://instagram.com/${username}`;
                            else if (s === "facebook")
                              finalUrl = `https://facebook.com/${username}`;
                            else if (s === "tiktok")
                              finalUrl = `https://tiktok.com/@${username}`;
                            else finalUrl = formatExternalLink(username); // Para sites gerais/globais

                            return (
                              <motion.a
                                key={s}
                                href={finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
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
                    </div>
                  )}

                  {hasAddress && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${theme.cardBg} p-8 rounded-[2.5rem] border ${theme.border} flex items-center gap-5 shadow-md block hover:border-black/20 transition-all`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${theme.bgAction} flex items-center justify-center text-white shadow-sm`}
                      >
                        <MapPin size={22} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <h4 className="text-sm md:text-lg font-black uppercase italic truncate">
                          {business.address}
                        </h4>
                        <p className="text-[9px] font-bold opacity-40 uppercase">
                          {business.city}{" "}
                          {business.state ? `— ${business.state}` : ""} | CEP:{" "}
                          {business.cep}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex justify-center mt-20 mb-10 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>
        <div ref={footerTriggerRef} className="w-full h-4 bg-transparent" />
      </main>

      {/* WHATSAPP FLUTUANTE (AJUSTE DESKTOP) */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: 1 }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 w-14 h-14 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl z-50 border-4 border-white/20 hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle
            className="w-7 h-7 md:w-10 md:h-10"
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

              <motion.img
                key={selectedIndex}
                src={gallery[selectedIndex]}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 80) safeSetIndex(selectedIndex - 1);
                  else if (info.offset.x < -80) safeSetIndex(selectedIndex + 1);
                }}
                className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain shadow-2xl rounded-lg pointer-events-auto cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              />
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
