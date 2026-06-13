"use client";

import { memo } from "react";
import { Camera, MapPin, MessageCircle, Navigation, PhoneCall } from "lucide-react";
import { businessThemes } from "@/lib/themes";

interface MobilePreviewProps {
  themeKey: string;
  name: string;
  description: string;
  profileImage: string;
  coverImage?: string;
  gallery: string[];
  comercial_badge?: string;
  luxe_quote?: string;
  urban_tag?: string;
  showroom_collection?: string;
  layoutLabel: string;
}

// Badge ON/OFF Simulado para dar fidelidade ao Preview
function FakeOpenBadge() {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[6px] font-black tracking-widest uppercase backdrop-blur-md shadow-sm">
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
      ON
    </span>
  );
}

// Galeria de miniaturas reutilizável
function FakeGallery({
  gallery,
  roundedClass,
  textColor,
}: {
  gallery: string[];
  roundedClass: string;
  textColor: string;
}) {
  return (
    <div className="w-full mt-4">
      <h3 className={`text-[8px] font-black uppercase mb-2 opacity-40 flex items-center gap-1 ${textColor}`}>
        <Camera size={9} /> Catálogo
      </h3>
      <div className="flex gap-1.5 overflow-hidden flex-nowrap">
        {gallery.length > 0
          ? gallery.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                className={`w-[72px] h-[88px] object-cover shrink-0 ${roundedClass}`}
                alt=""
              />
            ))
          : [1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-[72px] h-[88px] bg-black/10 shrink-0 ${roundedClass}`}
              />
            ))}
      </div>
    </div>
  );
}

// Barra de ação WhatsApp
function WhatsappBar({ bgAction }: { bgAction: string }) {
  return (
    <div
      className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white text-center flex items-center justify-center gap-1.5 ${bgAction}`}
    >
      <MessageCircle size={10} fill="white" /> WhatsApp
    </div>
  );
}

function MobilePreview({
  themeKey,
  name,
  description,
  profileImage,
  coverImage,
  gallery,
  comercial_badge,
  luxe_quote,
  urban_tag,
  showroom_collection,
  layoutLabel,
}: MobilePreviewProps) {
  const theme = businessThemes[themeKey] || businessThemes["urban_gold"];
  const layout = theme?.layout || "urban";

  return (
    <div className="flex flex-col items-center w-full">
      {/* MOLDURA DO CELULAR */}
      <div className="w-[260px] h-[540px] rounded-[3rem] shadow-2xl border-[7px] border-slate-900 overflow-hidden relative bg-black flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-30 pointer-events-none" />

        {/* ── 1. LUXE (Editorial) ── */}
        {layout === "editorial" && (
          <div className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}>
            {/* Hero adaptado ao formato de recorte */}
            <div
              className="relative w-full shrink-0 bg-slate-800"
              style={{ aspectRatio: coverImage ? 3 / 4 : "auto", height: coverImage ? "auto" : "8rem" }}
            >
              {coverImage && (
                <img src={coverImage} className="w-full h-full object-cover absolute inset-0" alt="" />
              )}
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Avatar flutuando sobre o hero */}
            <div className="flex flex-col items-center text-center px-4 -mt-10 relative z-10">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 mb-2">
                {profileImage ? (
                  <img src={profileImage} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>

              <div className="mb-2">
                <FakeOpenBadge />
              </div>

              <h1 className={`text-xl font-serif italic tracking-tight leading-none mb-0.5 ${theme.textColor}`}>
                {name || "Sua Marca"}
              </h1>

              {(luxe_quote || showroom_collection) && (
                <p className={`text-[8px] italic opacity-50 mb-2 ${theme.textColor}`}>
                  {luxe_quote || showroom_collection}
                </p>
              )}

              <div className={`w-full py-2 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-md mb-3 ${theme.bgAction}`}>
                {layoutLabel || "Ver Coleção"}
              </div>

              <p className={`text-[9px] font-light leading-relaxed opacity-70 ${theme.textColor}`}>
                {description?.slice(0, 100) || "A essência e a história da sua marca contada de forma elegante."}
              </p>

              <FakeGallery gallery={gallery} roundedClass="rounded-xl" textColor={theme.textColor} />
            </div>
          </div>
        )}

        {/* ── 2. URBAN ── */}
        {(layout === "urban" || layout === "influencer") && (
          <div className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}>
            <div className="relative w-full flex flex-col justify-center overflow-hidden shrink-0" style={{ aspectRatio: coverImage ? 16 / 9 : "auto" }}>
              {coverImage ? (
                <img src={coverImage} className="w-full h-full object-cover absolute inset-0" alt="" />
              ) : (
                <div className={`w-full h-24 ${theme.bgHero || "bg-slate-900"}`} />
              )}
              <div className="absolute inset-0 bg-black/40" />

              {/* 🚀 ON/OFF NO TOPO DA CAPA IGUAL AO ORIGINAL */}
              <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
                <FakeOpenBadge />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center mt-4 mb-4">
                <div className="w-14 h-14 rounded-[1.2rem] border-2 border-white/30 shadow-lg overflow-hidden bg-black mb-2">
                  {profileImage ? (
                    <img src={profileImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-white/10" />
                  )}
                </div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {name || "Sua Marca"}
                </h1>
                {/* 🚀 TAG INVERTIDA PARA BAIXO DO NOME */}
                {urban_tag && (
                  <span className="text-[6px] text-white/80 font-bold uppercase tracking-widest mt-1 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {urban_tag}
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pt-4 space-y-3">
              <WhatsappBar bgAction={theme.bgAction} />
              {description && (
                <p className={`text-[9px] leading-relaxed opacity-70 ${theme.textColor}`}>
                  {description.slice(0, 100)}…
                </p>
              )}
              <FakeGallery gallery={gallery} roundedClass="rounded-[0.8rem]" textColor={theme.textColor} />
            </div>
          </div>
        )}

        {/* ── 3. COMERCIAL ── */}
        {layout === "businessList" && (
          <div className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}>
            <div className="relative w-full shrink-0" style={{ aspectRatio: coverImage ? 21 / 9 : "auto", height: coverImage ? "auto" : "5rem" }}>
              {coverImage && (
                <img src={coverImage} className="w-full h-full object-cover absolute inset-0" alt="" />
              )}
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="px-4 -mt-8 relative z-10 flex items-end gap-3 mb-4">
              <div className="w-14 h-14 rounded-[1.2rem] border-[3px] border-white shadow-md overflow-hidden bg-white shrink-0">
                {profileImage ? (
                  <img src={profileImage} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
              <div className="pb-1 flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-1">
                  {comercial_badge && (
                    <span className={`text-[6px] font-black uppercase text-white px-1.5 py-0.5 rounded ${theme.bgAction}`}>
                      {comercial_badge}
                    </span>
                  )}
                  <FakeOpenBadge />
                </div>
                <h1 className="text-sm font-black italic tracking-tight leading-none text-white drop-shadow-sm">
                  {name || "Sua Marca"}
                </h1>
              </div>
            </div>

            <div className="px-4 space-y-3">
              <WhatsappBar bgAction={theme.bgAction} />
              <div className={`w-full p-3 rounded-2xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
                <p className={`text-[9px] leading-relaxed opacity-80 ${theme.textColor}`}>
                  {description?.slice(0, 90) || "Perfil focado em conversão, catálogos e atendimento via WhatsApp."}
                </p>
              </div>
              <FakeGallery gallery={gallery} roundedClass="rounded-xl" textColor={theme.textColor} />
            </div>
          </div>
        )}

        {/* ── 4. SHOWROOM ── */}
        {layout === "showroom" && (
          <div className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}>
            <div className="relative w-full shrink-0" style={{ aspectRatio: coverImage ? 21 / 9 : "auto", height: coverImage ? "auto" : "6rem" }}>
              {coverImage && (
                <img src={coverImage} className="w-full h-full object-cover absolute inset-0" alt="" />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="px-4 -mt-7 relative z-10 flex items-end justify-between mb-4">
              <div className="flex items-end gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white shrink-0">
                  {profileImage ? (
                    <img src={profileImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
                <div className="pb-0.5 text-left">
                  <h1 className={`text-sm font-extrabold tracking-tight leading-none ${theme.textColor}`}>
                    {name || "Sua Marca"}
                  </h1>
                  {showroom_collection && (
                    <span className="text-[6px] font-bold uppercase tracking-widest opacity-40 block mt-0.5">
                      {showroom_collection}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-0.5">
                <FakeOpenBadge />
              </div>
            </div>

            <div className="px-4 space-y-3">
              <div className="flex gap-1.5">
                <WhatsappBar bgAction={theme.bgAction} />
                <div className={`flex-1 py-2 rounded-xl text-[7px] font-black uppercase text-center border ${theme.border} ${theme.textColor} flex items-center justify-center gap-0.5`}>
                  Rota
                </div>
              </div>

              {description && (
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.cardBg}`}>
                  <p className={`text-[9px] leading-relaxed opacity-70 ${theme.textColor}`}>
                    {description.slice(0, 90)}…
                  </p>
                </div>
              )}
              <FakeGallery gallery={gallery} roundedClass="rounded-lg" textColor={theme.textColor} />
            </div>
          </div>
        )}
      </div>

      {/* Label do layout */}
      <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
        {layoutLabel}
      </p>
    </div>
  );
}

export default memo(MobilePreview);