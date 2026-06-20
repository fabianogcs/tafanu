"use client";

import React from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Smartphone,
  Palette,
  Lock,
  Unlock,
  AlertTriangle,
  AlertOctagon, // Ícone novo para chamar atenção
} from "lucide-react";
import { layoutInfo } from "./constants";
import { businessThemes } from "@/lib/themes";
import { CoverImageSection } from "./CoverImageSection";

interface IdentitySectionProps {
  name: string;
  handleNameChange: (val: string) => void;
  nameError: boolean;
  nameRef: React.RefObject<HTMLInputElement | null>;
  slug: string;
  handleSlugChange: (val: string) => void;
  slugError: boolean;
  slugRef: React.RefObject<HTMLInputElement | null>;
  isNew: boolean;
  safeBusinessSlug: string;
  profileImage: string;
  setProfileImage: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  isUploadingLogo: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedLayout: string;
  setSelectedLayout: (val: string) => void;
  layoutText: string;
  setLayoutText: (val: string) => void;
  selectedTheme: string;
  setSelectedTheme: (val: string) => void;
  filteredThemeKeys: string[];
}

export function IdentitySection({
  name,
  handleNameChange,
  nameError,
  nameRef,
  slug,
  handleSlugChange,
  slugError,
  slugRef,
  isNew,
  safeBusinessSlug,
  profileImage,
  setProfileImage,
  coverImage,
  setCoverImage,
  isUploadingLogo,
  fileInputRef,
  handleFileChange,
  selectedLayout,
  setSelectedLayout,
  layoutText,
  setLayoutText,
  selectedTheme,
  setSelectedTheme,
  filteredThemeKeys,
}: IdentitySectionProps) {
  const currentLayoutData = layoutInfo[selectedLayout] || layoutInfo["urban"];
  const isChanged = !isNew && slug !== safeBusinessSlug;

  // 1. A IMPRESSÃO DIGITAL: Verifica se o link original tem exatamente o padrão gerado pelo Backend
  // Padrão 1: "vitrine-" + 5 caracteres + "-" + 13 números (Date.now)
  // Padrão 2: "loja-" + 8 caracteres + "-" + 4 números (usado no adminActivateVisitor)
  const isGhostOriginal =
    /^vitrine-[a-z0-9]{5}-\d{13}$/i.test(safeBusinessSlug) ||
    /^loja-[a-z0-9]{8}-\d{4}$/i.test(safeBusinessSlug);

  // 2. Verifica se o usuário já limpou os dados genéricos
  const stillHasGhostName =
    name === "Minha Vitrine" || name === "Vitrine Oculta";
  const stillHasGhostSlug = slug === safeBusinessSlug;

  // 3. O RADAR FINAL: Só pisca a sirene se a loja nasceu fantasma E a pessoa ainda não editou os DOIS campos!
  const isGhostBusiness =
    isGhostOriginal && (stillHasGhostName || stillHasGhostSlug);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
        {/* 🚨 O ALERTA GIGANTE (Só aparece para a loja fantasma) */}
        {isGhostBusiness && (
          <div className="absolute top-0 left-0 w-full bg-rose-500 text-white p-3 md:p-4 flex items-center justify-center gap-3 animate-pulse shadow-md z-10">
            <AlertOctagon size={20} className="shrink-0" />
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center leading-tight">
              Ação Necessária: Mude o "Nome" e o "Link" abaixo para personalizar
              seu site!
            </p>
          </div>
        )}

        {/* ==============================================
            📸 PAINEL DE MÍDIA COMPACTO (Capa e Logo Lado a Lado)
            ============================================== */}
        <div className="w-full flex flex-row items-start justify-center gap-6 md:gap-12 mt-8 mb-6 px-2">
          {/* COLUNA 1: FOTO DE CAPA */}
          <div className="flex-1 flex flex-col items-center max-w-[160px] md:max-w-[220px]">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">
              Capa
            </p>
            <CoverImageSection
              coverImage={coverImage}
              setCoverImage={setCoverImage}
              selectedLayout={selectedLayout}
            />
          </div>

          {/* DIVISÓRIA SUTIL */}
          <div className="w-px h-32 bg-slate-100 shrink-0 hidden sm:block" />

          {/* COLUNA 2: LOGO / PERFIL */}
          <div className="flex flex-col items-center shrink-0">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">
              Logo
            </p>
            <div className="relative w-24 h-24 md:w-32 md:h-32 group">
              <div
                className="w-full h-full rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-indigo-100 transition-colors"
                onClick={() =>
                  !isUploadingLogo && fileInputRef.current?.click()
                }
              >
                {isUploadingLogo ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2
                      className="animate-spin text-indigo-500"
                      size={20}
                    />
                    <span className="text-[7px] font-black uppercase text-indigo-500 tracking-widest">
                      Upload
                    </span>
                  </div>
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Plus
                    size={28}
                    className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                  />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {profileImage && !isUploadingLogo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileImage("");
                  }}
                  className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-4 tracking-widest text-center">
              Formato 1:1
              <br />
              Máx: 6MB
            </p>
          </div>
        </div>

        {/* NOME */}
        <div className="w-full relative group mb-2">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest mb-1 block transition-colors ${isGhostBusiness ? "text-rose-500 animate-bounce" : "text-indigo-400 opacity-60"}`}
          >
            Nome do Negócio
          </label>
          <input
            ref={nameRef}
            value={name}
            maxLength={100} // 🚀 TRAVA UX (Sincronizado com o Back-end)
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full text-center bg-transparent text-2xl md:text-3xl font-black outline-none border-b-2 py-2 italic tracking-tighter transition-all ${
              nameError
                ? "border-rose-500 text-rose-600 bg-rose-50 animate-pulse"
                : isGhostBusiness
                  ? "border-rose-300 text-slate-400 focus:text-slate-900 focus:border-indigo-500"
                  : "border-dashed border-slate-300 focus:border-indigo-500 hover:bg-slate-50 text-slate-900"
            }`}
            placeholder="Digite o Nome Aqui..."
          />
        </div>

        {/* SLUG (LINK) */}
        <div className="w-full relative group mb-8 px-4 mt-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center justify-center gap-2 tracking-widest">
            <span className="bg-slate-100 px-2 py-1 rounded">
              tafanu.com.br/site/
            </span>
            {!isNew &&
              (isChanged ? (
                <Unlock size={12} className="text-amber-500" />
              ) : (
                <Lock size={12} className="text-slate-300" />
              ))}
          </label>
          <input
            ref={slugRef}
            value={slug}
            maxLength={60} // 🚀 TRAVA UX (Sincronizado com o Back-end)
            onChange={(e) => handleSlugChange(e.target.value)}
            className={`w-full text-center text-sm font-bold font-mono outline-none border-2 py-3 rounded-xl transition-all ${
              slugError
                ? "bg-rose-50 border-rose-500 text-rose-700 animate-pulse"
                : isChanged
                  ? "bg-amber-50 border-amber-400 text-amber-700 ring-4 ring-amber-100"
                  : isGhostBusiness
                    ? "bg-rose-50 border-rose-200 text-rose-400 focus:text-slate-900 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          />

          {/* 🚀 O AVISO DE CUIDADO AGORA É INTELIGENTE */}
          {/* Se a pessoa está na loja fantasma, nós QUEREMOS que ela mude. Então NÃO mostramos o aviso de perigo. */}
          {isChanged && !isGhostBusiness && (
            <div className="mt-2 text-[10px] font-black uppercase text-amber-600 flex items-center justify-center gap-1 animate-pulse">
              <AlertTriangle size={12} /> Cuidado: Links antigos vão parar de
              funcionar!
            </div>
          )}
        </div>
        {/* LAYOUTS */}
        <div className="w-full mt-10 pt-8 border-t border-slate-100">
          <h2 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-widest text-left mb-6 flex items-center gap-2">
            🎨 Escolha o Design da sua Vitrine
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {Object.keys(layoutInfo).map((key) => {
              const isSelected = selectedLayout === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedLayout(key)}
                  className={`p-4 md:p-6 rounded-[1.5rem] border-2 flex flex-col items-center gap-3 transition-all duration-300 group ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                >
                  <div
                    className={`transition-transform duration-300 ${isSelected ? "scale-110 text-emerald-400" : "group-hover:scale-110"}`}
                  >
                    {layoutInfo[key].icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {layoutInfo[key].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TEXTO ESPECIAL */}
        <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-dashed border-slate-200 w-full mt-6 text-left">
          <label className="text-[9px] font-black uppercase text-indigo-500 block mb-2">
            {currentLayoutData.label} - Texto Especial
          </label>
          <input
            value={layoutText}
            maxLength={40} // 🚀 TRAVA NATIVA HTML
            onChange={(e) => setLayoutText(e.target.value.slice(0, 40))}
            className="w-full h-12 px-5 rounded-xl bg-white border font-bold text-xs shadow-sm outline-none"
            placeholder={currentLayoutData.placeholder}
          />
        </div>
      </div>

      {/* TEMAS */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
          <Palette size={16} /> Cores e Temas
        </h3>
        <div className="grid grid-cols-6 md:grid-cols-10 gap-4">
          {filteredThemeKeys.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTheme(t)}
              className={`aspect-square rounded-full transition-all relative ${selectedTheme === t ? "ring-2 ring-offset-2 ring-slate-900 scale-90" : "hover:scale-110"}`}
              style={{ background: businessThemes[t].previewColor }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
