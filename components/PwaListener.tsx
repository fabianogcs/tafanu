"use client";
import { useEffect } from "react";

export default function PwaListener() {
  useEffect(() => {
    // Dentro do useEffect do PwaListener:
    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;

      // Grita o evento
      window.dispatchEvent(new Event("pwa-ready"));

      // Backup: garante que o evento sobreviva a trocas de rota leves
      console.log("PWA Event capturado!");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null; // Esse componente é invisível, só serve de lógica.
}
