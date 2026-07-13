"use client";

import { useRef } from "react";
import { Globe, Link as LinkIcon, Calendar, FileText } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "sonner";

interface MenuSectionProps {
  menuMode: "PDF" | "DIGITAL" | "AGENDA";
  setMenuMode: (val: "PDF" | "DIGITAL" | "AGENDA") => void;
  catalogPdf: string | null;
  setCatalogPdf: (val: string | null) => void;
  actionLink: string;
  setActionLink: (val: string) => void;
  setIsExternalLink: (val: boolean) => void; // Mantido para não quebrar o form pai
}

export function MenuSection({
  menuMode,
  setMenuMode,
  catalogPdf,
  setCatalogPdf,
  actionLink,
  setActionLink,
  setIsExternalLink,
}: MenuSectionProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Força o sistema a saber que é sempre um link externo quando escolhe loja ou agenda
  const handleModeChange = (mode: "PDF" | "DIGITAL" | "AGENDA") => {
    setMenuMode(mode);
    if (mode === "DIGITAL" || mode === "AGENDA") {
      setIsExternalLink(true);
    } else {
      setIsExternalLink(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 min-h-[400px] flex flex-col transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-800">
          <Globe size={18} className="text-orange-500" /> Integração de Vendas
        </h2>
      </div>

      <p className="text-[10px] text-slate-400 font-bold mb-6 max-w-xl">
        Conecte o Tafanu ao seu sistema atual. Redirecione seus clientes para o
        seu{" "}
        <span className="text-orange-500 font-black">
          E-commerce / Delivery
        </span>
        , para a sua{" "}
        <span className="text-indigo-500 font-black">Agenda Online</span>, ou
        simplesmente anexe o seu{" "}
        <span className="text-emerald-500 font-black">Menu em PDF</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-2 rounded-3xl mb-8 shrink-0 border border-slate-100">
        <button
          type="button"
          onClick={() => handleModeChange("DIGITAL")}
          className={`py-4 px-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 ${
            menuMode === "DIGITAL"
              ? "bg-white text-orange-600 shadow-md ring-1 ring-black/5 scale-[1.02]"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LinkIcon size={20} /> Link da Loja
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("AGENDA")}
          className={`py-4 px-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 ${
            menuMode === "AGENDA"
              ? "bg-white text-indigo-600 shadow-md ring-1 ring-black/5 scale-[1.02]"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar size={20} /> Link da Agenda
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("PDF")}
          className={`py-4 px-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 ${
            menuMode === "PDF"
              ? "bg-white text-emerald-600 shadow-md ring-1 ring-black/5 scale-[1.02]"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText size={20} /> Arquivo PDF
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* MODO LINKS (LOJA OU AGENDA) */}
        {(menuMode === "DIGITAL" || menuMode === "AGENDA") && (
          <div
            className={`rounded-[2rem] p-6 md:p-8 animate-in fade-in zoom-in duration-300 border ${menuMode === "DIGITAL" ? "bg-orange-50 border-orange-100" : "bg-indigo-50 border-indigo-100"}`}
          >
            <h3
              className={`text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${menuMode === "DIGITAL" ? "text-orange-800" : "text-indigo-800"}`}
            >
              <Globe size={16} /> Para onde vamos mandar seu cliente?
            </h3>
            <p
              className={`text-[10px] font-bold mb-4 leading-relaxed ${menuMode === "DIGITAL" ? "text-orange-600/80" : "text-indigo-600/80"}`}
            >
              Cole abaixo o link oficial do seu{" "}
              {menuMode === "DIGITAL"
                ? "iFood, Goomer, Nuvemshop, Shopify, Catálogo do WhatsApp ou E-commerce."
                : "Calendly, Trinks, Booksy, WhatsApp ou sistema de reservas."}
            </p>
            <input
              type="url"
              value={actionLink}
              onChange={(e) => setActionLink(e.target.value)}
              placeholder={
                menuMode === "DIGITAL"
                  ? "Ex: https://ifood.com.br/sua-loja"
                  : "Ex: https://calendly.com/sua-agenda"
              }
              className={`w-full h-14 px-5 bg-white rounded-xl text-xs font-bold border outline-none focus:ring-2 ${menuMode === "DIGITAL" ? "border-orange-200 ring-orange-500/20 text-orange-900 placeholder:text-orange-300" : "border-indigo-200 ring-indigo-500/20 text-indigo-900 placeholder:text-indigo-300"}`}
            />
          </div>
        )}

        {/* MODO PDF */}
        {menuMode === "PDF" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            {catalogPdf ? (
              <div className="w-full h-16 border border-emerald-200 bg-emerald-50 rounded-2xl flex items-center justify-between px-6 shadow-sm">
                <span className="text-xs font-black text-emerald-700 truncate mr-4 uppercase tracking-widest">
                  📄 Catálogo Anexado
                </span>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={() => setCatalogPdf(null)}
                    className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-rose-100"
                  >
                    Excluir
                  </button>
                  <a
                    href={catalogPdf}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg shadow-sm"
                  >
                    Abrir PDF
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
                >
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest group-hover:text-emerald-700">
                    Clique aqui para anexar seu PDF
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400">
                    Tamanho máximo: 8MB
                  </span>
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      toast.error(
                        "Apenas arquivos PDF originais são permitidos.",
                      );
                      e.target.value = "";
                      return;
                    }

                    if (file.size > 8 * 1024 * 1024) {
                      toast.error("O catálogo é muito pesado. (Máx 8MB)");
                      e.target.value = "";
                      return;
                    }
                    e.target.value = "";
                    toast.loading("Enviando PDF...", { id: "upload-pdf" });
                    try {
                      const res = await uploadFiles("pdfUploader", {
                        files: [file],
                      });
                      if (res && res[0]) {
                        setCatalogPdf(res[0].ufsUrl);
                        toast.success("Catálogo enviado com sucesso!", {
                          id: "upload-pdf",
                        });
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Erro ao enviar arquivo.", {
                        id: "upload-pdf",
                      });
                    }
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
