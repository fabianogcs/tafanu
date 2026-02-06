"use client";

import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
// IMPORTANTE: Importamos a função de portal do React DOM
import { createPortal } from "react-dom";

interface GalleryProps {
  images: string[];
}

export default function BusinessGallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Estado para garantir que só rodamos no cliente (navegador)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Navegação
  const nextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null && prev < images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : images.length - 1
    );
  };

  // Swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  // Travar Scroll do corpo
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-10 text-white/50 bg-white/5 rounded-xl border border-white/5">
        <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sem fotos na galeria</p>
      </div>
    );
  }

  // O CONTEÚDO DO MODAL (TELA PRETA)
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center h-screen w-screen animate-in fade-in duration-200"
      onClick={() => setSelectedIndex(null)}
    >
      {/* Botão Fechar (X) */}
      <button
        onClick={() => setSelectedIndex(null)}
        className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-red-600 transition-all z-[100000]"
      >
        <X size={28} />
      </button>

      {/* Área da Imagem Central */}
      <div
        {...swipeHandlers}
        className="flex-1 w-full h-full flex items-center justify-center px-2 md:px-20 relative"
      >
        <button
          onClick={prevImage}
          className="hidden md:block absolute left-6 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all z-[100000]"
        >
          <ChevronLeft size={40} />
        </button>

        <img
          src={images[selectedIndex as number]}
          className="max-h-[85vh] max-w-full object-contain select-none shadow-2xl"
          alt="Ampliada"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={nextImage}
          className="hidden md:block absolute right-6 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all z-[100000]"
        >
          <ChevronRight size={40} />
        </button>
      </div>

      {/* Barra de Miniaturas Inferior */}
      <div
        className="h-24 w-full bg-neutral-900/90 flex items-center justify-center gap-3 overflow-x-auto px-4 z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
              selectedIndex === i
                ? "border-white opacity-100 scale-110"
                : "border-transparent opacity-40 hover:opacity-100"
            }`}
          >
            <img src={img} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* GRID NA PÁGINA (Sempre visível) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="rounded-xl overflow-hidden relative group cursor-pointer h-32 border border-white/10"
          >
            <img
              src={img}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt="Galeria"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* O PULO DO GATO: 
          Se estiver montado e tiver uma imagem selecionada, 
          teletransporta o modalContent para a div #modal-root lá no layout.tsx 
      */}
      {mounted && selectedIndex !== null
        ? createPortal(
            modalContent,
            document.getElementById("modal-root") as HTMLElement
          )
        : null}
    </>
  );
}
