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
  Camera,
  MessageCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Layout,
  ShieldCheck,
  Quote,
  Navigation,
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
import VitrineCardapio from "../VitrineCardapio"; // 🚀 O MOTOR DA MÁQUINA DE VENDAS AQUI!

const AccordionItem = ({ q, a, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`mb-4 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left gap-4 outline-none bg-transparent border-none group"
      >
        <span
          className={`text-sm font-black uppercase tracking-tight transition-colors duration-300 ${isOpen ? theme.primary : "opacity-80 group-hover:opacity-100"}`}
        >
          {q}
        </span>
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner ${isOpen ? `${theme.bgAction} rotate-45 text-white` : `${theme.bgSecondary} ${theme.primary}`}`}
        >
          <Plus size={18} />
        </div>
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
            <div className="px-6 pb-6 text-sm font-medium leading-relaxed opacity-70 border-t border-black/5 pt-4 whitespace-pre-line">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 4. LAYOUT PRINCIPAL (COMERCIAL LUXE)
// ==========================================
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
  isOpen,
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
    hasDescription,
    availableSocials,
  } = useBusiness(rawBusiness, rawHours);

  const [activeTab, setActiveTab] = useState<"perfil" | "infos">("perfil");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showDigitalMenu, setShowDigitalMenu] = useState(false);

  // 🚀 O filtro agora começa nulo para a IA decidir o que mostrar depois
  const [userMediaFilter, setUserMediaFilter] = useState<
    "photos" | "motion" | null
  >(null);

  const footerTriggerRef = useRef<HTMLDivElement | null>(null);
  const isFooterVisible = useInView(footerTriggerRef, {
    margin: "0px 0px 50px 0px",
  });

  const theme =
    propTheme ||
    businessThemes[business.theme] ||
    businessThemes["comercial_pearl"];

  const address = fullAddress || business.address || "";
  const faqs = (business.faqs || []).filter(
    (f: any) => (f.q || f.question) && (f.a || f.answer),
  );

  // 🚀 RADAR DE ESTOQUE/AGENDA: Checa se tem pelo menos 1 item ou serviço configurado
  const temServicoOuProdutoAtivo =
    business.products && business.products.some((p: any) => p.isActive);

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
  // 🚀 CÉREBRO DA GALERIA: LÓGICA CONDICIONAL
  // ==========================================
  const hasPhotos = cleanFeed.some((item: any) => item.type === "image");
  const hasVideos = cleanFeed.some((item: any) =>
    ["video", "video_v", "video_h"].includes(item.type),
  );
  // Se o usuário não clicou em nada, o sistema escolhe: Fotos 1º, se não tiver, Vídeos.
  const activeMediaFilter =
    userMediaFilter || (hasPhotos ? "photos" : "motion");

  // 🚀 O RADAR DO LINK EXTERNO:
  const isExternalLink = !!business.isExternalLink;
  const actionLink = business.actionLink || "";

  const salesChannels = [
    {
      key: "mercadoLivre",
      name: "Mercado Livre",
      icon: <MeliIcon className="w-4 h-4" />,
      url: business.mercadoLivre,
      colorClass:
        "bg-[#FFE600] text-[#2D3277] border-transparent hover:shadow-[0_5px_15px_rgba(255,230,0,0.3)]",
    },
    {
      key: "shopee",
      name: "Shopee",
      icon: <ShopeeIcon className="w-4 h-4" />,
      url: business.shopee,
      colorClass:
        "bg-[#EE4D2D] text-white border-transparent hover:shadow-[0_5px_15px_rgba(238,77,45,0.3)]",
    },
    {
      key: "ifood",
      name: "iFood",
      icon: <IfoodIcon className="w-4 h-4" />,
      url: business.ifood,
      colorClass:
        "bg-[#EA1D2C] text-white border-transparent hover:shadow-[0_5px_15px_rgba(234,29,44,0.3)]",
    },
    {
      key: "shein",
      name: "Shein",
      icon: <SheinIcon className="w-4 h-4" />,
      url: business.shein,
      colorClass:
        "bg-slate-900 text-white border-transparent hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]",
    },
  ].filter((c) => c.url && c.url.trim() !== "");

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
        if (type === "whatsapp") {
          // 🚀 SEGURO E LUCRATIVO: Abre a conversa de vendas Noutra Janela e não "mata" a Vitrine Digital
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        } else {
          // O comando nativo 'tel:' nos telemóveis não destrói a aba, chama apenas o discador.
          window.location.href = targetUrl;
        }
      }
    },
    [business.id, business.name, business.whatsapp, business.phone],
  );

  useEffect(() => {
    if (selectedIndex !== null || isPdfModalOpen || showDigitalMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex, isPdfModalOpen, showDigitalMenu]); // 🚀 TRAVA A TELA PRO PDF E PRO CARRINHO

  // 🚀 MÁGICA DA CONVERSÃO: Abre o carrinho automaticamente se o cliente voltar de um login!
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 🧹 EXORCISMO: Deleta o carrinho antigo que ficou preso no navegador
      sessionStorage.removeItem("tafanu_cart");

      const isCartPending = window.location.search.includes("cart=true");
      // 🚀 Atualizado para ler o NOVO cofre super seguro
      const savedCart = sessionStorage.getItem("tafanu_pending_checkout");

      if (isCartPending || savedCart) {
        setShowDigitalMenu(true);
      }
    }
  }, []);

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
      className={`min-h-screen ${theme.bgPage} ${theme.textColor} font-sans pb-10 overflow-x-hidden selection:bg-black/10`}
    >
      {/* --- HEADER HERO BANNER (NOVA IDENTIDADE LUXE) --- */}
      <div
        className={`relative w-full h-56 md:h-72 ${theme.bgHero || "bg-slate-200"} rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-sm overflow-hidden`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Botões de Partilha e Favorito no topo - Alta visibilidade */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 flex items-center gap-3">
          <button
            onClick={() => handleShare(business.name)}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full border border-black/5 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white hover:scale-105 transition-all"
          >
            <Share2 size={20} strokeWidth={2} />
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full border border-black/5 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white hover:scale-105 transition-all cursor-pointer">
            <FavoriteButton
              businessId={business.id}
              isLoggedIn={isLoggedIn}
              initialIsFavorited={isFavorited}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>
      <header
        className={`relative w-full max-w-6xl mx-auto px-6 -mt-20 md:-mt-24 z-10 flex flex-col items-start text-left mb-8`}
      >
        <div className="flex flex-col md:flex-row items-start gap-6 w-full">
          {/* Avatar Flutuante Premium - Puxa a borda do tema para dar harmonia */}
          {business.imageUrl && (
            <div
              className={`relative w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] border-[6px] md:border-[8px] ${theme.border} backdrop-blur-md shadow-2xl overflow-hidden ${theme.cardBg} shrink-0`}
            >
              <Image
                src={business.imageUrl || "/og-default.png"}
                alt={`Logotipo ${business.name}`}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          )}
          {/* pt-32 empurra o texto para baixo apenas no desktop */}
          <div className="flex flex-col items-start pt-4 md:pt-32">
            {/* Evitando Duplicação de Badge e Urban Tag */}
            {business.comercial_badge &&
              business.comercial_badge !== business.urban_tag && (
                <span
                  className={`${theme.bgAction} px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest shadow-md inline-block mb-3`}
                >
                  {business.comercial_badge}
                </span>
              )}
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight leading-none drop-shadow-sm ${theme.textColor}`}
            >
              {business.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-start">
              {business.urban_tag && (
                <span
                  className={`text-sm font-bold uppercase tracking-widest ${theme.primary}`}
                >
                  {business.urban_tag}
                </span>
              )}
              {realHours.length > 0 && (
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm ${
                    isOpen
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {isOpen ? "ON" : "OFF"}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 O MOTOR DE DECISÃO E INVISIBILIDADE: LOJA DIGITAL vs PDF vs AGENDA vs LINK EXTERNO */}
      {((rawBusiness.menuMode === "DIGITAL" && temServicoOuProdutoAtivo) ||
        (rawBusiness.menuMode === "PDF" && rawBusiness.catalogPdf) ||
        (rawBusiness.menuMode === "AGENDA" && temServicoOuProdutoAtivo) ||
        (isExternalLink && actionLink)) && (
        <div className="w-full flex justify-center px-4 mb-8 -mt-2 relative z-10">
          <button
            onClick={() => {
              // 🚀 SE FOR LINK EXTERNO (CAVALO DE TRÓIA), MANDA PRA FORA E REGISTRA O CLIQUE!
              if (isExternalLink && actionLink) {
                Actions.registerClickEvent(business.id, "WEBSITE");
                window.open(
                  formatExternalLink(actionLink),
                  "_blank",
                  "noopener,noreferrer",
                );
                return;
              }

              if (
                rawBusiness.menuMode === "DIGITAL" ||
                rawBusiness.menuMode === "AGENDA"
              ) {
                setShowDigitalMenu(true);
              } else if (rawBusiness.menuMode === "PDF") {
                setIsPdfModalOpen(true);
              }
            }}
            className={`relative overflow-hidden flex w-full md:w-[320px] justify-center items-center gap-3 px-8 py-4 rounded-full text-[11px] md:text-xs font-black tracking-[0.2em] uppercase text-white ${theme.bgAction} shadow-md border border-white/20 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95`}
          >
            {/* Máscara de Degradê Translúcido para dar o efeito "Estilizado/3D" */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
              {rawBusiness.menuMode === "DIGITAL"
                ? "Fazer Pedido"
                : rawBusiness.menuMode === "AGENDA"
                  ? "Agendar Horário"
                  : "Explorar Menu"}
              <ChevronRight size={16} strokeWidth={2} />
            </span>
          </button>
        </div>
      )}

      {/* --- MENU TABS (Glassmorphism e z-20 para não conflitar com a Navbar) --- */}
      <div className="sticky top-6 z-20 px-4 mb-10 flex justify-center">
        <div
          className={`bg-white/80 backdrop-blur-xl p-1.5 rounded-full border ${theme.border} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex gap-1`}
        >
          {["perfil", "infos"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-8 md:px-14 py-3.5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === t
                  ? "text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-800 hover:bg-black/5"
              }`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="active-tab"
                  className={`absolute inset-0 ${theme.bgAction} rounded-full z-0`}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
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
          {/* ======================= ABA PERFIL ======================= */}
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 md:space-y-12"
            >
              {/* HISTÓRIA */}
              {hasDescription && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 transition-all hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                    >
                      <Quote size={20} />
                    </div>
                    <h2
                      className={`text-sm md:text-lg font-black uppercase tracking-widest opacity-60 ${theme.primary}`}
                    >
                      Nossa História
                    </h2>
                  </div>
                  <p
                    className={`text-lg md:text-2xl font-medium leading-relaxed opacity-90 break-words whitespace-pre-line ${theme.textColor}`}
                  >
                    {business.description}
                  </p>
                </section>
              )}
              {/* DESTAQUES */}
              {hasFeatures && (
                <section className="space-y-6">
                  <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40 pl-2">
                    {" "}
                    Destaques{" "}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {business.features
                      .filter(Boolean)
                      .map((f: string, i: number) => (
                        <div
                          key={i}
                          className={`w-full px-5 py-5 rounded-[1.5rem] border ${theme.border} ${theme.cardBg} flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all`}
                        >
                          <div
                            className={`w-10 h-10 shrink-0 rounded-full ${theme.bgSecondary} flex items-center justify-center`}
                          >
                            <CheckCircle2
                              size={18}
                              className={`${theme.primary}`}
                            />
                          </div>
                          <span className="text-sm font-bold leading-tight opacity-90">
                            {" "}
                            {f}{" "}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* GALERIA E VÍDEOS INTELIGENTE */}
              {cleanFeed.length > 0 && (
                <section className="w-full pt-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                      >
                        <Camera size={20} />
                      </div>
                      <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40">
                        Catálogo Visual
                      </h2>
                    </div>

                    {/* 🚀 SÓ MOSTRA AS ABAS SE TIVER OS DOIS TIPOS DE MÍDIA */}
                    {hasPhotos && hasVideos && (
                      <div
                        className={`flex items-center p-1.5 ${theme.cardBg} border ${theme.border} rounded-full shadow-sm`}
                      >
                        <button
                          onClick={() => setUserMediaFilter("photos")}
                          className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "photos" ? `${theme.bgAction} shadow-md text-white` : "opacity-50 hover:opacity-100"}`}
                        >
                          Fotos
                        </button>
                        <button
                          onClick={() => setUserMediaFilter("motion")}
                          className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${activeMediaFilter === "motion" ? `${theme.bgAction} shadow-md text-white` : "opacity-50 hover:opacity-100"}`}
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
                        return ["video", "video_v", "video_h"].includes(
                          item.type,
                        );
                      return true;
                    })}
                    setSelectedIndex={setSelectedIndex}
                    variant="comercial"
                    themeBorder={theme.border}
                    cardBg={theme.cardBg}
                  />
                </section>
              )}

              {/* DUVIDAS FREQUENTES (MOVIDO PARA AQUI) */}
              {faqs.length > 0 && (
                <section
                  className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 transition-all hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                    >
                      <HelpCircle size={20} />
                    </div>
                    <h2 className="text-sm md:text-lg font-black uppercase tracking-widest opacity-40">
                      Dúvidas Frequentes
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2">
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
            </motion.div>
          )}

          {/* ======================= ABA INFOS E CONTATOS ======================= */}
          {activeTab === "infos" && (
            <motion.div
              key="infos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* COLUNA ESQUERDA (Atendimento, Social, Lojas) */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* ATENDIMENTO ONLINE */}
                  {(hasWhatsapp || hasPhone) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform`}
                    >
                      <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 text-center md:text-left">
                        {" "}
                        Atendimento Rápido{" "}
                      </h2>
                      <div className="space-y-4">
                        {hasWhatsapp && (
                          <button
                            onClick={() => handleTrackLead("whatsapp")}
                            className="w-full flex items-center justify-between group bg-white border border-[#25D366]/20 p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                                <MessageCircle size={24} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                                  {" "}
                                  Chamar no{" "}
                                </h4>
                                <p className="text-lg md:text-xl font-black text-[#25D366]">
                                  {" "}
                                  WhatsApp{" "}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={24}
                              className="opacity-20 group-hover:translate-x-2 transition-transform text-[#25D366]"
                            />
                          </button>
                        )}
                        {hasPhone && (
                          <button
                            onClick={() => handleTrackLead("phone")}
                            className={`w-full flex items-center justify-between group ${theme.bgSecondary} border ${theme.border} p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-14 h-14 rounded-2xl ${theme.bgAction} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                              >
                                <PhoneCall size={24} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                                  {" "}
                                  Ligar Agora{" "}
                                </h4>
                                <p
                                  className={`text-lg md:text-xl font-black ${theme.primary}`}
                                >
                                  {" "}
                                  {formatPhoneNumber(business.phone)}{" "}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={24}
                              className={`opacity-20 group-hover:translate-x-2 transition-transform ${theme.primary}`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* REDES SOCIAIS E MARKETPLACES */}
                  {(availableSocials.length > 0 ||
                    salesChannels.length > 0) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 flex flex-col gap-8`}
                    >
                      {availableSocials.length > 0 && (
                        <div>
                          <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-5">
                            {" "}
                            Redes Sociais{" "}
                          </h2>
                          <div className="flex flex-wrap gap-4">
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
                                <motion.a
                                  key={s}
                                  href={finalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ y: -5 }}
                                  onClick={() =>
                                    Actions.registerClickEvent(
                                      business.id,
                                      s.toUpperCase(),
                                    )
                                  }
                                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${theme.bgSecondary} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}
                                >
                                  <div className={`${theme.primary}`}>
                                    {s === "instagram" ? (
                                      <Instagram size={20} />
                                    ) : s === "facebook" ? (
                                      <Facebook size={20} />
                                    ) : s === "tiktok" ? (
                                      <TikTokIcon className="w-5 h-5" />
                                    ) : (
                                      <Globe size={20} />
                                    )}
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest opacity-80">
                                    {s}
                                  </span>
                                </motion.a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {salesChannels.length > 0 && (
                        <div
                          className={`${availableSocials.length > 0 ? "pt-6 border-t border-black/5" : ""}`}
                        >
                          <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-5">
                            {" "}
                            Lojas Oficiais{" "}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 group ${channel.colorClass}`}
                              >
                                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                  {" "}
                                  {channel.icon}{" "}
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase">
                                  {" "}
                                  {channel.name}{" "}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COLUNA DIREITA (Endereço, Horários) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  {/* LOCALIZAÇÃO E HORÁRIOS */}
                  {(hasAddress || hasHours) && (
                    <div
                      className={`${theme.cardBg} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} shadow-xl shadow-black/5 flex flex-col gap-8 hover:-translate-y-1 transition-transform`}
                    >
                      {hasAddress && (
                        <div className="block">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-10 h-10 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner group-hover:scale-110 transition-transform`}
                            >
                              <MapPin size={18} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                              {" "}
                              Localização{" "}
                            </h2>
                          </div>
                          <p className="text-sm md:text-base font-black italic leading-snug mb-1 opacity-90">
                            {business.address || "Endereço não cadastrado"}{" "}
                            {business.number &&
                              !business.address?.includes(business.number) &&
                              `, ${business.number}`}
                          </p>
                          {business.complement && (
                            <p className="text-xs font-medium opacity-60 mb-3">
                              {business.complement}
                            </p>
                          )}
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2 bg-black/5 inline-block px-3 py-1.5 rounded-md">
                            {business.neighborhood &&
                              `${business.neighborhood} • `}{" "}
                            {business.city}{" "}
                            {business.state ? `— ${business.state}` : ""}{" "}
                            {business.cep && ` • CEP: ${business.cep}`}
                          </p>

                          {/* LINK DIRETO DE NAVEGAÇÃO */}
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              Actions.registerClickEvent(business.id, "MAP")
                            }
                            className={`mt-6 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl ${theme.bgSecondary} ${theme.primary} border ${theme.border} hover:opacity-80 transition-all`}
                          >
                            <Navigation size={16} /> Traçar Rota
                          </a>
                        </div>
                      )}

                      {hasHours && (
                        <div
                          className={`${hasAddress ? "pt-6 border-t border-black/5" : ""}`}
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`w-10 h-10 rounded-xl ${theme.bgSecondary} flex items-center justify-center ${theme.primary} shadow-inner`}
                            >
                              <Clock size={18} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                              {" "}
                              Horários{" "}
                            </h2>
                          </div>
                          <div className="space-y-3">
                            {realHours.map((h: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between items-center pb-2.5 border-b border-black/5 last:border-0 last:pb-0"
                              >
                                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                                  {" "}
                                  {h.day}{" "}
                                </span>
                                <span
                                  className={`text-xs md:text-sm font-black italic ${h.isClosed ? "text-rose-500" : "opacity-90"}`}
                                >
                                  {" "}
                                  {h.time}{" "}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- RODAPÉ DE DENÚNCIA E COMENTÁRIOS --- */}
        <div className="mt-16 mb-8 w-full flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <ReportModal businessSlug={business.slug || business.id} />
        </div>
        <div className="max-w-4xl mx-auto w-full pb-24">
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

      {/* WHATSAPP FLUTUANTE GLOBAL */}
      {hasWhatsapp && (
        <motion.button
          aria-label="Abrir WhatsApp Flutuante"
          animate={
            isFooterVisible
              ? { opacity: 0, scale: 0.8, pointerEvents: "none" }
              : { opacity: 1, scale: 1, pointerEvents: "auto" }
          }
          onClick={() => handleTrackLead("whatsapp")}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] border-4 border-white hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle
            className="w-8 h-8 md:w-10 md:h-10"
            fill="currentColor"
          />
        </motion.button>
      )}

      <TemplateLightbox
        images={lightboxImages}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={safeSetIndex}
      />

      {/* ==========================================
          🚀 MODAL DE PDF (CARDÁPIO/CATÁLOGO)
          ========================================== */}
      <AnimatePresence>
        {isPdfModalOpen && rawBusiness.catalogPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
              {/* Barra de Topo com Botão de Fechar */}
              <div className="w-full h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                  Visualização de Documento
                </span>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-rose-500 hover:text-white rounded-full transition-colors text-slate-500"
                >
                  <Plus className="rotate-45" size={20} strokeWidth={2} />
                </button>
              </div>

              {/* O Coração: O Leitor de PDF nativo do navegador */}
              <div className="flex-1 w-full bg-slate-200/50">
                <iframe
                  src={`${rawBusiness.catalogPdf}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="Catálogo PDF"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          🚀 MODAL DE ITENS (CARRINHO OU LISTA DE SERVIÇOS)
          ========================================== */}
      <AnimatePresence>
        {showDigitalMenu && (
          <VitrineCardapio
            businessId={rawBusiness.id}
            businessName={rawBusiness.name}
            whatsapp={rawBusiness.whatsapp || rawBusiness.phone}
            themeColor={theme.previewColor}
            products={rawBusiness.products || []}
            onClose={() => setShowDigitalMenu(false)}
            isOpen={isOpen}
            hours={rawBusiness.hours}
            deliveryFee={rawBusiness.deliveryFee || 0}
            deliveryRadius={rawBusiness.deliveryRadius || 0}
            businessLat={rawBusiness.latitude}
            businessLng={rawBusiness.longitude}
            menuMode={rawBusiness.menuMode}
            agendaConfig={rawBusiness.agendaConfig} // 🚀 ENVIANDO A NOVA GRADE DE AGENDAS INDEPENDENTE!
          />
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
