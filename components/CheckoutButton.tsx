"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ userId }: { userId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCreateVitrine = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    // 🛡️ DRIBLE DA PLAY STORE: Detecta se está rodando dentro do App (PWA Standalone)
    const isRunningInApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isRunningInApp) {
      // 🎁 SE ESTIVER NO APP: Dispara o link mágico por e-mail para esconder a rota da Google/Apple
      router.push(`/api/checkout-magico?uid=${userId}`);
    } else {
      // ⚡ SE ESTIVER NO DESKTOP / NAVEGADOR: Vai direto para a tela de pagamento do Mercado Pago
      router.push("/checkout");
    }
  };

  return (
    <button
      onClick={handleCreateVitrine}
      disabled={isProcessing}
      className="w-full bg-tafanu-action text-white font-black text-sm md:text-base lg:text-lg px-8 py-5 rounded-2xl shadow-[0_5px_20px_rgba(0,168,107,0.3)] hover:bg-[#00c27a] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-80 disabled:hover:scale-100"
    >
      {isProcessing ? (
        <>
          <Loader2 size={22} className="animate-spin" /> PREPARANDO...
        </>
      ) : (
        <>
          CRIAR MINHA VITRINE <ArrowRight size={22} />
        </>
      )}
    </button>
  );
}
