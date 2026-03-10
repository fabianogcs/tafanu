"use client";

import React from "react";
import { Loader2, Plus, Trash2, Smartphone, Palette } from "lucide-react";
import { layoutInfo } from "./constants";
import { businessThemes } from "@/lib/themes";

interface IdentitySectionProps {
  name: string;
  handleNameChange: (val: string) => void;
  nameError: boolean;
  // 🛡️ Tipagem correta para Refs de inputs do React
  nameRef: React.RefObject<HTMLInputElement | null>;
  slug: string;
  handleSlugChange: (val: string) => void;
  slugError: boolean;
  slugRef: React.RefObject<HTMLInputElement | null>;
  isNew: boolean;
  safeBusinessSlug: string;
  profileImage: string;
  setProfileImage: (val: string) => void;
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

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center">
        {/* FOTO DE PERFIL */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4 group">
          <div
            className="w-full h-full rounded-full bg-slate-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center relative cursor-pointer"
            onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
          >
            {isUploadingLogo ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-indigo-500" size={24} />
                <span className="text-[8px] font-black uppercase text-indigo-500">
                  Enviando...
                </span>
              </div>
            ) : profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" />
            ) : (
              <Plus
                size={40}
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
              className="absolute bottom-1 right-1 bg-rose-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="mb-8 px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-full">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-500">
            💡 Clique na bola para enviar (MÁX: 4MB)
          </p>
        </div>

        {/* NOME */}
        <div className="w-full relative group mb-2">
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 block opacity-60">
            Nome do Negócio
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full text-center bg-transparent text-2xl md:text-3xl font-black outline-none border-b-2 py-2 italic tracking-tighter transition-all ${
              nameError
                ? "border-rose-500 text-rose-600 bg-rose-50 animate-pulse"
                : "border-dashed border-slate-300 focus:border-indigo-500 hover:bg-slate-50 text-slate-900"
            }`}
            placeholder="Digite o Nome Aqui..."
          />
        </div>

        {/* SLUG (LINK) */}
        <div className="w-full relative group mb-8 px-4 mt-4">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
            <span className="bg-slate-100 px-2 py-1 rounded">
              tafanu.com.br/site/
            </span>
          </label>
          <input
            ref={slugRef}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={`w-full text-center text-sm font-bold font-mono outline-none border-2 py-3 rounded-xl transition-all ${
              slugError
                ? "bg-rose-50 border-rose-500 text-rose-700 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          />
        </div>

        {/* LAYOUTS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mt-10 pt-8 border-t border-slate-50">
          {Object.keys(layoutInfo).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedLayout(key)}
              className={`p-4 md:p-6 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all ${
                selectedLayout === key
                  ? "border-slate-900 bg-slate-50 text-slate-900"
                  : "border-slate-50 text-slate-300"
              }`}
            >
              {layoutInfo[key].icon}
              <span className="text-[9px] font-black uppercase">
                {layoutInfo[key].label}
              </span>
            </button>
          ))}
        </div>

        {/* TEXTO ESPECIAL */}
        <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-dashed border-slate-200 w-full mt-6 text-left">
          <label className="text-[9px] font-black uppercase text-indigo-500 block mb-2">
            {currentLayoutData.label} - Texto Especial
          </label>
          <input
            value={layoutText}
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
