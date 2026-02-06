"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const formatPhoneNumber = (phone: string) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;

  // Tenta formatar fixo também (10 dígitos)
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
      className={`mb-3 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} overflow-hidden transition-all duration-300 ${isOpen ? "ring-1" : ""}`}
      style={{ ringColor: isOpen ? "currentColor" : "transparent" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex justify-between items-center text-left gap-4 select-none outline-none group border-none bg-transparent"
      >
        <span
          className={`text-xs md:text-sm font-black uppercase tracking-tight ${isOpen ? theme.primary : "opacity-80"}`}
        >
          {q}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? `${theme.bgAction} rotate-45 text-white shadow-md` : `${theme.bgSecondary} ${theme.primary}`}`}
        >
          <Plus size={16} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p className="px-6 pb-6 text-xs md:text-sm font-medium leading-relaxed opacity-60 italic border-t border-black/5 pt-4">
              {a}
            </p>
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
    hasWhatsapp, // true se tiver whatsapp
    hasPhone, // true se tiver telefone (Adicionado na sua lib useBusiness)
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
  const gallery = Array.isArray(business.gallery) ? business.gallery : [];

  const safeSetIndex = useCallback(
    (next: number) => {
      if (gallery.length === 0 || selectedIndex === null) return;
      setSelectedIndex((next + gallery.length) % gallery.length);
    },
    [gallery.length, selectedIndex],
  );

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  // --- CORREÇÃO AQUI: Lógica de rastreamento separada ---
  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      // Se for whatsapp usa business.whatsapp, se for phone usa business.phone
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
        console.error(e);
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
      {/* --- HEADER --- */}
      <header className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden bg-slate-900 shadow-xl">
        <div className="absolute inset-0">
          {business.videoUrl ? (
            <video
              src={business.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-60"
            />
          ) : business.heroImage ? (
            <img
              src={business.heroImage}
              className="w-full h-full object-cover opacity-60"
              alt="Capa"
            />
          ) : (
            <div className={`w-full h-full ${theme.bgPage}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="absolute top-6 right-6 flex gap-3 z-20">
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ url });
              } else if (navigator.clipboard?.writeText) {
                navigator.clipboard
                  .writeText(url)
                  .then(() => alert("Link copiado!"));
              }
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
          >
            <Share2 size={18} strokeWidth={2} />
          </button>
          <button
            onClick={async () => {
              if (isFavoriting) return;
              setIsFavoriting(true);
              try {
                await (Actions as any).toggleFavorite(business.id);
                setIsFavorite(!isFavorite);
              } catch (err) {
                console.error(err);
              } finally {
                setIsFavoriting(false);
              }
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-90 transition-transform"
          >
            {isFavoriting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart
                size={18}
                fill={isFavorite ? "#f43f5e" : "none"}
                className={isFavorite ? "text-rose-500" : "text-black"}
              />
            )}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            {business.imageUrl && (
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 z-10 flex items-center justify-center">
                <img
                  src={business.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              </div>
            )}
            <div className="space-y-1">
              {business.comercial_badge && (
                <span
                  className={`${theme.bgAction} px-3 py-1.5 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-md inline-block`}
                >
                  {business.comercial_badge}
                </span>
              )}
              <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-lg">
                {business.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* --- MENU TABS --- */}
      <div className="sticky top-4 z-40 px-4 my-6 md:my-10 flex justify-center">
        <div className="bg-slate-950/90 backdrop-blur-2xl p-1 md:p-2 rounded-full border border-white/10 shadow-2xl flex">
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-8 md:px-14 py-3 md:py-4 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "text-white" : "text-slate-500"}`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="tab"
                  className={`absolute inset-0 ${theme.bgAction} rounded-full z-0 shadow-lg`}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 md:gap-3 font-bold">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {hasDescription && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-14 pr-8 md:pr-24 relative overflow-hidden shadow-xl`}
                >
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div
                      className={`w-11 h-11 rounded-xl ${theme.bgSecondary} flex items-center justify-center shadow-inner`}
                    >
                      <Quote size={22} className={theme.primary} />
                    </div>
                    <div>
                      <h3
                        className={`text-sm md:text-xl font-black uppercase italic ${theme.textColor}`}
                      >
                        Sobre Nós
                      </h3>
                      <div
                        className={`h-1 w-12 ${theme.bgAction} mt-0.5 rounded-full`}
                      />
                    </div>
                  </div>
                  <p className="text-xl md:text-3xl font-normal leading-relaxed opacity-90 break-words whitespace-pre-line relative z-10">
                    {business.description}
                  </p>
                </section>
              )}

              {hasFeatures && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {business.features.map((f: string, i: number) => (
                    <div
                      key={i}
                      className={`px-6 py-3.5 rounded-2xl border ${theme.border} ${theme.cardBg} flex items-center gap-3 shadow-md`}
                    >
                      <CheckCircle2 size={16} className={theme.primary} />
                      <span className="text-[10px] md:text-xs font-black uppercase italic">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {hasGallery && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">
                      Nossa Vitrine
                    </h3>
                    <Camera size={16} className="opacity-20" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {gallery.map((img: string, i: number) => (
                      <motion.div
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="relative aspect-square rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg group border border-black/5"
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt="Galeria"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white" size={24} />
                        </div>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {hasFaqs && (
                <section className="w-full">
                  <div className="flex items-center gap-3 px-2 mb-6">
                    <HelpCircle size={20} className={theme.primary} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                      Dúvidas Frequentes
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
                    {business.faqs.map((f: any, i: number) => (
                      <AccordionItem key={i} q={f.q} a={f.a} theme={theme} />
                    ))}
                  </div>
                </section>
              )}

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                {hasHours && (
                  <div
                    className={`${theme.cardBg} p-8 md:p-12 rounded-[2.5rem] border ${theme.border} shadow-xl flex flex-col`}
                  >
                    <div className="flex items-center gap-2 mb-8 opacity-30">
                      <Clock size={16} /> Funcionamento
                    </div>
                    <div className="space-y-4 flex-grow">
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
                  className={`flex flex-col gap-5 ${!hasHours ? "md:col-span-2 max-w-2xl mx-auto w-full" : ""}`}
                >
                  {/* AJUSTE: Seção de Contato com Telefone e WhatsApp separados */}
                  {(hasWhatsapp || hasPhone || availableSocials.length > 0) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl flex flex-col gap-6`}
                    >
                      {/* BOTÃO DE LIGAR (Se tiver telefone) */}
                      {hasPhone && (
                        <button
                          onClick={() => handleTrackLead("phone")}
                          className="w-full flex items-center justify-between group outline-none border-none bg-transparent"
                        >
                          <div className="flex items-center gap-5">
                            <div
                              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-md group-hover:scale-110 transition-transform`}
                            >
                              <PhoneCall size={24} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">
                                Ligar Agora
                              </h4>
                              <p className="text-base md:text-xl font-black italic">
                                {/* CORREÇÃO AQUI: Mostrando o business.phone */}
                                {formatPhoneNumber(business.phone)}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={24}
                            className={`opacity-20 group-hover:translate-x-2 transition-transform ${theme.primary}`}
                          />
                        </button>
                      )}

                      {/* BOTÃO DE WHATSAPP (Se tiver zap) */}
                      {hasWhatsapp && (
                        <button
                          onClick={() => handleTrackLead("whatsapp")}
                          className="w-full flex items-center justify-between group outline-none border-none bg-transparent"
                        >
                          <div className="flex items-center gap-5">
                            <div
                              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                            >
                              <MessageCircle size={24} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">
                                WhatsApp
                              </h4>
                              <p className="text-base md:text-xl font-black italic">
                                Conversar no Chat
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={24}
                            className="opacity-20 group-hover:translate-x-2 transition-transform text-emerald-500"
                          />
                        </button>
                      )}

                      {availableSocials.length > 0 && (
                        <div
                          className={`flex items-center justify-center gap-6 pt-6 border-t border-black/5`}
                        >
                          {availableSocials.map((s) => (
                            <motion.a
                              key={s}
                              href={formatExternalLink(business[s])}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.2, y: -3 }}
                              className="w-12 h-12 flex items-center justify-center"
                            >
                              {s === "instagram" ? (
                                <Instagram size={28} color="#E1306C" />
                              ) : s === "facebook" ? (
                                <Facebook size={28} color="#1877F2" />
                              ) : s === "tiktok" ? (
                                <TikTokIcon className="w-7 h-7 text-[#FE2C55]" />
                              ) : (
                                <Globe size={28} color="#06b6d4" />
                              )}
                            </motion.a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {hasAddress && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${theme.cardBg} p-8 rounded-[2.5rem] border ${theme.border} flex items-center gap-5 shadow-lg hover:scale-[1.01] transition-transform block`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl ${theme.bgAction} flex items-center justify-center text-white shadow-md`}
                      >
                        <MapPin size={24} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <h4 className="text-sm md:text-lg font-black uppercase italic truncate">
                          {business.address}
                        </h4>
                        <p className="text-[9px] font-bold opacity-40 uppercase">
                          {business.city}{" "}
                          {business.state ? `— ${business.state}` : ""}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex justify-center mt-20 mb-10">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>
        <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />
      </main>

      {/* --- WHATSAPP CTA FLUTUANTE --- */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, y: 100 }
              : { opacity: 1, y: 0, scale: [1, 1.1, 1] }
          }
          transition={
            isFooterVisible
              ? { duration: 0.3 }
              : {
                  scale: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  },
                }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-8 right-6 w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl z-50 border-4 border-white/20"
        >
          <MessageCircle size={28} fill="currentColor" />
        </motion.button>
      )}

      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-3xl"
            onClick={closeLightbox}
          >
            <div className={`absolute inset-0 opacity-90 ${theme.bgPage}`} />
            <button
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white z-[120]"
              onClick={closeLightbox}
            >
              <X size={44} strokeWidth={1} />
            </button>
            <div
              className="relative w-full h-[60vh] md:h-[65vh] flex items-center justify-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                src={
                  gallery[selectedIndex] ||
                  "https://placehold.co/600x400?text=Imagem"
                }
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-[90%] max-h-full object-contain shadow-2xl rounded-sm"
              />
              <button
                onClick={() => safeSetIndex(selectedIndex - 1)}
                className="hidden md:flex absolute left-8 w-14 h-14 rounded-full bg-white/10 border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={() => safeSetIndex(selectedIndex + 1)}
                className="hidden md:flex absolute right-8 w-14 h-14 rounded-full bg-white/10 border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={40} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
