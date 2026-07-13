"use client";

import {
  Instagram,
  Music2,
  Facebook,
  Globe,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import { contactPlaceholders } from "./constants";
import { formatPhoneNumber, cleanSocialHandle } from "@/lib/normalize";

interface Socials {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
}

interface ConnectionsSectionProps {
  socials: Socials;
  setSocials: (socials: Socials) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
}

export function ConnectionsSection({
  socials,
  setSocials,
  whatsapp,
  setWhatsapp,
  phone,
  setPhone,
}: ConnectionsSectionProps) {
  const updateSocial = (id: keyof Socials, value: string) => {
    setSocials({ ...socials, [id]: value });
  };

  return (
    <div className="space-y-8">
      {/* CONTATOS PRINCIPAIS */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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

      {/* REDES SOCIAIS E SITE OFICIAL */}
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
    </div>
  );
}
