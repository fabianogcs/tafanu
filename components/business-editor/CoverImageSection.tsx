"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2, Check, X, ZoomIn } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

// -----------------------------------------------------------------------
// Modal de recorte dedicado à capa (aspect 16/9, shape rectangle)
// Separado do ImageCropperModal original que usa 1:1 para o logo
// -----------------------------------------------------------------------
function CoverCropperModal({
  imageSrc,
  onCropComplete,
  onClose,
}: {
  imageSrc: string;
  onCropComplete: (file: File) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteEvent = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        "capa-recortada.jpg",
      );
      if (croppedFile) onCropComplete(croppedFile);
    } catch (e) {
      toast.error("Erro ao recortar a capa.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-[45vw] max-h-[360px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteEvent}
          cropShape="rect"
          showGrid={true}
        />
      </div>

      <p className="text-white/40 text-[10px] uppercase tracking-widest mt-4 font-bold">
        Arraste para reposicionar • Proporção 16:9
      </p>

      <div className="w-full max-w-2xl mt-4 flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
        <ZoomIn className="text-white/50 w-5 h-5 shrink-0" />
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-label="Zoom da capa"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex gap-4 mt-6 w-full max-w-2xl">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <X size={20} /> Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          {isProcessing ? (
            "Recortando..."
          ) : (
            <>
              <Check size={20} /> Confirmar Capa
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------
interface CoverImageSectionProps {
  coverImage: string;
  setCoverImage: (val: string) => void;
}

export function CoverImageSection({
  coverImage,
  setCoverImage,
}: CoverImageSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("A imagem é muito pesada! O limite é 8MB.");
      return;
    }
    e.target.value = "";
    setRawImageSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = useCallback(
    async (croppedFile: File | Blob) => {
      if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
      setIsUploading(true);
      toast.loading("Enviando capa...", { id: "upload-cover" });

      try {
        const safeFile = new File([croppedFile], "capa-recortada.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        const compressed = await compressImage(safeFile);
        const res = await uploadFiles("imageUploader", { files: [compressed] });

        if (res && res.length > 0) {
          setCoverImage(res[0].url || res[0].ufsUrl);
          toast.success("Capa atualizada!", { id: "upload-cover" });
        } else {
          toast.error("Erro ao processar a imagem.", { id: "upload-cover" });
        }
      } catch (error: any) {
        toast.error(`Erro no upload: ${error?.message || "Tente novamente."}`, {
          id: "upload-cover",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [rawImageSrc, setCoverImage],
  );

  return (
    <div className="w-full">
      <div
        className={`relative w-full h-40 md:h-52 rounded-[2rem] overflow-hidden border-2 border-dashed transition-all cursor-pointer group
          ${coverImage ? "border-transparent" : "border-slate-200 hover:border-indigo-300 bg-slate-50"}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {coverImage && (
          <Image
            src={coverImage}
            alt="Capa do negócio"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        )}

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all
            ${coverImage ? "bg-black/0 group-hover:bg-black/40" : "bg-transparent"}`}
        >
          {isUploading ? (
            <>
              <Loader2 size={28} className="text-white animate-spin" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">
                Enviando...
              </span>
            </>
          ) : coverImage ? (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
              <ImagePlus size={28} className="text-white drop-shadow-md" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">
                Trocar Capa
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <ImagePlus size={28} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Adicionar Foto de Capa
              </span>
              <span className="text-[9px] font-medium opacity-60">
                Proporção 16:9 • Recomendado: 1200 × 675px • Máx 8MB
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {coverImage && !isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCoverImage("");
          }}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
        >
          <Trash2 size={12} /> Remover Capa
        </button>
      )}

      {rawImageSrc && (
        <CoverCropperModal
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => {
            if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
            setRawImageSrc(null);
          }}
        />
      )}
    </div>
  );
}
