"use client";

import {
  Instagram,
  Music2,
  Facebook,
  Globe,
  ShoppingCart,
  MessageCircle,
  PhoneCall,
  Truck, // 🚀 Novo ícone importado
} from "lucide-react";
import { contactPlaceholders } from "./constants";
import { formatPhoneNumber } from "@/lib/normalize";

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
  // 🚀 NOVAS PROPRIEDADES PARA O DELIVERY
  hasDelivery: boolean;
  setHasDelivery: (val: boolean) => void;
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
}: ConnectionsSectionProps) {
  const updateSocial = (id: keyof Socials, value: string) => {
    setSocials({ ...socials, [id]: value });
  };

  return (
    <div className="space-y-8">
      {/* CONTATOS PRINCIPAIS */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* WhatsApp */}
        <div className="flex-1 bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 transition-all focus-within:ring-4 ring-emerald-50 focus-within:border-emerald-200">
          <label className="text-[9px] font-black uppercase text-emerald-600 mb-2 block tracking-widest">
            WhatsApp Business
          </label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <MessageCircle size={20} fill="currentColor" />
            </div>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhoneNumber(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="bg-transparent w-full text-xl md:text-2xl font-mono font-bold text-slate-800 outline-none placeholder:text-emerald-200"
            />
          </div>
        </div>

        {/* Telefone */}
        <div className="flex-1 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 transition-all focus-within:ring-4 ring-indigo-50 focus-within:border-indigo-200">
          <label className="text-[9px] font-black uppercase text-indigo-600 mb-2 block tracking-widest">
            Ligações
          </label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <PhoneCall size={18} />
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(00) 0000-0000"
              maxLength={15}
              className="bg-transparent w-full text-xl md:text-2xl font-mono font-bold text-slate-800 outline-none placeholder:text-indigo-200"
            />
          </div>
        </div>
      </div>

      {/* REDES SOCIAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: "instagram",
            icon: <Instagram size={20} />,
            color: "bg-[#E1306C] text-white",
            label: "Instagram",
          },
          {
            id: "tiktok",
            icon: <Music2 size={20} />,
            color: "bg-black text-white",
            label: "TikTok",
          },
          {
            id: "facebook",
            icon: <Facebook size={20} />,
            color: "bg-[#1877F2] text-white",
            label: "Facebook",
          },
          {
            id: "website",
            icon: <Globe size={20} />,
            color: "bg-indigo-500 text-white",
            label: "Website Oficial",
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
            <div className="flex-1 pr-4">
              <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">
                {social.label}
              </span>
              <input
                value={(socials as any)[social.id]}
                onChange={(e) => updateSocial(social.id as any, e.target.value)}
                placeholder={
                  contactPlaceholders[
                    social.id as keyof typeof contactPlaceholders
                  ]
                }
                className="bg-transparent w-full text-[11px] font-bold text-slate-700 outline-none placeholder:font-normal placeholder:opacity-30"
              />
            </div>
          </label>
        ))}
      </div>

      {/* 🚀 O NOVO BOTÃO DE DELIVERY */}
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
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
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
              O seu negócio aparecerá na Vitrine Digital para compras online.
            </p>
          </div>
        </div>
        {/* Toggle Switch Visual */}
        <div
          className={`w-14 h-8 rounded-full p-1 transition-colors ${hasDelivery ? "bg-emerald-500" : "bg-slate-200"}`}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${hasDelivery ? "translate-x-6" : "translate-x-0"}`}
          />
        </div>
      </div>

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
