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
