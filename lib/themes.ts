export const businessThemes: Record<string, any> = {
  // =========================================================
  // ☀️ COMERCIAL (3 CLAROS + 2 ESCUROS)
  // =========================================================

  // 1. LIGHT -
  comercial_pearl: {
    label: "Comercial - Pearl Luxe",
    layout: "businessList",
    bgPage: "bg-[#fdfcfb]", // Off-white quente e luxuoso
    textColor: "text-[#2d2421]", // Marrom café para leitura suave
    cardBg: "bg-white", // Card branco puro para destacar
    border: "border-[#e5e1da]", // Borda sutil perolada
    primary: "text-[#a38040]", // Dourado Champagne (Elegância)
    bgSecondary: "bg-[#f4f1ea]", // Fundo de ícones em tom areia
    bgAction: "bg-[#c5a059] text-slate-900", // Botão Dourado
    previewColor: "linear-gradient(135deg, #fdfcfb 0%, #c5a059 100%)",
  },

  // 2. LIGHT -
  comercial_violet: {
    label: "Comercial - Cloud Violet",
    layout: "businessList",
    bgPage: "bg-[#f8f9ff]", // Branco azulado (limpeza visual)
    textColor: "text-[#1e1b4b]", // Azul marinho profundo
    cardBg: "bg-white",
    border: "border-[#e0e7ff]", // Borda azulada clara
    primary: "text-[#6366f1]", // Violeta/Índigo vibrante
    bgSecondary: "bg-[#eef2ff]",
    bgAction: "bg-[#4f46e5] text-white",
    previewColor: "linear-gradient(135deg, #f8f9ff 0%, #6366f1 100%)",
  },

  // 3. DARK - MIDNIGHT INDIGO (Substituindo o Vermelho por um Azul Profundo)
  // Identidade: Tecnológico, Profissional e Elegante
  // Mix: Indigo Profundo + Ciano Elétrico + Branco Gelo
  comercial_blue_dark: {
    label: "Comercial - Digital Clear",
    layout: "businessList",
    bgPage: "bg-[#FDF2F8]", // Cinza azulado ultra-claro (Cor de fundo do Gemini)
    textColor: "text-[[#4A044E]", // Cinza quase preto (Suave para leitura longa)
    cardBg: "bg-white", // Card branco puro (Destaque total)
    border: "border-[#FDBA74]", // Borda muito fina e discreta
    primary: "text-[#1a73e8]", // Azul Google (Focado em tecnologia e clareza)
    bgSecondary: "bg-[#FAE8FF]", // Fundo de ícones em azul pálido
    bgAction: "bg-[#7E22CE] text-white", // Botão azul vibrante (Ação clara)
    previewColor: "linear-gradient(135deg, #f0f4f8 0%, #7E22CE 100%)",
  },

  // 4. DARK - ONYX & GOLD (Estilo Luxo / High-End)
  // Identidade: Exclusividade, Poder e Sofisticação
  // Mix: Preto Absoluto + Ouro Champagne + Branco Gelo
  comercial_mint: {
    label: "Comercial - Onyx & Gold",
    layout: "businessList",
    bgPage: "bg-[#000000]", // PRETO ABSOLUTO (Oled)
    textColor: "text-[#f8f8f8]", // Branco Gelo para leitura nítida no preto
    cardBg: "bg-[#0d0d0d]", // Card quase preto (Sutil separação de profundidade)
    border: "border-[#EAD900]/30", // Borda Dourada sutil (30% de opacidade para não carregar)
    primary: "text-[#FFD700]", // Ouro Champagne (A cor que dá o brilho)
    bgSecondary: "bg-[#1a1a1a]", // Fundo de ícones em cinza chumbo
    bgAction: "bg-[#AFA700] text-[#000000]", // Botão Dourado com texto preto (Máxima elegância)
    previewColor: "linear-gradient(135deg, #000000 0%, #FFD700 100%)",
  },

  // 5. DARK - TECH NIGHT
  comercial_forest: {
    label: "Comercial - Deep Forest",
    layout: "businessList",
    bgPage: "bg-[#0d1410]", // Verde quase preto (Sólido)
    textColor: "text-[#ecf3f0]", // Texto menta gelo
    cardBg: "bg-[#16211b]", // Card um tom acima do fundo (profundidade)
    border: "border-[#23352a]",
    primary: "text-[#4ade80]", // Verde neon para "quebrar" a sobriedade
    bgSecondary: "bg-[#23352a]",
    bgAction: "bg-[#4ade80] text-[#0d1410]", // Botão Neon com texto escuro
    previewColor: "linear-gradient(135deg, #0d1410 0%, #4ade80 100%)",
  },

  // =========================================================
  // 💎 EDITORIAL (LUXE) - 4 CLAROS + 1 ESCUROS
  // =========================================================

  // 1. GOLDEN PEARL (Substituiu o Creme - Quente, Iluminado e Rico)
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
    // 🚀 AJUSTE AQUI: Trocamos o text-white pelo marrom café profundo para blindar a acessibilidade
    bgAction: "bg-[#B67645] text-[#2A231E]",
    previewColor: "linear-gradient(135deg, #FDF0E6 0%, #EACBA6 100%)",
  },

  // 2. SAPPHIRE GLOW (Azul Safira e Ciano Brilhante)
  luxe_hamptons: {
    label: "Luxe - Sapphire Glow",
    layout: "editorial",
    bgPage: "bg-[#020617]",
    bgHero: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e3a8a]",
    textColor: "text-[#F8FAFC]",
    subTextColor: "text-[#F8FAFC]/70",
    cardBg: "bg-[#0f172a]/80",
    border: "border-[#38bdf8]/20",
    primary: "text-[#38bdf8]",
    bgSecondary: "bg-[#1e293b]",
    bgAction: "bg-[#38bdf8] text-[#020617]",
    previewColor: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
  },

  // 3. EMERALD VELVET (Esmeralda Profundo e Neon)
  luxe_matcha: {
    label: "Luxe - Emerald Velvet",
    layout: "editorial",
    bgPage: "bg-[#022c22]",
    bgHero: "bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857]",
    textColor: "text-[#ecfdf5]",
    subTextColor: "text-[#ecfdf5]/70",
    cardBg: "bg-[#064e3b]/80",
    border: "border-[#10b981]/30",
    primary: "text-[#34d399]",
    bgSecondary: "bg-[#065f46]",
    bgAction: "bg-[#34d399] text-[#022c22]",
    previewColor: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
  },

  // 4. RUBY NOIR (Vinho Tinto Escuro e Rubi Quente)
  luxe_rose: {
    label: "Luxe - Ruby Noir",
    layout: "editorial",
    bgPage: "bg-[#170505]",
    bgHero: "bg-gradient-to-br from-[#2a0800] via-[#4c0519] to-[#881337]",
    textColor: "text-[#ffe4e6]",
    subTextColor: "text-[#ffe4e6]/70",
    cardBg: "bg-[#4c0519]/60",
    border: "border-[#fb7185]/20",
    primary: "text-[#fb7185]",
    bgSecondary: "bg-[#2b0808]",
    bgAction: "bg-[#fb7185] text-[#170505]",
    previewColor: "linear-gradient(135deg, #4c0519 0%, #881337 100%)",
  },

  // 5. 24K OBSIDIAN (A Joia Suprema - Preto e Ouro)
  luxe_midnight: {
    label: "Luxe - 24K Obsidian",
    layout: "editorial",
    bgPage: "bg-[#000000]",
    bgHero: "bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#362706]",
    textColor: "text-[#fef3c7]",
    subTextColor: "text-[#fef3c7]/60",
    cardBg: "bg-[#0a0a0a]/90",
    border: "border-[#d4af37]/30",
    primary: "text-[#d4af37]",
    bgSecondary: "bg-[#171717]",
    bgAction: "bg-[#d4af37] text-black",
    previewColor: "linear-gradient(135deg, #0a0a0a 0%, #362706 100%)",
  },

  // 6. VELVET AMETHYST (Nobreza, Roxo Fashion e Lilás Vivo)
  // Identidade: Marcas Autorais, Beauty Hype, Estúdios Criativos
  luxe_amethyst: {
    label: "Luxe - Velvet Amethyst",
    layout: "editorial",
    bgPage: "bg-[#0B0410]", // Roxo incrivelmente escuro (quase preto)
    bgHero: "bg-gradient-to-br from-[#0B0410] via-[#200D36] to-[#451A61]", // Roxo abissal explodindo num Ametista
    textColor: "text-[#FAFAFA]",
    subTextColor: "text-[#FAFAFA]/70",
    cardBg: "bg-[#200D36]/80",
    border: "border-[#D8B4E2]/20",
    primary: "text-[#DDA0DD]", // Lavanda / Ametista Vibrante
    bgSecondary: "bg-[#170824]",
    bgAction: "bg-[#DDA0DD] text-[#0B0410]",
    previewColor: "linear-gradient(135deg, #200D36 0%, #451A61 100%)",
  },

  // 7. TUSCAN SUN (Terracota Escuro e Pôr do Sol)
  // Identidade: Beachwear de Luxo, Produtos Naturais, Alta Gastronomia
  luxe_terracotta: {
    label: "Luxe - Tuscan Sun",
    layout: "editorial",
    bgPage: "bg-[#1C0E0A]", // Marrom terra ultra escuro
    bgHero: "bg-gradient-to-br from-[#1C0E0A] via-[#4A1D13] to-[#8C381E]", // O calor da terracota
    textColor: "text-[#FFF8F0]", // Off-white quente
    subTextColor: "text-[#FFF8F0]/70",
    cardBg: "bg-[#2D1610]/80",
    border: "border-[#F4A261]/20",
    primary: "text-[#F4A261]", // Laranja Pôr do Sol super vivo
    bgSecondary: "bg-[#140806]",
    bgAction: "bg-[#F4A261] text-[#1C0E0A]",
    previewColor: "linear-gradient(135deg, #4A1D13 0%, #8C381E 100%)",
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
  // 🏛️ SHOWROOM (3 CLAROS + 2 ESCUROS)
  // =========================================================
  // 1. Showroom Clean (Vibe: Apple, Minimalismo Absoluto, Tech)
  showroom_clean: {
    label: "Showroom - Clean",
    layout: "showroom",
    bgPage: "bg-[#FFFFFF]",
    cardBg: "bg-[#F9FAFB]",
    textColor: "text-[#111827]",
    subTextColor: "text-[#6B7280]",
    border: "border-[#E5E7EB]",
    primary: "text-[#000000]",
    bgSecondary: "bg-[#F3F4F6]",
    bgAction: "bg-[#000000] text-white", // 🚀 AJUSTE DE CONTRASTE AQUI
    previewColor: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)",
  },

  // 2. Showroom Latte (Vibe: Estúdios de Arquitetura, Móveis Planejados)
  showroom_latte: {
    label: "Showroom - Latte",
    layout: "showroom",
    bgPage: "bg-[#FDFBF7]",
    cardBg: "bg-[#FFFFFF]",
    textColor: "text-[#433831]",
    subTextColor: "text-[#8A7E76]",
    border: "border-[#E8E2D9]",
    primary: "text-[#B48E6D]",
    bgSecondary: "bg-[#F4EFE6]",
    bgAction: "bg-[#B48E6D] text-white", // 🚀 AJUSTE DE CONTRASTE AQUI
    previewColor: "linear-gradient(135deg, #FDFBF7 0%, #B48E6D 100%)",
  },

  // 3. Showroom Cloud (Vibe: Clínicas, Odonto, Startups B2B)
  showroom_cloud: {
    label: "Showroom - Cloud",
    layout: "showroom",
    bgPage: "bg-[#F4F7FB]",
    cardBg: "bg-[#FFFFFF]",
    textColor: "text-[#0F172A]",
    subTextColor: "text-[#64748B]",
    border: "border-[#CBD5E1]",
    primary: "text-[#0284C7]",
    bgSecondary: "bg-[#E2E8F0]",
    bgAction: "bg-[#0284C7] text-white", // 🚀 AJUSTE DE CONTRASTE AQUI
    previewColor: "linear-gradient(135deg, #F4F7FB 0%, #0284C7 100%)",
  },

  // 4. Showroom SaaS (Vibe: Dark Mode de Aplicativos, Agências de Marketing)
  showroom_saas: {
    label: "Showroom - SaaS",
    layout: "showroom",
    bgPage: "bg-[#09090B]",
    cardBg: "bg-[#18181B]",
    textColor: "text-[#FAFAFA]",
    subTextColor: "text-[#A1A1AA]",
    border: "border-[#27272A]",
    primary: "text-[#3B82F6]",
    bgSecondary: "bg-[#27272A]",
    bgAction: "bg-[#3B82F6] text-white", // 🚀 AJUSTE DE CONTRASTE AQUI
    previewColor: "linear-gradient(135deg, #09090B 0%, #3B82F6 100%)",
  },

  // 5. Showroom Obsidian (Vibe: Estúdios Premium, Fotografia, Tech Luxo)
  showroom_obsidian: {
    label: "Showroom - Obsidian",
    layout: "showroom",
    bgPage: "bg-[#000000]",
    cardBg: "bg-[#0A0A0A]",
    textColor: "text-[#E4E4E7]",
    subTextColor: "text-[#71717A]",
    border: "border-[#27272A]",
    primary: "text-[#FFFFFF]",
    bgSecondary: "bg-[#18181B]",
    bgAction: "bg-[#FFFFFF] text-slate-900", // 🚀 AJUSTE DE CONTRASTE AQUI
    previewColor: "linear-gradient(135deg, #000000 0%, #27272A 100%)",
  },
};
