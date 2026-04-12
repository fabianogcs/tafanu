"use client";

import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  Sparkles,
  Navigation,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// 🚀 1. RECEBENDO O AVISO "showDistance" DO PAI
export default function BusinessCard({ business, showDistance }: any) {
  const favoriteCount = business._count?.favorites || 0;

  // --- 2. SUBCATEGORIAS (MECÂNICA NOVA: 1 POR VEZ) ---
  let allSubcategories: string[] = [];
  if (Array.isArray(business.subcategory)) {
    allSubcategories = business.subcategory;
  } else if (typeof business.subcategory === "string") {
    allSubcategories = business.subcategory
      .split(",")
      .map((s: string) => s.trim());
  }

  const [index, setIndex] = useState(0);
  useEffect(() => {
    // Agora ele pula de 1 em 1
    if (allSubcategories.length > 1) {
      const timer = setInterval(() => {
        setIndex((prev) =>
          prev + 1 >= allSubcategories.length ? 0 : prev + 1,
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [allSubcategories.length]);

  const currentSub = allSubcategories[index];

  // --- 3. CONTATO ---
  const rawPhone = business.whatsapp || business.phone;
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, "") : null;
  const wppLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  // --- 4. ENDEREÇO TEXTO LIMPO ---
  const locationParts = [
    business.neighborhood,
    business.city && business.state
      ? `${business.city}/${business.state}`
      : business.city || business.state,
  ].filter((part) => part && part.trim() !== "");

  // 🚀 Se a array locationParts estiver vazia, retorna null para podermos esconder o ícone depois
  const locationText =
    locationParts.length > 0 ? locationParts.join(" • ") : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(2,48,89,0.08)] transition-all duration-500 group flex flex-col h-full overflow-hidden"
    >
      {/* --- CONTADOR DE FAVORITOS (Apenas Visual) --- */}
      {favoriteCount > 0 && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-30 scale-[0.85] md:scale-100 origin-top-right pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-full shadow-sm border border-black/5 flex items-center gap-1.5">
            <Heart size={14} className="fill-rose-500 text-rose-500" />
            <span className="text-[10px] md:text-xs font-black text-slate-700 pr-0.5">
              {favoriteCount}
            </span>
          </div>
        </div>
      )}

      <Link
        href={`/site/${business.slug}`}
        className="flex flex-col flex-1 relative z-10"
      >
        {/* --- IMAGEM HEADER --- */}
        <div className="p-1.5 md:p-2 pb-0">
          <div className="relative aspect-[16/11] md:aspect-[16/10] w-full bg-slate-100 overflow-hidden rounded-[20px] md:rounded-[24px] shadow-inner">
            <img
              src={business.imageUrl || "/og-default.png"}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Sombreamento inferior para dar leitura nas tags */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

            {/* 🚀 2. BADGE DE DISTÂNCIA (Travado pelo showDistance) */}
            {showDistance &&
              business.distance !== null &&
              business.distance !== undefined && (
                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20">
                  <div className="bg-blue-600/90 backdrop-blur-sm text-white px-2.5 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
                    <Navigation
                      size={10}
                      className="fill-white md:w-3 md:h-3"
                    />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">
                      {business.distance < 1
                        ? `${(business.distance * 1000).toFixed(0)}m`
                        : `${business.distance.toFixed(1)}km`}
                    </span>
                  </div>
                </div>
              )}

            {/* BADGE CATEGORIA PRINCIPAL */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-20">
              <span className="bg-black/40 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest flex items-center justify-center gap-1.5 border border-white/20 truncate shadow-lg">
                <Sparkles
                  size={10}
                  className="text-yellow-400 shrink-0 md:w-3 md:h-3"
                />
                {business.category || "Geral"}
              </span>
            </div>
          </div>
        </div>

        {/* --- CONTEÚDO DO CARD --- */}
        <div className="px-3 pt-4 pb-3 md:p-5 flex flex-col flex-1 items-center text-center">
          {/* ANIMAÇÃO SUBCATEGORIAS */}
          <div className="h-5 md:h-6 mb-2 overflow-hidden relative w-full flex justify-center items-center px-1">
            <AnimatePresence mode="wait">
              {currentSub && (
                <motion.div
                  key={index}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full flex justify-center"
                >
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate w-full text-center px-1">
                    {currentSub}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NOME DO NEGÓCIO */}
          <h3 className="text-[15px] md:text-xl font-black text-slate-900 leading-[1.1] mb-2 md:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
            {business.name}
          </h3>

          {/* ENDEREÇO (TEXTO LIMPO) - Renderização Condicional */}
          {locationText && (
            <div className="flex items-center justify-center gap-1 text-slate-400 mt-auto px-1">
              <MapPin
                size={10}
                className="text-blue-600 shrink-0 md:w-3 md:h-3"
              />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide truncate">
                {locationText}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* --- BOTÃO WHATSAPP --- */}
      {wppLink ? (
        <div className="px-2 md:px-3 pb-2 md:pb-3 relative z-20 mt-auto">
          <a
            href={wppLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 bg-[#F0FDF4] text-emerald-600 hover:bg-emerald-500 hover:text-white py-2.5 md:py-3.5 rounded-xl md:rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border border-emerald-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 w-full group/btn"
          >
            <MessageCircle size={14} className="md:w-4 md:h-4" /> WhatsApp
          </a>
        </div>
      ) : (
        <div className="pb-3" />
      )}
    </motion.div>
  );
}
