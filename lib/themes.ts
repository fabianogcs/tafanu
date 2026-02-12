export const businessThemes: Record<string, any> = {
  // =========================================================
  // ☀️ COMERCIAL (3 CLAROS + 2 ESCUROS)
  // =========================================================

  // 1. LIGHT - ESSENCIAL (Cinza Neutro e Elegante)
  comercial_neutral: {
    label: "Comercial - Clássico",
    layout: "businessList",
    bgPage: "bg-gray-50", // Fundo gelo quase branco
    textColor: "text-gray-900", // Texto preto suave
    cardBg: "bg-white", // Cards brancos puros
    border: "border-gray-200", // Bordas discretas
    primary: "text-gray-700", // Ícones em cinza médio elegante
    bgSecondary: "bg-gray-200/60", // Fundo dos ícones levemente mais escuro que a página
    bgAction: "bg-gray-900", // Botão "Preto Carvão" (O charme e destaque)
    previewColor: "linear-gradient(135deg, #ffffff 0%, #111827 100%)",
  },

  // 2. LIGHT - MENTA FRESH
  comercial_mint: {
    label: "Comercial - Menta",
    layout: "businessList",
    bgPage: "bg-emerald-50/30",
    textColor: "text-slate-800",
    cardBg: "bg-white",
    border: "border-emerald-100",
    primary: "text-emerald-600",
    bgSecondary: "bg-emerald-50",
    bgAction: "bg-emerald-600",
    previewColor: "linear-gradient(135deg, #ffffff 0%, #10b981 100%)",
  },

  // 3. LIGHT - SOLAR AMBER
  comercial_amber: {
    label: "Comercial - Solar",
    layout: "businessList",
    bgPage: "bg-orange-50/20",
    textColor: "text-stone-900",
    cardBg: "bg-white",
    border: "border-orange-100",
    primary: "text-orange-600",
    bgSecondary: "bg-orange-50",
    bgAction: "bg-orange-600",
    previewColor: "linear-gradient(135deg, #ffffff 0%, #ea580c 100%)",
  },

  // 4. DARK - TECH NIGHT (Azul Noturno)
  comercial_dark: {
    label: "Comercial - Tech",
    layout: "businessList",
    bgPage: "bg-slate-950",
    textColor: "text-slate-100",
    cardBg: "bg-slate-900",
    border: "border-slate-800",
    primary: "text-sky-400",
    bgSecondary: "bg-sky-950/50",
    bgAction: "bg-sky-500",
    previewColor: "linear-gradient(135deg, #020617 20%, #0ea5e9 100%)",
  },

  // 5. DARK - RED FORCE (Substitui o Grafite para variar do Azul)
  comercial_red_dark: {
    label: "Comercial - Red Force",
    layout: "businessList",
    bgPage: "bg-[#0f0a0a]", // Fundo preto com um leve toque quente
    textColor: "text-[#fef2f2]", // Texto branco gelo
    cardBg: "bg-[#1c1010]", // Card num tom "Café/Vinho" muito escuro
    border: "border-[#450a0a]", // Bordas em vermelho sangue escuro
    primary: "text-[#f87171]", // Ícones em vermelho claro
    bgSecondary: "bg-[#450a0a]", // Fundo secundário vermelho escuro
    bgAction: "bg-[#b91c1c]", // Botão Vermelho Intenso (Fica ótimo com texto branco)
    previewColor: "linear-gradient(135deg, #0f0a0a 0%, #b91c1c 100%)",
  },

  // =========================================================
  // 💎 EDITORIAL (LUXE) - 3 CLAROS + 2 ESCUROS
  // =========================================================

  // 1. LIGHT - PÊSSEGO E ROXO
  luxe_peach_purple: {
    label: "Luxe - Peach",
    layout: "editorial",
    bgPage: "bg-[#FFF0E5]",
    textColor: "text-[#4A044E]",
    subTextColor: "text-[#86198F]",
    border: "border-[#FDBA74]",
    primary: "text-[#FDBA74]",
    bgSecondary: "bg-[#FAE8FF]",
    bgAction: "bg-[#7E22CE]",
    previewColor: "linear-gradient(135deg, #FFF0E5 0%, #7E22CE 100%)",
  },

  // 2. LIGHT - ROSA CHIC
  luxe_pastel_rose: {
    label: "Luxe - Rosa Chic",
    layout: "editorial",
    bgPage: "bg-[#FDF2F8]",
    textColor: "text-[#831843]",
    subTextColor: "text-[#DB2777]",
    border: "border-[#FBCFE8]",
    primary: "text-[#F9A8D4]",
    bgSecondary: "bg-white",
    bgAction: "bg-[#BE185D]",
    previewColor: "linear-gradient(135deg, #FDF2F8 0%, #BE185D 100%)",
  },

  // 3. LIGHT - MILITAR
  luxe_military: {
    label: "Luxe - Militar",
    layout: "editorial",
    bgPage: "bg-[#F4F5F0]",
    textColor: "text-[#1A2E05]",
    subTextColor: "text-[#4D7C0F]",
    border: "border-[#D9E6C3]",
    primary: "text-[#A3B18A]",
    bgSecondary: "bg-[#E2E8D5]",
    bgAction: "bg-[#365314]",
    previewColor: "linear-gradient(135deg, #F4F5F0 0%, #365314 100%)",
  },

  // 4. DARK - BLACK & GOLD
  luxe_gold_black: {
    label: "Luxe - Gold",
    layout: "editorial",
    bgPage: "bg-[#000000]",
    textColor: "text-[#FDE68A]",
    subTextColor: "text-[#D4D4D8]",
    border: "border-[#713F12]",
    primary: "text-[#CA8A04]",
    bgSecondary: "bg-[#1C1917]",
    bgAction: "bg-[#EAB308]",
    previewColor: "linear-gradient(135deg, #000000 20%, #EAB308 100%)",
  },

  // 5. DARK - BLACK & ROSE GOLD (Ajustado para Leitura)
  luxe_black_rose: {
    label: "Luxe - Black Rose",
    layout: "editorial",
    bgPage: "bg-[#000000]", // Preto Puro no fundo geral
    textColor: "text-[#FFE4E6]", // Rose muito claro (quase branco) para leitura principal
    subTextColor: "text-[#FB7185]", // Rose médio (iluminado) para detalhes - Antes estava muito escuro
    border: "border-[#881337]",
    primary: "text-[#BE123C]",
    bgSecondary: "bg-[#121212]", // O CARD AGORA É NEUTRO (Preto Matte) - Resolve o ofuscamento
    bgAction: "bg-[#E11D48]",
    previewColor: "linear-gradient(135deg, #000000 0%, #E11D48 100%)",
  },

  // 1. MIDNIGHT (O Original - Intocável)
  // Identidade: Realeza Cyberpunk
  // Mix: Roxo Profundo + Dourado Ouro
  urban_cyber: {
    label: "Urban - Midnight",
    layout: "urban",
    bgPage: "bg-[#0f0a1e]", // Roxo Quase Preto
    textColor: "text-[#e9d5ff]", // Lilás Claro
    cardBg: "bg-[#1e1b4b]/60", // Roxo Profundo Transparente
    cardTextColor: "text-white",
    border: "border-[#fbbf24]", // Dourado
    primary: "text-[#fbbf24]",
    bgSecondary: "bg-[#3b0764]",
    bgAction: "bg-[#fbbf24] text-black",
    radius: "rounded-xl",
    shadow: "shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)]", // Glow Dourado
    previewColor: "linear-gradient(135deg, #e9d5ff 0%, #fbbf24 100%)",
  },

  // 2. CRIMSON (Estilo Samurai / Sith)
  // Identidade: Agressivo e Tecnológico
  // Mix: Preto Carvão + Vermelho Neon + Prata (Adeus Vermelho no fundo!)
  urban_crimson: {
    label: "Urban - Crimson",
    layout: "urban",
    bgPage: "bg-[#09090b]", // Preto Zinco (Frio)
    textColor: "text-[#e4e4e7]", // Prata/Cinza Claro
    cardBg: "bg-[#18181b]/80", // Cinza Escuro
    cardTextColor: "text-white",
    border: "border-[#ff0055]", // Vermelho Laser
    primary: "text-[#ff0055]",
    bgSecondary: "bg-[#27272a]",
    bgAction: "bg-[#ff0055] text-white",
    radius: "rounded-sm", // Levemente quadrado para parecer agressivo
    shadow: "shadow-[0_0_30px_-5px_rgba(255,0,85,0.25)]", // Glow Vermelho
    previewColor: "linear-gradient(135deg, #09090b 0%, #ff0055 100%)",
  },

  // 3. SAPPHIRE (Versão Electric / Tron)
  // Identidade: Futurista e Alta Voltagem
  // Mix: Preto Puro + Azul Ciano Neon (Laser)
  urban_sapphire: {
    label: "Urban - Sapphire",
    layout: "urban",
    bgPage: "bg-[#000000]", // Mudei para PRETO PURO (o azul brilha mais assim)
    textColor: "text-[#e0f2fe]", // Branco azulado gelo
    cardBg: "bg-[#050b14]/80", // Azul quase preto (Deep Navy)
    cardTextColor: "text-white",
    border: "border-[#00e1ff]", // Ciano Elétrico (Laser) - Agora destaca de verdade
    primary: "text-[#00e1ff]", // Ícones brilhando em ciano
    bgSecondary: "bg-[#082f49]",
    bgAction: "bg-[#00e1ff] text-black", // Botão Ciano com texto preto (leitura perfeita)
    radius: "rounded-3xl", // Bordas bem arredondadas (estilo cápsula)
    shadow: "shadow-[0_0_35px_-5px_rgba(0,225,255,0.5)]", // Glow forte em azul neon
    previewColor: "linear-gradient(135deg, #000000 40%, #00e1ff 100%)", // O botão vai mostrar Preto misturando com Ciano
  },

  // 4. TOXIC (Estilo Joker / Vilão)
  // Identidade: Caótico e Radioativo
  // Mix: Roxo Escuro + Verde Ácido
  urban_toxic: {
    label: "Urban - Toxic",
    layout: "urban",
    bgPage: "bg-[#0b0214]", // Roxo/Preto muito escuro
    textColor: "text-[#d1fae5]", // Menta Claro
    cardBg: "bg-[#1a0524]/70", // Roxo Uva Escuro
    cardTextColor: "text-white",
    border: "border-[#39ff14]", // Verde Neon Puro
    primary: "text-[#39ff14]",
    bgSecondary: "bg-[#2e093e]",
    bgAction: "bg-[#39ff14] text-black", // Botão Verde
    radius: "rounded-none", // Quadrado (Brutalista)
    shadow: "shadow-[0_0_25px_-5px_rgba(57,255,20,0.3)]", // Glow Verde
    previewColor: "linear-gradient(135deg, #0b0214 0%, #39ff14 100%)",
  },

  // 5. GOLD (Estilo Luxury Noir)
  // Identidade: Minimalismo de Alto Padrão
  // Mix: Preto Absoluto (Matte) + Ouro + Branco (Sem tons amarelados no fundo)
  urban_gold: {
    label: "Urban - Gold",
    layout: "urban",
    bgPage: "bg-[#000000]", // Preto Puro
    textColor: "text-[#f4f4f5]", // Branco Gelo
    cardBg: "bg-[#121212]/80", // Cinza Chumbo
    cardTextColor: "text-white",
    border: "border-[#ffd700]", // Ouro Metálico
    primary: "text-[#ffd700]",
    bgSecondary: "bg-[#27272a]",
    bgAction: "bg-[#ffd700] text-black", // Botão Ouro
    radius: "rounded-lg", // Clássico
    shadow: "shadow-[0_0_40px_-10px_rgba(255,215,0,0.15)]", // Glow Dourado Sutil
    previewColor: "linear-gradient(135deg, #000000 0%, #ffd700 100%)",
  },
  // =========================================================
  // 🏛️ SHOWROOM (3 CLAROS + 2 ESCUROS)
  // =========================================================

  // 1. LIGHT - STUDIO MINIMAL (Estética Apple/Galeria)
  // Foco: Branco absoluto e detalhes em Preto. Ideal para fotos coloridas.
  showroom_minimal: {
    label: "Showroom - Studio",
    layout: "showroom",
    bgPage: "bg-white",
    textColor: "text-slate-900",
    subTextColor: "text-slate-400",
    border: "border-slate-100",
    primary: "text-slate-900",
    bgSecondary: "bg-slate-50",
    bgAction: "bg-black", // O sticker preto no fundo branco é o auge do chic
    previewColor: "linear-gradient(135deg, #ffffff 0%, #000000 100%)",
  },

  // 2. LIGHT - NORDIC SKY (Azul Acinzentado e Sereno)
  // Foco: Profissionalismo e calma. Ótimo para arquitetura e design.
  showroom_nordic: {
    label: "Showroom - Nordic",
    layout: "showroom",
    bgPage: "bg-[#F8FAFC]",
    textColor: "text-[#0F172A]",
    subTextColor: "text-[#64748B]",
    border: "border-slate-200",
    primary: "text-[#334155]",
    bgSecondary: "bg-white",
    bgAction: "bg-[#334155]",
    previewColor: "linear-gradient(135deg, #F8FAFC 0%, #334155 100%)",
  },

  // 3. LIGHT - TERRACOTTA (Orgânico e Quente)
  // Foco: Marcas artesanais, joias ou gastronomia.
  showroom_clay: {
    label: "Showroom - Terracotta",
    layout: "showroom",
    bgPage: "bg-[#FAF9F6]", // Branco Linho
    textColor: "text-[#2D2A26]",
    subTextColor: "text-[#9A7E6F]",
    border: "border-[#EFEBE9]",
    primary: "text-[#8D6E63]",
    bgSecondary: "bg-[#F5F5F4]",
    bgAction: "bg-[#BC6C25]", // Sticker em tom barro/terracota
    previewColor: "linear-gradient(135deg, #FAF9F6 0%, #BC6C25 100%)",
  },

  // 4. DARK - ONYX & PLATINUM (Luxo Tecnológico)
  // Foco: Relógios, carros ou agências de elite.
  showroom_onyx: {
    label: "Showroom - Onyx",
    layout: "showroom",
    bgPage: "bg-[#050505]",
    textColor: "text-white",
    subTextColor: "text-zinc-500",
    border: "border-zinc-800/50",
    primary: "text-white",
    bgSecondary: "bg-[#111111]",
    bgAction: "bg-white", // Sticker branco brilha no fundo preto
    previewColor: "linear-gradient(135deg, #050505 0%, #ffffff 100%)",
  },

  // 5. DARK - MIDNIGHT AMBER (Elegância Noturna)
  // Foco: Lounge, vinhos ou produtos premium.
  showroom_amber: {
    label: "Showroom - Amber",
    layout: "showroom",
    bgPage: "bg-[#0D0C0B]",
    textColor: "text-[#E5E5E5]",
    subTextColor: "text-[#BC6C25]",
    border: "border-[#1A1816]",
    primary: "text-[#D4A373]",
    bgSecondary: "bg-[#1A1816]",
    bgAction: "bg-[#D4A373]", // Sticker em cobre/âmbar
    previewColor: "linear-gradient(135deg, #0D0C0B 0%, #D4A373 100%)",
  },
};
