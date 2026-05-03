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
  // 💎 EDITORIAL (LUXE) - 5 CLAROS SUAVES + 2 ESCUROS CHIQUES
  // =========================================================

  // 1. GOLDEN PEARL (Quente, Iluminado e Rico - O seu favorito)
  luxe_ivory: {
    label: "Luxe - Golden Pearl",
    layout: "editorial",
    bgPage: "bg-[#FCFBF9]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FDF0E6] to-[#EACBA6]",
    textColor: "text-[#2A231E]",
    cardBg: "bg-white",
    border: "border-[#B67645]/20",
    primary: "text-[#B67645]",
    bgSecondary: "bg-[#F3EDE6]",
    bgAction: "bg-[#B67645] text-[#2A231E]",
    previewColor: "linear-gradient(135deg, #FDF0E6 0%, #EACBA6 100%)",
  },

  // 2. BIANCO MARBLE (Branco, Cinza Frio e Prata - Super Clean)
  luxe_hamptons: {
    // Chave mantida para não quebrar cadastros antigos
    label: "Luxe - Bianco Marble",
    layout: "editorial",
    bgPage: "bg-[#F8F9FA]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F3F4F6] to-[#E5E7EB]",
    textColor: "text-[#1F2937]",
    cardBg: "bg-white",
    border: "border-[#D1D5DB]/40",
    primary: "text-[#4B5563]", // Cinza chumbo/prata elegante
    bgSecondary: "bg-[#F3F4F6]",
    bgAction: "bg-[#1F2937] text-white",
    previewColor: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)",
  },

  // 3. ROSE QUARTZ (Rosa Bebê muito suave com Branco - Delicado)
  luxe_matcha: {
    // Chave mantida
    label: "Luxe - Rose Quartz",
    layout: "editorial",
    bgPage: "bg-[#FFFBFB]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#FFF0F5] to-[#FCE7F3]",
    textColor: "text-[#4C0519]",
    cardBg: "bg-white",
    border: "border-[#FBCFE8]/50",
    primary: "text-[#DB2777]", // Rosa elegante
    bgSecondary: "bg-[#FDF2F8]",
    bgAction: "bg-[#DB2777] text-white",
    previewColor: "linear-gradient(135deg, #FFF0F5 0%, #FCE7F3 100%)",
  },

  // 4. SAGE LINEN (Creme e Verde Sálvia super claro - Natural/Spa)
  luxe_rose: {
    // Chave mantida
    label: "Luxe - Sage Linen",
    layout: "editorial",
    bgPage: "bg-[#FAFAF9]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F4F5F0] to-[#DCE3D8]",
    textColor: "text-[#1C1917]",
    cardBg: "bg-white",
    border: "border-[#A3B19B]/30",
    primary: "text-[#5C715E]", // Verde sálvia profundo
    bgSecondary: "bg-[#F4F5F0]",
    bgAction: "bg-[#5C715E] text-white",
    previewColor: "linear-gradient(135deg, #F4F5F0 0%, #DCE3D8 100%)",
  },

  // 5. CASHMERE WOOD (Bege Acinzentado e Marrom Frio - Arquitetura)
  luxe_terracotta: {
    // Chave mantida
    label: "Luxe - Cashmere Wood",
    layout: "editorial",
    bgPage: "bg-[#FAF9F6]",
    bgHero: "bg-gradient-to-br from-[#FFFFFF] via-[#F5F2EB] to-[#E8E1D5]",
    textColor: "text-[#3E2723]",
    cardBg: "bg-white",
    border: "border-[#D7CCC8]/50",
    primary: "text-[#8D6E63]", // Marrom Cashmere
    bgSecondary: "bg-[#F5F2EB]",
    bgAction: "bg-[#8D6E63] text-white",
    previewColor: "linear-gradient(135deg, #F5F2EB 0%, #E8E1D5 100%)",
  },

  // 6. OBSIDIAN GOLD (O Escuro Supremo - Preto Absoluto e Ouro Velho)
  luxe_midnight: {
    // Chave mantida
    label: "Luxe - Obsidian Gold",
    layout: "editorial",
    bgPage: "bg-[#0A0A0A]",
    bgHero: "bg-gradient-to-br from-[#1A1A1A] via-[#0A0A0A] to-[#000000]",
    textColor: "text-[#F5F5F5]",
    cardBg: "bg-[#171717]/90",
    border: "border-[#333333]",
    primary: "text-[#D4AF37]", // Ouro
    bgSecondary: "bg-[#121212]",
    bgAction: "bg-[#D4AF37] text-black",
    previewColor: "linear-gradient(135deg, #171717 0%, #D4AF37 100%)",
  },

  // 7. MIDNIGHT SAPPHIRE (Azul Noturno Profundo e Prata - Executivo)
  luxe_amethyst: {
    // Chave mantida
    label: "Luxe - Midnight Sapphire",
    layout: "editorial",
    bgPage: "bg-[#020617]",
    bgHero: "bg-gradient-to-br from-[#0F172A] via-[#020617] to-[#000000]",
    textColor: "text-[#F8FAFC]",
    cardBg: "bg-[#0F172A]/80",
    border: "border-[#1E293B]",
    primary: "text-[#38BDF8]", // Azul Gelo
    bgSecondary: "bg-[#080F1E]",
    bgAction: "bg-[#38BDF8] text-[#020617]",
    previewColor: "linear-gradient(135deg, #0F172A 0%, #38BDF8 100%)",
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
