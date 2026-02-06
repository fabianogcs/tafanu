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
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowUpRight,
  MessageCircle, // Ícone do WhatsApp
} from "lucide-react";
import * as Actions from "@/app/actions";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness"; // Importando a lib

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

const formatPhoneNumber = (phone: string) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;

  // Formata fixo
  const matchFixo = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchFixo) return `(${matchFixo[1]}) ${matchFixo[2]}-${matchFixo[3]}`;

  return phone;
};

const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

// --- COMPONENTES VISUAIS ÚNICOS DO SHOWROOM ---

const ShowroomCard = ({ children, className, theme, onClick }: any) => (
  <motion.div
    layout
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`relative overflow-hidden bg-white/5 backdrop-blur-sm border ${theme.border} hover:border-opacity-100 transition-colors duration-500 ${className}`}
  >
    {children}
  </motion.div>
);

const StickerTitle = ({ text, theme }: any) => (
  <div className="inline-flex items-center gap-2 mb-4">
    <div className={`w-2 h-2 ${theme.bgAction}`} />
    <span
      className={`text-xs font-bold uppercase tracking-widest ${theme.subTextColor}`}
    >
      {text}
    </span>
  </div>
);

const SocialButton = ({ type, url }: { type: string; url: string }) => {
  let icon = <Globe size={20} className="text-slate-600" />;
  let label = "Website";

  if (type === "instagram") {
    icon = <Instagram size={20} color="#E1306C" />;
    label = "Instagram";
  } else if (type === "facebook") {
    icon = <Facebook size={20} color="#1877F2" />;
    label = "Facebook";
  } else if (type === "tiktok") {
    icon = <TikTokIcon className="w-5 h-5" color="#000000" />;
    label = "TikTok";
  }

  return (
    <a
      href={formatExternalLink(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 group"
      title={label}
    >
      {icon}
    </a>
  );
};

export default function ShowroomLayout({
  business: rawBusiness,
  theme: propTheme,
  realHours: rawHours,
  fullAddress,
}: any) {
  // --- USANDO O HOOK UNIFICADO ---
  const {
    business,
    realHours: safeHours,
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

  // Tema Fallback
  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["showroom_clean"];

  // --- LÓGICA DE CLICK & DRAG DA GALERIA ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- CONFIGURAÇÃO DO GRID ---
  const gallery = business.gallery || [];

  // Ajuste de colunas
  const descriptionSpan = hasFeatures ? "md:col-span-8" : "md:col-span-12";
  const featuresSpan = hasDescription ? "md:col-span-4" : "md:col-span-12";

  // Define se exibe o card de contato (Se tiver telefone OU whats)
  const showContactCard = hasPhone || hasWhatsapp;

  const activeInfoBlocks = [showContactCard, hasHours, hasAddress].filter(
    Boolean,
  ).length;

  const infoGridClass =
    activeInfoBlocks === 3
      ? "md:col-span-4"
      : activeInfoBlocks === 2
        ? "md:col-span-6"
        : "md:col-span-6 md:col-start-4";

  const safeAddress = fullAddress || business.address;
  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

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
      // Pega o número correto
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
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-0 selection:bg-black selection:text-white transition-colors duration-700`}
    >
      {/* --- HERO SHOWROOM --- */}
      <header className="relative h-[85vh] md:h-[90vh] w-full flex flex-col justify-between p-4 md:p-6 border-b border-black/10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {business.videoUrl ? (
            <video
              src={business.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-90 grayscale-[20%]"
            />
          ) : business.heroImage ? (
            <img
              src={business.heroImage}
              className="w-full h-full object-cover opacity-90 grayscale-[20%]"
              alt="Capa"
            />
          ) : (
            <div className={`w-full h-full ${theme.bgSecondary}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
        </div>

        {/* Top Bar (Share e Favorite) */}
        <div className="relative z-10 flex justify-end items-start w-full">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copiado!");
                }
              }}
              className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-lg rounded-full"
            >
              <Share2 size={18} />
            </button>
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
              className={`w-10 h-10 flex items-center justify-center transition-colors shadow-lg rounded-full ${isFavorite ? "bg-rose-500 text-white" : "bg-white text-black"}`}
            >
              {isFavoriting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="relative z-10 flex flex-col justify-end pb-28 md:pb-0">
          {business.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-white/30 shadow-2xl overflow-hidden"
            >
              <img
                src={business.imageUrl}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            </motion.div>
          )}

          {business.luxe_quote && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 max-w-2xl"
            >
              <p className="text-white/80 font-medium italic text-sm md:text-xl tracking-wide leading-relaxed">
                "{business.luxe_quote}"
              </p>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-4 md:mb-6 mix-blend-overlay"
          >
            {business.name || "Showroom"}
          </motion.h1>

          {/* Redes Sociais */}
          {availableSocials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 items-center"
            >
              {availableSocials.map((s) => (
                <SocialButton key={s} type={s} url={business[s]} />
              ))}
            </motion.div>
          )}
        </div>
      </header>

      {/* --- GRID INTELIGENTE (MAIN CONTENT) --- */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min">
          {/* 1. DESCRIÇÃO */}
          {hasDescription && (
            <ShowroomCard
              className={`${descriptionSpan} p-6 md:p-10 bg-white`}
              theme={theme}
            >
              <StickerTitle text="Conceito" theme={theme} />
              <p
                className={`text-lg md:text-2xl font-light leading-relaxed ${theme.textColor} whitespace-pre-line`}
              >
                {business.description}
              </p>
            </ShowroomCard>
          )}

          {/* 2. FEATURES */}
          {hasFeatures && (
            <ShowroomCard
              className={`${featuresSpan} p-6 md:p-10 bg-neutral-50`}
              theme={theme}
            >
              <StickerTitle text="Destaques" theme={theme} />
              <ul className="space-y-4">
                {business.features.map((f: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border-b border-black/5 pb-3 last:border-0"
                  >
                    <div
                      className={`mt-1 w-1.5 h-1.5 rounded-full ${theme.bgAction}`}
                    />
                    <span
                      className={`text-sm md:text-base font-medium uppercase tracking-wide ${theme.textColor}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </ShowroomCard>
          )}

          {/* 3. GALERIA */}
          {hasGallery && (
            <div className="md:col-span-12 py-10 overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3
                  className={`text-xl font-black uppercase ${theme.textColor}`}
                >
                  Galeria
                </h3>
                <span className="text-xs opacity-50 uppercase tracking-widest">
                  Arraste para navegar
                </span>
              </div>

              <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className="flex gap-4 overflow-x-auto pb-8 -mb-8 px-2 cursor-grab active:cursor-grabbing no-scrollbar"
              >
                {gallery.map((img: string, i: number) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => {
                      if (!isDragging) setSelectedIndex(i);
                    }}
                    className="relative shrink-0 w-[280px] md:w-[400px] aspect-[4/5] bg-neutral-200 select-none group cursor-pointer"
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover pointer-events-none"
                      alt="Galeria"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-white text-black p-3 rounded-full shadow-lg transition-all transform scale-90 group-hover:scale-100">
                        <Maximize2 size={24} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 4. FAQ */}
          {hasFaqs && (
            <div className="md:col-span-12 mt-4 mb-8">
              <StickerTitle text="Q&A" theme={theme} />
              <div className="grid md:grid-cols-2 gap-4">
                {business.faqs.map((f: any, i: number) => (
                  <div
                    key={i}
                    className={`p-6 border ${theme.border} bg-white hover:shadow-md transition-shadow`}
                  >
                    <h4
                      className={`font-bold uppercase text-sm mb-2 ${theme.primary}`}
                    >
                      {f.q}
                    </h4>
                    <p className="text-sm opacity-70 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. BLOCO DE INFORMAÇÕES */}

          {/* 5.1 CARD DE CONTATO (Inteligente: Mostra Ligar ou Whats) */}
          {showContactCard && (
            <ShowroomCard
              className={`${infoGridClass} p-8 ${theme.bgSecondary} flex flex-col justify-between group cursor-pointer`}
              theme={theme}
              // Se tiver telefone, clica e liga. Se só tiver whats, clica e abre whats.
              onClick={() => handleTrackLead(hasPhone ? "phone" : "whatsapp")}
            >
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={theme.primary} size={24} />
              </div>
              <div>
                <StickerTitle text="Contato" theme={theme} />
                <div
                  className={`text-2xl md:text-4xl font-black italic ${theme.textColor} mb-2`}
                >
                  {/* Mostra o número de telefone se tiver, senão o do zap */}
                  {formatPhoneNumber(business.phone || business.whatsapp)}
                </div>
                <p
                  className={`text-xs uppercase opacity-50 tracking-widest ${theme.subTextColor}`}
                >
                  {hasPhone ? "Toque para Ligar" : "Chamar no WhatsApp"}
                </p>
              </div>
              <div
                className={`mt-8 w-12 h-12 rounded-full ${theme.bgAction} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                {/* Ícone muda dependendo da prioridade */}
                {hasPhone ? <Phone size={20} /> : <MessageSquare size={20} />}
              </div>
            </ShowroomCard>
          )}

          {/* 5.2 CARD DE HORÁRIO */}
          {hasHours && (
            <ShowroomCard
              className={`${infoGridClass} p-8 ${theme.bgSecondary}`}
              theme={theme}
            >
              <StickerTitle text="Horários" theme={theme} />
              <div className="space-y-3">
                {safeHours.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm md:text-base"
                  >
                    <span className="opacity-50 uppercase font-bold">
                      {h.day}
                    </span>
                    <span
                      className={
                        h.isClosed ? "text-rose-500 font-bold" : "font-medium"
                      }
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </ShowroomCard>
          )}

          {/* 5.3 CARD DE ENDEREÇO */}
          {hasAddress && (
            <ShowroomCard
              className={`${infoGridClass} p-0 relative group`}
              theme={theme}
            >
              <a
                href={
                  safeAddress
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full min-h-[300px] relative"
              >
                <div
                  className={`absolute inset-0 ${theme.bgAction} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div
                    className={`w-16 h-16 ${theme.bgAction} text-white flex items-center justify-center rounded-full mb-4 shadow-xl group-hover:scale-110 transition-transform`}
                  >
                    <MapPin size={32} />
                  </div>
                  <h4
                    className={`text-xl font-bold uppercase ${theme.textColor} underline decoration-transparent group-hover:decoration-current transition-all`}
                  >
                    Abrir Mapa
                  </h4>
                  <p className="mt-2 opacity-60 text-sm max-w-[200px]">
                    {business.address || "Endereço sob consulta"}
                  </p>
                  <p className="opacity-40 text-xs mt-1">
                    {business.city || ""}
                    {business.state ? ` - ${business.state}` : ""}
                  </p>
                </div>
              </a>
            </ShowroomCard>
          )}
        </div>

        {/* --- RODAPÉ COM REPORT --- */}
        <div
          ref={footerTriggerRef}
          className="w-full flex flex-col items-center py-12 mt-12 gap-6 border-t border-black/5"
        >
          <div className="opacity-40 hover:opacity-100 transition-opacity">
            <ReportModal businessSlug={business.slug} />
          </div>
        </div>
      </main>

      {/* --- WHATSAPP CTA FLUTUANTE --- */}
      {hasWhatsapp && (
        <motion.button
          animate={
            isFooterVisible ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }
          }
          className={`fixed bottom-6 right-6 w-16 h-16 ${theme.bgAction} text-white flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all z-50 border-2 border-black`}
          onClick={() => handleTrackLead("whatsapp")}
        >
          <MessageCircle size={28} strokeWidth={2} />
        </motion.button>
      )}

      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] ${theme.bgPage} flex flex-col items-center justify-center`}
            onClick={closeLightbox}
          >
            <button
              className={`absolute top-6 right-6 opacity-60 hover:opacity-100 transition-opacity ${theme.textColor}`}
            >
              <X size={32} />
            </button>

            <div
              className="relative w-full h-[70vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                src={
                  gallery[selectedIndex] ||
                  "https://placehold.co/1200x800?text=Imagem+Indisponível"
                }
                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                alt="Zoom"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    setSelectedIndex((selectedIndex + 1) % gallery.length);
                  } else if (swipe > 50) {
                    setSelectedIndex(
                      (selectedIndex - 1 + gallery.length) % gallery.length,
                    );
                  }
                }}
              />

              <div className="absolute inset-y-0 left-0 hidden md:flex items-center pl-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(
                      (selectedIndex - 1 + gallery.length) % gallery.length,
                    );
                  }}
                  className={`p-3 rounded-full border ${theme.border} ${theme.bgSecondary} hover:brightness-95 transition-all shadow-lg`}
                >
                  <ChevronLeft className={theme.textColor} />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 hidden md:flex items-center pr-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((selectedIndex + 1) % gallery.length);
                  }}
                  className={`p-3 rounded-full border ${theme.border} ${theme.bgSecondary} hover:brightness-95 transition-all shadow-lg`}
                >
                  <ChevronRight className={theme.textColor} />
                </button>
              </div>
            </div>

            <div
              className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-12 h-12 border-2 ${selectedIndex === idx ? theme.border : "border-transparent opacity-30"} transition-all`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
