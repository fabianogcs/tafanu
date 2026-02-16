"use client";
import { useEffect } from "react";

export default function PwaListener() {
  useEffect(() => {
    const handler = (e: any) => {
      // Impede o Chrome de mostrar a barra nativa feia automaticamente
      e.preventDefault();
      // Guarda o evento no 'bolso' (variável global window) para usar depois
      (window as any).deferredPrompt = e;
      console.log("PWA Event capturado e guardado!");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null; // Este componente é invisível
}
