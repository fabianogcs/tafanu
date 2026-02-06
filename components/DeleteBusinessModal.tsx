"use client";

import { useState } from "react";
import { deleteBusiness } from "@/app/actions";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteBusinessModal({ slug }: { slug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteBusiness(slug);

    if (res.success) {
      router.push("/"); // Redireciona para a home após deletar e virar visitante
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest border border-red-200 px-4 py-2 rounded-lg transition-all"
      >
        Encerrar Anúncio e Assinatura
      </button>
    );

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-500/20">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="text-red-600 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-2">
            Zona de Perigo
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Isso apagará permanentemente seu anúncio, fotos, vídeos e
            **encerrará sua assinatura**. Sua conta voltará ao nível gratuito e
            esta ação não pode ser desfeita.
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Sim, apagar e encerrar"
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
