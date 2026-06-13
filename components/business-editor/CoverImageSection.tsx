"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2, Check, X, ZoomIn } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

// -----------------------------------------------------------------------
// Modal Inteligente de Recorte de Capa
// -----------------------------------------------------------------------
function CoverCropperModal({
  imageSrc,
  onCropComplete,
  onClose,
  aspectRatio, // 🚀 RECEBE A PROPORÇÃO EXATA DO LAYOUT
}: {
  imageSrc: string;
  onCropComplete: (file: File) => void;
  onClose: () => void;
  aspectRatio: number;
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
      <div className="relative w-full max-w-2xl h-[50vh] max-h-[400px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio} // 🚀 PROPORÇÃO DINÂMICA DO LAYOUT
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteEvent}
          cropShape="rect"
          showGrid={true}
          objectFit="contain" // 🚀 Garante que a foto comece inteira na tela
          minZoom={0.5} // 🚀 Libera o zoom para afastar (diminuir) a foto
          restrictPosition={false} // 🚀 Permite afastar a foto das bordas (cria margens pretas)
        />
      </div>

      <p className="text-white/60 text-[10px] uppercase tracking-widest mt-4 font-bold text-center">
        O quadro de corte já está no tamanho exato do seu Template.<br/>
        Use a barra abaixo para aumentar ou <span className="text-white">diminuir</span> a foto.
      </p>

      <div className="w-full max-w-2xl mt-4 flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
        <ZoomIn className="text-white/50 w-5 h-5 shrink-0" />
        <input
          type="range"
          value={zoom}
          min={0.5} // 🚀 PERMITE AFASTAR A FOTO
          max={3}
          step={0.05}
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
  selectedLayout?: string; // 🚀 INJEÇÃO DO LAYOUT
}

export function CoverImageSection({
  coverImage,
  setCoverImage,
  selectedLayout = "urban", // Começa com o padrão
}: CoverImageSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 O MOTOR DE INTELIGÊNCIA WYSIWYG
  // Decide a proporção do modal e a aparência do botão no painel!
  const layoutConfig = useMemo(() => {
    switch (selectedLayout) {
      case "editorial": // Luxe Layout (Retrato)
        return { aspect: 3 / 4, css: "w-full max-w-[280px] mx-auto rounded-[2rem]" };
      case "businessList": // Comercial Layout (Faixa Fina)
      case "showroom": // Showroom Layout (Faixa Fina)
        return { aspect: 21 / 9, css: "w-full rounded-[1.5rem]" };
      case "urban":
      case "influencer": // Urban Layout (Padrão/Largo)
      default:
        return { aspect: 16 / 9, css: "w-full rounded-[2rem]" };
    }
  }, [selectedLayout]);

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
    <div className="w-full flex flex-col justify-center">
      <div
        className={`relative overflow-hidden border-2 border-dashed transition-all cursor-pointer group 
          ${layoutConfig.css} 
          ${coverImage ? "border-transparent" : "border-slate-200 hover:border-indigo-300 bg-slate-50"}`}
        style={{ aspectRatio: layoutConfig.aspect }} // 🚀 CSS INLINE À PROVA DE FALHAS DO TAILWIND
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
              <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md text-center px-4">
                Trocar Capa
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-400 transition-colors text-center px-4">
              <ImagePlus size={28} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Adicionar Foto de Capa
              </span>
              <span className="text-[9px] font-medium opacity-60">
                A proporção é ajustada automaticamente para o seu template
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
          className="mt-4 flex items-center justify-center w-max mx-auto gap-1.5 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
        >
          <Trash2 size={12} /> Remover Capa
        </button>
      )}

      {rawImageSrc && (
        <CoverCropperModal
          imageSrc={rawImageSrc}
          aspectRatio={layoutConfig.aspect} // 🚀 PASSA A PROPORÇÃO PARA O MODAL
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