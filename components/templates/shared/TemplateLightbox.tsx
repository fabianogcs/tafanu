"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TemplateLightboxProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}

export function TemplateLightbox({
  images,
  selectedIndex,
  onClose,
  onNavigate,
}: TemplateLightboxProps) {
  if (selectedIndex === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Botão fechar */}
        <button
          aria-label="Fechar galeria"
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white z-[210] hover:bg-white/10 rounded-full transition-all"
          onClick={onClose}
        >
          <X size={32} strokeWidth={1.5} />
        </button>

        {/* Imagem principal */}
        <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(selectedIndex - 1);
            }}
            aria-label="Imagem anterior"
            className="hidden md:flex absolute left-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220] backdrop-blur-md"
          >
            <ChevronLeft size={32} strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(selectedIndex + 1);
            }}
            aria-label="Próxima imagem"
            className="hidden md:flex absolute right-8 w-14 h-14 items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[220] backdrop-blur-md"
          >
            <ChevronRight size={32} strokeWidth={1.5} />
          </button>

          {images[selectedIndex] && (
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              loading="eager"
              decoding="async"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.x > 80) onNavigate(selectedIndex - 1);
                else if (info.offset.x < -80) onNavigate(selectedIndex + 1);
              }}
              className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-2xl cursor-grab active:cursor-grabbing z-[210]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {/* Miniaturas */}
        <div
          className="h-32 w-full flex items-center justify-start md:justify-center gap-3 px-6 pb-6 overflow-x-auto no-scrollbar snap-x"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              aria-label={`Ver miniatura ${idx + 1}`}
              onClick={() => onNavigate(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center ${
                selectedIndex === idx
                  ? "border-white scale-110 shadow-lg opacity-100"
                  : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <Image
                src={img || "/og-default.png"}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
