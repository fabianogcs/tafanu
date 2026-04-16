"use client";

import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  Sparkles,
  Navigation,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function BusinessCard({ business, showDistance }: any) {
  const favoriteCount = business._count?.favorites || 0;

  // --- SUBCATEGORIAS (Limitando a 2) ---
  let allSubcategories: string[] = [];
  if (Array.isArray(business.subcategory)) {
    allSubcategories = business.subcategory;
  } else if (typeof business.subcategory === "string") {
    allSubcategories = business.subcategory
      .split(",")
      .map((s: string) => s.trim());
  }

  const currentSub =
    allSubcategories.length > 0
      ? allSubcategories.slice(0, 2).join(" • ")
      : null;

  // --- LÓGICA ABERTO/FECHADO ---
  const checkIsOpen = (hours: any[]) => {
    if (!hours || hours.length === 0) return null;
    const now = new Date();
    const today = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = hours.find((h: any) => h.dayOfWeek === today);
    if (!todayHours || todayHours.isClosed) return false;

    const [openH, openM] = todayHours.openTime.split(":").map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  const isOpen = checkIsOpen(business.hours);

  // --- CONTATO WHATSAPP ---
  const rawPhone = business.whatsapp || business.phone;
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, "") : null;

  // 🚀 MENSAGEM AUTOMÁTICA INTELIGENTE
  const defaultMessage = `Olá! Encontrei o anúncio "${business.name}" no Tafanu e gostaria de saber mais.`;
  const wppLink = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`
    : null;

  // --- ENDEREÇO TEXTO LIMPO ---
  const locationParts = [
    business.neighborhood,
    business.city && business.state
      ? `${business.city}/${business.state}`
      : business.city || business.state,
  ].filter((part) => part && part.trim() !== "");

  const locationText =
    locationParts.length > 0 ? locationParts.join(" • ") : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden"
    >
      <Link
        href={`/site/${business.slug}`}
        className="flex flex-col flex-1 relative z-10 outline-none"
      >
        {/* --- HEADER VISUAL (IMAGEM E BADGES) --- */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={business.imageUrl || "/og-default.png"}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

          {/* TOPO: Aberto/Fechado (Esquerda) e Favoritos (Direita) */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
            {/* Aberto/Fechado e Distância (Esquerda) */}
            <div className="flex gap-2 flex-col items-start">
              {isOpen !== null && (
                <div
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-md border ${
                    isOpen
                      ? "bg-emerald-500/90 border-emerald-400 text-white"
                      : "bg-red-500/90 border-red-400 text-white"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-white animate-pulse" : "bg-white/70"}`}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>
              )}

              {showDistance &&
                business.distance !== null &&
                business.distance !== undefined && (
                  <div className="bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/20">
                    <Navigation size={10} className="fill-white" />
                    <span className="text-[9px] font-bold uppercase tracking-wide">
                      {business.distance < 1
                        ? `${(business.distance * 1000).toFixed(0)}m`
                        : `${business.distance.toFixed(1)}km`}
                    </span>
                  </div>
                )}
            </div>

            {/* Favoritos (Direita) */}
            {favoriteCount > 0 && (
              <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-md border border-black/5 flex items-center gap-1.5 shrink-0">
                <Heart size={12} className="fill-rose-500 text-rose-500" />
                <span className="text-[10px] font-black text-slate-800 pr-0.5">
                  {favoriteCount}
                </span>
              </div>
            )}
          </div>

          {/* BOTTOM: Categoria Principal */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-20">
            <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center justify-center gap-1.5 border border-white/20 truncate shadow-lg">
              <Sparkles size={10} className="text-amber-300 shrink-0" />
              {business.category || "Geral"}
            </span>
          </div>
        </div>

        {/* --- CORPO DE TEXTO --- */}
        {/* 🚀 AQUI FOI O AJUSTE: px-2 e md:px-3 para esticar mais, e itens centralizados! */}
        <div className="py-3.5 px-2 md:py-4 md:px-3 flex flex-col flex-1 text-center justify-start items-center">
          {/* Subcategorias */}
          <div className="h-4 mb-1.5 w-full flex justify-center items-center">
            {currentSub && (
              <span className="text-center text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate w-full">
                {currentSub}
              </span>
            )}
          </div>

          {/* Nome do Negócio */}
          <h3 className="text-center text-base md:text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 w-full">
            {business.name}
          </h3>

          {/* Endereço */}
          <div className="mt-auto pt-1 w-full flex items-center justify-center gap-1.5 text-slate-400">
            {locationText ? (
              <>
                <MapPin size={12} className="text-slate-300 shrink-0" />
                <span className="text-center text-[9px] md:text-[10px] font-bold uppercase tracking-wide truncate">
                  {locationText}
                </span>
              </>
            ) : (
              <span className="text-[9px] text-transparent select-none">
                Sem endereço
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* --- RODAPÉ: BOTÃO WHATSAPP --- */}
      {wppLink ? (
        <div className="px-3 pb-3 pt-0 relative z-20 mt-auto">
          <a
            href={wppLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 bg-[#F0FDF4] text-emerald-600 hover:bg-emerald-500 hover:text-white py-3 rounded-[16px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border border-emerald-100 hover:border-emerald-500 w-full"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      ) : (
        <div className="pb-4 mt-auto" />
      )}
    </motion.div>
  );
}
