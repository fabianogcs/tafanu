"use client";

import Link from "next/link";
import { MapPin, MessageCircle, Map, Sparkles, Navigation } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function BusinessCard({
  business,
  isLoggedIn,
  forceMatch = false,
}: any) {
  // --- 1. FAVORITOS ---
  const isFavorited =
    forceMatch === true ||
    (business.favorites && business.favorites.length > 0) ||
    business.isFavorite === true;

  const favoriteCount = business._count?.favorites || 0;

  // --- 2. SUBCATEGORIAS ---
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
    if (allSubcategories.length > 2) {
      const timer = setInterval(() => {
        setIndex((prev) =>
          prev + 2 >= allSubcategories.length ? 0 : prev + 2,
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [allSubcategories.length]);

  const visibleTags = allSubcategories.slice(index, index + 2);

  // --- 3. CONTATO ---
  const rawPhone = business.whatsapp || business.phone;
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, "") : null;
  const wppLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  // --- 4. ENDEREÇO E MAPA ---
  const street = business.address?.split(",")[0];
  const locationParts = [
    street,
    business.number,
    business.neighborhood,
    business.city && business.state
      ? `${business.city}/${business.state}`
      : business.city || business.state,
  ].filter((part) => part && part.trim() !== "");

  const locationText = locationParts.join(" • ");

  const addressQuery = [
    street,
    business.number,
    business.neighborhood,
    business.city,
    business.state,
  ]
    .filter(Boolean)
    .join(", ");

  const mapLink =
    street || business.city
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`
      : null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className="relative bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(2,48,89,0.12)] transition-all duration-500 group flex flex-col h-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* --- FAVORITO E CONTADOR --- */}
      <div className="absolute top-3 right-3 z-30">
        <div className="bg-white/70 backdrop-blur-md pl-1.5 pr-2.5 py-1.5 rounded-full shadow-sm border border-white/60 hover:scale-105 transition-transform flex items-center gap-1.5">
          <FavoriteButton
            businessId={business.id}
            initialIsFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
          />
          {favoriteCount > 0 && (
            <span className="text-[10px] font-black text-slate-600">
              {favoriteCount}
            </span>
          )}
        </div>
      </div>

      <Link
        href={`/site/${business.slug}`}
        className="flex flex-col flex-1 relative z-10"
      >
        {/* IMAGEM E DISTÂNCIA */}
        <div className="p-2 pb-0">
          <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden rounded-[24px] shadow-inner">
            <img
              src={business.imageUrl || "/og-default.png"}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            {/* BADGE DE DISTÂNCIA (NOVO) */}
            {business.distance !== null && business.distance !== undefined && (
              <div className="absolute top-3 left-3">
                <div className="bg-tafanu-blue text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/20 animate-in fade-in zoom-in duration-500">
                  <Navigation size={10} className="fill-white" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {business.distance < 1
                      ? `${(business.distance * 1000).toFixed(0)}m`
                      : `${business.distance.toFixed(1)}km`}
                  </span>
                </div>
              </div>
            )}

            {/* BADGE CATEGORIA */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[90%]">
              <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg border border-white/30 truncate">
                <Sparkles size={10} className="text-tafanu-action shrink-0" />
                {business.category || "Geral"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-5 flex flex-col flex-1 items-center text-center">
          <div className="h-6 mb-3 overflow-hidden relative w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="flex flex-wrap justify-center gap-1.5 absolute w-full px-2"
              >
                {visibleTags.length > 0 ? (
                  visibleTags.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg uppercase border border-slate-200/50 whitespace-nowrap tracking-wide"
                    >
                      {sub}
                    </span>
                  ))
                ) : (
                  <div className="w-full h-full" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-tafanu-blue transition-colors line-clamp-2 px-2">
            {business.name}
          </h3>

          <div className="flex items-start justify-center gap-1.5 text-slate-400 mt-auto px-2">
            <MapPin size={12} className="text-tafanu-blue mt-0.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
              {locationText || "Ver localização no mapa"}
            </span>
          </div>
        </div>
      </Link>

      {/* --- BOTÕES --- */}
      {wppLink || mapLink ? (
        <div className="p-2 pt-0 mt-auto grid grid-cols-2 gap-2 relative z-20">
          {wppLink ? (
            <a
              href={wppLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-[#F0FDF4] text-emerald-600 hover:bg-emerald-500 hover:text-white py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 group/btn"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          ) : (
            <div />
          )}

          {mapLink ? (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-slate-50 text-slate-500 hover:bg-tafanu-blue hover:text-white py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-tafanu-blue hover:shadow-lg hover:shadow-tafanu-blue/20 group/btn"
            >
              <Map size={16} /> Rota
            </a>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <div className="pb-4" />
      )}
    </motion.div>
  );
}
