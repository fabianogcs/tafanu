"use client";

import { Tag, Hash, X, Plus } from "lucide-react";
import { TAFANU_CATEGORIES } from "./constants";
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
  // 🚀 LÓGICA INTELIGENTE DE ADICIONAR TAG
  const addTag = () => {
    const val = tagInput.trim().toLowerCase();
    if (!val) return;

    // Se já existe na lista, só limpa o input para não duplicar
    if (keywords.includes(val)) {
      setTagInput("");
      return;
    }

    // Se tem espaço (menos de 10 tags), adiciona a palavra composta inteira
    if (keywords.length < 10) {
      setKeywords([...keywords, val]);
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
                setCategoria(cat);
                setSelectedSubs([]);
              }}
              className={`h-12 rounded-xl text-[9px] font-black uppercase transition-all border ${
                categoria === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              {formatDisplayName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO 2: NICHOS (SUBCATEGORIAS) --- */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
        <div className="text-[9px] font-black uppercase text-slate-400 mb-3 flex tracking-widest justify-between">
          <span>2. Nichos (Máx 3)</span>
          <span
            className={
              selectedSubs.length >= 3 ? "text-rose-500" : "text-indigo-400"
            }
          >
            {selectedSubs.length} Selecionados
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 🚀 TRAVA VISUAL: Esconde as subcategorias até ele escolher o ramo principal */}
          {!categoria || categoria === "Geral" ? (
            <div className="w-full bg-amber-50 border border-amber-200 text-amber-600 p-4 rounded-xl text-center flex flex-col items-center gap-1 shadow-sm">
              <span className="text-lg">⚠️</span>
              <p className="text-[10px] font-black uppercase tracking-widest">
                Ação Necessária
              </p>
              <p className="text-xs font-bold mt-1">
                Selecione um Ramo Principal acima para liberar as opções de
                nicho.
              </p>
            </div>
          ) : (
            (TAFANU_CATEGORIES as any)[categoria]?.map((sub: string) => (
              <button
                key={sub}
                onClick={() =>
                  setSelectedSubs((prev) => {
                    if (prev.includes(sub)) {
                      return prev.filter((s) => s !== sub);
                    }
                    if (prev.length >= 3) {
                      return prev;
                    }
                    return [...prev, sub];
                  })
                }
                className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${
                  selectedSubs.includes(sub)
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : selectedSubs.length >= 3
                      ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                      : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {selectedSubs.includes(sub) ? "✓ " : "+ "}
                {formatDisplayName(sub)}
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- SEÇÃO 3: PALAVRAS-CHAVE (Atualizada para Palavras Compostas) --- */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
              <Hash size={16} /> Palavras-chave de Busca
            </label>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Digite termos que seus clientes usam (ex: &quot;salão de
              beleza&quot;, &quot;tele entrega&quot;).
            </p>
          </div>
          <span className="text-[9px] font-bold text-slate-400 shrink-0">
            {keywords.length} / 10
          </span>
        </div>

        {/* Lista de tags já adicionadas */}
        <div className="w-full min-h-[56px] p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-2 items-center mb-3">
          {keywords.length === 0 ? (
            <span className="text-xs font-semibold text-slate-400 italic px-2 py-1">
              Nenhuma palavra-chave adicionada ainda.
            </span>
          ) : (
            keywords.map((tag, i) => (
              <span
                key={i}
                className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm animate-in fade-in zoom-in duration-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remover tag"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Campo de digitação + Botão Adicionar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)} // 🚀 REMOVIDO O ENDSWITH(" ")
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            disabled={keywords.length >= 10}
            maxLength={30}
            className="flex-1 h-12 px-4 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20 text-slate-800 placeholder:text-slate-400 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            placeholder={
              keywords.length >= 10
                ? "Limite de 10 palavras atingido"
                : "Digite uma palavra ou frase e clique em Adicionar..."
            }
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || keywords.length >= 10}
            className="h-12 px-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
