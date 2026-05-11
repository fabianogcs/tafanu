"use client";

import { Tag, Hash, X } from "lucide-react";
import { TAFANU_CATEGORIES } from "./constants";
// 1. Importamos a nossa função mágica do dicionário
import { formatDisplayName } from "@/lib/dictionary";

interface SegmentationSectionProps {
  categoria: string;
  setCategoria: (val: string) => void;
  selectedSubs: string[];
  setSelectedSubs: (val: string[] | ((prev: string[]) => string[])) => void;
  keywords: string[];
  setKeywords: (val: string[]) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  categoryKeys: string[];
}

export function SegmentationSection({
  categoria,
  setCategoria,
  selectedSubs,
  setSelectedSubs,
  keywords,
  setKeywords,
  tagInput,
  setTagInput,
  categoryKeys,
}: SegmentationSectionProps) {
  const addTag = () => {
    const val = tagInput.trim().toLowerCase();
    if (val && !keywords.includes(val) && keywords.length < 10) {
      setKeywords([...keywords, val]);
      setTagInput("");
    } else {
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) =>
    setKeywords(keywords.filter((tag) => tag !== tagToRemove));

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
      <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
        <Tag size={16} /> Segmentação
      </h3>

      {/* --- SEÇÃO 1: RAMO PRINCIPAL --- */}
      <div className="mb-8">
        <label className="text-[9px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">
          1. Ramo Principal
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                // O estado (backend) continua guardando a versão sem acento
                setCategoria(cat);
                setSelectedSubs([]);
              }}
              className={`h-12 rounded-xl text-[9px] font-black uppercase transition-all border ${
                categoria === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              {/* 2. O usuário vê a versão formatada (com acentos) */}
              {formatDisplayName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO 2: NICHOS (SUBCATEGORIAS) --- */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
        <div className="text-[9px] font-black uppercase text-slate-400 mb-3 flex tracking-widest justify-between">
          <span>2. Nichos (Máx 5)</span>
          <span
            className={
              selectedSubs.length >= 5 ? "text-rose-500" : "text-indigo-400"
            }
          >
            {selectedSubs.length} Selecionados
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(TAFANU_CATEGORIES as any)[categoria]?.map((sub: string) => (
            <button
              key={sub}
              onClick={() =>
                setSelectedSubs((prev) => {
                  // Se já tem, ele tira (desmarca)
                  if (prev.includes(sub)) {
                    return prev.filter((s) => s !== sub);
                  }
                  // 🚀 A TRAVA: Se não tem e já deu 5, ele bloqueia e não faz nada
                  if (prev.length >= 5) {
                    return prev;
                  }
                  // Se tem espaço, ele adiciona
                  return [...prev, sub];
                })
              }
              className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${
                selectedSubs.includes(sub)
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : selectedSubs.length >= 5
                    ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed opacity-50" // Visual de "Bloqueado"
                    : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {selectedSubs.includes(sub) ? "✓ " : "+ "}
              {formatDisplayName(sub)}
            </button>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO 3: PALAVRAS-CHAVE --- */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <Hash size={16} /> Palavras-chave
          </label>
          <span className="text-[9px] font-bold text-slate-400">
            {keywords.length} / 10
          </span>
        </div>
        <div className="w-full min-h-[56px] px-2 py-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2 items-center">
          {keywords.map((tag, i) => (
            <span
              key={i}
              className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              {tag}{" "}
              <button onClick={() => removeTag(tag)}>
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) =>
              e.target.value.endsWith(" ") || e.target.value.endsWith(",")
                ? addTag()
                : setTagInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            disabled={keywords.length >= 10}
            className="bg-transparent text-xs font-bold outline-none flex-1 min-w-[120px]"
            placeholder={
              keywords.length >= 10
                ? "Limite atingido"
                : "Digite e aperte Espaço..."
            }
          />
        </div>
      </div>
    </div>
  );
}
