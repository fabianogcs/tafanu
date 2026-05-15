"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  MessageCircle,
  Navigation,
  Heart,
  Loader2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function BusinessCard({ business, showDistance }: any) {
  const [isNavigating, setIsNavigating] = useState(false);
  const favoriteCount = business._count?.favorites || 0;

  // --- SUBCATEGORIAS ---
  let allSubcategories: string[] = [];
  if (Array.isArray(business.subcategory)) {
    allSubcategories = business.subcategory;
  } else if (typeof business.subcategory === "string") {
    allSubcategories = business.subcategory
      .split(",")
      .map((s: string) => s.trim());
  }

  // --- SUBCATEGORIAS (Com lógica de "+X Ocultos") ---
  let currentSub = null;
  if (allSubcategories.length > 0) {
    const visibleSubs = allSubcategories.slice(0, 2).join(" • ");
    const hiddenCount = allSubcategories.length - 2;

    // Se tiver mais de 2, ele mostra "Sub1 • Sub2 • +3"
    currentSub =
      hiddenCount > 0 ? `${visibleSubs} • +${hiddenCount}` : visibleSubs;
  }

  // --- LÓGICA INTELIGENTE ABERTO/FECHADO E PRÓXIMO HORÁRIO ---
  const getBusinessStatus = (hours: any[]) => {
    if (!hours || hours.length === 0) return { status: "UNKNOWN", text: null };

    const now = new Date();
    const todayIndex = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const daysMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const todayHours = hours.find((h: any) => h.dayOfWeek === todayIndex);

    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    if (todayHours && !todayHours.isClosed) {
      const openMins = toMinutes(todayHours.openTime);
      const closeMins = toMinutes(todayHours.closeTime);

      if (currentMinutes >= openMins && currentMinutes <= closeMins) {
        const timeToClose = closeMins - currentMinutes;
        if (timeToClose <= 60 && timeToClose > 0) {
          return {
            status: "CLOSING_SOON",
            text: `Fecha às ${todayHours.closeTime}`,
          };
        }
        return { status: "OPEN", text: `Fecha às ${todayHours.closeTime}` };
      }

      if (currentMinutes < openMins) {
        return {
          status: "CLOSED",
          text: `Abre hoje às ${todayHours.openTime}`,
        };
      }
    }

    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDayHours = hours.find((h: any) => h.dayOfWeek === nextDayIndex);

      if (nextDayHours && !nextDayHours.isClosed) {
        const isTomorrow = i === 1;
        const dayText = isTomorrow ? "amanhã" : daysMap[nextDayIndex];
        return {
          status: "CLOSED",
          text: `Abre ${dayText} às ${nextDayHours.openTime}`,
        };
      }
    }

    return { status: "CLOSED", text: null };
  };

  const { status: currentStatus, text: statusText } = getBusinessStatus(
    business.hours,
  );
  const isCurrentlyOpen =
    currentStatus === "OPEN" || currentStatus === "CLOSING_SOON";

  // --- CONTATO WHATSAPP ---
  const rawPhone = business.whatsapp || business.phone;
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, "") : null;
  const defaultMessage = `Olá! Encontrei o anúncio "${business.name}" no Tafanu e gostaria de saber mais.`;
  const wppLink = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`
    : null;

  // --- ENDEREÇO TEXTO LIMPO ---
  const locationParts = [business.neighborhood, business.city].filter(
    (part) => part && part.trim() !== "",
  );
  const locationText =
    locationParts.length > 0 ? locationParts.join(", ") : null;

  return (
    <motion.div
      whileHover={!isNavigating ? { y: -4 } : {}}
      className={`bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden ${
        isNavigating ? "opacity-90 pointer-events-none scale-[0.98]" : ""
      }`}
    >
      <Link
        href={`/site/${business.slug}`}
        onClick={() => setIsNavigating(true)}
        className="flex flex-col flex-1 outline-none"
      >
        {/* --- 1. ÁREA DA FOTO (LIMPA E FOCADA) --- */}
        <div className="relative h-[160px] md:h-[180px] w-full bg-slate-100 overflow-hidden shrink-0">
          {/* Spinner de Loading */}
          {isNavigating && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white transition-all">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Abrindo...
              </span>
            </div>
          )}

          <Image
            src={business.imageUrl || "/og-default.png"}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Gradiente escuro apenas no topo para dar leitura aos selos */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-10" />

          {/* Selos (Tags) Minimalistas */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
            <div className="flex flex-col gap-1.5">
              {/* Tag Status (Aberto/Fechado) */}
              {currentStatus !== "UNKNOWN" && (
                <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-black/5">
                  <div
                    className={`w-2 h-2 rounded-full ${isCurrentlyOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                  />
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                    {isCurrentlyOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>
              )}

              {/* Tag Distância */}
              {showDistance &&
                business.distance !== null &&
                business.distance !== undefined && (
                  <div className="bg-[#023059]/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <Navigation size={10} className="text-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wide">
                      {business.distance < 1
                        ? `${(business.distance * 1000).toFixed(0)}m`
                        : `${business.distance.toFixed(1)}km`}
                    </span>
                  </div>
                )}
            </div>

            {/* Tag Favoritos */}
            {favoriteCount > 0 && (
              <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-black/5 flex items-center gap-1.5 shrink-0">
                <Heart size={12} className="fill-rose-500 text-rose-500" />
                <span className="text-[10px] font-black text-slate-700">
                  {favoriteCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- 2. CORPO DE TEXTO (ALINHADO À ESQUERDA, FÁCIL DE LER) --- */}
        <div className="p-4 flex flex-col flex-1 text-left justify-start">
          {/* --- Categoria Fixa e Subcategorias em Rolagem Automática --- */}
          <div className="flex items-center w-full mb-2 overflow-hidden relative">
            {/* Categoria fixa na esquerda com fundo branco para sobrepor o texto que rola */}
            <div className="shrink-0 bg-white pr-2 z-10 flex items-center">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                {business.category}
              </span>
              {allSubcategories.length > 0 && (
                <span className="text-slate-300 ml-2">•</span>
              )}
            </div>

            {/* Letreiro Digital (Marquee) das Subcategorias usando Framer Motion */}
            {allSubcategories.length > 0 && (
              <div className="flex-1 overflow-hidden relative flex">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 15,
                  }} // 15 segundos para uma leitura bem suave
                  className="flex whitespace-nowrap text-[9px] font-bold text-slate-400 uppercase tracking-widest w-max"
                >
                  {/* Duplicamos o texto para o loop infinito não ter fim nem solavancos */}
                  <span className="pr-4">{allSubcategories.join(" • ")}</span>
                  <span className="pr-4">{allSubcategories.join(" • ")}</span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Título Principal */}
          <h3 className="text-base md:text-lg font-black text-[#023059] leading-tight mb-4 group-hover:text-emerald-500 transition-colors line-clamp-2">
            {business.name}
          </h3>

          {/* Dados (Endereço e Relógio) empilhados discretamente */}
          <div className="mt-auto flex flex-col gap-2">
            {locationText ? (
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={12} className="shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wide truncate">
                  {locationText}
                </span>
              </div>
            ) : (
              <div className="h-[14px]" /> // Espaçador caso não tenha endereço
            )}

            {statusText && (
              <div
                className={`flex items-center gap-2 ${currentStatus === "CLOSING_SOON" ? "text-orange-500 animate-pulse" : "text-slate-400"}`}
              >
                <Clock size={12} className="shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wide truncate">
                  {statusText}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* --- 3. RODAPÉ DE AÇÃO --- */}
      {wppLink ? (
        <div className="px-4 pb-4 mt-auto">
          <a
            href={wppLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white py-2.5 rounded-[12px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border border-emerald-100 w-full"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      ) : (
        <div className="pb-2" />
      )}
    </motion.div>
  );
}
