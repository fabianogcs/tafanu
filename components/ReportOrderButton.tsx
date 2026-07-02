"use client";

import { useState } from "react";
import { ShieldAlert, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { reportOrderAction } from "@/app/actions";

export default function ReportOrderButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.error("Selecione um motivo.");

    setIsSubmitting(true);
    const res = await reportOrderAction(orderId, reason, details);

    if (res.success) {
      toast.success(res.message);
      setIsOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl flex justify-center items-center gap-2 uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-100"
      >
        <ShieldAlert size={14} /> Reportar Problema
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <h3 className="font-black text-slate-800 uppercase italic">
                Relatar Problema
              </h3>
            </div>

            <p className="text-[11px] font-bold text-slate-500 mb-4">
              Descreva o que houve com este pedido. Nossa equipe vai analisar
              para tomar medidas contra a loja ou o comprador.
            </p>

            <div className="space-y-3">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none text-slate-700"
              >
                <option value="">Selecione o problema...</option>
                <option value="Cliente não pagou/Trote">
                  Trote / Cliente não pagou
                </option>
                <option value="Loja não entregou">
                  A loja não entregou o pedido
                </option>
                <option value="Produto incorreto/estragado">
                  Produto incorreto ou estragado
                </option>
                <option value="Comportamento abusivo">
                  Ofensas ou comportamento abusivo
                </option>
                <option value="Outros">Outro problema</option>
              </select>

              <textarea
                placeholder="Detalhes adicionais (opcional)"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 outline-none resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-rose-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] shadow-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Enviar Denúncia ao Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
