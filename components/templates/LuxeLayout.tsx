"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
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
  MessageCircle, // Adicionado para o ícone do WhatsApp
} from "lucide-react";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { useBusiness } from "@/lib/useBusiness"; // Importando sua lib
import { businessThemes } from "@/lib/themes";

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

  // Tenta formatar fixo também
  const matchFixo = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchFixo) return `(${matchFixo[1]}) ${matchFixo[2]}-${matchFixo[3]}`;

  return phone;
};

const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

// --- COMPONENTES DE EFEITO (MANTIDOS) ---

const TypewriterText = ({ text, delay = 0, className = "" }: any) => {
  const letters = Array.from(text);
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.05, delayChildren: delay },
        },
      }}
      className={`flex flex-wrap justify-center ${className}`}
    >
      {letters.map((letter: any, index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
          }}
          className="italic"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const LuxuryReveal = ({ text, theme }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
      className={`text-lg md:text-3xl font-light leading-relaxed ${theme.textColor} text-left md:text-justify`}
    >
      <span
        className={`text-6xl md:text-8xl float-left mr-4 mt-0 md:-mt-4 font-serif italic ${theme.primary} drop-shadow-sm`}
      >
        {text.charAt(0)}
      </span>
      {text.slice(1)}
    </motion.p>
  );
};

const FadeSection = ({ children, className }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className={`${className} overflow-hidden`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
};

const LuxeAccordion = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${theme.border} last:border-0`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left gap-4 group"
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
              className={`pb-10 text-base md:text-lg font-light opacity-80 leading-relaxed font-sans max-w-3xl ${theme.subTextColor}`}
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
  // --- USANDO O HOOK UNIFICADO (IGUAL AO COMERCIAL) ---
  const {
    business,
    realHours,
    isFavorite,
    setIsFavorite,
    hasWhatsapp,
    hasPhone, // Novo campo
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

  // Tema Fallback
  const theme =
    propTheme || businessThemes[business.theme] || businessThemes["editorial"]; // Fallback para editorial/luxe

  const safeAddress = fullAddress || business.address;
  const gallery = Array.isArray(business.gallery) ? business.gallery : [];

  // Lógica de Mídia Hero
  const hasMedia = business.videoUrl || business.heroImage;

  // Ref de Footer
  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  // Parallax Hero
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  // Safe Index para Galeria
  const safeSetIndex = useCallback(
    (next: number) => {
      if (gallery.length === 0 || selectedIndex === null) return;
      setSelectedIndex((next + gallery.length) % gallery.length);
    },
    [gallery.length, selectedIndex],
  );

  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? "hidden" : "unset";
  }, [selectedIndex]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeLightbox]);

  // --- LÓGICA DE RASTREAMENTO CORRIGIDA ---
  const handleTrackLead = useCallback(
    async (type: "whatsapp" | "phone") => {
      // Pega o número correto baseado no tipo
      const rawNumber =
        type === "whatsapp" ? business.whatsapp : business.phone;
      const cleanNumber = (rawNumber || "").replace(/\D/g, "");

      if (!cleanNumber) return;

      const targetUrl =
        type === "whatsapp"
          ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
              `Olá! Vi o perfil de ${business.name} no Tafanu.`,
            )}`
          : `tel:${cleanNumber}`;

      try {
        if (type === "whatsapp") {
          await (Actions as any).incrementWhatsappClicks?.(business.id);
        } else {
          await (Actions as any).incrementPhoneClicks?.(business.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        window.location.href = targetUrl;
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  if (!theme) return null;

  return (
    <div
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-serif pb-0 overflow-x-hidden transition-colors duration-1000`}
    >
      {/* --- HERO SECTION --- */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center z-0">
        {/* Camada de Mídia (Video/Foto ou Cor Sólida) */}
        <motion.div style={{ opacity, y }} className="absolute inset-0">
          {business.videoUrl ? (
            <>
              <video
                src={business.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </>
          ) : business.heroImage ? (
            <>
              <img
                src={business.heroImage}
                className="w-full h-full object-cover scale-105"
                alt="Capa"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </>
          ) : (
            <div
              className={`w-full h-full ${theme.bgPage} relative overflow-hidden transition-colors duration-1000`}
            />
          )}
        </motion.div>

        {/* --- LETRA DE FUNDO --- */}
        <motion.div
          style={{ opacity, y }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
        >
          <div
            className={`text-[25rem] md:text-[45rem] font-serif italic opacity-[0.08] ${hasMedia ? "text-white" : theme.primary} select-none blur-[2px]`}
          >
            {business.name ? business.name.charAt(0) : ""}
          </div>
        </motion.div>

        {/* BOTÕES DE AÇÃO HERO */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 flex gap-3 z-50">
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ url }).catch(() => {});
              } else if (navigator.clipboard?.writeText) {
                navigator.clipboard
                  .writeText(url)
                  .then(() =>
                    toast.success("Link copiado para a área de transferência!"),
                  );
              }
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <Share2 strokeWidth={1.5} size={18} />
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
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            {isFavoriting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart
                strokeWidth={1.5}
                size={18}
                className={
                  isFavorite ? "text-rose-500 fill-rose-500" : "text-black"
                }
              />
            )}
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <motion.div
          style={{ opacity, y }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto space-y-4 mt-10"
        >
          {/* LOGO */}
          {business.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mx-auto w-24 h-24 md:w-36 md:h-36 rounded-full border border-white/20 shadow-2xl overflow-hidden mb-8"
            >
              <img
                src={business.imageUrl}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className={`text-6xl md:text-9xl font-thin tracking-tighter italic leading-none drop-shadow-2xl ${hasMedia ? "text-white" : theme.primary} transition-colors duration-700`}
          >
            {business.name}
          </motion.h1>

          {business.luxe_quote && (
            <TypewriterText
              text={`"${business.luxe_quote}"`}
              delay={1}
              className={`text-lg md:text-3xl mt-6 font-light tracking-widest ${hasMedia ? "text-white/90" : theme.textColor} drop-shadow-md`}
            />
          )}
        </motion.div>

        {/* SCROLL INDICATOR */}
        <motion.div
          style={{ opacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 ${hasMedia ? "text-white/30" : theme.textColor} opacity-20`}
        >
          <div
            className={`w-[1px] h-24 bg-gradient-to-b from-transparent ${hasMedia ? "via-white" : "via-current"} to-transparent`}
          />
        </motion.div>
      </div>

      <main
        className={`relative z-10 ${theme.bgPage} rounded-t-[3rem] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] pt-24 px-4 container mx-auto max-w-7xl pb-10 transition-colors duration-1000`}
      >
        {/* STORY */}
        {hasDescription && (
          <FadeSection className={`pb-24 md:pb-32 border-b ${theme.border}`}>
            <div className="flex flex-col items-center max-w-5xl mx-auto">
              <div className="mb-12 flex flex-col items-center text-center">
                <span
                  className={`text-xs uppercase tracking-[0.5em] font-bold block mb-6 ${theme.primary} transition-colors duration-700`}
                >
                  Editorial
                </span>
                <div className={`w-20 h-[2px] ${theme.bgAction} shadow-sm`} />
              </div>
              <LuxuryReveal text={business.description} theme={theme} />
            </div>
          </FadeSection>
        )}

        {/* FEATURES */}
        {hasFeatures && (
          <FadeSection className={`py-24 border-b ${theme.border}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
              {business.features.map((f: string, i: number) => (
                <div
                  key={i}
                  className={`relative p-5 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center gap-5 h-full group transition-all duration-700 hover:border-white/40 shadow-2xl`}
                >
                  <div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-inner ${theme.bgAction}`}
                  >
                    <Check
                      size={14}
                      strokeWidth={3}
                      className="text-white relative z-10"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-1 ${theme.textColor}`}
                    >
                      Premium
                    </span>
                    <span
                      className={`text-xs md:text-sm uppercase tracking-[0.15em] font-semibold leading-tight ${theme.textColor}`}
                    >
                      {f}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FadeSection>
        )}

        {/* CURADORIA (GALERIA) */}
        {hasGallery && (
          <FadeSection className={`py-24 md:py-32 border-b ${theme.border}`}>
            <div className="text-center mb-24">
              <h3
                className={`text-5xl md:text-7xl font-serif italic mb-6 ${theme.primary}`}
              >
                Curadoria Visual
              </h3>
              <span
                className={`text-xs uppercase tracking-[0.4em] font-bold opacity-60 ${theme.textColor}`}
              >
                Portfolio
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  whileHover={{ y: -10 }}
                  className="relative aspect-[3/4] cursor-pointer group bg-neutral-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 rounded-sm"
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    alt="Galeria"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeSection>
        )}

        {/* FAQ */}
        {hasFaqs && (
          <FadeSection className="py-24 max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h3
                className={`text-5xl font-serif italic mb-6 ${theme.primary}`}
              >
                Perguntas & Respostas
              </h3>
              <div className={`w-12 h-[2px] ${theme.bgAction} mx-auto`} />
            </div>
            <div>
              {business.faqs.map((f: any, i: number) => (
                <LuxeAccordion key={i} q={f.q} a={f.a} theme={theme} />
              ))}
            </div>
          </FadeSection>
        )}

        {/* CONTATO (QI INTELIGENTE) */}
        {(hasWhatsapp ||
          hasPhone ||
          availableSocials.length > 0 ||
          hasAddress ||
          hasHours) && (
          <FadeSection className="pt-12 pb-32">
            <div
              className={`p-8 md:p-24 ${theme.bgSecondary} border ${theme.border} relative overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700`}
            >
              <div className="grid md:grid-cols-2 gap-16 md:gap-24 relative z-10 items-center">
                {/* COLUNA DA ESQUERDA: CONTATOS DIRETOS */}
                <div className="space-y-12">
                  <span
                    className={`text-xs uppercase tracking-[0.4em] font-bold block mb-8 opacity-60 ${theme.textColor}`}
                  >
                    Atendimento Exclusivo
                  </span>

                  {/* 1. SE TIVER TELEFONE (LIGAÇÃO) */}
                  {hasPhone && (
                    <div className="mb-6">
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ${theme.textColor}`}
                      >
                        Ligar para
                      </p>
                      <button
                        onClick={() => handleTrackLead("phone")}
                        className={`text-left text-3xl md:text-5xl font-serif italic hover:opacity-70 transition-opacity underline decoration-1 underline-offset-[8px] ${theme.primary}`}
                      >
                        {formatPhoneNumber(business.phone)}
                      </button>
                    </div>
                  )}

                  {/* 2. SE TIVER WHATSAPP (CHAT) */}
                  {hasWhatsapp && (
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ${theme.textColor}`}
                      >
                        Chat Online
                      </p>
                      <button
                        onClick={() => handleTrackLead("whatsapp")}
                        className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        <span
                          className={`w-12 h-12 rounded-full ${theme.bgAction} text-white flex items-center justify-center shadow-lg`}
                        >
                          <MessageCircle size={20} />
                        </span>
                        <span className={theme.textColor}>
                          Iniciar Conversa
                        </span>
                      </button>
                    </div>
                  )}

                  {availableSocials.length > 0 && (
                    <div className="flex gap-6 flex-wrap pt-8 border-t border-black/5">
                      {availableSocials.map((s) => (
                        <a
                          key={s}
                          href={formatExternalLink(business[s])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full border ${theme.border} hover:bg-white/10 hover:scale-110 transition-all ${theme.primary}`}
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
                      ))}
                    </div>
                  )}
                </div>

                {/* COLUNA DA DIREITA: ENDEREÇO E HORÁRIO */}
                <div
                  className={`space-y-12 md:pl-24 border-t md:border-t-0 md:border-l ${theme.border} pt-12 md:pt-0`}
                >
                  {hasAddress && (
                    <div className="group">
                      <span
                        className={`text-xs uppercase tracking-[0.4em] font-bold block mb-6 opacity-60 ${theme.textColor}`}
                      >
                        Localização
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-6"
                      >
                        <MapPin size={24} className={theme.primary} />
                        <div>
                          <p
                            className={`text-xl md:text-3xl font-light leading-snug group-hover:underline ${theme.textColor}`}
                          >
                            {business.address}
                          </p>
                          <p
                            className={`text-sm md:text-lg opacity-60 mt-2 ${theme.subTextColor}`}
                          >
                            {business.city}
                            {business.state ? `, ${business.state}` : ""}
                            {business.cep ? ` — CEP: ${business.cep}` : ""}
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                  {hasHours && (
                    <div>
                      <span
                        className={`text-xs uppercase tracking-[0.4em] font-bold block mb-6 opacity-60 ${theme.textColor}`}
                      >
                        Horários
                      </span>
                      <div className="space-y-4">
                        {realHours.map((h: any, i: number) => (
                          <div
                            key={i}
                            className={`flex justify-between text-base md:text-lg font-light border-b border-dashed ${theme.border} pb-3 last:border-0`}
                          >
                            <span
                              className={`uppercase opacity-70 text-sm ${theme.subTextColor}`}
                            >
                              {h.day}
                            </span>
                            <span
                              className={
                                h.isClosed
                                  ? "text-rose-500 font-medium italic"
                                  : theme.textColor
                              }
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
            </div>
          </FadeSection>
        )}

        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>

        <div ref={footerTriggerRef} className="w-full h-10 bg-transparent" />
      </main>

      {/* --- WHATSAPP CTA --- */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible
              ? { opacity: 0, y: 100, scale: 0.5 }
              : { opacity: 1, y: 0, scale: [1, 1.1, 1] }
          }
          transition={
            isFooterVisible
              ? { duration: 0.5 }
              : {
                  scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className={`fixed bottom-8 right-8 w-16 h-16 rounded-full ${theme.bgAction} text-white flex items-center justify-center shadow-2xl z-50 ring-4 ring-white/10`}
        >
          <MessageCircle strokeWidth={1.5} size={28} />
        </motion.button>
      )}

      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden backdrop-blur-3xl"
            onClick={closeLightbox}
          >
            <div className={`absolute inset-0 opacity-90 ${theme.bgPage}`} />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <button
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white z-[120]"
              onClick={closeLightbox}
            >
              <X size={28} strokeWidth={1} />
            </button>

            <div
              className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                src={
                  gallery[selectedIndex] ||
                  "https://placehold.co/600x800?text=Curadoria+Indisponível"
                }
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-[90%] max-h-full object-contain shadow-2xl rounded-sm cursor-default md:cursor-pointer"
              />
              <button
                onClick={() => safeSetIndex(selectedIndex - 1)}
                className="hidden md:flex absolute left-8 w-14 h-14 rounded-full bg-white/10 border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => safeSetIndex(selectedIndex + 1)}
                className="hidden md:flex absolute right-8 w-14 h-14 rounded-full bg-white/10 border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            <div
              className="relative w-full mt-10 px-0 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar py-2 px-10 md:px-0">
                {gallery.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative shrink-0 w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"}`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt="Thumb"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
