"use client";

import { useRef, useEffect } from "react";

interface BusinessVideoProps {
  videoUrl?: string | null;
}

export default function BusinessVideo({ videoUrl }: BusinessVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Se não tiver URL, não renderiza nada
  if (!videoUrl) return null;

  // Garante que o vídeo tente rodar assim que a URL mudar
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    /* REVOLUCIONÁRIO: Removido iframe de YouTube.
       Agora usa a tag HTML5 nativa para máxima performance e 
       compatibilidade com os uploads do seu editor (ufs.sh).
    */
    <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black/5">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      >
        Seu navegador não suporta a reprodução de vídeos.
      </video>

      {/* Overlay sutil para dar profundidade e acabamento premium */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.15)]" />
    </div>
  );
}
