"use client";

import {
  Instagram,
  Music2,
  Facebook,
  Globe,
  ShoppingCart,
  MessageCircle,
  PhoneCall,
  Truck,
  Coins, // 🚀 NOVO ÍCONE DE MOEDA
} from "lucide-react";
import { contactPlaceholders } from "./constants";
import { formatPhoneNumber, cleanSocialHandle } from "@/lib/normalize";

interface Socials {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  shopee: string;
  mercadoLivre: string;
  shein: string;
  ifood: string;
}

interface ConnectionsSectionProps {
  socials: Socials;
  setSocials: (socials: Socials) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  hasDelivery: boolean;
  setHasDelivery: (val: boolean) => void;
  deliveryFee: number;
  setDeliveryFee: (val: number) => void;
  deliveryRadius: number;
  setDeliveryRadius: (val: number) => void;
  isService: boolean;
}

export function ConnectionsSection({
  socials,
  setSocials,
  whatsapp,
  setWhatsapp,
  phone,
  setPhone,
  hasDelivery,
  setHasDelivery,
  deliveryFee, // 🚀 NOVO
  setDeliveryFee, // 🚀
  deliveryRadius, // 🚀 AQUI
  setDeliveryRadius, // 🚀 AQUI
  isService,
}: ConnectionsSectionProps) {
  const updateSocial = (id: keyof Socials, value: string) => {
    setSocials({ ...socials, [id]: value });
  };

  return (
    <div className="space-y-8">
      {/* CONTATOS PRINCIPAIS */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* WhatsApp (Layout alinhado com as Redes Sociais) */}
        <label className="flex-1 flex items-center gap-3 p-2 bg-emerald-50/30 rounded-2xl border border-emerald-100 transition-all focus-within:bg-emerald-50 focus-within:ring-4 ring-emerald-100/50 focus-within:border-transparent group cursor-text">
          <div className="w-12 h-12 shrink-0 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm transition-transform group-focus-within:scale-105">
            <MessageCircle size={22} fill="currentColor" />
          </div>
          <div className="flex-1 pr-4">
            <span className="text-[8px] font-black uppercase text-emerald-600 block mb-0.5">
              WhatsApp Business
            </span>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhoneNumber(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="bg-transparent w-full text-[13px] md:text-sm font-black text-slate-700 outline-none placeholder:font-normal placeholder:text-emerald-300"
            />
          </div>
        </label>

        {/* Telefone (Layout alinhado com as Redes Sociais) */}
        <label className="flex-1 flex items-center gap-3 p-2 bg-indigo-50/30 rounded-2xl border border-indigo-100 transition-all focus-within:bg-indigo-50 focus-within:ring-4 ring-indigo-100/50 focus-within:border-transparent group cursor-text">
          <div className="w-12 h-12 shrink-0 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-sm transition-transform group-focus-within:scale-105">
            <PhoneCall size={20} />
          </div>
          <div className="flex-1 pr-4">
            <span className="text-[8px] font-black uppercase text-indigo-600 block mb-0.5">
              Ligações
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(00) 0000-0000"
              maxLength={15}
              className="bg-transparent w-full text-[13px] md:text-sm font-black text-slate-700 outline-none placeholder:font-normal placeholder:text-indigo-300"
            />
          </div>
        </label>
      </div>

      {/* REDES SOCIAIS (Com Máscara Inteligente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: "instagram",
            icon: <Instagram size={20} />,
            color: "bg-[#E1306C] text-white",
            label: "Instagram",
            prefix: "instagram.com/",
            isSocial: true,
          },
          {
            id: "tiktok",
            icon: <Music2 size={20} />,
            color: "bg-black text-white",
            label: "TikTok",
            prefix: "tiktok.com/@",
            isSocial: true,
          },
          {
            id: "facebook",
            icon: <Facebook size={20} />,
            color: "bg-[#1877F2] text-white",
            label: "Facebook",
            prefix: "facebook.com/",
            isSocial: true,
          },
          {
            id: "website",
            icon: <Globe size={20} />,
            color: "bg-indigo-500 text-white",
            label: "Website Oficial",
            prefix: "",
            isSocial: false,
          },
        ].map((social) => (
          <label
            key={social.id}
            className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 transition-all focus-within:bg-white focus-within:ring-4 focus-within:border-transparent group cursor-text"
          >
            <div
              className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-sm transition-transform group-focus-within:scale-105 ${social.color}`}
            >
              {social.icon}
            </div>
            <div className="flex-1 pr-4 overflow-hidden">
              <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">
                {social.label}
              </span>
              <div className="flex items-center w-full">
                {(socials as any)[social.id]?.length > 0 && (
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                    {social.prefix}
                  </span>
                )}
                <input
                  value={(socials as any)[social.id]}
                  maxLength={255}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    const finalVal = social.isSocial
                      ? cleanSocialHandle(rawVal)
                      : rawVal.trim().replace(/^https?:\/\//, "");
                    updateSocial(social.id as any, finalVal);
                  }}
                  placeholder={
                    contactPlaceholders[
                      social.id as keyof typeof contactPlaceholders
                    ]
                  }
                  className="bg-transparent w-full text-[11px] font-bold text-slate-700 outline-none placeholder:font-normal placeholder:opacity-30 truncate"
                />
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* ===============================================================
          🚀 BLOCO DO DELIVERY: AGORA COM A TAXA INCLUÍDA ANIMADA
          =============================================================== */}
      {!isService && (
        <div className="space-y-3">
          <div
            onClick={() => setHasDelivery(!hasDelivery)}
            className={`cursor-pointer rounded-[2.5rem] p-6 border-2 transition-all flex items-center justify-between ${
              hasDelivery
                ? "bg-emerald-50 border-emerald-400 shadow-[0_8px_30px_rgb(16,185,129,0.15)]"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                  hasDelivery
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Truck size={28} />
              </div>
              <div>
                <h3
                  className={`font-black text-sm md:text-base uppercase tracking-tight ${hasDelivery ? "text-emerald-700" : "text-slate-700"}`}
                >
                  Fazemos Entregas (Delivery)
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  O seu negócio aparecerá na Vitrine Digital para compras
                  online.
                </p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ${hasDelivery ? "bg-emerald-500" : "bg-slate-200"}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${hasDelivery ? "translate-x-6" : "translate-x-0"}`}
              />
            </div>
          </div>

          {/* 🚀 CAIXA DE TAXA DE ENTREGA E RAIO MÁXIMO */}
          {hasDelivery && (
            <div className="bg-white border border-emerald-200 p-5 rounded-3xl shadow-sm animate-in slide-in-from-top-4 fade-in duration-300 ml-0 md:ml-8 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CAMPO 1: TAXA DE ENTREGA */}
                <div>
                  <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block mb-1">
                    Taxa Fixa de Entrega
                  </label>
                  <p className="text-[9px] text-slate-400 font-bold mb-2 leading-tight">
                    Valor cobrado. Deixe R$ 0,00 se for frete Grátis ou a
                    combinar.
                  </p>
                  <div className="flex items-center w-full border-2 border-emerald-100 bg-slate-50 rounded-xl overflow-hidden focus-within:border-emerald-400 transition-colors h-12">
                    <span className="bg-emerald-50 text-emerald-600 font-black text-xs px-4 flex items-center border-r border-emerald-100 h-full">
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryFee || ""}
                      onChange={(e) => {
                        const val = Math.max(
                          0,
                          parseFloat(e.target.value) || 0,
                        );
                        setDeliveryFee(val);
                      }}
                      className="w-full h-full px-3 text-sm font-black text-slate-700 bg-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* CAMPO 2: RAIO MÁXIMO DE ENTREGA */}
                <div>
                  <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest block mb-1 flex items-center gap-1.5">
                    Distância Máxima
                  </label>
                  <p className="text-[9px] text-slate-400 font-bold mb-2 leading-tight">
                    Até quantos Km você entrega? Deixe 0 para Sem Limites.
                  </p>
                  <div className="flex items-center w-full border-2 border-indigo-100 bg-slate-50 rounded-xl overflow-hidden focus-within:border-indigo-400 transition-colors h-12">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={deliveryRadius || ""}
                      onChange={(e) => {
                        const val = Math.max(
                          0,
                          parseFloat(e.target.value) || 0,
                        );
                        setDeliveryRadius(val);
                      }}
                      className="w-full h-full px-4 text-sm font-black text-slate-700 bg-transparent outline-none"
                      placeholder="Ex: 5"
                    />
                    <span className="bg-indigo-50 text-indigo-500 font-black text-xs px-4 flex items-center border-l border-indigo-100 h-full">
                      KM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* MARKETPLACES */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
        <h2 className="text-[10px] font-black uppercase mb-8 flex items-center gap-2 text-slate-400 tracking-[0.2em]">
          <ShoppingCart size={16} /> Marketplaces & Apps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: "shopee",
              label: "Shopee",
              color: "bg-[#EE4D2D] text-white",
              icon: "S",
              placeholder: "shopee.com.br/...",
            },
            {
              key: "ifood",
              label: "iFood",
              color: "bg-[#EA1D2C] text-white",
              icon: "i",
              placeholder: "ifood.com.br/...",
            },
            {
              key: "mercadoLivre",
              label: "M. Livre",
              color: "bg-[#FFF159] text-slate-900",
              icon: "M",
              placeholder: "mercadolivre.com.br/...",
            },
            {
              key: "shein",
              label: "Shein",
              color: "bg-black text-white",
              icon: "S",
              placeholder: "shein.com/...",
            },
          ].map((store) => (
            <label
              key={store.key}
              className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 transition-all focus-within:bg-white focus-within:ring-4 focus-within:border-transparent group cursor-text"
            >
              <div
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-xl shadow-sm transition-transform group-focus-within:scale-105 ${store.color}`}
              >
                {store.icon}
              </div>
              <div className="flex-1 pr-4">
                <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">
                  {store.label}
                </span>
                <input
                  value={(socials as any)[store.key]}
                  maxLength={255}
                  onChange={(e) =>
                    updateSocial(store.key as any, e.target.value)
                  }
                  placeholder={store.placeholder}
                  className="bg-transparent w-full text-[11px] font-bold text-slate-700 outline-none placeholder:font-normal placeholder:opacity-30"
                />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
