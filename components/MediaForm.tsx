"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { X, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { updateBusinessMedia } from "@/app/actions";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/compressImage";

interface MediaFormProps {
  businessSlug: string;
  initialGallery?: string[];
}

export default function MediaForm({
  businessSlug,
  initialGallery,
}: MediaFormProps) {
  const router = useRouter();
  const [gallery, setGallery] = useState<string[]>(initialGallery || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const removeImage = (indexToRemove: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateBusinessMedia(businessSlug, gallery);

      if (result.success) {
        toast.success("Galeria atualizada com sucesso!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar mídia.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-4xl mx-auto">
      {/* --- GALERIA DE FOTOS --- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <ImageIcon className="text-indigo-500" size={18} />
            Galeria de Fotos
          </h3>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {gallery.length} / 12 {/* 🚀 ATUALIZADO PARA 12 */}
          </span>
        </div>

        {gallery.length < 12 /* 🚀 ATUALIZADO PARA 12 */ ? (
          <UploadDropzone
            endpoint="imageUploader"
            onBeforeUploadBegin={async (files) => {
              return await Promise.all(
                files.map(async (file) => {
                  return await compressImage(file);
                }),
              );
            }}
            onClientUploadComplete={(res) => {
              const newPhotos = res.map((r) => r.ufsUrl);
              setGallery((prev) =>
                [...prev, ...newPhotos].slice(0, 12),
              ); /* 🚀 ATUALIZADO PARA 12 */
              toast.success("Fotos enviadas e comprimidas!");
            }}
            onUploadError={(error: Error) => {
              toast.error("Erro: Verifique se a foto tem menos de 6MB.");
            }}
            className="ut-label:text-indigo-500 ut-button:bg-indigo-600 ut-button:hover:bg-indigo-700 border-dashed border-2 border-slate-200 bg-slate-50 rounded-[2rem] p-8 transition-all hover:bg-slate-100/50 ut-allowed-content:text-[10px] ut-allowed-content:uppercase ut-allowed-content:font-bold"
          />
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
            <p className="text-amber-700 text-xs font-bold uppercase tracking-tight">
              Limite de 12 fotos atingido. {/* 🚀 ATUALIZADO PARA 12 */}
            </p>
          </div>
        )}

        {gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {gallery.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-[1.5rem] overflow-hidden border-4 border-white shadow-md aspect-square"
              >
                <img
                  src={url}
                  alt="Galeria"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* --- BOTÃO SALVAR --- */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-16 bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.8rem] shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Save size={20} /> Gravar Galeria
          </>
        )}
      </button>
    </div>
  );
}
