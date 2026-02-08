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
} from "lucide-react";
import * as Actions from "@/app/actions";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { businessThemes } from "@/lib/themes";
import { useBusiness } from "@/lib/useBusiness"; // Importando a lib centralizada

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
}: any) {
  // --- USANDO O HOOK UNIFICADO ---
  const {
    business,
    realHours,
    isFavorite,
    setIsFavorite,
    hasWhatsapp,
    hasPhone, // Novo campo para telefone
    hasFaqs,
    hasFeatures,
    hasHours,
    hasAddress,
    hasGallery,
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [selectedImg, setSelectedImg] = useState<number | null>(null);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const footerTriggerRef = useRef(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  // --- CORREÇÃO DE SEGURANÇA DO TEMA ---
  const theme =
    propTheme || businessThemes[business.theme] || businessThemes["urban_gold"];

  const safeAddress = fullAddress || business.address;
  const gallery = Array.isArray(business.gallery) ? business.gallery : [];
  const hasTag = business.urban_tag && business.urban_tag.trim() !== "";

  // --- LÓGICA DE LEADS CORRIGIDA ---
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

  // Trava de Scroll no Lightbox
  useEffect(() => {
    document.body.style.overflow = selectedImg !== null ? "hidden" : "unset";
  }, [selectedImg]);

  if (!theme)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando Estilo...
      </div>
    );

  return (
    <div
      className={`min-h-screen ${theme.textColor} font-sans relative bg-black w-full overflow-x-hidden selection:bg-white selection:text-black`}
    >
      <div className="fixed inset-0 pointer-events-none z-[10] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* --- BOTÕES DE AÇÃO URBAN (TOP RIGHT - ABAIXO DA NAV GLOBAL) --- */}
      <div className="fixed top-28 right-6 z-[100] flex flex-col gap-3">
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
          className={`w-12 h-12 flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_rgba(255,255,255,0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${isFavorite ? "bg-white text-black" : "bg-black text-white"}`}
        >
          {isFavoriting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          )}
        </button>
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ url }).catch(() => {});
            } else {
              navigator.clipboard.writeText(url);
              toast.success("Link copiado para a área de transferência!");
            }
          }}
          className="..."
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden w-full px-4">
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <div className="absolute inset-0 w-full h-full grayscale contrast-150 opacity-50">
            {business.videoUrl ? (
              <video
                src={business.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : business.heroImage ? (
              <img
                src={business.heroImage}
                className="w-full h-full object-cover"
                alt="Hero"
              />
            ) : null}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto text-center">
          {/* LOGO COLORIDO CENTRALIZADO */}
          {business.imageUrl && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden mb-6"
            >
              <img
                src={business.imageUrl}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-urban-raw font-black uppercase italic leading-[0.85] tracking-tighter text-white"
          >
            {business.name || "NEGÓCIO_SEM_NOME"}
          </motion.h1>
        </div>

        {hasTag && (
          <div className="absolute bottom-10 left-0 w-full overflow-hidden bg-white/5 backdrop-blur-sm py-4 border-y border-white/10">
            <div className="inline-block animate-marquee whitespace-nowrap">
              {Array(8)
                .fill(null)
                .map((_, i) => (
                  <span
                    key={i}
                    className={`text-4xl md:text-6xl font-black uppercase italic mx-12 opacity-80 tracking-tighter ${theme.primary}`}
                  >
                    {business.urban_tag}
                  </span>
                ))}
            </div>
          </div>
        )}
      </section>

      <main className="container mx-auto px-4 md:px-6 relative z-30 space-y-20 md:space-y-32 pb-24">
        {/* SOBRE (CARD INTELIGENTE) */}
        {hasDescription && (
          <section className="relative w-full max-w-5xl mx-auto -mt-10">
            <div className="bg-zinc-900 border border-white/10 p-8 md:p-16 shadow-2xl">
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 border-b-4 border-current pb-4">
                SOBRE_
              </h2>
              <p className="text-xl md:text-3xl font-bold uppercase tracking-tight text-white/90 leading-tight whitespace-pre-line">
                {business.description}
              </p>
            </div>
          </section>
        )}

        {/* DESTAQUES */}
        {hasFeatures && (
          <section className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {business.features.map((f: string, i: number) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-white/5 p-10 flex flex-col items-center text-center group hover:bg-white hover:text-black transition-all duration-500"
                >
                  <Terminal
                    size={24}
                    className={`${theme.primary} group-hover:text-black mb-6`}
                  />
                  <h3 className="font-black text-xl md:text-2xl uppercase italic leading-none">
                    {f}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GALERIA (COM EFEITO P&B NO HOVER) */}
        {hasGallery && (
          <section className="space-y-10">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter italic">
              VITRINE_
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {gallery.map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className="aspect-square bg-zinc-900 overflow-hidden cursor-crosshair group relative border border-white/5"
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    alt="Gallery"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus size={40} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTATO & HORÁRIOS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. CARD TELEFONE (Se existir telefone) */}
              {hasPhone && (
                <div
                  onClick={() => handleTrackLead("phone")}
                  className={`bg-zinc-900 border-2 border-white/10 p-8 cursor-pointer hover:border-white hover:bg-white hover:text-black transition-all group`}
                >
                  <span className="text-[10px] font-black uppercase opacity-40 mb-4 block tracking-[0.2em]">
                    CHAMADA_VOZ
                  </span>
                  <div className="mb-2">
                    <Phone size={32} className="mb-4" />
                  </div>
                  <p className="text-xl md:text-3xl font-black italic uppercase leading-none break-all">
                    {formatPhoneNumber(business.phone)}
                  </p>
                </div>
              )}

              {/* 2. CARD WHATSAPP (Se existir whatsapp - estilo botão grande no grid) */}
              {hasWhatsapp && (
                <div
                  onClick={() => handleTrackLead("whatsapp")}
                  className={`bg-zinc-900 border-2 border-white/10 p-8 cursor-pointer hover:border-[#25D366] hover:text-[#25D366] transition-all group`}
                >
                  <span className="text-[10px] font-black uppercase opacity-40 mb-4 block tracking-[0.2em]">
                    CHAT_ONLINE
                  </span>
                  <div className="mb-2">
                    <MessageCircle size={32} className="mb-4" />
                  </div>
                  <p className="text-xl md:text-3xl font-black italic uppercase leading-none">
                    INICIAR CONVERSA
                  </p>
                </div>
              )}

              {/* 3. CARD LOCALIZAÇÃO */}
              {hasAddress && (
                <a
                  href={
                    safeAddress
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-900 border-2 border-white/10 p-8 hover:bg-white hover:text-black transition-all group md:col-span-2"
                >
                  <span className="text-[10px] font-black uppercase opacity-40 mb-4 block tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} /> LOCALIZAÇÃO_
                  </span>
                  <p className="text-sm md:text-lg font-black uppercase leading-tight italic">
                    {business.address || "LOCAL_NÃO_INFORMADO"}
                  </p>
                  <p className="text-xs opacity-60 mt-1 uppercase">
                    {business.city}{" "}
                    {business.state ? `- ${business.state}` : ""}{" "}
                    {business.cep ? `| CEP: ${business.cep}` : ""}
                  </p>
                </a>
              )}
            </div>

            {/* 4. REDES SOCIAIS */}
            {availableSocials.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {availableSocials.map((s) => (
                  <a
                    key={s}
                    href={formatExternalLink(business[s])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
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

          {/* 5. HORÁRIOS */}
          {hasHours && (
            <div className="lg:col-span-5 bg-white text-black p-8 md:p-12 shadow-[12px_12px_0px_rgba(255,255,255,0.1)]">
              <h3 className="text-3xl font-black uppercase italic mb-8 border-b-4 border-black pb-2 flex items-center gap-3">
                <Clock size={28} /> AGENDA_
              </h3>
              <div className="space-y-4">
                {realHours.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-black/5 font-black uppercase italic py-1 text-xs"
                  >
                    <span className="opacity-40">{h.day}</span>
                    <span
                      className={
                        h.isClosed
                          ? "text-rose-600 line-through opacity-30"
                          : ""
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

        {/* REPORT */}
        <div className="w-full flex justify-center py-6 opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug} />
        </div>
        <div ref={footerTriggerRef} className="h-1" />
      </main>

      {/* WHATSAPP CTA URBAN (FLUTUANTE) */}
      {hasWhatsapp && (
        <motion.button
          animate={isFooterVisible ? { scale: 0 } : { scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-8 right-8 z-[110] w-20 h-20 bg-white text-black flex items-center justify-center border-2 border-black"
          style={{
            boxShadow: `6px 6px 0px ${theme?.previewColor || "#ffffff"}`,
          }}
        >
          <MessageCircle size={36} fill="currentColor" />
        </motion.button>
      )}

      {/* LIGHTBOX URBAN */}
      <AnimatePresence>
        {selectedImg !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-10 right-10 text-white z-[210] hover:rotate-90 transition-transform"
            >
              <X size={40} />
            </button>
            <img
              src={
                gallery[selectedImg] ||
                "https://placehold.co/800x800/000000/FFFFFF?text=IMAGEM_INDISPONIVEL"
              }
              className="max-w-full max-h-[85vh] object-contain border-4 border-white/10 shadow-2xl"
              alt="Preview"
            />
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
          animation: marquee 30s linear infinite;
        }
        .text-urban-raw {
          font-size: clamp(3.5rem, 14vw, 10rem);
          letter-spacing: -0.05em;
          transform: skewX(-5deg);
          text-shadow: 6px 6px 0px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
