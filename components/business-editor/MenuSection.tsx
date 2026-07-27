"use client";

import { useRef } from "react";
import {
  Globe,
  ShoppingBag,
  Calendar,
  FileText,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "sonner";

interface MenuSectionProps {
  menuMode: "PDF" | "DIGITAL" | "AGENDA";
  setMenuMode: (val: "PDF" | "DIGITAL" | "AGENDA") => void;
  catalogPdf: string | null;
  setCatalogPdf: (val: string | null) => void;
  actionLink: string;
  setActionLink: (val: string) => void;
  agendaLink: string; // 🚀 INJETADO
  setAgendaLink: (val: string) => void; // 🚀 INJETADO
  setIsExternalLink: (val: boolean) => void;
}

export function MenuSection({
  catalogPdf,
  setCatalogPdf,
  actionLink,
  setActionLink,
  agendaLink,
  setAgendaLink,
  setIsExternalLink,
}: MenuSectionProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Validador inteligente de links para avisar se esquecer do https://
  const handleLinkChange = (type: "action" | "agenda", value: string) => {
    if (type === "action") {
      setActionLink(value);
    } else {
      setAgendaLink(value);
    }
    // Avisa o painel pai que existem links externos ativos
    setIsExternalLink(
      !!(value.trim() || actionLink.trim() || agendaLink.trim()),
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col transition-all duration-500 space-y-8">
      {/* CABEÇALHO DO HUB */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-800">
            <Globe size={18} className="text-indigo-500" /> Hub Multi-Canal de
            Vendas & Reservas
          </h2>
          <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
            <Sparkles size={12} /> 3 em 1 Liberado
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
          Você não precisa mais escolher apenas uma opção! Preencha os links e
          arquivos abaixo que desejar. Sua vitrine pública exibirá botões
          inteligentes para{" "}
          <strong className="text-slate-800">
            todos os canais que você ativar
          </strong>
          .
        </p>
      </div>

      {/* GRADE DOS 3 CANAIS DE AÇÃO */}
      <div className="space-y-6">
        {/* CANAL 1: LOJA / PEDIDOS ONLINE */}
        <div className="p-6 rounded-3xl bg-orange-50/60 border border-orange-100 transition-all focus-within:ring-2 ring-orange-500/20">
          <div className="flex items-center gap-2 mb-2 text-orange-900">
            <ShoppingBag size={18} className="text-orange-600" />
            <label className="text-xs font-black uppercase tracking-wider">
              1. Link de Loja / Pedidos Online
            </label>
          </div>
          <p className="text-[11px] font-medium text-orange-700/80 mb-3">
            Para onde enviar quem quer comprar? Cole o link do seu iFood,
            Goomer, Nuvemshop, Shopify, Catálogo do WhatsApp ou E-commerce.
          </p>
          <input
            type="url"
            value={actionLink}
            onChange={(e) => handleLinkChange("action", e.target.value)}
            placeholder="Ex: https://ifood.com.br/sua-loja ou https://sualoja.com.br"
            className="w-full h-12 px-4 bg-white rounded-xl text-xs font-bold border border-orange-200 text-slate-800 placeholder:text-slate-400 outline-none shadow-sm"
          />
        </div>

        {/* CANAL 2: AGENDA / RESERVAS */}
        <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 transition-all focus-within:ring-2 ring-indigo-500/20">
          <div className="flex items-center gap-2 mb-2 text-indigo-900">
            <Calendar size={18} className="text-indigo-600" />
            <label className="text-xs font-black uppercase tracking-wider">
              2. Link de Agendamento / Reservas
            </label>
          </div>
          <p className="text-[11px] font-medium text-indigo-700/80 mb-3">
            Trabalha com horários? Cole o link do seu Calendly, Trinks, Booksy,
            Doctoralia ou link de agendamento do WhatsApp.
          </p>
          <input
            type="url"
            value={agendaLink}
            onChange={(e) => handleLinkChange("agenda", e.target.value)}
            placeholder="Ex: https://calendly.com/sua-agenda ou https://trinks.com/..."
            className="w-full h-12 px-4 bg-white rounded-xl text-xs font-bold border border-indigo-200 text-slate-800 placeholder:text-slate-400 outline-none shadow-sm"
          />
        </div>

        {/* CANAL 3: CATÁLOGO / CARDÁPIO EM PDF */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2 text-emerald-900">
            <FileText size={18} className="text-emerald-600" />
            <label className="text-xs font-black uppercase tracking-wider">
              3. Catálogo ou Cardápio em PDF
            </label>
          </div>
          <p className="text-[11px] font-medium text-emerald-700/80 mb-4">
            Anexe seu arquivo oficial. Seus clientes poderão visualizar, dar
            zoom e explorar seu catálogo direto na vitrine sem gastar a memória
            do celular deles.
          </p>

          {catalogPdf ? (
            <div className="w-full h-16 border border-emerald-300 bg-white rounded-2xl flex items-center justify-between px-5 shadow-sm">
              <span className="text-xs font-black text-emerald-800 truncate mr-4 uppercase tracking-widest flex items-center gap-2">
                📄 Catálogo Anexado no Servidor
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCatalogPdf(null)}
                  className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} /> Excluir
                </button>
                <a
                  href={catalogPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Abrir PDF
                </a>
              </div>
            </div>
          ) : (
            <>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-emerald-300 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-white hover:border-emerald-400 transition-all group shadow-sm"
              >
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest group-hover:text-emerald-800 flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} /> Clique aqui para anexar seu
                  arquivo PDF
                </span>
                <span className="text-[10px] font-bold text-emerald-500">
                  Tamanho máximo permitido: 8MB
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
      </div>
    </div>
  );
}
