"use client";

import { useState, useRef } from "react";
import {
  Store,
  Trash2,
  Camera,
  Loader2,
  Plus,
  Image as ImageIcon,
  Tag,
  X,
  ListChecks,
  Clock, // 🚀 AGORA O RELÓGIO ESTÁ AQUI!
} from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import { ProductData } from "./types";

interface MenuSectionProps {
  menuMode: "PDF" | "DIGITAL" | "AGENDA";
  setMenuMode: (val: "PDF" | "DIGITAL" | "AGENDA") => void;
  catalogPdf: string | null;
  setCatalogPdf: (val: string | null) => void;
  products: ProductData[];
  setProducts: (
    val: ProductData[] | ((prev: ProductData[]) => ProductData[]),
  ) => void;
  isService: boolean;
  agendaConfig?: any; // 🚀 RECEBE AQUI
  setAgendaConfig?: (val: any) => void;
}

export function MenuSection({
  menuMode,
  setMenuMode,
  catalogPdf,
  setCatalogPdf,
  products = [],
  setProducts,
  isService,
  agendaConfig, // 🚀 PUXA AQUI
  setAgendaConfig,
}: MenuSectionProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleAddProduct = () => {
    if (products.length >= 50) {
      toast.warning("O limite é de 50 produtos por cardápio.");
      return;
    }
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: 0,
        oldPrice: 0,
        isActive: true,
        imageUrl: "",
        extras: [],
      },
    ]);
    setUploadingIndex(null);
  };

  const handleRemoveProduct = (index: number) => {
    if (window.confirm("Deseja excluir este item do cardápio?")) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateProduct = (
    index: number,
    field: keyof ProductData,
    value: any,
  ) => {
    setProducts((prev) => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return newProducts;
    });
  };

  const handleAddExtra = (productIndex: number) => {
    const currentExtras = products[productIndex].extras || [];
    if (currentExtras.length >= 10) {
      toast.warning("Limite de 10 adicionais por produto.");
      return;
    }
    handleUpdateProduct(productIndex, "extras", [
      ...currentExtras,
      { name: "", price: 0 },
    ]);
  };

  const handleRemoveExtra = (productIndex: number, extraIndex: number) => {
    const newExtras = [...(products[productIndex].extras || [])];
    newExtras.splice(extraIndex, 1);
    handleUpdateProduct(productIndex, "extras", newExtras);
  };

  const handleUpdateExtra = (
    productIndex: number,
    extraIndex: number,
    field: string,
    value: any,
  ) => {
    const newExtras = [...(products[productIndex].extras || [])];
    newExtras[extraIndex] = { ...newExtras[extraIndex], [field]: value };
    handleUpdateProduct(productIndex, "extras", newExtras);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadingIndex(null);
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("A foto do produto é muito pesada (Máx 6MB).");
      e.target.value = "";
      setUploadingIndex(null);
      return;
    }
    setUploadingIndex(index);
    e.target.value = "";
    toast.loading("Otimizando e subindo foto...", { id: "upload-product" });
    try {
      const compressed = await compressImage(file);
      const res = await uploadFiles("imageUploader", { files: [compressed] });
      if (res && res.length > 0) {
        handleUpdateProduct(index, "imageUrl", res[0].ufsUrl);
        toast.success("Foto do produto adicionada!", { id: "upload-product" });
      }
    } catch (error) {
      toast.error("Erro ao enviar a imagem. Tente novamente.", {
        id: "upload-product",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-800">
          <ListChecks size={18} className="text-orange-500" /> Formato da
          Vitrine
        </h2>
      </div>

      <p className="text-[10px] text-slate-400 font-bold mb-6">
        Escolha o formato da sua vitrine. Você pode criar uma{" "}
        <span className="text-orange-500 font-black">
          Loja Digital interativa
        </span>{" "}
        ou anexar o seu <span className="text-emerald-500 font-black">PDF</span>
        .
      </p>

      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setMenuMode("DIGITAL")}
          className={`py-3 px-2 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            menuMode === "DIGITAL"
              ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-sm sm:text-base">🛍️</span> Catálogo
        </button>

        <button
          type="button"
          onClick={() => setMenuMode("PDF")}
          className={`py-3 px-2 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            menuMode === "PDF"
              ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-sm sm:text-base">📄</span> Menu PDF
        </button>

        <button
          type="button"
          // @ts-ignore: AGENDA será adicionado ao Prisma na próxima migração
          onClick={() => setMenuMode("AGENDA")}
          className={`py-3 px-2 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            menuMode === "AGENDA"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-sm sm:text-base">📅</span> Agenda
        </button>
      </div>

      {/* 🚀 AVISO INTELIGENTE DE UX PARA O MODO AGENDA */}
      {menuMode === "AGENDA" && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in zoom-in duration-300 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-1.5">
              A sua Agenda Mágica
            </h3>
            <p className="text-[10px] font-medium text-emerald-700 leading-relaxed max-w-2xl">
              1. Crie seus <strong>Serviços</strong> na lista abaixo.
              <br />
              2. Defina logo abaixo o <strong>
                Tempo de cada atendimento
              </strong>{" "}
              e a <strong>Sua Grade Semanal</strong> (Independente do horário de
              abertura da loja!).
            </p>
          </div>
        </div>
      )}

      {/* 🚀 O NOVO CONSTRUTOR DE AGENDA INDEPENDENTE */}
      {menuMode === "AGENDA" && agendaConfig && setAgendaConfig && (
        <div className="mb-8 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">
                Grade da Agenda Semanal
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                Configure os dias e intervalos exatos que você atende seus
                clientes.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">
                ⏳ Tempo padrão de cada serviço
              </label>
              <select
                value={agendaConfig.duration}
                onChange={(e) =>
                  setAgendaConfig({
                    ...agendaConfig,
                    duration: Number(e.target.value),
                  })
                }
                className="w-full md:w-64 h-14 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 cursor-pointer"
              >
                <option value={15}>15 Minutos (Rápido)</option>
                <option value={30}>30 Minutos (Padrão)</option>
                <option value={45}>45 Minutos</option>
                <option value={60}>1 Hora</option>
                <option value={90}>1 Hora e Meia</option>
                <option value={120}>2 Horas</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">
                📅 Dias e Horários de Trabalho
              </label>
              <div className="space-y-3">
                {[
                  "Domingo",
                  "Segunda",
                  "Terça",
                  "Quarta",
                  "Quinta",
                  "Sexta",
                  "Sábado",
                ].map((dia, index) => {
                  const dayData = agendaConfig.hours.find(
                    (h: any) => h.dayOfWeek === index,
                  ) || {
                    dayOfWeek: index,
                    openTime: "09:00",
                    closeTime: "18:00",
                    isClosed: true,
                  };

                  return (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${dayData.isClosed ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-indigo-100 shadow-sm"}`}
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0 w-32 shrink-0">
                        <input
                          type="checkbox"
                          checked={!dayData.isClosed}
                          onChange={(e) => {
                            const newHours = [...agendaConfig.hours];
                            const idx = newHours.findIndex(
                              (h: any) => h.dayOfWeek === index,
                            );
                            if (idx >= 0)
                              newHours[idx].isClosed = !e.target.checked;
                            setAgendaConfig({
                              ...agendaConfig,
                              hours: newHours,
                            });
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-700">
                          {dia}
                        </span>
                      </div>

                      <div
                        className={`flex flex-1 sm:justify-end items-center gap-3 ${dayData.isClosed ? "pointer-events-none" : ""}`}
                      >
                        <input
                          type="time"
                          value={dayData.openTime}
                          onChange={(e) => {
                            const newHours = [...agendaConfig.hours];
                            const idx = newHours.findIndex(
                              (h: any) => h.dayOfWeek === index,
                            );
                            if (idx >= 0)
                              newHours[idx].openTime = e.target.value;
                            setAgendaConfig({
                              ...agendaConfig,
                              hours: newHours,
                            });
                          }}
                          className="w-24 md:w-32 h-12 px-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-center outline-none focus:ring-2 ring-indigo-500/20"
                        />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          até
                        </span>
                        <input
                          type="time"
                          value={dayData.closeTime}
                          onChange={(e) => {
                            const newHours = [...agendaConfig.hours];
                            const idx = newHours.findIndex(
                              (h: any) => h.dayOfWeek === index,
                            );
                            if (idx >= 0)
                              newHours[idx].closeTime = e.target.value;
                            setAgendaConfig({
                              ...agendaConfig,
                              hours: newHours,
                            });
                          }}
                          className="w-24 md:w-32 h-12 px-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-center outline-none focus:ring-2 ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {menuMode === "PDF" ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          {catalogPdf ? (
            <div className="w-full h-14 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between px-6">
              <span className="text-xs font-bold text-emerald-700 truncate mr-4">
                Catálogo Anexado ✅
              </span>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setCatalogPdf(null)}
                  className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600"
                >
                  Remover
                </button>
                <a
                  href={catalogPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 underline"
                >
                  Visualizar
                </a>
              </div>
            </div>
          ) : (
            <>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="w-full h-14 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors group"
              >
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:text-emerald-700">
                  Anexar Arquivo PDF (Max 8MB)
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
                      "Formato inválido. Apenas arquivos PDF originais são permitidos.",
                    );
                    e.target.value = "";
                    return;
                  }

                  if (file.size > 8 * 1024 * 1024) {
                    toast.error(
                      "O catálogo é muito pesado. Por favor, comprima seu PDF para no máximo 8MB.",
                    );
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
      ) : (
        <div className="w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full border-t border-slate-100 pt-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-400">
                Itens Cadastrados
              </h2>
              <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-3 py-1 rounded-full">
                {products.length} / 50
              </span>
            </div>

            <div className="space-y-4">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 items-start md:items-center relative transition-all focus-within:border-orange-200 focus-within:ring-2 ring-orange-500/10"
                >
                  <input
                    type="file"
                    accept="image/*"
                    id={`file-upload-${i}`}
                    onChange={(e) => handleImageUpload(e, i)}
                    className="hidden"
                  />
                  <div
                    onClick={() =>
                      document.getElementById(`file-upload-${i}`)?.click()
                    }
                    className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer group relative"
                  >
                    {uploadingIndex === i ? (
                      <Loader2
                        size={24}
                        className="text-orange-500 animate-spin"
                      />
                    ) : product.imageUrl ? (
                      <>
                        <img
                          src={product.imageUrl}
                          alt="Produto"
                          className="w-full h-full object-cover group-hover:scale-110 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-300 group-hover:text-orange-400 transition-colors">
                        <ImageIcon size={24} />
                        <span className="text-[8px] font-black uppercase mt-1">
                          Foto
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          handleUpdateProduct(i, "name", e.target.value)
                        }
                        maxLength={60}
                        placeholder={
                          isService
                            ? "Ex: Corte de Cabelo / Consulta"
                            : "Ex: X-Bacon Artesanal"
                        }
                        className="flex-1 h-10 px-3 bg-white rounded-lg text-xs font-black border outline-none text-slate-800 placeholder:text-slate-300"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        {product.oldPrice !== 0 &&
                        product.oldPrice !== null &&
                        product.oldPrice !== undefined ? (
                          <div className="relative w-24 shrink-0 animate-in fade-in zoom-in duration-300">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-rose-300 uppercase">
                              De:
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                String(product.oldPrice) === ""
                                  ? ""
                                  : product.oldPrice
                              }
                              onChange={(e) =>
                                handleUpdateProduct(
                                  i,
                                  "oldPrice",
                                  e.target.value.replace(
                                    /[^0-9.,]/g,
                                    "",
                                  ) as any,
                                )
                              }
                              onBlur={(e) => {
                                const cleanVal = String(e.target.value)
                                  .replace(/[^0-9.,]/g, "")
                                  .replace(",", ".");
                                let finalNumber = parseFloat(cleanVal);

                                if (isNaN(finalNumber) || finalNumber < 0)
                                  finalNumber = 0;
                                if (finalNumber > 10000) finalNumber = 10000;

                                handleUpdateProduct(
                                  i,
                                  "oldPrice",
                                  parseFloat(finalNumber.toFixed(2)),
                                );
                              }}
                              placeholder="0,00"
                              className="w-full h-10 pl-7 pr-2 bg-rose-50/50 rounded-lg text-[10px] font-black border border-rose-200 outline-none focus:ring-2 ring-rose-500/20 text-rose-400 placeholder:text-rose-300 line-through"
                            />
                            <button
                              onClick={() =>
                                handleUpdateProduct(i, "oldPrice", 0)
                              }
                              className="absolute -top-2 -right-2 bg-white text-rose-500 rounded-full border border-rose-100 shadow-sm p-0.5 hover:scale-110 transition-transform"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdateProduct(i, "oldPrice", "" as any)
                            }
                            title="Ativar Promoção"
                            className="h-10 px-3 border border-dashed border-orange-200 bg-orange-50 text-orange-500 rounded-lg text-[10px] font-black uppercase hover:bg-orange-100 hover:border-orange-300 transition-colors flex items-center gap-1"
                          >
                            <Tag size={12} strokeWidth={3} /> Promo
                          </button>
                        )}
                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              String(product.price) === "0" ? "" : product.price
                            }
                            onChange={(e) =>
                              handleUpdateProduct(
                                i,
                                "price",
                                e.target.value.replace(/[^0-9.,]/g, "") as any,
                              )
                            }
                            onBlur={(e) => {
                              const cleanVal = String(e.target.value)
                                .replace(/[^0-9.,]/g, "")
                                .replace(",", ".");
                              let finalNumber = parseFloat(cleanVal);

                              if (isNaN(finalNumber) || finalNumber < 0)
                                finalNumber = 0;
                              if (finalNumber > 10000) {
                                toast.error(
                                  "O valor máximo permitido por item é de R$ 10.000,00.",
                                );
                                finalNumber = 10000;
                              }

                              handleUpdateProduct(
                                i,
                                "price",
                                parseFloat(finalNumber.toFixed(2)),
                              );
                            }}
                            placeholder="0,00"
                            className="w-full h-10 pl-8 pr-3 bg-white rounded-lg text-xs font-black border outline-none focus:ring-2 ring-emerald-500/20 text-emerald-600 placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={product.description || ""}
                      onChange={(e) =>
                        handleUpdateProduct(i, "description", e.target.value)
                      }
                      maxLength={250}
                      rows={2}
                      placeholder={
                        isService
                          ? "Descrição curta (Ex: Duração aprox. 45 min... Pressione Enter para pular linha!)"
                          : "Descrição curta (Ex: Pão brioche... Pressione Enter para pular linha!)"
                      }
                      className="w-full p-3 bg-white rounded-lg text-xs font-medium border outline-none text-slate-600 placeholder:text-slate-300 resize-none min-h-[60px]"
                    />

                    {/* 🚀 CAIXA DE ADICIONAIS ESTILO iFOOD */}
                    <div className="w-full mt-2 pt-3 border-t border-slate-200/60">
                      <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5 mb-2">
                        <Plus size={12} /> Adicionais / Complementos (Opcional)
                      </label>
                      <div className="space-y-2">
                        {(product.extras || []).map((extra, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200"
                          >
                            <input
                              type="text"
                              placeholder={
                                isService
                                  ? "Ex: Lavagem Especial"
                                  : "Ex: Bacon Extra"
                              }
                              value={extra.name}
                              onChange={(e) =>
                                handleUpdateExtra(
                                  i,
                                  eIdx,
                                  "name",
                                  e.target.value,
                                )
                              }
                              maxLength={40}
                              className="flex-1 h-8 px-2 bg-slate-50 rounded-md text-[10px] font-bold outline-none border border-transparent focus:border-orange-200 focus:bg-white transition-all"
                            />
                            <div className="relative w-24 shrink-0">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                                + R$
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  String(extra.price) === "0" ? "" : extra.price
                                }
                                onChange={(e) =>
                                  handleUpdateExtra(
                                    i,
                                    eIdx,
                                    "price",
                                    e.target.value.replace(/[^0-9.,]/g, ""),
                                  )
                                }
                                onBlur={(e) => {
                                  const cleanVal = String(e.target.value)
                                    .replace(/[^0-9.,]/g, "")
                                    .replace(",", ".");
                                  const finalNumber = parseFloat(cleanVal);
                                  handleUpdateExtra(
                                    i,
                                    eIdx,
                                    "price",
                                    isNaN(finalNumber)
                                      ? 0
                                      : parseFloat(finalNumber.toFixed(2)),
                                  );
                                }}
                                className="w-full h-8 pl-8 pr-2 bg-slate-50 rounded-md text-[10px] font-black outline-none border border-transparent focus:border-emerald-200 focus:bg-white text-emerald-600"
                                placeholder="0,00"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveExtra(i, eIdx)}
                              className="text-rose-300 hover:text-rose-500 transition-colors p-1"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {(product.extras || []).length < 10 && (
                        <button
                          onClick={() => handleAddExtra(i)}
                          className="mt-2 w-full py-2 bg-white text-orange-400 hover:bg-orange-50 hover:text-orange-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-dashed border-orange-200 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={12} strokeWidth={3} /> Adicional
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveProduct(i)}
                    className="absolute -top-3 -right-3 md:relative md:top-0 md:right-0 p-2.5 bg-white text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all border shadow-sm shrink-0"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {products.length < 50 && (
                <button
                  onClick={handleAddProduct}
                  className="w-full h-14 border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-xl text-[10px] font-black text-orange-500 uppercase hover:bg-orange-50 hover:border-orange-400 transition-all flex items-center justify-center gap-2 tracking-widest mt-4"
                >
                  <Plus size={16} strokeWidth={2.5} />{" "}
                  {isService
                    ? "Adicionar Novo Serviço"
                    : "Adicionar Novo Produto"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
