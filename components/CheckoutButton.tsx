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
    // Faz o navegador ir para a rota mágica silenciosamente
    router.push(`/api/checkout-magico?uid=${userId}`);
  };

  return (
    <button
      onClick={handleCreateVitrine}
      disabled={isProcessing}
      className="w-full bg-emerald-500 text-[#050814] font-black text-sm md:text-base lg:text-lg px-8 py-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-80 disabled:hover:scale-100"
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
