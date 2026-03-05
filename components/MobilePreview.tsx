"use client";

import React from "react";
import {
  Smartphone,
  Camera,
  Instagram,
  MessageCircle,
  Globe,
} from "lucide-react";
import { businessThemes } from "@/lib/themes";

export default function MobilePreview({
  themeKey,
  name,
  description,
  profileImage,
  gallery,
  comercial_badge,
  luxe_quote,
  urban_tag,
  showroom_collection, // 👈 Showroom agora está aqui!
  layoutLabel,
}: any) {
  const theme = businessThemes[themeKey] || businessThemes["comercial_neutral"];
  const layout = theme.layout;

  // O Showroom usa o showroom_collection, se não tiver, tenta usar o luxe_quote
  const specialText = showroom_collection || luxe_quote;

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      <div className="w-[280px] h-[580px] rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative bg-black">
        <div
          className={`w-full h-full overflow-y-auto no-scrollbar ${theme.bgPage} transition-all duration-700`}
        >
          <div className="sticky top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 mb-[-24px]" />

          <div className="pt-12 px-5 pb-10 flex flex-col items-center">
            {/* FOTO DE PERFIL */}
            <div
              className={`mb-4 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center shrink-0 transition-all
              ${layout === "urban" ? `${theme.radius} ${theme.border} bg-black` : "rounded-full bg-white"} 
              ${layout === "showroom" ? "w-20 h-20" : "w-24 h-24"}
            `}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 opacity-50" />
              )}
            </div>

            {/* COMERCIAL BADGE */}
            {layout === "businessList" && comercial_badge && (
              <span
                className={`${theme.bgAction} px-3 py-1 rounded-md text-[8px] font-black uppercase text-white mb-3`}
              >
                {comercial_badge}
              </span>
            )}

            {/* NOME */}
            <h1
              className={`text-center leading-none mb-2 ${theme.textColor}
              ${layout === "urban" ? "text-3xl font-black italic uppercase skew-x-[-6deg]" : "text-3xl font-black tracking-tighter"}
            `}
            >
              {name || "Nome do Negócio"}
            </h1>

            {/* TEXTO ESPECIAL (Luxe / Showroom) */}
            {(layout === "editorial" || layout === "showroom") &&
              specialText && (
                <p
                  className={`text-[10px] font-medium italic opacity-50 mb-4 text-center ${theme.textColor}`}
                >
                  {specialText}
                </p>
              )}

            {/* URBAN TAG */}
            {layout === "urban" && urban_tag && (
              <div className="w-full overflow-hidden py-1 border-y border-white/10 mb-6 bg-white/5">
                <div
                  className={`whitespace-nowrap text-[10px] font-black italic uppercase ${theme.primary} animate-pulse`}
                >
                  {urban_tag} /// {urban_tag}
                </div>
              </div>
            )}

            {/* BOTÃO DE AÇÃO */}
            <div
              className={`w-full py-3 text-[10px] font-black uppercase text-center mb-8 ${theme.bgAction} ${theme.radius || "rounded-xl"} ${layout === "urban" ? "text-black" : "text-white"}`}
            >
              {layoutLabel || "CONTATO"}
            </div>

            {/* SOBRE (Showroom com Sticker) */}
            <div
              className={`w-full p-4 mb-6 ${layout === "urban" || layout === "businessList" ? `${theme.cardBg} border ${theme.border} ${theme.radius}` : ""}`}
            >
              {layout === "showroom" && (
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 ${theme.bgAction}`} />
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest ${theme.subTextColor}`}
                  >
                    Concept
                  </span>
                </div>
              )}
              <p
                className={`text-[10px] leading-relaxed ${theme.textColor} opacity-70`}
              >
                {description}
              </p>
            </div>

            {/* GALERIA (Mosaico Showroom) */}
            <div className="w-full">
              <h3
                className={`text-[9px] font-black uppercase mb-3 opacity-30 flex items-center gap-2 ${theme.textColor}`}
              >
                <Camera size={12} />{" "}
                {layout === "showroom" ? "Showroom" : "Vitrine"}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {gallery.slice(0, 4).map((img: any, i: any) => (
                  <div
                    key={i}
                    className={`aspect-square overflow-hidden bg-slate-200/20 ${theme.radius || "rounded-2xl"} ${layout === "showroom" && i === 0 ? "col-span-2 h-32" : ""}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
