"use client";

import { useState } from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Store,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { ProductData } from "./business-editor/types";

interface VitrineCardapioProps {
  businessName: string;
  whatsapp: string;
  themeColor: string; // Mantido apenas na tipagem para não dar erro nos outros layouts, mas 100% ignorado no visual.
  products: ProductData[];
  onClose: () => void;
}

// 🚀 SUBCOMPONENTE: Produto Individual (Organizado e com Detalhes Ocultos)
const ProductItem = ({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: ProductData;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-0 transition-all hover:shadow-md hover:border-slate-200">
      {/* 🟢 LINHA PRINCIPAL: Foto + Info Básica + Botões */}
      <div className="flex gap-4">
        {/* 📸 FOTO DO PRODUTO */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <Store size={24} className="text-slate-300" />
          )}
        </div>
        {/* 📝 DADOS E AÇÕES */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div>
            <h3 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-wide leading-tight truncate">
              {product.name}
            </h3>

            {/* 🚀 LÓGICA DE PREÇO PROMOCIONAL */}
            <div className="flex items-baseline gap-2 mt-1">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[10px] font-black text-rose-400 line-through">
                  R$ {product.oldPrice.toFixed(2)}
                </span>
              )}
              <span className="font-black text-sm text-slate-900">
                R$ {product.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* 🚀 BOTÃO DE DETALHES (Oculto por padrão, agora padronizado em Indigo) */}
            {product.description ? (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                {showDetails ? (
                  <>
                    <ChevronUp size={14} /> Ocultar
                  </>
                ) : (
                  <>
                    <Info size={14} /> Detalhes
                  </>
                )}
              </button>
            ) : (
              <div /> /* Espaçador se não tiver descrição */
            )}

            {/* 🚀 BOTÃO DE QUANTIDADE */}
            {quantity === 0 ? (
              <button
                onClick={onAdd}
                className="h-8 px-5 rounded-xl text-[10px] font-black uppercase text-white shadow-md active:scale-95 transition-all bg-slate-900 hover:bg-slate-800"
              >
                Adicionar
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-2 h-8 border border-slate-200 shadow-inner">
                <button
                  onClick={onRemove}
                  className="text-rose-500 active:scale-90 p-1 hover:text-rose-600"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="text-[11px] font-black w-4 text-center text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={onAdd}
                  className="text-emerald-500 active:scale-90 p-1 hover:text-emerald-600"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🟢 LINHA OCULTA: Descrição Expandida */}
      {showDetails && product.description && (
        <div className="mt-4 pt-3 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default function VitrineCardapio({
  businessName,
  whatsapp,
  products,
  onClose,
}: VitrineCardapioProps) {
  const [cart, setCart] = useState<
    { product: ProductData; quantity: number }[]
  >([]);

  const handleQuantity = (product: ProductData, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.name === product.name);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0)
          return prev.filter((item) => item.product.name !== product.name);
        return prev.map((item) =>
          item.product.name === product.name
            ? { ...item, quantity: newQuantity }
            : item,
        );
      }
      if (delta > 0) return [...prev, { product, quantity: 1 }];
      return prev;
    });
  };

  const getQuantity = (productName: string) => {
    return (
      cart.find((item) => item.product.name === productName)?.quantity || 0
    );
  };

  const totalCart = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let text = `*NOVO PEDIDO - ${businessName}*\n\n`;
    cart.forEach((item) => {
      text += `• ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2)})\n`;
    });
    text += `\n*TOTAL: R$ ${totalCart.toFixed(2)}*\n\n`;
    text += `Olá! Gostaria de confirmar este pedido.`;

    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(
        `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else {
      alert("O lojista ainda não cadastrou um WhatsApp para receber pedidos.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end md:justify-center md:p-6">
      <div className="bg-[#F8FAFC] w-full md:max-w-2xl md:mx-auto md:h-auto md:max-h-[85vh] h-[92vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300">
        {/* 🟢 HEADER (Fixo no topo da loja) */}
        <div className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm shrink-0 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner bg-indigo-50 text-indigo-500">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-widest leading-none">
                Menu Digital
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate max-w-[200px] md:max-w-md">
                {businessName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-all active:scale-90 border border-slate-100"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 🟢 LISTA DE PRODUTOS (Área Central Rolável) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar">
          {products.filter((p) => p.isActive).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Nenhum produto disponível no momento.
              </p>
            </div>
          ) : (
            products
              .filter((p) => p.isActive)
              .map((product, idx) => (
                <ProductItem
                  key={idx}
                  product={product}
                  quantity={getQuantity(product.name)}
                  onAdd={() => handleQuantity(product, 1)}
                  onRemove={() => handleQuantity(product, -1)}
                />
              ))
          )}
        </div>

        {/* 🟢 RODAPÉ DO CARRINHO (Fixo no fundo, empurrando a lista pra cima) */}
        {cart.length > 0 && (
          <div className="bg-white p-4 md:p-6 border-t border-slate-100 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-30">
            <button
              onClick={handleCheckout}
              className="w-full h-16 rounded-2xl flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group overflow-hidden relative bg-slate-900 hover:bg-slate-800"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white shrink-0">
                  <ShoppingBag size={14} strokeWidth={2.5} />
                </div>
                {/* 🚀 CIRURGIA AQUI: Substituí span por div, removi o drop-shadow e forcei bg-transparent */}
                <div className="text-white bg-transparent font-black uppercase tracking-widest text-[10px] md:text-xs m-0 p-0">
                  Finalizar Pedido (
                  {cart.reduce((acc, item) => acc + item.quantity, 0)})
                </div>
              </div>

              <div className="text-white text-xs font-black uppercase bg-white/10 px-4 py-2 rounded-xl shadow-inner border border-white/10 shrink-0 relative z-10">
                R$ {totalCart.toFixed(2)}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
