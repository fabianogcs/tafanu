"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelOrderByCustomer } from "@/app/actions";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      "Tem certeza que deseja cancelar este pedido?",
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    const res = await cancelOrderByCustomer(orderId);

    if (res.success) {
      toast.success(res.message);
      // Opcional: Recarrega a página para atualizar o status visualmente
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setIsCancelling(false);
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="w-full bg-rose-50 text-rose-600 border border-rose-200 font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
    >
      {isCancelling ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <XCircle size={16} />
      )}
      Cancelar Pedido
    </button>
  );
}
