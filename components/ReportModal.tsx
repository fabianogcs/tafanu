"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Flag, Loader2, AlertTriangle, X } from "lucide-react";
import { createReport } from "@/app/actions";

export default function ReportModal({
  businessSlug,
}: {
  businessSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("Conteúdo Impróprio");
  const [details, setDetails] = useState("");

  const reasons = [
    "Conteúdo Impróprio / Ofensivo",
    "Plágio / Cópia do meu negócio",
    "Informações Falsas",
    "Spam / Golpe",
    "Outro",
  ];

  async function handleSubmit() {
    setLoading(true);
    const res = await createReport(businessSlug, reason, details);
    setLoading(false);
    if (res.success) {
      toast.success("Denúncia recebida", {
        description: "Nossa equipe irá analisar o caso em breve.",
      });
      setIsOpen(false);
      setDetails("");
    } else {
      toast.error("Não foi possível enviar a denúncia. Tente novamente.");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 bg-red-50/30 hover:bg-red-50 hover:border-red-200 transition-all"
      >
        <Flag
          size={12}
          className="text-red-400 group-hover:text-red-600 transition-colors"
        />
        <span className="text-[10px] font-black text-red-400 group-hover:text-red-600 uppercase tracking-widest transition-colors">
          Reportar este perfil
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-red-50 rounded-full mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic">
                Central de Denúncia
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Sua denúncia ajuda a manter o Tafanu seguro.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">
                  Qual o problema?
                </label>
                {/* FORÇANDO TEXTO PRETO E FUNDO BRANCO NAS OPÇÕES */}
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-red-100 transition-all appearance-none cursor-pointer"
                >
                  {reasons.map((r) => (
                    <option
                      key={r}
                      value={r}
                      className="text-slate-900 bg-white"
                    >
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">
                  Mais detalhes (Opcional)
                </label>
                {/* FORÇANDO TEXTO PRETO NO TEXTAREA */}
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none h-28 resize-none focus:ring-2 ring-red-100 transition-all"
                  placeholder="Explique o que aconteceu..."
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-14 bg-red-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Confirmar Denúncia"
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full h-10 text-slate-400 font-bold uppercase text-[9px] hover:text-slate-600 transition-colors"
                >
                  Voltar para o perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
