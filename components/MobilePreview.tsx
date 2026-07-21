"use client";

import { memo } from "react";
import {
  Camera,
  MapPin,
  MessageCircle,
  Navigation,
  PhoneCall,
  Layout,
  Info,
} from "lucide-react";
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
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[5px] font-bold tracking-widest uppercase backdrop-blur-md shadow-sm">
      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
      ON
    </span>
  );
}

// Mock do "Double CTA" (Loja e Contato) da Atualização 3.0
function FakeDoubleCTA({ theme }: { theme: any }) {
  return (
    <div className="flex gap-1.5 w-full mt-3">
      <div
        className={`flex-1 py-1.5 rounded-lg text-[6px] font-bold uppercase text-white flex items-center justify-center gap-1 shadow-sm ${theme.bgAction}`}
      >
        <Layout size={8} /> Loja
      </div>
      <div
        className={`flex-1 py-1.5 rounded-lg text-[6px] font-bold uppercase flex items-center justify-center gap-1 shadow-sm border transition-colors ${theme.bgSecondary} ${theme.primary} ${theme.border}`}
      >
        <MessageCircle size={8} /> Contato
      </div>
    </div>
  );
}

// Mock das Abas "Perfil / Infos"
function FakeTabs({ theme }: { theme: any }) {
  return (
    <div className="flex justify-center mt-3 mb-2 w-full">
      <div
        className={`p-0.5 rounded-full border ${theme.border} bg-white/50 flex gap-0.5 shadow-sm`}
      >
        <div
          className={`px-3 py-1 rounded-full text-[5px] font-bold uppercase text-white ${theme.bgAction}`}
        >
          Perfil
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[5px] font-bold uppercase opacity-50`}
        >
          Infos
        </div>
      </div>
    </div>
  );
}

// Galeria de miniaturas reutilizável
function FakeGallery({
  gallery,
  roundedClass,
  textColor,
  primaryColor,
}: {
  gallery: string[];
  roundedClass: string;
  textColor: string;
  primaryColor?: string;
}) {
  return (
    <div className="w-full mt-2">
      <h3
        className={`text-[7px] font-bold uppercase mb-1.5 opacity-60 flex items-center gap-1 ${textColor}`}
      >
        <Camera size={8} className={primaryColor} /> Galeria
      </h3>
      <div className="flex gap-1 overflow-hidden flex-nowrap">
        {gallery.length > 0
          ? gallery
              .slice(0, 3)
              .map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`w-[60px] h-[70px] object-cover shrink-0 ${roundedClass} shadow-sm border border-black/5`}
                  alt=""
                />
              ))
          : [1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-[60px] h-[70px] bg-black/5 shrink-0 ${roundedClass} border border-black/5`}
              />
            ))}
      </div>
    </div>
  );
}

// Barra de ação WhatsApp (Ainda usada no Luxe e Urban)
function WhatsappBar({ bgAction }: { bgAction: string }) {
  return (
    <div
      className={`w-full py-2 rounded-lg text-[7px] font-bold uppercase tracking-widest text-white text-center flex items-center justify-center gap-1.5 shadow-sm ${bgAction}`}
    >
      <MessageCircle size={9} fill="white" /> Falar Conosco
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
      <div className="w-[240px] h-[500px] rounded-[2.5rem] shadow-2xl border-[6px] border-slate-900 overflow-hidden relative bg-black flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-b-xl z-30 pointer-events-none" />

        {/* ── 1. LUXE (Editorial) ── */}
        {layout === "editorial" && (
          <div
            className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}
          >
            <div
              className="relative w-full shrink-0 bg-slate-800"
              style={{
                aspectRatio: coverImage ? 3 / 4 : "auto",
                height: coverImage ? "auto" : "8rem",
              }}
            >
              {coverImage && (
                <img
                  src={coverImage}
                  className="w-full h-full object-cover absolute inset-0"
                  alt=""
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col items-center text-center px-4 -mt-8 relative z-10">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden bg-white shrink-0 mb-2">
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>

              <div className="mb-1.5">
                <FakeOpenBadge />
              </div>

              <h1
                className={`text-lg font-serif italic tracking-tight leading-none mb-0.5 ${theme.textColor}`}
              >
                {name || "Sua Marca"}
              </h1>

              {(luxe_quote || showroom_collection) && (
                <p
                  className={`text-[7px] italic opacity-50 mb-2 ${theme.textColor}`}
                >
                  {luxe_quote || showroom_collection}
                </p>
              )}

              <div
                className={`w-full py-2 rounded-full text-[7px] font-bold uppercase tracking-widest text-white shadow-sm mb-3 ${theme.bgAction}`}
              >
                {layoutLabel || "Ver Coleção"}
              </div>

              <p
                className={`text-[8px] font-light leading-relaxed opacity-70 ${theme.textColor}`}
              >
                {description?.slice(0, 90) ||
                  "A essência e a história da sua marca contada de forma elegante."}
              </p>

              <FakeGallery
                gallery={gallery}
                roundedClass="rounded-xl"
                textColor={theme.textColor}
                primaryColor={theme.primary}
              />
            </div>
          </div>
        )}

        {/* ── 2. URBAN ── */}
        {(layout === "urban" || layout === "influencer") && (
          <div
            className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}
          >
            <div
              className="relative w-full flex flex-col justify-center overflow-hidden shrink-0"
              style={{
                aspectRatio: coverImage ? 16 / 9 : "auto",
                height: coverImage ? "auto" : "6rem",
              }}
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  className="w-full h-full object-cover absolute inset-0"
                  alt=""
                />
              ) : (
                <div
                  className={`w-full h-full ${theme.bgHero || "bg-slate-900"}`}
                />
              )}
              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
                <FakeOpenBadge />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center mt-4 mb-2">
                <div className="w-12 h-12 rounded-xl border border-white/30 shadow-lg overflow-hidden bg-black mb-1.5">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10" />
                  )}
                </div>
                <h1 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">
                  {name || "Sua Marca"}
                </h1>
                {urban_tag && (
                  <span className="text-[5px] text-white/80 font-bold uppercase tracking-widest mt-1 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {urban_tag}
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pt-3 space-y-2.5">
              <WhatsappBar bgAction={theme.bgAction} />
              {description && (
                <p
                  className={`text-[8px] leading-relaxed opacity-70 ${theme.textColor}`}
                >
                  {description.slice(0, 90)}…
                </p>
              )}
              <FakeGallery
                gallery={gallery}
                roundedClass="rounded-lg"
                textColor={theme.textColor}
                primaryColor={theme.primary}
              />
            </div>
          </div>
        )}

        {/* ── 3. COMERCIAL 3.0 ── */}
        {layout === "businessList" && (
          <div
            className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}
          >
            {/* Capa */}
            <div
              className={`relative w-full shrink-0 ${theme.bgHero}`}
              style={{ height: "5rem" }}
            >
              {coverImage && (
                <img
                  src={coverImage}
                  className="w-full h-full object-cover absolute inset-0"
                  alt=""
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Cabeçalho */}
            <div className="px-4 -mt-6 relative z-10 flex items-end gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden ${theme.cardBg} shrink-0`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
              <div className="pb-0.5 flex flex-col items-start">
                <h1
                  className={`text-xs font-extrabold tracking-tight leading-none ${theme.textColor}`}
                >
                  {name || "Sua Marca"}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  {urban_tag && (
                    <span
                      className={`text-[5px] font-bold uppercase ${theme.primary}`}
                    >
                      {urban_tag}
                    </span>
                  )}
                  <FakeOpenBadge />
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 flex flex-col items-center">
              <FakeDoubleCTA theme={theme} />
              <FakeTabs theme={theme} />

              {/* Fake Card: Visão Geral */}
              <div
                className={`p-2.5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm w-full mt-1 flex flex-col gap-1.5`}
              >
                <h3
                  className={`text-[7px] font-bold flex items-center gap-1 opacity-90 ${theme.textColor}`}
                >
                  <Info size={8} className={theme.primary} /> Sobre nós
                </h3>
                <p
                  className={`text-[7px] leading-relaxed opacity-70 ${theme.textColor}`}
                >
                  {description?.slice(0, 70) ||
                    "Perfil focado em conversão e atendimento moderno."}
                  …
                </p>
              </div>

              {/* Fake Card: Galeria */}
              <div
                className={`p-2.5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm w-full mt-2`}
              >
                <FakeGallery
                  gallery={gallery}
                  roundedClass="rounded-lg"
                  textColor={theme.textColor}
                  primaryColor={theme.primary}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 4. SHOWROOM 3.0 ── */}
        {layout === "showroom" && (
          <div
            className={`flex-1 overflow-y-auto no-scrollbar ${theme.bgPage}`}
          >
            {/* Capa */}
            <div
              className={`relative w-full shrink-0 ${theme.bgHero}`}
              style={{ height: "4.5rem" }}
            >
              {coverImage && (
                <img
                  src={coverImage}
                  className="w-full h-full object-cover absolute inset-0"
                  alt=""
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Cabeçalho */}
            <div className="px-4 -mt-5 relative z-10 flex items-end gap-2 mb-2">
              <div
                className={`w-10 h-10 rounded-lg border-2 border-white shadow-sm overflow-hidden ${theme.cardBg} shrink-0`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
              <div className="pb-0.5 flex flex-col items-start">
                <h1
                  className={`text-xs font-bold tracking-tight leading-none ${theme.textColor}`}
                >
                  {name || "Sua Marca"}
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <FakeOpenBadge />
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 flex flex-col items-center">
              <FakeDoubleCTA theme={theme} />
              <FakeTabs theme={theme} />

              {/* Fake Card: Visão Geral */}
              <div
                className={`p-2 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm w-full mt-1 flex flex-col gap-1`}
              >
                <p
                  className={`text-[7px] leading-relaxed opacity-80 ${theme.textColor}`}
                >
                  {description?.slice(0, 60) ||
                    "Estrutura limpa, direta e profissional."}
                  …
                </p>
              </div>

              {/* Fake Card: Endereço */}
              <div
                className={`p-2 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm w-full mt-2 flex flex-col gap-1`}
              >
                <h3
                  className={`text-[6px] font-bold flex items-center gap-1 opacity-90 ${theme.textColor}`}
                >
                  <MapPin size={7} className={theme.primary} /> Endereço
                </h3>
                <p
                  className={`text-[6px] font-medium opacity-70 ${theme.textColor}`}
                >
                  Rua de Exemplo, 123 - Centro
                </p>
              </div>

              {/* Fake Card: Galeria */}
              <div
                className={`p-2 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm w-full mt-2`}
              >
                <FakeGallery
                  gallery={gallery}
                  roundedClass="rounded-md"
                  textColor={theme.textColor}
                  primaryColor={theme.primary}
                />
              </div>
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
