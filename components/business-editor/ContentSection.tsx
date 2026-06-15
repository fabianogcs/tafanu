"use client";

import {
  Layout,
  Trash2,
  AlignLeft,
  ListChecks,
  HelpCircle,
  Video,
  Camera,
  GripVertical,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing"; // 🚀 Importação da função pura
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import { useState, useRef } from "react"; // 🚀 Adicionado useRef

interface ContentSectionProps {
  mediaFeed: { type: "image" | "video"; url: string }[];
  setMediaFeed: (val: any[] | ((prev: any[]) => any[])) => void;
  description: string;
  setDescription: (val: string) => void;
  features: string[];
  setFeatures: (val: string[]) => void;
  faqs: { q: string; a: string }[];
  setFaqs: (val: { q: string; a: string }[]) => void;
  catalogPdf: string | null;
  setCatalogPdf: (val: string | null) => void;
  isUploadingGallery: boolean;
  setIsUploadingGallery: (val: boolean) => void;
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
  catalogPdf,
  setCatalogPdf,
  isUploadingGallery,
  setIsUploadingGallery,
}: ContentSectionProps) {
  const imageCount = mediaFeed.filter((m) => m.type === "image").length;

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 🚀 O estado da Galeria agora vem do pai (BusinessEditor)!
  // A linha "useState(false)" foi removida daqui.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null); // 🚀 NOVO REF PARA O PDF

  // 🚀 O NOVO MOTOR DE UPLOAD NATIVO
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limpa o input para permitir subir a mesma foto em sequência se necessário
    e.target.value = "";

    setIsUploadingGallery(true);
    toast.loading("Preparando imagens...", { id: "upload-gallery" });

    try {
      // ========================================================
      // 🚀 AQUI COMEÇA A MUDANÇA: Fila Síncrona Blindada
      // ========================================================
      const compressedFiles = [];

      for (const file of files) {
        try {
          // Processa uma por uma, aguardando terminar antes de ir para a próxima
          const compressed = await compressImage(file);
          compressedFiles.push(compressed);
        } catch (error) {
          console.error("Falha ao comprimir imagem, enviando original", error);
          compressedFiles.push(file); // Fallback de segurança
        }
      }
      // ========================================================
      // 🚀 FIM DA MUDANÇA
      // ========================================================

      toast.loading("Enviando para a nuvem...", { id: "upload-gallery" });

      // 2. Sobe as fotos blindadas com a função pura
      const res = await uploadFiles("imageUploader", {
        files: compressedFiles,
      });

      // ... (O RESTANTE DA SUA FUNÇÃO CONTINUA EXATAMENTE IGUAL)

      if (res && res.length > 0) {
        const newImages = res.map((r) => ({
          type: "image",
          url: r.ufsUrl,
        }));

        setMediaFeed((prev: any) => {
          const currentImagesCount = prev.filter(
            (m: any) => m.type === "image",
          ).length;
          const allowedCount = 12 - currentImagesCount;
          const imagesToAdd = newImages.slice(0, allowedCount);
          return [...prev, ...imagesToAdd];
        });

        toast.success("Fotos adicionadas com sucesso!", {
          id: "upload-gallery",
        });
      }
    } catch (error: any) {
      toast.error("Falha no upload. Verifique a internet e tente novamente.", {
        id: "upload-gallery",
      });
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newFeed = [...mediaFeed];
    const temp = newFeed[index];
    newFeed[index] = newFeed[index - 1];
    newFeed[index - 1] = temp;
    setMediaFeed(newFeed);
  };

  const moveItemDown = (index: number) => {
    if (index === mediaFeed.length - 1) return;
    const newFeed = [...mediaFeed];
    const temp = newFeed[index];
    newFeed[index] = newFeed[index + 1];
    newFeed[index + 1] = temp;
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

        {/* =========================================================
            🚀 NOVO: UPLOAD DE CATÁLOGO/CARDÁPIO (PDF)
            ========================================================= */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
              <ListChecks size={16} className="text-emerald-500" /> Cardápio /
              Catálogo Digital (PDF)
            </h3>
          </div>

          {catalogPdf ? (
            <div className="w-full h-14 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between px-6">
              <span className="text-xs font-bold text-emerald-700 truncate mr-4">
                Catálogo Anexado ✅
              </span>

              {/* Botões de Ação Agrupados e Protegidos */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setCatalogPdf(null)}
                  className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600"
                >
                  Remover
                </button>
                <a
                  href={catalogPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 underline"
                >
                  Visualizar
                </a>
              </div>
            </div>
          ) : (
            <>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="w-full h-14 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors group"
              >
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:text-emerald-700">
                  Anexar Arquivo PDF (Max 8MB)
                </span>
              </div>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // 🚀 O PULO DO GATO: Limpa a memória do input para ele não travar mais!
                  e.target.value = "";

                  toast.loading("Enviando PDF...", { id: "upload-pdf" });
                  try {
                    const res = await uploadFiles("pdfUploader", {
                      files: [file],
                    });
                    if (res && res[0]) {
                      setCatalogPdf(res[0].ufsUrl);
                      toast.success("Catálogo enviado com sucesso!", {
                        id: "upload-pdf",
                      });
                    }
                  } catch (err: any) {
                    // Agora mostra o erro REAL que o servidor mandar
                    toast.error(err.message || "Erro ao enviar arquivo.", {
                      id: "upload-pdf",
                    });
                  }
                }}
              />
            </>
          )}
        </div>

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
              {/* O Ícone de Arrastar e Controles Mobile */}
              <div className="flex flex-col items-center justify-center shrink-0 gap-1 bg-white rounded-lg border shadow-sm p-1">
                <button
                  type="button"
                  onClick={() => moveItemUp(i)}
                  disabled={i === 0}
                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all cursor-pointer"
                >
                  <ChevronUp size={18} strokeWidth={3} />
                </button>

                <div className="hidden md:block cursor-grab active:cursor-grabbing text-slate-300 py-1">
                  <GripVertical size={16} strokeWidth={2.5} />
                </div>

                <button
                  type="button"
                  onClick={() => moveItemDown(i)}
                  disabled={i === mediaFeed.length - 1}
                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all cursor-pointer"
                >
                  <ChevronDown size={18} strokeWidth={3} />
                </button>
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

        {/* 🚀 BOTÕES DE AÇÃO COM NOVO UX RESPONSIVO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {imageCount < 12 ? (
            <div
              onClick={() =>
                !isUploadingGallery && fileInputRef.current?.click()
              }
              className={`h-14 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-center relative transition-all group overflow-hidden cursor-pointer ${
                isUploadingGallery
                  ? "opacity-70 pointer-events-none"
                  : "hover:border-indigo-400"
              }`}
            >
              <div className="flex items-center justify-center pointer-events-none z-10 gap-2">
                {isUploadingGallery ? (
                  <>
                    <Loader2
                      size={16}
                      className="text-indigo-500 animate-spin"
                      strokeWidth={2.5}
                    />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      Enviando Fotos...
                    </span>
                  </>
                ) : (
                  <>
                    <Camera
                      size={16}
                      className="text-indigo-500"
                      strokeWidth={2.5}
                    />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      Fazer Upload de Fotos
                    </span>
                  </>
                )}
              </div>

              {/* O INPUT NATIVO INVISÍVEL */}
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleGalleryUpload}
                className="hidden"
              />
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
