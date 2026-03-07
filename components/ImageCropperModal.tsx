// components/ImageCropperModal.tsx
"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage"; // Ajuste o caminho se salvou em outro lugar
import { Check, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";

interface ImageCropperModalProps {
  imageSrc: string; // A foto original que o cara escolheu
  onCropComplete: (croppedFile: File) => void; // Função que devolve a foto cortada
  onClose: () => void; // Fecha o modal
}

export default function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onClose,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Salva as coordenadas sempre que o usuário move a foto
  const onCropCompleteEvent = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  // O botão de "Salvar" que faz a mágica acontecer
  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      // Chama nosso motor matemático para fatiar a imagem
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (croppedFile) {
        onCropComplete(croppedFile); // Manda a foto pronta pro formulário!
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao recortar a imagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {/* Container do Cropper */}
      <div className="relative w-full max-w-md h-[60vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // Força a ser quadrado (1:1). Se for banner, mude para 16/9
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteEvent}
          cropShape="round" // Fica um círculo visualmente, mas salva quadrado
          showGrid={false}
        />
      </div>

      {/* Controle de Zoom em Barra */}
      <div className="w-full max-w-md mt-6 flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
        <ZoomIn className="text-white/50 w-5 h-5 shrink-0" />
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 mt-8 w-full max-w-md">
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
              <Check size={20} /> Confirmar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
