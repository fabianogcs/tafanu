"use client";
import { useEffect } from "react";

export default function PwaListener() {
  useEffect(() => {
    // 1. FUNÇÃO PARA REPASSAR O AVISO
    const notifyReady = () => {
      if ((window as any).deferredPrompt) {
        // Dispara o evento que o seu botão de instalar está ouvindo
        window.dispatchEvent(new Event("pwa-ready"));
        console.log("PWA: Evento recuperado da variável global!");
      }
    };

    // 2. CHECA IMEDIATAMENTE (Caso o script do layout já tenha pego o aviso)
    notifyReady();

    // 3. ESCUTA O NAVEGADOR (Caso o aviso venha depois do site carregar)
    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      notifyReady();
      console.log("PWA: Evento capturado diretamente pelo Listener!");
    };

    // 4. ESCUTA O "SENTINELA" (O evento vindo do script do layout.tsx)
    window.addEventListener("pwa-prompt-ready", notifyReady);
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("pwa-prompt-ready", notifyReady);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  return null;
}
