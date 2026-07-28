"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// 🚀 CTO FIX: Agora aceita userId opcional ou nulo (para visitantes públicos da Web e SEO)
export default function CheckoutButton({ userId }: { userId?: string | null }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCreateVitrine = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    // 🛡️ DRIBLE WHITE HAT DA PLAY STORE: Detecta se está rodando dentro do App (PWA Standalone)
    const isRunningInApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isRunningInApp) {
      // 🎁 SE ESTIVER NO APP (TWA/PWA):
      if (userId) {
        // Se logado, dispara o link mágico por e-mail para pagar no Navegador (Longe do radar de cobrança da Apple/Google)
        router.push(`/api/checkout-magico?uid=${userId}`);
      } else {
        // Se não tiver conta no App, manda logar/criar conta com retorno automático para o checkout
        router.push("/login?callbackUrl=/checkout&intent=assinante");
      }
    } else {
      // ⚡ SE ESTIVER NO DESKTOP OU NAVEGADOR WEB: Vai direto para o Checkout sem burocracia!
      router.push("/checkout");
    }
  };

  return (
    <button
      onClick={handleCreateVitrine}
      disabled={isProcessing}
      className="w-full bg-tafanu-action text-white font-black text-sm md:text-base lg:text-lg px-8 py-5 rounded-2xl shadow-[0_5px_20px_rgba(0,168,107,0.3)] hover:bg-[#00c27a] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-80 disabled:hover:scale-100 cursor-pointer"
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
