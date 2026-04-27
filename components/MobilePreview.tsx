"use client";

import { memo } from "react";
import { Camera } from "lucide-react";
import { businessThemes } from "@/lib/themes";

interface MobilePreviewProps {
  themeKey: string;
  name: string;
  description: string;
  profileImage: string;
  gallery: string[];
  comercial_badge?: string;
  luxe_quote?: string;
  urban_tag?: string;
  showroom_collection?: string;
  layoutLabel: string;
}

function MobilePreview({
  themeKey,
  name,
  description,
  profileImage,
  gallery,
  comercial_badge,
  luxe_quote,
  urban_tag,
  showroom_collection,
  layoutLabel,
}: MobilePreviewProps) {
  const theme = businessThemes[themeKey] || businessThemes["urban_gold"];
  const layout = theme?.layout || "urban";
  const specialText = showroom_collection || luxe_quote;

  // Renderiza a galeria de forma leve (apenas HTML nativo)
  const renderFakeGallery = (roundedClass: string) => (
    <div className="w-full mt-4">
      <h3
        className={`text-[9px] font-black uppercase mb-2 opacity-40 flex items-center gap-1 ${theme.textColor}`}
      >
        <Camera size={10} /> Catálogo
      </h3>
      <div className="flex gap-2 overflow-hidden flex-nowrap">
        {gallery.length > 0
          ? gallery
              .slice(0, 3)
              .map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`w-20 h-24 object-cover shrink-0 ${roundedClass}`}
                  alt="thumb"
                />
              ))
          : [1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-20 h-24 bg-slate-200/30 shrink-0 ${roundedClass}`}
              />
            ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* MOLDURA DO CELULAR */}
      <div className="w-[280px] h-[580px] rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative bg-black">
        {/* O "Notch" do celular */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50" />

        {/* ---------------------------------------------------
            1. LAYOUT LUXE (Editorial)
            --------------------------------------------------- */}
        {layout === "editorial" && (
          <div
            className={`w-full h-full overflow-y-auto no-scrollbar ${theme.bgPage} relative`}
          >
            {/* Fundo do Header */}
            <div className={`w-full h-36 ${theme.bgHero || "bg-slate-200"}`} />

            <div className="px-5 -mt-12 flex flex-col items-center text-center relative z-10">
              {/* Logo Redonda Sobreposta */}
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 mb-3">
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>

              <h1
                className={`text-3xl font-serif italic tracking-tight leading-none mb-1 ${theme.textColor}`}
              >
                {name || "Sua Marca"}
              </h1>

              {specialText && (
                <p
                  className={`text-[10px] font-medium italic opacity-50 mb-3 ${theme.textColor}`}
                >
                  {specialText}
                </p>
              )}

              <div
                className={`w-full py-3 rounded-full text-[9px] font-black uppercase text-white tracking-widest shadow-lg ${theme.bgAction}`}
              >
                {layoutLabel || "Reservar"}
              </div>

              <p
                className={`text-[10px] font-light leading-relaxed mt-5 opacity-70 ${theme.textColor}`}
              >
                {description ||
                  "A essência e a história da sua marca contada de forma elegante e sofisticada para encantar seus clientes."}
              </p>

              {renderFakeGallery("rounded-xl")}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------
            2. LAYOUT URBAN
            --------------------------------------------------- */}
        {(layout === "urban" || layout === "influencer") && (
          <div
            className={`w-full h-full overflow-y-auto no-scrollbar ${theme.bgPage}`}
          >
            <div
              className={`pt-14 pb-6 px-5 flex flex-col ${theme.bgHero || "bg-slate-900"} rounded-b-[2rem] shadow-lg`}
            >
              {urban_tag && (
                <span className="text-[8px] text-white/70 font-black uppercase tracking-widest mb-2">
                  {urban_tag}
                </span>
              )}

              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-[1.1] mb-4">
                {name || "Sua Marca"}
              </h1>

              <div className="flex gap-3">
                <div
                  className={`w-16 h-16 rounded-[1.2rem] border-2 border-white/20 shadow-inner overflow-hidden bg-black shrink-0`}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      className="w-full h-full object-cover"
                      alt="Logo"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10" />
                  )}
                </div>
                <p className="text-[9px] text-white/80 font-medium leading-tight flex-1">
                  {description?.slice(0, 80) ||
                    "Impacto visual forte e direto. Conecte-se com sua audiência urbana."}
                  ...
                </p>
              </div>
            </div>

            <div className="px-5 mt-5">
              <div
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md text-black text-center ${theme.bgAction}`}
              >
                {layoutLabel || "Contato Rápido"}
              </div>
              {renderFakeGallery("rounded-[1rem]")}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------
            3. LAYOUT COMERCIAL (BusinessList)
            --------------------------------------------------- */}
        {layout === "businessList" && (
          <div
            className={`w-full h-full overflow-y-auto no-scrollbar ${theme.bgPage} px-4 pt-12`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-16 h-16 rounded-[1.2rem] border-[3px] border-white shadow-md overflow-hidden bg-white shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
              <div className="flex flex-col">
                {comercial_badge && (
                  <span
                    className={`text-[8px] font-black uppercase text-white px-2 py-0.5 rounded w-fit mb-1 ${theme.bgAction}`}
                  >
                    {comercial_badge}
                  </span>
                )}
                <h1
                  className={`text-2xl font-black italic tracking-tighter leading-none ${theme.textColor}`}
                >
                  {name || "Sua Marca"}
                </h1>
              </div>
            </div>

            <div
              className={`w-full p-4 rounded-2xl border ${theme.border} ${theme.cardBg} shadow-sm mb-4`}
            >
              <p
                className={`text-[10px] leading-relaxed opacity-80 ${theme.textColor}`}
              >
                {description ||
                  "O perfil ideal para negócios locais que focam em conversão, catálogos e atendimento via WhatsApp."}
              </p>
              <div
                className={`w-full py-2.5 mt-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center text-white ${theme.bgAction}`}
              >
                {layoutLabel || "Comprar Agora"}
              </div>
            </div>

            {renderFakeGallery("rounded-2xl")}
          </div>
        )}

        {/* ---------------------------------------------------
            4. LAYOUT SHOWROOM
            --------------------------------------------------- */}
        {layout === "showroom" && (
          <div
            className={`w-full h-full overflow-y-auto no-scrollbar ${theme.bgPage} pt-14 px-5`}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className={`w-14 h-14 rounded-2xl border ${theme.border} shadow-sm overflow-hidden bg-white shrink-0 mb-3`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
              <h1
                className={`text-2xl font-extrabold tracking-tight leading-none mb-1 ${theme.textColor}`}
              >
                {name || "Sua Marca"}
              </h1>
              {specialText && (
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 border border-black/10 px-2 py-0.5 rounded mt-1">
                  {specialText}
                </span>
              )}
            </div>

            <div
              className={`w-full py-3 rounded-full text-[9px] font-black uppercase text-white tracking-widest shadow-md text-center mb-5 ${theme.bgAction}`}
            >
              {layoutLabel || "Ver Coleção"}
            </div>

            <div className="flex gap-2 mb-2">
              <div className={`w-1.5 h-3 ${theme.bgAction} rounded-full`} />
              <p
                className={`text-[10px] leading-relaxed opacity-70 ${theme.textColor}`}
              >
                {description ||
                  "Design limpo, minimalista e focado em apresentar os detalhes dos seus produtos."}
              </p>
            </div>

            {renderFakeGallery("rounded-xl")}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MobilePreview);
