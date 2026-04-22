"use client";

import {
  Layout,
  Trash2,
  AlignLeft,
  ListChecks,
  HelpCircle,
  Video,
  Camera,
  GripVertical, // 🚀 NOVO: O Ícone de Arrastar (Drag Handle)
} from "lucide-react";
import { UploadButton as UTButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import { useState } from "react";

interface ContentSectionProps {
  mediaFeed: { type: "image" | "video"; url: string }[];
  setMediaFeed: (val: any[] | ((prev: any[]) => any[])) => void;
  description: string;
  setDescription: (val: string) => void;
  features: string[];
  setFeatures: (val: string[]) => void;
  faqs: { q: string; a: string }[];
  setFaqs: (val: { q: string; a: string }[]) => void;
}

export function ContentSection({
  mediaFeed,
  setMediaFeed,
  description,
  setDescription,
  features,
  setFeatures,
  faqs,
  setFaqs,
}: ContentSectionProps) {
  // Limite estrito de 12 imagens. Os vídeos não entram nessa conta!
  const imageCount = mediaFeed.filter((m) => m.type === "image").length;

  // 🚀 O MOTOR DE ARRASTAR E SOLTAR (DRAG & DROP)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessário para permitir soltar o item
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newFeed = [...mediaFeed];
    const draggedItem = newFeed[draggedIndex];

    // Remove do lugar antigo e coloca no novo lugar
    newFeed.splice(draggedIndex, 1);
    newFeed.splice(targetIndex, 0, draggedItem);

    setMediaFeed(newFeed);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeItem = (index: number) => {
    setMediaFeed((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateVideoUrl = (index: number, newUrl: string) => {
    const newFeed = [...mediaFeed];
    newFeed[index].url = newUrl;
    setMediaFeed(newFeed);
  };

  return (
    <div className="space-y-8">
      {/* =========================================================
          🚀 THE MASTER MEDIA MANAGER (Com Drag & Drop)
          ========================================================= */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
            <Layout size={18} className="text-indigo-500" /> Vitrine de Mídia
            (Fotos e Vídeos)
          </h2>
          <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
            Fotos: {imageCount} / 12
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mb-6 leading-tight">
          Faça upload de fotos e cole links do YouTube, Reels ou TikTok.{" "}
          <br className="hidden md:block" />
          <span className="text-indigo-500">Clique e arraste</span> para
          organizar a ordem exata na passarela.
        </p>

        {/* 🚀 LISTAGEM DRAG & DROP FÍSICA */}
        <div className="space-y-3">
          {mediaFeed.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex gap-3 p-3 rounded-2xl border items-center transition-all ${
                draggedIndex === i
                  ? "opacity-50 border-indigo-400 bg-indigo-50 shadow-inner scale-[0.98]"
                  : "bg-slate-50 border-slate-100 hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              {/* O Ícone de Arrastar (Handle) */}
              <div className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 shrink-0">
                <GripVertical size={20} strokeWidth={2.5} />
              </div>

              {/* Preview e Input */}
              <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
                {item.type === "image" ? (
                  <>
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border-2 border-white shrink-0 bg-slate-200 pointer-events-none">
                      <img
                        src={item.url}
                        className="w-full h-full object-cover"
                        alt="Vitrine"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border pointer-events-none">
                      Imagem da Galeria
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-rose-50 flex items-center justify-center border-2 border-white shadow-sm shrink-0 pointer-events-none">
                      <Video size={24} className="text-rose-400" />
                    </div>
                    <input
                      value={item.url}
                      onChange={(e) => updateVideoUrl(i, e.target.value)}
                      className="w-full md:flex-1 bg-white p-4 rounded-xl text-xs font-bold border outline-none focus:ring-2 ring-rose-500/20"
                      placeholder="Cole o link do YouTube, Instagram ou TikTok aqui..."
                    />
                  </>
                )}
              </div>

              {/* Botão de Excluir */}
              <button
                onClick={() => removeItem(i)}
                className="p-4 bg-white text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all border shadow-sm shrink-0"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {/* 🚀 BOTÕES DE AÇÃO (UPLOAD DE FOTO E ADD VÍDEO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {imageCount < 12 ? (
            <div className="h-14 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-center relative transition-all group overflow-hidden hover:border-indigo-400 cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 gap-2">
                <Camera
                  size={16}
                  className="text-indigo-500"
                  strokeWidth={2.5}
                />
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  Fazer Upload de Fotos
                </span>
              </div>
              <div className="opacity-0 w-full h-full absolute inset-0 cursor-pointer scale-150">
                <UTButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onBeforeUploadBegin={async (files) => {
                    toast.loading("Otimizando as imagens...", {
                      id: "compress",
                    });
                    const compressed = await Promise.all(
                      files.map(async (file) => await compressImage(file)),
                    );
                    toast.success("Imagens prontas!", { id: "compress" });
                    return compressed;
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const newImages = res.map((r) => ({
                        type: "image",
                        url: r.url,
                      }));
                      // A mágica: Impede de passar de 12 imagens mesmo se o cara selecionar 20 de uma vez!
                      setMediaFeed((prev: any) => {
                        const currentImagesCount = prev.filter(
                          (m: any) => m.type === "image",
                        ).length;
                        const allowedCount = 12 - currentImagesCount;
                        const imagesToAdd = newImages.slice(0, allowedCount);
                        return [...prev, ...imagesToAdd];
                      });
                      toast.success("Mídias adicionadas à vitrine!");
                    }
                  }}
                  onUploadError={(error) => {
                    // 🛡️ Aquele Erro de Tipo Corrigido Novamente
                    toast.error(`Erro: ${error.message}`);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Limite de 12 fotos atingido
            </div>
          )}

          <button
            onClick={() =>
              setMediaFeed((prev: any) => [...prev, { type: "video", url: "" }])
            }
            className="h-14 border-2 border-dashed border-rose-200 bg-rose-50 rounded-xl text-[10px] font-black text-rose-500 uppercase hover:border-rose-400 transition-all flex items-center justify-center gap-2 tracking-widest"
          >
            <Video size={16} strokeWidth={2.5} /> Adicionar Link de Vídeo
          </button>
        </div>
      </div>

      {/* =========================================================
          SOBRE O NEGÓCIO
          ========================================================= */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-6">
          <AlignLeft size={16} /> Sobre o Negócio
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 600))}
          rows={6}
          className="w-full bg-slate-50 p-6 rounded-[1.5rem] border text-sm font-medium outline-none focus:ring-2 ring-indigo-500/20 transition-all"
          placeholder="Conte sua história e a essência da sua marca..."
        />

        {/* DIFERENCIAIS */}
        <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <ListChecks size={18} /> Diferenciais
          </label>
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={f}
                onChange={(e) => {
                  const n = [...features];
                  n[i] = e.target.value;
                  setFeatures(n);
                }}
                className="flex-1 bg-slate-50 p-4 rounded-xl text-xs font-bold border outline-none focus:ring-2 ring-indigo-500/20"
                placeholder="Ex: Wi-fi Grátis, Pet Friendly, Atendimento Exclusivo..."
              />
              <button
                onClick={() =>
                  setFeatures(features.filter((_, idx) => idx !== i))
                }
                className="p-4 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-colors border border-rose-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFeatures([...features, ""])}
            className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            + Adicionar Diferencial
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <HelpCircle size={18} /> FAQ (Perguntas Frequentes)
          </label>
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group transition-all focus-within:ring-2 ring-indigo-500/20"
            >
              <input
                value={f.q}
                onChange={(e) => {
                  const n = [...faqs];
                  n[i].q = e.target.value;
                  setFaqs(n);
                }}
                placeholder="Pergunta"
                className="w-full h-10 px-4 bg-white rounded-lg text-xs font-black border mb-2 outline-none"
              />
              <textarea
                value={f.a}
                onChange={(e) => {
                  const n = [...faqs];
                  n[i].a = e.target.value;
                  setFaqs(n);
                }}
                placeholder="Resposta"
                rows={3}
                className="w-full p-3 bg-white rounded-lg text-xs border outline-none resize-none"
              />
              <button
                onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                className="absolute top-2 right-2 p-2 text-rose-200 hover:text-rose-500 bg-white rounded-lg border shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
            className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            + Nova Pergunta
          </button>
        </div>
      </div>
    </div>
  );
}
