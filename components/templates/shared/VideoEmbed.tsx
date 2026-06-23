"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  /** Estilo visual do botão de play. "luxe" = minimalista, "comercial" = mais bold, "default" = padrão */
  variant?: "luxe" | "comercial" | "default";
  /** Classe de cor primária do tema (ex: "text-indigo-500") */
  primaryColor?: string;
}

export function VideoEmbed({
  url,
  variant = "default",
  primaryColor,
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  let embedUrl = "";
  let isInstagram = false;

  try {
    // 🛡️ A VACINA ANTI-XSS: Força a validação da URL e exige protocolo seguro (https)
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:")
      return null;

    if (
      parsedUrl.hostname.includes("youtube.com") ||
      parsedUrl.hostname.includes("youtu.be")
    ) {
      const videoId = parsedUrl.hostname.includes("youtu.be")
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.pathname.includes("/shorts/")
          ? parsedUrl.pathname.split("/shorts/")[1]
          : parsedUrl.searchParams.get("v");

      if (videoId)
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
    } else if (parsedUrl.hostname.includes("instagram.com")) {
      isInstagram = true;
      embedUrl = parsedUrl.href; // Agora é 100% seguro
    } else if (parsedUrl.hostname.includes("tiktok.com")) {
      const videoId = parsedUrl.pathname.split("/video/")[1];
      if (videoId) embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    }
  } catch (e) {
    // Se a URL for inválida (ex: texto solto ou javascript:), ele falha silenciosamente
    return null;
  }

  if (!embedUrl) return null;

  const roundedClass =
    variant === "luxe"
      ? "rounded-[1.5rem] md:rounded-[2rem]"
      : variant === "comercial"
        ? "rounded-[2.5rem]"
        : "rounded-2xl";

  // Instagram — abre em nova aba
  if (isInstagram) {
    return (
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver no Instagram"
        className={`w-full h-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto ${roundedClass} cursor-pointer group shadow-lg`}
      >
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700" />
        <div className="relative z-20 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:bg-white/20 transition-all duration-700">
          <Instagram
            className="w-7 h-7 text-white/90 drop-shadow-md"
            strokeWidth={1.5}
          />
        </div>
        <span
          className={`relative z-20 text-white/60 text-[10px] mt-6 uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-500 drop-shadow-md text-center px-4 ${
            variant === "luxe" ? "font-serif italic" : "font-black"
          }`}
        >
          Instagram Experience
        </span>
      </a>
    );
  }

  // YouTube / TikTok — fachada antes de carregar
  if (!isLoaded) {
    return (
      <button
        aria-label="Carregar e reproduzir vídeo"
        onClick={() => setIsLoaded(true)}
        className={`w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto ${roundedClass} cursor-pointer group border border-white/10 hover:border-white/30 transition-all duration-500`}
      >
        <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-700 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white ml-1 opacity-90 group-hover:opacity-100 transition-opacity" />
        </div>
        <span
          className={`relative z-20 text-white/50 text-[10px] mt-6 uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-500 ${
            variant === "luxe" ? "font-serif italic" : "font-bold"
          }`}
        >
          Reproduzir
        </span>
      </button>
    );
  }

  // O vídeo real
  return (
    <div
      className={`w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden pointer-events-auto ${roundedClass}`}
    >
      <iframe
        src={embedUrl}
        title="Vídeo de demonstração do negócio"
        aria-label="Reprodutor de vídeo"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
}
