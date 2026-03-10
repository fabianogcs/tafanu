"use client";

import {
  Layout,
  Plus,
  Trash2,
  AlignLeft,
  ListChecks,
  HelpCircle,
} from "lucide-react";
import { UploadButton as UTButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";

interface ContentSectionProps {
  validGallery: string[];
  setGallery: (val: string[] | ((prev: string[]) => string[])) => void;
  description: string;
  setDescription: (val: string) => void;
  features: string[];
  setFeatures: (val: string[]) => void;
  faqs: { q: string; a: string }[];
  setFaqs: (val: { q: string; a: string }[]) => void;
}

export function ContentSection({
  validGallery,
  setGallery,
  description,
  setDescription,
  features,
  setFeatures,
  faqs,
  setFaqs,
}: ContentSectionProps) {
  return (
    <div className="space-y-8">
      {/* GALERIA */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
            <Layout size={18} className="text-indigo-500" /> Galeria Vitrine
          </h2>
          <span className="text-[10px] font-black text-indigo-600 uppercase">
            {validGallery.length} / 8
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {validGallery.map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden relative group border-2 border-white shadow-md"
            >
              <img src={url} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() =>
                  setGallery((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* BOTÃO DE UPLOADTHING (Agora posicionado certinho) */}
          {validGallery.length < 8 && (
            <div className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative transition-all group overflow-hidden">
              <Plus
                size={24}
                className="text-slate-300 group-hover:text-indigo-400 mb-2"
              />
              <div className="scale-75 origin-top">
                <UTButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onBeforeUploadBegin={async (files) => {
                    toast.loading("Otimizando as imagens...", {
                      id: "compress",
                    });

                    const compressedFiles = await Promise.all(
                      files.map(async (file) => await compressImage(file)),
                    );

                    toast.success("Imagens prontas para subir!", {
                      id: "compress",
                    });
                    return compressedFiles;
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const newUrls = res.map((r) => r.url);
                      setGallery([...validGallery, ...newUrls].slice(0, 8));
                      toast.success("Imagens adicionadas com sucesso!");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Erro: ${error.message}`);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SOBRE */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-6">
          <AlignLeft size={16} /> Sobre o Negócio
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 600))}
          rows={6}
          className="w-full bg-slate-50 p-6 rounded-[1.5rem] border text-sm font-medium outline-none"
          placeholder="Conte sua história..."
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
                className="flex-1 bg-slate-50 p-4 rounded-xl text-xs font-bold border outline-none"
                placeholder="Ex: Wi-fi Grátis..."
              />
              <button
                onClick={() =>
                  setFeatures(features.filter((_, idx) => idx !== i))
                }
                className="p-4 bg-rose-50 text-rose-400 rounded-xl"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFeatures([...features, ""])}
            className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase"
          >
            + Diferencial
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <HelpCircle size={18} /> FAQ
          </label>
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group"
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
                className="absolute top-2 right-2 p-2 text-rose-200 hover:text-rose-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
            className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase"
          >
            + Nova Pergunta
          </button>
        </div>
      </div>
    </div>
  );
}
