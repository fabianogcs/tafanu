"use client";
import { useEffect } from "react";

export default function PwaListener() {
  useEffect(() => {
    const handler = (e: any) => {
      // 1. Impede o banner nativo chato do Chrome
      e.preventDefault();

      // 2. Guarda o evento no bolso (variável global)
      (window as any).deferredPrompt = e;

      // 3. O PULO DO GATO: Grita para o resto do site que o PWA está pronto! 📢
      // Isso avisa o botão instantaneamente.
      window.dispatchEvent(new Event("pwa-ready"));

      console.log("PWA Event capturado e notificado!");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null; // Esse componente é invisível, só serve de lógica.
}
