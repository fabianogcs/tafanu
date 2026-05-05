export const businessThemes: Record<string, any> = {
  // =========================================================
  // ☀️ COMERCIAL (3 CLAROS + 2 ESCUROS)
  // =========================================================

  // =========================================================
  // 🏢 COMERCIAL (8 TEMAS CLAROS + 2 ESCUROS) - Top Identity
  // =========================================================

  // --- TEMAS CLAROS (Frescos, Modernos e Elegantes) ---

  // 1. PEARL LUXE (O seu original atualizado - Quente e Dourado)
  comercial_pearl: {
    label: "Comercial - Pearl Luxe",
    layout: "businessList",
    bgPage: "bg-[#fdfcfb]", // Off-white quente
    bgHero: "bg-gradient-to-r from-[#F4F1EA] to-[#EAE4D9]", // Capa bege
    textColor: "text-[#2d2421]",
    cardBg: "bg-white",
    border: "border-[#e5e1da]",
    primary: "text-[#a38040]",
    bgSecondary: "bg-[#f4f1ea]",
    bgAction: "bg-[#c5a059] text-white",
    previewColor: "linear-gradient(135deg, #fdfcfb 0%, #c5a059 100%)",
  },

  // 2. CLOUD VIOLET (O seu original atualizado - Azulado e Índigo)
  comercial_violet: {
    label: "Comercial - Cloud Violet",
    layout: "businessList",
    bgPage: "bg-[#f8f9ff]",
    bgHero: "bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF]", // Capa azulada
    textColor: "text-[#1e1b4b]",
    cardBg: "bg-white",
    border: "border-[#e0e7ff]",
    primary: "text-[#6366f1]",
    bgSecondary: "bg-[#eef2ff]",
    bgAction: "bg-[#4f46e5] text-white",
    previewColor: "linear-gradient(135deg, #f8f9ff 0%, #6366f1 100%)",
  },

  // 3. OCEAN CLEAR (Azul e Ciano super limpo)
  comercial_blue_dark: {
    // Mantive a chave para não quebrar a sua BD
    label: "Comercial - Ocean Clear",
    layout: "businessList",
    bgPage: "bg-[#F0F9FF]", // Fundo azul gelo
    bgHero: "bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD]", // Capa Ciano
    textColor: "text-[#0C4A6E]",
    cardBg: "bg-white",
    border: "border-[#BAE6FD]",
    primary: "text-[#0284C7]", // Azul tech
    bgSecondary: "bg-[#E0F2FE]",
    bgAction: "bg-[#0284C7] text-white",
    previewColor: "linear-gradient(135deg, #F0F9FF 0%, #0284C7 100%)",
  },

  // 4. FRESH MINT (Verde Claro e Minimalista)
  comercial_mint: {
    label: "Comercial - Fresh Mint",
    layout: "businessList",
    bgPage: "bg-[#F0FDF4]",
    bgHero: "bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]", // Capa Verde Menta
    textColor: "text-[#064E3B]",
    cardBg: "bg-white",
    border: "border-[#A7F3D0]",
    primary: "text-[#059669]", // Verde esmeralda
    bgSecondary: "bg-[#D1FAE5]",
    bgAction: "bg-[#059669] text-white",
    previewColor: "linear-gradient(135deg, #F0FDF4 0%, #059669 100%)",
  },

  // 5. PEACH SUNSET (Pêssego e Laranja Vivo)
  comercial_peach: {
    label: "Comercial - Peach Sunset",
    layout: "businessList",
    bgPage: "bg-[#FFF5F5]",
    bgHero: "bg-gradient-to-r from-[#FFEDD5] to-[#FFCFCD]", // Capa Pêssego
    textColor: "text-[#431407]",
    cardBg: "bg-white",
    border: "border-[#FFDEDD]",
    primary: "text-[#F97316]", // Laranja Vivo
    bgSecondary: "bg-[#FFEDD5]",
    bgAction: "bg-[#F97316] text-white",
    previewColor: "linear-gradient(135deg, #FFF5F5 0%, #F97316 100%)",
  },

  // 6. ROSE GOLD (Tons femininos e delicados)
  comercial_rose: {
    label: "Comercial - Rose Gold",
    layout: "businessList",
    bgPage: "bg-[#FFF1F2]",
    bgHero: "bg-gradient-to-r from-[#FFE4E6] to-[#FECDD3]", // Capa Rosa
    textColor: "text-[#881337]",
    cardBg: "bg-white",
    border: "border-[#FECDD3]",
    primary: "text-[#E11D48]", // Rosa forte
    bgSecondary: "bg-[#FFE4E6]",
    bgAction: "bg-[#E11D48] text-white",
    previewColor: "linear-gradient(135deg, #FFF1F2 0%, #E11D48 100%)",
  },

  // 7. LEMONADE (Amarelo e Mostarda vibrante)
  comercial_lemon: {
    label: "Comercial - Lemonade",
    layout: "businessList",
    bgPage: "bg-[#FEFCE8]",
    bgHero: "bg-gradient-to-r from-[#FEF08A] to-[#FDE047]", // Capa Amarela
    textColor: "text-[#713F12]",
    cardBg: "bg-white",
    border: "border-[#FEF08A]",
    primary: "text-[#CA8A04]", // Mostarda Escuro
    bgSecondary: "bg-[#FEF08A]",
    bgAction: "bg-[#CA8A04] text-white",
    previewColor: "linear-gradient(135deg, #FEFCE8 0%, #CA8A04 100%)",
  },

  // 8. MINIMAL MONOCHROME (Preto, Branco e Cinza puro)
  comercial_mono: {
    label: "Comercial - Minimal Mono",
    layout: "businessList",
    bgPage: "bg-[#F3F4F6]", // Cinza muito suave
    bgHero: "bg-gradient-to-r from-[#E5E7EB] to-[#D1D5DB]", // Capa Cinza
    textColor: "text-[#111827]",
    cardBg: "bg-white",
    border: "border-[#E5E7EB]",
    primary: "text-[#000000]", // Preto
    bgSecondary: "bg-[#F3F4F6]",
    bgAction: "bg-[#000000] text-white",
    previewColor: "linear-gradient(135deg, #F3F4F6 0%, #000000 100%)",
  },

  // --- TEMAS ESCUROS (Elegância Extrema e Contraste) ---

  // 9. ONYX & GOLD (Preto Oled com Ouro)
  comercial_obsidian: {
    label: "Comercial - Onyx & Gold",
    layout: "businessList",
    bgPage: "bg-[#000000]",
    bgHero: "bg-gradient-to-r from-[#171717] to-[#262626]", // Capa Cinza Chumbo
    textColor: "text-[#FAFAFA]",
    cardBg: "bg-[#0A0A0A]",
    border: "border-[#27272A]",
    primary: "text-[#FBBF24]", // Dourado
    bgSecondary: "bg-[#18181B]",
    bgAction: "bg-[#FBBF24] text-[#000000]",
    previewColor: "linear-gradient(135deg, #000000 0%, #FBBF24 100%)",
  },

  // 10. DEEP FOREST (O seu original - Verde Noturno)
  comercial_forest: {
    label: "Comercial - Deep Forest",
    layout: "businessList",
    bgPage: "bg-[#052E16]", // Verde muito escuro
    bgHero: "bg-gradient-to-r from-[#064E3B] to-[#065F46]", // Capa Esmeralda
    textColor: "text-[#ECFDF5]",
    cardBg: "bg-[#064E3B]",
    border: "border-[#047857]",
    primary: "text-[#34D399]", // Verde Menta vibrante
    bgSecondary: "bg-[#047857]",
    bgAction: "bg-[#34D399] text-[#052E16]",
    previewColor: "linear-gradient(135deg, #052E16 0%, #34D399 100%)",
  },

  // =========================================================
  // 💎 EDITORIAL (LUXE) - A MEGA COLEÇÃO (Claros + Escuros)
  // Escolha os seus favoritos testando no painel e apague o resto!
  // =========================================================

  // --- OS ORIGINAIS (Vibrantes e Escuros) ---

  luxe_ivory: {
    label: "Luxe - Golden Pearl",
    layout: "editorial",
    bgPage: "bg-[#FCFBF9]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FDF0E6] to-[#EACBA6]",
    textColor: "text-[#2A231E]",
    subTextColor: "text-[#2A231E]/70",
    cardBg: "bg-white",
    border: "border-[#B67645]/20",
    primary: "text-[#B67645]",
    bgSecondary: "bg-[#F3EDE6]",
    bgAction: "bg-[#B67645] text-[#2A231E]",
    previewColor: "linear-gradient(135deg, #FDF0E6 0%, #EACBA6 100%)",
  },

  luxe_vanilla: {
    label: "Luxe - Soft Vanilla",
    layout: "editorial",
    bgPage: "bg-[#FFFFFF]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FCFBF8] to-[#F3EEE6]",
    textColor: "text-[#333333]",
    subTextColor: "text-[#333333]/70",
    cardBg: "bg-white",
    border: "border-[#EBE6DF]",
    primary: "text-[#A68A56]",
    bgSecondary: "bg-[#FCFBF8]",
    bgAction: "bg-[#A68A56] text-white",
    previewColor: "linear-gradient(135deg, #FCFBF8 0%, #F3EEE6 100%)",
  },
  luxe_breeze: {
    label: "Luxe - Mint Breeze",
    layout: "editorial",
    bgPage: "bg-[#FAFCFB]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F2F9F6] to-[#E3EFEA]",
    textColor: "text-[#1C2E24]",
    subTextColor: "text-[#1C2E24]/70",
    cardBg: "bg-white",
    border: "border-[#D1E0D9]",
    primary: "text-[#5D806D]",
    bgSecondary: "bg-[#F2F9F6]",
    bgAction: "bg-[#5D806D] text-white",
    previewColor: "linear-gradient(135deg, #F2F9F6 0%, #E3EFEA 100%)",
  },
  luxe_blush: {
    label: "Luxe - Blush Petal",
    layout: "editorial",
    bgPage: "bg-[#FFFCFC]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FFF5F6] to-[#FCE8EC]",
    textColor: "text-[#3B1E25]",
    subTextColor: "text-[#3B1E25]/70",
    cardBg: "bg-white",
    border: "border-[#F8D7E0]",
    primary: "text-[#C47083]",
    bgSecondary: "bg-[#FFF5F6]",
    bgAction: "bg-[#C47083] text-white",
    previewColor: "linear-gradient(135deg, #FFF5F6 0%, #FCE8EC 100%)",
  },
  luxe_sand: {
    label: "Luxe - Sandstone",
    layout: "editorial",
    bgPage: "bg-[#FCFAFC]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F7F5F2] to-[#EBE7E0]",
    textColor: "text-[#2E2925]",
    subTextColor: "text-[#2E2925]/70",
    cardBg: "bg-white",
    border: "border-[#DFD9D1]",
    primary: "text-[#8C7A6B]",
    bgSecondary: "bg-[#F7F5F2]",
    bgAction: "bg-[#8C7A6B] text-white",
    previewColor: "linear-gradient(135deg, #F7F5F2 0%, #EBE7E0 100%)",
  },
  luxe_cloud: {
    label: "Luxe - Cloud Blue",
    layout: "editorial",
    bgPage: "bg-[#F8FBFF]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F2F7FC] to-[#E0EBF5]",
    textColor: "text-[#1A2E40]",
    subTextColor: "text-[#1A2E40]/70",
    cardBg: "bg-white",
    border: "border-[#CDDCEB]",
    primary: "text-[#567E9F]",
    bgSecondary: "bg-[#F2F7FC]",
    bgAction: "bg-[#567E9F] text-white",
    previewColor: "linear-gradient(135deg, #F2F7FC 0%, #E0EBF5 100%)",
  },
  luxe_lilac: {
    label: "Luxe - Lilac Whisper",
    layout: "editorial",
    bgPage: "bg-[#FCFAFF]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F7F5FC] to-[#EDE7F5]",
    textColor: "text-[#282136]",
    subTextColor: "text-[#282136]/70",
    cardBg: "bg-white",
    border: "border-[#DFD6EB]",
    primary: "text-[#8267A6]",
    bgSecondary: "bg-[#F7F5FC]",
    bgAction: "bg-[#8267A6] text-white",
    previewColor: "linear-gradient(135deg, #F7F5FC 0%, #EDE7F5 100%)",
  },
  // 8. PLATINUM MIST (Moda de Alta Costura, Joalharia Prata, Minimalismo)
  luxe_platinum: {
    label: "Luxe - Platinum Mist",
    layout: "editorial",
    bgPage: "bg-[#F8F9FA]", // Cinza gelo quase branco
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F1F3F5] to-[#E2E8F0]", // Degradê prateado
    textColor: "text-[#334155]", // Chumbo elegante
    subTextColor: "text-[#334155]/70",
    cardBg: "bg-white",
    border: "border-[#E2E8F0]",
    primary: "text-[#64748B]", // Prata/Cinza escuro nos ícones
    bgSecondary: "bg-[#F1F3F5]",
    bgAction: "bg-[#475569] text-white", // Botão Chumbo forte
    previewColor: "linear-gradient(135deg, #F1F3F5 0%, #E2E8F0 100%)",
  },

  // 9. PEACH SILK (Skincare, Cosméticos, Moda Praia, Acolhedor)
  luxe_peach: {
    label: "Luxe - Peach Silk",
    layout: "editorial",
    bgPage: "bg-[#FFFAF8]", // Off-white puxado para um pêssego muito pálido
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FFF1E6] to-[#FCD5CE]", // Degradê sedoso Pêssego/Coral
    textColor: "text-[#5D4037]", // Castanho café para contraste suave
    subTextColor: "text-[#5D4037]/70",
    cardBg: "bg-white",
    border: "border-[#F8EDEB]",
    primary: "text-[#F08080]", // Coral suave nos ícones
    bgSecondary: "bg-[#FFF1E6]",
    bgAction: "bg-[#F08080] text-white", // Botão Coral
    previewColor: "linear-gradient(135deg, #FFF1E6 0%, #FCD5CE 100%)",
  },

  // 10. MATCHA SAGE (Produtos Orgânicos, Spas, Sustentabilidade)
  luxe_sage: {
    label: "Luxe - Matcha Sage",
    layout: "editorial",
    bgPage: "bg-[#F9FAF8]", // Fundo natural quase branco
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F2F5F0] to-[#CCD5AE]", // Degradê chá verde/matcha
    textColor: "text-[#283618]", // Verde musgo profundo para texto
    subTextColor: "text-[#283618]/70",
    cardBg: "bg-white",
    border: "border-[#E9EDC9]",
    primary: "text-[#606C38]", // Verde Sálvia
    bgSecondary: "bg-[#F2F5F0]",
    bgAction: "bg-[#606C38] text-white", // Botão verde terroso
    previewColor: "linear-gradient(135deg, #F2F5F0 0%, #CCD5AE 100%)",
  },

  // 1. VIBRANT VIOLET (Igual à sua imagem de referência!)
  // Identidade: Agências, Criadores de Conteúdo, Inovação
  urban_rose_gold: {
    // Mantive a chave para não quebrar cadastros antigos
    label: "Landing - Vibrant Violet",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#a855f7] to-[#ec4899]", // Degradê Roxo para Rosa vibrante
    bgPage: "bg-[#f8fafc]", // Fundo do site super claro e limpo
    textColor: "text-[#0f172a]", // Texto chumbo escuro para leitura perfeita
    cardBg: "bg-[#ffffff]", // Cards brancos absolutos
    cardTextColor: "text-[#0f172a]",
    border: "border-[#e2e8f0]", // Borda cinza super fina
    primary: "text-[#a855f7]", // Ícones e detalhes em Roxo
    bgSecondary: "bg-[#f3e8ff]", // Fundo secundário roxinho claro
    bgAction: "bg-white text-[#a855f7]", // Botão branco no header roxo
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(168,85,247,0.2)]", // Sombra com tom roxo suave
    previewColor: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  },

  // 2. ELECTRIC BLUE (Tech, Clínicas, Confiança e Limpeza)
  // Identidade: Consultorias, Softwares, Odontologia
  urban_ocean: {
    label: "Landing - Electric Blue",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#2563eb] to-[#06b6d4]", // Azul Royal para Ciano
    bgPage: "bg-[#f8fafc]",
    textColor: "text-[#0f172a]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#0f172a]",
    border: "border-[#e2e8f0]",
    primary: "text-[#0ea5e9]", // Azul claro vibrante
    bgSecondary: "bg-[#e0f2fe]",
    bgAction: "bg-white text-[#0ea5e9]",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(14,165,233,0.2)]", // Sombra azulada
    previewColor: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
  },

  // 3. SUNSET ORANGE (Quente, Vendas, Alimentação, Energia)
  // Identidade: Delivery, Moda Praia, Estúdios Criativos
  urban_black_nude: {
    // Chave antiga, mas com cara totalmente nova
    label: "Landing - Sunset Orange",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#f97316] to-[#f43f5e]", // Laranja para Rosa/Vermelho
    bgPage: "bg-[#f8fafc]",
    textColor: "text-[#1c1917]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#1c1917]",
    border: "border-[#e2e8f0]",
    primary: "text-[#f97316]", // Laranja vibrante
    bgSecondary: "bg-[#ffedd5]",
    bgAction: "bg-white text-[#f97316]",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(249,115,22,0.2)]", // Sombra alaranjada
    previewColor: "linear-gradient(135deg, #f97316 0%, #f43f5e 100%)",
  },

  // 4. FRESH EMERALD (Saúde, Natureza, Bem-estar)
  // Identidade: Nutricionistas, Produtos Naturais, Spa
  urban_platinum: {
    label: "Landing - Fresh Emerald",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#10b981] to-[#14b8a6]", // Esmeralda para Teal
    bgPage: "bg-[#f8fafc]",
    textColor: "text-[#0f172a]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#0f172a]",
    border: "border-[#e2e8f0]",
    primary: "text-[#10b981]", // Verde Esmeralda
    bgSecondary: "bg-[#d1fae5]",
    bgAction: "bg-white text-[#10b981]",
    radius: "rounded-3xl",
    shadow: "shadow-[0_15px_40px_-15px_rgba(16,185,129,0.2)]", // Sombra verde suave
    previewColor: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
  },

  // 5. GOLD VIP (O Intocável - Luxo Absoluto)
  // Identidade: Joalherias, Marcas de Alto Padrão, VIP
  urban_gold: {
    label: "Landing - Gold VIP",
    layout: "urban",
    bgHero: "bg-[#0a0a0a]", // Tom de asfalto finíssimo (Capa)
    bgPage: "bg-[#000000]", // Preto Absoluto Oled (Corpo)
    textColor: "text-[#fef3c7]", // Âmbar Dourado para o texto
    cardBg: "bg-[#111111]/90",
    cardTextColor: "text-[#fef3c7]",
    border: "border-[#d4af37]/30",
    primary: "text-[#d4af37]", // Dourado Metálico Clássico
    bgSecondary: "bg-[#171717]",
    bgAction: "bg-[#d4af37] text-black", // Botão dourado escrito preto
    radius: "rounded-3xl", // Deixei arredondado pra combinar com os outros!
    shadow: "shadow-[0_15px_40px_-15px_rgba(212,175,55,0.15)]", // Glow Dourado
    previewColor: "linear-gradient(135deg, #0a0a0a 0%, #d4af37 100%)",
  },

  // =========================================================
  // 🔥 URBAN EXTREME (Identidades Radicais e Diferenciadas)
  // =========================================================

  // 6. URBAN BRUTALIST (Agressivo, Preto/Branco/Vermelho)
  // Identidade: Streetwear, Crossfit, Agências Disruptivas
  urban_brutalist: {
    label: "Landing - Brutalist Red",
    layout: "urban",
    bgHero: "bg-[#000000]", // Preto sólido, sem degradê para ser brutal
    bgPage: "bg-[#ffffff]", // Branco absoluto
    textColor: "text-[#000000]", // Preto absoluto
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#000000]",
    border: "border-[#000000] border-2", // Borda preta e grossa
    primary: "text-[#ef4444]", // Vermelho sangue
    bgSecondary: "bg-[#f3f4f6]",
    bgAction: "bg-[#ef4444] text-white font-black uppercase",
    radius: "rounded-none", // Sem cantos arredondados (Brutalismo)
    shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", // Sombra sólida preta ("hard shadow")
    previewColor: "linear-gradient(135deg, #000000 50%, #ef4444 50%)",
  },

  // 7. URBAN SYNTHWAVE (Retro 80s, Noite, Cores Neon)
  // Identidade: Baladas, Arcades, Streamers, Retrowave
  urban_synthwave: {
    label: "Landing - Synthwave 80s",
    layout: "urban",
    bgHero: "bg-gradient-to-b from-[#db2777] via-[#9333ea] to-[#1e1b4b]", // Por do sol anos 80
    bgPage: "bg-[#1e1b4b]", // Roxo mega escuro (fundo)
    textColor: "text-[#fbcfe8]", // Rosa bebê pálido para leitura
    cardBg: "bg-[#2e1065]", // Card roxo profundo
    cardTextColor: "text-[#e0e7ff]",
    border: "border-[#db2777]/50",
    primary: "text-[#10b981]", // Verde neon escandaloso
    bgSecondary: "bg-[#171033]",
    bgAction: "bg-[#10b981] text-[#064e3b]", // Botão Verde Neon
    radius: "rounded-xl",
    shadow: "shadow-[0_0_25px_rgba(219,39,119,0.4)]", // Glow rosa
    previewColor: "linear-gradient(135deg, #db2777 0%, #1e1b4b 100%)",
  },

  // 8. URBAN EARTH (Tons de Barro, Areia e Natureza)
  // Identidade: Cerâmica, Produtos Naturais, Estética Boho
  urban_earth: {
    label: "Landing - Earth & Boho",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#92400e] to-[#d97706]", // Barro para Ocre
    bgPage: "bg-[#fef3c7]", // Fundo cor de areia/creme (quebra o branco)
    textColor: "text-[#451a03]", // Marrom super escuro
    cardBg: "bg-[#fffbeb]", // Creme mais claro para o card
    cardTextColor: "text-[#78350f]",
    border: "border-[#fcd34d]",
    primary: "text-[#92400e]", // Terracota escuro
    bgSecondary: "bg-[#fde68a]",
    bgAction: "bg-[#78350f] text-[#fef3c7]",
    radius: "rounded-2xl",
    shadow: "shadow-xl shadow-[#d97706]/10",
    previewColor: "linear-gradient(135deg, #92400e 0%, #fef3c7 100%)",
  },

  // 9. URBAN CYBERPUNK (Futurista Sombrio, Ciano e Rosa)
  // Identidade: Tecnologia, Hardware, Eventos Noturnos
  urban_cyberpunk: {
    label: "Landing - Cyber Night",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#020617] via-[#0891b2] to-[#c026d3]", // Preto, Ciano e Fuchsia
    bgPage: "bg-[#020617]", // Slate 950 (Quase preto)
    textColor: "text-[#e2e8f0]",
    cardBg: "bg-[#0f172a]", // Slate 900
    cardTextColor: "text-[#f8fafc]",
    border: "border-[#0891b2]/40", // Borda ciano
    primary: "text-[#e879f9]", // Rosa choque / Fuchsia claro
    bgSecondary: "bg-[#000000]",
    bgAction: "bg-[#0891b2] text-white", // Botão Ciano
    radius: "rounded-lg",
    shadow: "shadow-[0_10px_30px_rgba(8,145,178,0.3)]",
    previewColor: "linear-gradient(135deg, #0891b2 0%, #c026d3 100%)",
  },

  // 10. URBAN Y2K (Estética Anos 2000, Tons Pastéis Doces)
  // Identidade: Lojas Teen, Capinhas de Celular, Docerias
  urban_bubblegum: {
    label: "Landing - Y2K Bubblegum",
    layout: "urban",
    bgHero: "bg-gradient-to-r from-[#f472b6] to-[#60a5fa]", // Rosa Chiclete para Azul Bebê
    bgPage: "bg-[#faf5ff]", // Fundo lilás mega claro
    textColor: "text-[#4c1d95]", // Roxo escuro
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#4c1d95]",
    border: "border-[#e9d5ff]",
    primary: "text-[#db2777]", // Rosa forte
    bgSecondary: "bg-[#f3e8ff]",
    bgAction: "bg-[#60a5fa] text-white", // Botão Azul bebê
    radius: "rounded-full", // Extremamente arredondado (Cute)
    shadow: "shadow-[0_15px_30px_-10px_rgba(244,114,182,0.3)]",
    previewColor: "linear-gradient(135deg, #f472b6 0%, #60a5fa 100%)",
  },

  // 11. URBAN COFFEE (Rústico Elegante, Madeiras e Torra)
  // Identidade: Cafeterias, Empórios, Cervejarias Artesanais
  urban_coffee: {
    label: "Landing - Espresso Wood",
    layout: "urban",
    bgHero: "bg-gradient-to-bl from-[#451a03] to-[#1c1917]", // Torra escura
    bgPage: "bg-[#f5f5f4]", // Off-white quente (cor de pedra)
    textColor: "text-[#292524]",
    cardBg: "bg-[#ffffff]",
    cardTextColor: "text-[#292524]",
    border: "border-[#d6d3d1]",
    primary: "text-[#9a3412]", // Laranja avermelhado (Caramelo)
    bgSecondary: "bg-[#e7e5e4]",
    bgAction: "bg-[#451a03] text-[#f5f5f4]", // Botão Café Escuro
    radius: "rounded-xl",
    shadow: "shadow-xl shadow-[#451a03]/10",
    previewColor: "linear-gradient(135deg, #451a03 0%, #9a3412 100%)",
  },
  // =========================================================
  // 🏛️ SHOWROOM (8 TEMAS CLAROS + 2 ESCUROS) - ESTILO GMB
  // =========================================================

  // --- TEMAS CLAROS (Focados em Legibilidade e Confiança) ---

  // 1. SHOWROOM GOOGLE (Inspirado no visual limpo do Google Workspace)
  showroom_clean: {
    label: "Showroom - Blue Trust",
    layout: "showroom",
    bgPage: "bg-[#F3F4F6]", // Fundo cinza super claro (padrão de apps)
    bgHero: "bg-gradient-to-r from-[#1A73E8] to-[#4285F4]", // Azul corporativo do Google
    textColor: "text-[#1F2937]", // Texto chumbo escuro
    cardBg: "bg-[#FFFFFF]", // Cartões brancos para destaque
    border: "border-[#E5E7EB]",
    primary: "text-[#1A73E8]", // Azul nos ícones
    bgSecondary: "bg-[#F9FAFB]", // Fundo de badges cinza extra-claro
    bgAction: "bg-[#1A73E8] text-white", // Botão Azul
    previewColor: "linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)",
  },

  // 2. SHOWROOM VIBRANT ORANGE (Para Serviços Dinâmicos, Delivery, Oficinas)
  showroom_latte: {
    // Chave mantida
    label: "Showroom - Vibrant Orange",
    layout: "showroom",
    bgPage: "bg-[#FFF7ED]", // Fundo laranja ultra pálido
    bgHero: "bg-gradient-to-r from-[#EA580C] to-[#F97316]", // Laranja forte na capa
    textColor: "text-[#431407]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FFEDD5]",
    primary: "text-[#EA580C]",
    bgSecondary: "bg-[#FFEDD5]",
    bgAction: "bg-[#EA580C] text-white",
    previewColor: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
  },

  // 3. SHOWROOM EMERALD (Saúde, Natureza, Bem-estar, Clínicas)
  showroom_cloud: {
    // Chave mantida
    label: "Showroom - Fresh Emerald",
    layout: "showroom",
    bgPage: "bg-[#ECFDF5]", // Fundo verde menta clarinho
    bgHero: "bg-gradient-to-r from-[#059669] to-[#10B981]", // Capa esmeralda
    textColor: "text-[#064E3B]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#D1FAE5]",
    primary: "text-[#059669]",
    bgSecondary: "bg-[#D1FAE5]",
    bgAction: "bg-[#059669] text-white",
    previewColor: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
  },

  // 4. SHOWROOM INDIGO (Advogados, Imobiliárias, Agências)
  showroom_saas: {
    // Chave mantida
    label: "Showroom - Deep Indigo",
    layout: "showroom",
    bgPage: "bg-[#EEF2FF]", // Azul índigo muito suave
    bgHero: "bg-gradient-to-r from-[#4338CA] to-[#6366F1]", // Capa roxa/índigo
    textColor: "text-[#312E81]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#E0E7FF]",
    primary: "text-[#4F46E5]",
    bgSecondary: "bg-[#E0E7FF]",
    bgAction: "bg-[#4F46E5] text-white",
    previewColor: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
  },

  // 5. SHOWROOM RUBY (Beleza, Estética, Docerias)
  showroom_ruby: {
    label: "Showroom - Ruby Blush",
    layout: "showroom",
    bgPage: "bg-[#FFF1F2]", // Fundo rosa muito claro
    bgHero: "bg-gradient-to-r from-[#E11D48] to-[#F43F5E]", // Capa rosa/cereja vibrante
    textColor: "text-[#881337]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FFE4E6]",
    primary: "text-[#E11D48]", // Rosa escuro
    bgSecondary: "bg-[#FFE4E6]",
    bgAction: "bg-[#E11D48] text-white",
    previewColor: "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)",
  },

  // 6. SHOWROOM SAND (Arquitetura, Padarias, Produtos Naturais)
  showroom_sand: {
    label: "Showroom - Golden Sand",
    layout: "showroom",
    bgPage: "bg-[#FEFCE8]", // Fundo amarelo/bege super suave
    bgHero: "bg-gradient-to-r from-[#D97706] to-[#F59E0B]", // Capa mostarda/ouro
    textColor: "text-[#78350F]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#FEF08A]",
    primary: "text-[#D97706]", // Mostarda escuro
    bgSecondary: "bg-[#FEF08A]",
    bgAction: "bg-[#D97706] text-white",
    previewColor: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  },

  // 7. SHOWROOM LILAC (Psicologia, Lojas Criativas, Marcas Teen)
  showroom_lilac: {
    label: "Showroom - Lilac Dream",
    layout: "showroom",
    bgPage: "bg-[#FAF5FF]", // Fundo lilás quase invisível
    bgHero: "bg-gradient-to-r from-[#9333EA] to-[#A855F7]", // Capa roxa/lavanda
    textColor: "text-[#581C87]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#F3E8FF]",
    primary: "text-[#9333EA]", // Lilás forte
    bgSecondary: "bg-[#F3E8FF]",
    bgAction: "bg-[#9333EA] text-white",
    previewColor: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  },

  // 8. SHOWROOM AQUA (Turismo, Limpeza, Piscinas, Odonto)
  showroom_aqua: {
    label: "Showroom - Aqua Splash",
    layout: "showroom",
    bgPage: "bg-[#F0FDFA]", // Fundo turquesa bebê
    bgHero: "bg-gradient-to-r from-[#0D9488] to-[#14B8A6]", // Capa Teal/Aqua
    textColor: "text-[#134E4A]",
    cardBg: "bg-[#FFFFFF]",
    border: "border-[#CCFBF1]",
    primary: "text-[#0D9488]", // Turquesa escuro
    bgSecondary: "bg-[#CCFBF1]",
    bgAction: "bg-[#0D9488] text-white",
    previewColor: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  },

  // --- TEMAS ESCUROS (Focados em Elegância e Alto Contraste) ---

  // 9. SHOWROOM LUXE DARK (Barbearias, Estúdios VIP, Baladas)
  showroom_obsidian: {
    // Chave mantida
    label: "Showroom - Night Obsidian",
    layout: "showroom",
    bgPage: "bg-[#0A0A0A]", // Fundo preto absoluto
    bgHero: "bg-gradient-to-r from-[#171717] to-[#262626]", // Capa cinza chumbo
    textColor: "text-[#F3F4F6]",
    cardBg: "bg-[#171717]", // Cartões em chumbo para destacar do fundo preto
    border: "border-[#374151]",
    primary: "text-[#A78BFA]", // Roxo neon para dar o contraste "dark mode"
    bgSecondary: "bg-[#1F2937]",
    bgAction: "bg-[#A78BFA] text-[#0A0A0A]", // Botão roxo texto preto
    previewColor: "linear-gradient(135deg, #171717 0%, #A78BFA 100%)",
  },

  // 10. SHOWROOM CRIMSON (Tatuadores, Hamburguerias Artesanais, Bares)
  showroom_crimson: {
    label: "Showroom - Midnight Crimson",
    layout: "showroom",
    bgPage: "bg-[#111111]", // Fundo quase preto (tom carvão)
    bgHero: "bg-gradient-to-r from-[#7F1D1D] to-[#9F1239]", // Capa vermelho escuro sangue
    textColor: "text-[#FEE2E2]",
    cardBg: "bg-[#1C1917]", // Cartões em tom carvão levemente quente
    border: "border-[#451A03]", // Borda rústica
    primary: "text-[#F43F5E]", // Rosa/Vermelho brilhante nos detalhes
    bgSecondary: "bg-[#292524]",
    bgAction: "bg-[#F43F5E] text-white", // Botão vermelho vibrante
    previewColor: "linear-gradient(135deg, #7F1D1D 0%, #F43F5E 100%)",
  },
};
