import { ReactNode } from "react";

export type Theme = {
  label: string;
  primary: string; // Cor de destaque (textos, ícones)
  bgAction: string; // Cor dos botões
  textColor: string; // Cor do texto base (geralmente branco ou preto)
  previewColor: string; // O degradê que aparece na bolinha do editor
};

export const businessThemes: Record<string, Theme> = {
  // =========================================================
  // 🌑 TEMAS DARK / PREMIUM (Gradiente Preto -> Cor)
  // =========================================================
  urban_gold: {
    label: "Gold Noir",
    primary: "text-yellow-500",
    bgAction: "bg-yellow-600",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #09090b 20%, #eab308 100%)",
  },
  midnight_sapphire: {
    label: "Sapphire",
    primary: "text-blue-500",
    bgAction: "bg-blue-700",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #020617 20%, #1d4ed8 100%)",
  },
  emerald_dark: {
    label: "Emerald",
    primary: "text-emerald-500",
    bgAction: "bg-emerald-700",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #022c22 20%, #10b981 100%)",
  },
  royal_amethyst: {
    label: "Royal",
    primary: "text-purple-500",
    bgAction: "bg-purple-700",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #3b0764 20%, #a855f7 100%)",
  },
  crimson_red: {
    label: "Crimson",
    primary: "text-red-500",
    bgAction: "bg-red-700",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #450a0a 20%, #ef4444 100%)",
  },
  carbon_stealth: {
    label: "Carbon",
    primary: "text-gray-400",
    bgAction: "bg-gray-700",
    textColor: "text-gray-200",
    previewColor: "linear-gradient(135deg, #000000 20%, #52525b 100%)",
  },
  cyber_neon: {
    label: "Cyber",
    primary: "text-fuchsia-400",
    bgAction: "bg-fuchsia-600",
    textColor: "text-white",
    previewColor: "linear-gradient(135deg, #1a0524 20%, #d946ef 100%)",
  },
  chocolate_luxe: {
    label: "Mocha",
    primary: "text-orange-400", // Tom terra/bronze
    bgAction: "bg-orange-700",
    textColor: "text-orange-50",
    previewColor: "linear-gradient(135deg, #271306 20%, #c2410c 100%)",
  },

  // =========================================================
  // ☀️ TEMAS LIGHT / CLEAN (Gradiente Branco -> Cor Suave)
  // =========================================================
  porcelain_white: {
    label: "Porcelain",
    primary: "text-slate-900",
    bgAction: "bg-slate-900",
    textColor: "text-slate-600",
    // Branco -> Cinza Gelo
    previewColor: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
  },
  soft_sand: {
    label: "Sand",
    primary: "text-stone-800",
    bgAction: "bg-stone-600",
    textColor: "text-stone-600",
    // Branco -> Bege Areia
    previewColor: "linear-gradient(135deg, #ffffff 0%, #d6d3d1 100%)",
  },
  blush_rose: {
    label: "Blush",
    primary: "text-rose-600",
    bgAction: "bg-rose-400",
    textColor: "text-slate-600",
    // Branco -> Rosa Bebê
    previewColor: "linear-gradient(135deg, #ffffff 0%, #f9a8d4 100%)",
  },
  sky_blue: {
    label: "Sky",
    primary: "text-sky-600",
    bgAction: "bg-sky-500",
    textColor: "text-slate-600",
    // Branco -> Azul Céu
    previewColor: "linear-gradient(135deg, #ffffff 0%, #bae6fd 100%)",
  },
  mint_fresh: {
    label: "Mint",
    primary: "text-teal-600",
    bgAction: "bg-teal-500",
    textColor: "text-slate-600",
    // Branco -> Verde Água
    previewColor: "linear-gradient(135deg, #ffffff 0%, #99f6e4 100%)",
  },
  lavender_haze: {
    label: "Lavender",
    primary: "text-violet-600",
    bgAction: "bg-violet-500",
    textColor: "text-slate-600",
    // Branco -> Lilás
    previewColor: "linear-gradient(135deg, #ffffff 0%, #ddd6fe 100%)",
  },
  sunset_peach: {
    label: "Peach",
    primary: "text-orange-500",
    bgAction: "bg-orange-400",
    textColor: "text-slate-600",
    // Branco -> Pêssego
    previewColor: "linear-gradient(135deg, #ffffff 0%, #fed7aa 100%)",
  },
  vogue_bw: {
    label: "Vogue",
    primary: "text-black",
    bgAction: "bg-black",
    textColor: "text-gray-800",
    // Branco Puro -> Preto (Alto Contraste)
    previewColor: "linear-gradient(135deg, #ffffff 50%, #000000 50%)",
  },
};
