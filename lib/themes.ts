export const businessThemes: Record<string, any> = {
  // =========================================================
  // 🏢 COMERCIAL (8 TEMAS CLAROS + 2 ESCUROS) - Top Identity
  // =========================================================

  // --- TEMAS CLAROS (Frescos, Modernos e Elegantes) ---

  // 1. PEARL LUXE (Neutro Quente - Sofisticação Clássica)
  comercial_pearl: {
    label: "Comercial - Pearl Luxe",
    layout: "businessList",
    bgPage: "bg-[#fdfcfb]",
    bgHero: "bg-gradient-to-r from-[#F4F1EA] to-[#EAE4D9]",
    textColor: "text-[#2d2421]",
    cardBg: "bg-white",
    border: "border-[#e5e1da]",
    primary: "text-[#a38040]",
    bgSecondary: "bg-[#f4f1ea]",
    bgAction: "bg-[#c5a059] text-white",
    previewColor: "linear-gradient(135deg, #fdfcfb 0%, #c5a059 100%)",
  },

  // 2. CLOUD VIOLET (Neutro Frio - Minimalismo Corporativo)
  comercial_violet: {
    label: "Comercial - Cloud Violet",
    layout: "businessList",
    bgPage: "bg-[#f8f9ff]",
    bgHero: "bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF]",
    textColor: "text-[#1e1b4b]",
    cardBg: "bg-white",
    border: "border-[#e0e7ff]",
    primary: "text-[#6366f1]",
    bgSecondary: "bg-[#eef2ff]",
    bgAction: "bg-[#4f46e5] text-white",
    previewColor: "linear-gradient(135deg, #f8f9ff 0%, #6366f1 100%)",
  },

  // 3. OCEAN CLEAR (Neutro Limpo - Azul Tech)
  comercial_blue_dark: {
    label: "Comercial - Ocean Clear",
    layout: "businessList",
    bgPage: "bg-[#F0F9FF]",
    bgHero: "bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD]",
    textColor: "text-[#0C4A6E]",
    cardBg: "bg-white",
    border: "border-[#BAE6FD]",
    primary: "text-[#0284C7]",
    bgSecondary: "bg-[#E0F2FE]",
    bgAction: "bg-[#0284C7] text-white",
    previewColor: "linear-gradient(135deg, #F0F9FF 0%, #0284C7 100%)",
  },

  // 4. FRESH MINT (Exótico Suave - Bem-estar e Organicos)
  comercial_mint: {
    label: "Comercial - Fresh Mint",
    layout: "businessList",
    bgPage: "bg-[#F0FDF4]",
    bgHero: "bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]",
    textColor: "text-[#064E3B]",
    cardBg: "bg-white",
    border: "border-[#A7F3D0]",
    primary: "text-[#059669]",
    bgSecondary: "bg-[#D1FAE5]",
    bgAction: "bg-[#059669] text-white",
    previewColor: "linear-gradient(135deg, #F0FDF4 0%, #059669 100%)",
  },

  // 5. PEACH SUNSET (Exótico Quente - Gastronomia e Lazer)
  comercial_peach: {
    label: "Comercial - Peach Sunset",
    layout: "businessList",
    bgPage: "bg-[#FFF5F5]",
    bgHero: "bg-gradient-to-r from-[#FFEDD5] to-[#FFCFCD]",
    textColor: "text-[#431407]",
    cardBg: "bg-white",
    border: "border-[#FFDEDD]",
    primary: "text-[#F97316]",
    bgSecondary: "bg-[#FFEDD5]",
    bgAction: "bg-[#F97316] text-white",
    previewColor: "linear-gradient(135deg, #FFF5F5 0%, #F97316 100%)",
  },

  // 6. ROSE GOLD (Exótico Elegante - Moda e Beleza)
  comercial_rose: {
    label: "Comercial - Rose Gold",
    layout: "businessList",
    bgPage: "bg-[#FFF1F2]",
    bgHero: "bg-gradient-to-r from-[#FFE4E6] to-[#FECDD3]",
    textColor: "text-[#881337]",
    cardBg: "bg-white",
    border: "border-[#FECDD3]",
    primary: "text-[#E11D48]",
    bgSecondary: "bg-[#FFE4E6]",
    bgAction: "bg-[#E11D48] text-white",
    previewColor: "linear-gradient(135deg, #FFF1F2 0%, #E11D48 100%)",
  },

  // 7. LEMONADE (Exótico Vibrante - Criatividade e Varejo)
  comercial_lemon: {
    label: "Comercial - Lemonade",
    layout: "businessList",
    bgPage: "bg-[#FEFCE8]",
    bgHero: "bg-gradient-to-r from-[#FEF08A] to-[#FDE047]",
    textColor: "text-[#713F12]",
    cardBg: "bg-white",
    border: "border-[#FEF08A]",
    primary: "text-[#CA8A04]",
    bgSecondary: "bg-[#FEF08A]",
    bgAction: "bg-[#CA8A04] text-white",
    previewColor: "linear-gradient(135deg, #FEFCE8 0%, #CA8A04 100%)",
  },

  // 8. MINIMAL MONOCHROME (Neutro Absoluto - Editorial Pura)
  comercial_mono: {
    label: "Comercial - Minimal Mono",
    layout: "businessList",
    bgPage: "bg-[#F3F4F6]",
    bgHero: "bg-gradient-to-r from-[#E5E7EB] to-[#D1D5DB]",
    textColor: "text-[#111827]",
    cardBg: "bg-white",
    border: "border-[#E5E7EB]",
    primary: "text-[#000000]",
    bgSecondary: "bg-[#F3F4F6]",
    bgAction: "bg-[#000000] text-white",
    previewColor: "linear-gradient(135deg, #F3F4F6 0%, #000000 100%)",
  },

  // --- TEMAS ESCUROS (Elegância Extrema e Contraste) ---

  // 9. ONYX & GOLD (Dark Luxo Absoluto)
  comercial_obsidian: {
    label: "Comercial - Onyx & Gold",
    layout: "businessList",
    bgPage: "bg-[#000000]",
    bgHero: "bg-gradient-to-r from-[#171717] to-[#262626]",
    textColor: "text-[#FAFAFA]",
    cardBg: "bg-[#0A0A0A]",
    border: "border-[#27272A]",
    primary: "text-[#FBBF24]",
    bgSecondary: "bg-[#18181B]",
    bgAction: "bg-[#FBBF24] text-[#000000]",
    previewColor: "linear-gradient(135deg, #000000 0%, #FBBF24 100%)",
  },

  // 10. DEEP FOREST (Dark Exótico - Verde Noturno)
  comercial_forest: {
    label: "Comercial - Deep Forest",
    layout: "businessList",
    bgPage: "bg-[#052E16]",
    bgHero: "bg-gradient-to-r from-[#064E3B] to-[#065F46]",
    textColor: "text-[#ECFDF5]",
    cardBg: "bg-[#064E3B]",
    border: "border-[#047857]",
    primary: "text-[#34D399]",
    bgSecondary: "bg-[#047857]",
    bgAction: "bg-[#34D399] text-[#052E16]",
    previewColor: "linear-gradient(135deg, #052E16 0%, #34D399 100%)",
  },
  // =========================================================
  // 💎 EDITORIAL (LUXE) - A MEGA COLEÇÃO (Cores Vivas + Dark VIP)
  // =========================================================

  // 1. GOLDEN PEARL (Ouro Brilhante e Pérola)
  luxe_ivory: {
    label: "Luxe - Golden Pearl",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FFFDF5] via-[#FFF3DC] to-[#F2D7A5]", // Ouro claro luminoso
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#C58A22]", // Ouro vivo e quente
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#C58A22] text-white",
    previewColor: "linear-gradient(135deg, #FFF3DC 0%, #C58A22 100%)",
  },

  // 2. CYBER SUNSET (Exótico: Amarelo Citrus, Magenta e Roxo)
  luxe_vanilla: {
    label: "Luxe - Vibrant Vanilla",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FEF08A] via-[#F43F5E] to-[#9333EA]", // Amarelo solar -> Magenta -> Roxo Neon
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#BE185D]", // Rosa Magenta Profundo / Fúcsia
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#9333EA] text-white", // Botão em Roxo Imperial
    previewColor: "linear-gradient(135deg, #FEF08A 0%, #9333EA 100%)",
  },

  // 3. SANDSTONE (Rose Gold Luminoso)
  luxe_sand: {
    label: "Luxe - Rose Gold",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FFFAF8] via-[#F5E6E1] to-[#EAC4BA]", // Fundo Rose bem limpo
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#D97E6A]", // Rose Gold marcante
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#D97E6A] text-white",
    previewColor: "linear-gradient(135deg, #F5E6E1 0%, #D97E6A 100%)",
  },

  // 4. MINT BREEZE (Esmeralda Fresco)
  luxe_breeze: {
    label: "Luxe - Mint Emerald",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#F0FDF4] via-[#D1FAE5] to-[#A7F3D0]", // Menta brilhante e alegre
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#10B981]", // Esmeralda vibrante
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#10B981] text-white",
    previewColor: "linear-gradient(135deg, #D1FAE5 0%, #10B981 100%)",
  },

  // 5. BLUSH PETAL (Rubi e Pink)
  luxe_blush: {
    label: "Luxe - Ruby Petal",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6] to-[#FECDD3]", // Rosa chiclete limpo
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#E11D48]", // Cereja / Rubi elétrico
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#E11D48] text-white",
    previewColor: "linear-gradient(135deg, #FFE4E6 0%, #E11D48 100%)",
  },

  // 6. CLOUD BLUE (Safira e Azul Céu)
  luxe_cloud: {
    label: "Luxe - Sapphire Blue",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE]", // Azul céu radiante
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#2563EB]", // Azul Safira puro e forte
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#2563EB] text-white",
    previewColor: "linear-gradient(135deg, #DBEAFE 0%, #2563EB 100%)",
  },

  // 7. LILAC WHISPER (Ametista Vibrante)
  luxe_lilac: {
    label: "Luxe - Amethyst Whisper",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]", // Lilás luminoso
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#9333EA]", // Roxo Ametista elétrico
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#9333EA] text-white",
    previewColor: "linear-gradient(135deg, #F3E8FF 0%, #9333EA 100%)",
  },

  // 8. PLATINUM MIST (Prata e Ciano)
  luxe_platinum: {
    label: "Luxe - Icy Platinum",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]", // Prata com toque de azul gelo
    textColor: "text-[#171717]",
    subTextColor: "text-[#171717]/70",
    cardBg: "bg-[#FFFFFF]",
    border: "border-black/5",
    primary: "text-[#0891B2]", // Ciano profundo / Azul Cerúleo
    bgSecondary: "bg-[#FAFAFA]",
    bgAction: "bg-[#0891B2] text-white",
    previewColor: "linear-gradient(135deg, #E0F2FE 0%, #0891B2 100%)",
  },

  // 9. MIDNIGHT ROSE (A Exceção Dark - Preto e Rosa Pink)
  luxe_peach: {
    label: "Luxe - Midnight Rose",
    layout: "editorial",
    bgPage: "bg-[#000000]",
    bgHero: "bg-gradient-to-br from-[#1A0A0E] via-[#0A0003] to-[#000000]",
    textColor: "text-[#FAFAFA]",
    subTextColor: "text-[#FAFAFA]/70",
    cardBg: "bg-[#111111]",
    border: "border-[#F43F5E]/20",
    primary: "text-[#F43F5E]",
    bgSecondary: "bg-[#1A1A1A]",
    bgAction: "bg-[#F43F5E] text-white",
    previewColor: "linear-gradient(135deg, #0A0A0A 0%, #F43F5E 100%)",
  },

  // 10. ONYX GOLD (A Exceção Dark - Preto e Dourado Clássico)
  luxe_sage: {
    label: "Luxe - Onyx Gold",
    layout: "editorial",
    bgPage: "bg-[#000000]",
    bgHero: "bg-gradient-to-br from-[#1A1814] via-[#0A0A0A] to-[#000000]",
    textColor: "text-[#FAFAFA]",
    subTextColor: "text-[#FAFAFA]/70",
    cardBg: "bg-[#111111]",
    border: "border-[#D4AF37]/20",
    primary: "text-[#D4AF37]",
    bgSecondary: "bg-[#1A1A1A]",
    bgAction: "bg-[#D4AF37] text-black",
    previewColor: "linear-gradient(135deg, #0A0A0A 0%, #D4AF37 100%)",
  },
  // =========================================================
  // 🚀 URBAN (LANDING / SAAS) - IDENTIDADES MODERNAS E EXÓTICAS
  // =========================================================

  urban_rose_gold: {
    label: "Landing - Vibrant Violet",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#a855f7] to-[#ec4899]",
    bgPage: "bg-[#fdf4ff]",
    textColor: "text-[#4a044e]",
    cardBg: "bg-white",
    cardTextColor: "text-[#4a044e]",
    border: "border-[#f5d0fe]",
    primary: "text-[#a855f7]",
    bgSecondary: "bg-[#f3e8ff]",
    bgAction:
      "bg-gradient-to-r from-[#a855f7] to-[#ec4899] border-none !text-white",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(168,85,247,0.25)]",
    previewColor: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  },

  urban_ocean: {
    label: "Landing - Electric Blue",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#2563eb] to-[#06b6d4]",
    bgPage: "bg-[#f0f9ff]",
    textColor: "text-[#082f49]",
    cardBg: "bg-white",
    cardTextColor: "text-[#082f49]",
    border: "border-[#bae6fd]",
    primary: "text-[#0ea5e9]",
    bgSecondary: "bg-[#e0f2fe]",
    bgAction:
      "bg-gradient-to-r from-[#2563eb] to-[#06b6d4] border-none !text-white",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(14,165,233,0.25)]",
    previewColor: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
  },

  urban_black_nude: {
    label: "Landing - Sunset Orange",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#f97316] to-[#f43f5e]",
    bgPage: "bg-[#fff7ed]",
    textColor: "text-[#431407]",
    cardBg: "bg-white",
    cardTextColor: "text-[#431407]",
    border: "border-[#fed7aa]",
    primary: "text-[#f97316]",
    bgSecondary: "bg-[#ffedd5]",
    bgAction:
      "bg-gradient-to-r from-[#f97316] to-[#f43f5e] border-none !text-white",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(249,115,22,0.25)]",
    previewColor: "linear-gradient(135deg, #f97316 0%, #f43f5e 100%)",
  },

  urban_platinum: {
    label: "Landing - Fresh Emerald",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#10b981] to-[#14b8a6]",
    bgPage: "bg-[#f0fdf4]",
    textColor: "text-[#022c22]",
    cardBg: "bg-white",
    cardTextColor: "text-[#022c22]",
    border: "border-[#a7f3d0]",
    primary: "text-[#10b981]",
    bgSecondary: "bg-[#d1fae5]",
    bgAction:
      "bg-gradient-to-r from-[#10b981] to-[#14b8a6] border-none !text-white",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(16,185,129,0.25)]",
    previewColor: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
  },

  urban_gold: {
    label: "Landing - Gold VIP (Dark)",
    layout: "urban",
    bgHero: "bg-[#0a0a0a]",
    bgPage: "bg-[#000000]",
    textColor: "text-[#fef3c7]",
    cardBg: "bg-[#111111]/90",
    cardTextColor: "text-[#fef3c7]",
    border: "border-[#d4af37]/30",
    primary: "text-[#d4af37]",
    bgSecondary: "bg-[#171717]",
    bgAction: "bg-[#d4af37] !text-black",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(212,175,55,0.15)]",
    previewColor: "linear-gradient(135deg, #0a0a0a 0%, #d4af37 100%)",
  },

  urban_brutalist: {
    label: "Landing - Brutalist Red (Exótico)",
    layout: "urban",
    bgHero: "bg-[#000000]",
    bgPage: "bg-[#ffffff]",
    textColor: "text-[#000000]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#000000]",
    border: "border-[#000000] border-2",
    primary: "text-[#ef4444]",
    bgSecondary: "bg-[#f3f4f6]",
    bgAction: "bg-[#ef4444] !text-white font-black uppercase",
    radius: "rounded-none",
    shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    previewColor: "linear-gradient(135deg, #000000 50%, #ef4444 50%)",
  },

  urban_synthwave: {
    label: "Landing - Synthwave 80s (Dark Exótico)",
    layout: "urban",
    bgHero: "bg-gradient-to-b from-[#db2777] via-[#9333ea] to-[#1e1b4b]",
    bgPage: "bg-[#1e1b4b]",
    textColor: "text-[#fbcfe8]",
    cardBg: "bg-[#2e1065]",
    cardTextColor: "text-[#e0e7ff]",
    border: "border-[#db2777]/50",
    primary: "text-[#10b981]",
    bgSecondary: "bg-[#171033]",
    bgAction: "bg-[#10b981] !text-[#064e3b]",
    radius: "rounded-xl",
    shadow: "shadow-[0_0_25px_rgba(219,39,119,0.4)]",
    previewColor: "linear-gradient(135deg, #db2777 0%, #1e1b4b 100%)",
  },

  urban_earth: {
    label: "Landing - Earth & Boho (Neutro Terroso)",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#92400e] to-[#d97706]",
    bgPage: "bg-[#fef3c7]",
    textColor: "text-[#451a03]",
    cardBg: "bg-[#fffbeb]",
    cardTextColor: "text-[#78350f]",
    border: "border-[#fcd34d]",
    primary: "text-[#92400e]",
    bgSecondary: "bg-[#fde68a]",
    bgAction: "bg-[#78350f] !text-[#fef3c7]",
    radius: "rounded-2xl",
    shadow: "shadow-xl shadow-[#d97706]/10",
    previewColor: "linear-gradient(135deg, #92400e 0%, #fef3c7 100%)",
  },

  urban_cyberpunk: {
    label: "Landing - Cyber Night (Dark Tech)",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#020617] via-[#0891b2] to-[#c026d3]",
    bgPage: "bg-[#020617]",
    textColor: "text-[#e2e8f0]",
    cardBg: "bg-[#0f172a]",
    cardTextColor: "text-[#f8fafc]",
    border: "border-[#0891b2]/40",
    primary: "text-[#e879f9]",
    bgSecondary: "bg-[#000000]",
    bgAction: "bg-[#0891b2] text-white",
    radius: "rounded-lg",
    shadow: "shadow-[0_10px_30px_rgba(8,145,178,0.3)]",
    previewColor: "linear-gradient(135deg, #0891b2 0%, #c026d3 100%)",
  },

  urban_bubblegum: {
    label: "Landing - Y2K Bubblegum (Exótico Fofo)",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#f472b6] to-[#60a5fa]",
    bgPage: "bg-[#faf5ff]",
    textColor: "text-[#4c1d95]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#4c1d95]",
    border: "border-[#e9d5ff]",
    primary: "text-[#db2777]",
    bgSecondary: "bg-[#f3e8ff]",
    bgAction: "bg-[#60a5fa] text-white",
    radius: "rounded-full",
    shadow: "shadow-[0_15px_30px_-10px_rgba(244,114,182,0.3)]",
    previewColor: "linear-gradient(135deg, #f472b6 0%, #60a5fa 100%)",
  },

  urban_coffee: {
    label: "Landing - Espresso Wood (Neutro Rústico)",
    layout: "urban",
    bgHero: "bg-gradient-to-bl from-[#451a03] to-[#1c1917]",
    bgPage: "bg-[#f5f5f4]",
    textColor: "text-[#292524]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#292524]",
    border: "border-[#d6d3d1]",
    primary: "text-[#9a3412]",
    bgSecondary: "bg-[#e7e5e4]",
    bgAction: "bg-[#451a03] text-[#f5f5f4]",
    radius: "rounded-xl",
    shadow: "shadow-xl shadow-[#451a03]/10",
    previewColor: "linear-gradient(135deg, #451a03 0%, #9a3412 100%)",
  },

  // =========================================================
  // 🏛️ SHOWROOM (8 TEMAS CLAROS + 2 ESCUROS) - ESTILO GMB
  // =========================================================

  showroom_clean: {
    label: "Showroom - Blue Trust (Neutro)",
    layout: "showroom",
    bgPage: "bg-[#F3F4F6]",
    bgHero: "bg-gradient-to-r from-[#1A73E8] to-[#4285F4]",
    textColor: "text-[#1F2937]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#E5E7EB]",
    primary: "text-[#1A73E8]",
    bgSecondary: "bg-[#F9FAFB]",
    bgAction: "bg-[#1A73E8] text-white",
    previewColor: "linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)",
  },

  showroom_latte: {
    label: "Showroom - Vibrant Orange (Exótico)",
    layout: "showroom",
    bgPage: "bg-[#FFF7ED]",
    bgHero: "bg-gradient-to-r from-[#EA580C] to-[#F97316]",
    textColor: "text-[#431407]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FFEDD5]",
    primary: "text-[#EA580C]",
    bgSecondary: "bg-[#FFEDD5]",
    bgAction: "bg-[#EA580C] text-white",
    previewColor: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
  },

  showroom_cloud: {
    label: "Showroom - Fresh Emerald (Neutro Saúde)",
    layout: "showroom",
    bgPage: "bg-[#ECFDF5]",
    bgHero: "bg-gradient-to-r from-[#059669] to-[#10B981]",
    textColor: "text-[#064E3B]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#D1FAE5]",
    primary: "text-[#059669]",
    bgSecondary: "bg-[#D1FAE5]",
    bgAction: "bg-[#059669] text-white",
    previewColor: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
  },

  showroom_saas: {
    label: "Showroom - Deep Indigo (Corporativo)",
    layout: "showroom",
    bgPage: "bg-[#EEF2FF]",
    bgHero: "bg-gradient-to-r from-[#4338CA] to-[#6366F1]",
    textColor: "text-[#312E81]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#E0E7FF]",
    primary: "text-[#4F46E5]",
    bgSecondary: "bg-[#E0E7FF]",
    bgAction: "bg-[#4F46E5] text-white",
    previewColor: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
  },

  showroom_ruby: {
    label: "Showroom - Ruby Blush (Exótico Estética)",
    layout: "showroom",
    bgPage: "bg-[#FFF1F2]",
    bgHero: "bg-gradient-to-r from-[#E11D48] to-[#F43F5E]",
    textColor: "text-[#881337]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FFE4E6]",
    primary: "text-[#E11D48]",
    bgSecondary: "bg-[#FFE4E6]",
    bgAction: "bg-[#E11D48] text-white",
    previewColor: "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)",
  },

  showroom_sand: {
    label: "Showroom - Golden Sand (Neutro Terroso)",
    layout: "showroom",
    bgPage: "bg-[#FEFCE8]",
    bgHero: "bg-gradient-to-r from-[#D97706] to-[#F59E0B]",
    textColor: "text-[#78350F]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FEF08A]",
    primary: "text-[#D97706]",
    bgSecondary: "bg-[#FEF08A]",
    bgAction: "bg-[#D97706] text-white",
    previewColor: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  },

  showroom_lilac: {
    label: "Showroom - Lilac Dream (Exótico Suave)",
    layout: "showroom",
    bgPage: "bg-[#FAF5FF]",
    bgHero: "bg-gradient-to-r from-[#9333EA] to-[#A855F7]",
    textColor: "text-[#581C87]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#F3E8FF]",
    primary: "text-[#9333EA]",
    bgSecondary: "bg-[#F3E8FF]",
    bgAction: "bg-[#9333EA] text-white",
    previewColor: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  },

  showroom_aqua: {
    label: "Showroom - Aqua Splash (Clean Azul)",
    layout: "showroom",
    bgPage: "bg-[#F0FDFA]",
    bgHero: "bg-gradient-to-r from-[#0D9488] to-[#14B8A6]",
    textColor: "text-[#134E4A]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#CCFBF1]",
    primary: "text-[#0D9488]",
    bgSecondary: "bg-[#CCFBF1]",
    bgAction: "bg-[#0D9488] text-white",
    previewColor: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  },

  showroom_obsidian: {
    label: "Showroom - Night Obsidian (Dark Luxo)",
    layout: "showroom",
    bgPage: "bg-[#0A0A0A]",
    bgHero: "bg-gradient-to-r from-[#171717] to-[#262626]",
    textColor: "text-[#F3F4F6]",
    cardBg: "bg-[#171717]",
    border: "border-[#374151]",
    primary: "text-[#A78BFA]",
    bgSecondary: "bg-[#1F2937]",
    bgAction: "bg-[#A78BFA] text-[#0A0A0A]",
    previewColor: "linear-gradient(135deg, #171717 0%, #A78BFA 100%)",
  },

  showroom_crimson: {
    label: "Showroom - Midnight Crimson (Dark Rústico)",
    layout: "showroom",
    bgPage: "bg-[#111111]",
    bgHero: "bg-gradient-to-r from-[#7F1D1D] to-[#9F1239]",
    textColor: "text-[#FEE2E2]",
    cardBg: "bg-[#1C1917]",
    border: "border-[#451A03]",
    primary: "text-[#F43F5E]",
    bgSecondary: "bg-[#292524]",
    bgAction: "bg-[#F43F5E] text-white",
    previewColor: "linear-gradient(135deg, #7F1D1D 0%, #F43F5E 100%)",
  },
};
