"use client";

import { useState } from "react";
import {
  Store,
  Trash2,
  Camera,
  Loader2,
  Plus,
  Image as ImageIcon,
  Tag,
  X,
} from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";
import { ProductData } from "./types";

interface MenuSectionProps {
  products: ProductData[];
  setProducts: (
    val: ProductData[] | ((prev: ProductData[]) => ProductData[]),
  ) => void;
}

export function MenuSection({ products = [], setProducts }: MenuSectionProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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

  // 🚀 NOVAS FUNÇÕES PARA OS ADICIONAIS
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
                <Loader2 size={24} className="text-orange-500 animate-spin" />
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
                  placeholder="Ex: X-Bacon Artesanal"
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
                            e.target.value.replace(/[^0-9.,]/g, "") as any,
                          )
                        }
                        onBlur={(e) => {
                          const cleanVal = String(e.target.value)
                            .replace(/[^0-9.,]/g, "")
                            .replace(",", ".");
                          let finalNumber = parseFloat(cleanVal);

                          // 🛡️ CFO FIX: Trava do preço promocional antigo
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
                        onClick={() => handleUpdateProduct(i, "oldPrice", 0)}
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
                      value={String(product.price) === "0" ? "" : product.price}
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

                        // 🛡️ CFO FIX: Teto financeiro do Produto Principal!
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
                placeholder="Descrição curta (Ex: Pão brioche... Pressione Enter para pular linha!)"
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
                        placeholder="Ex: Bacon Extra"
                        value={extra.name}
                        onChange={(e) =>
                          handleUpdateExtra(i, eIdx, "name", e.target.value)
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
                          value={String(extra.price) === "0" ? "" : extra.price}
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
            <Plus size={16} strokeWidth={2.5} /> Adicionar Novo Produto
          </button>
        )}
      </div>
    </div>
  );
}
