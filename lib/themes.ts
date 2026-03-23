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
    primary: "text-[#c5a059]", // Dourado Champagne (Elegância)
    bgSecondary: "bg-[#f4f1ea]", // Fundo de ícones em tom areia
    bgAction: "bg-[#c5a059]", // Botão Dourado
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
    bgAction: "bg-[#6366f1]",
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

  // 1. CYBER PINK (Antigo Midnight - Totalmente Refeito)
  // Identidade: Futurista, Vibrante e Alta Voltagem
  // Mix: Preto Absoluto + Rosa Neon + Branco Rosado
  urban_cyber: {
    label: "Urban - Cyber Pink",
    layout: "urban",
    bgPage: "bg-[#000000]", // Preto Absoluto para o Pink brilhar
    textColor: "text-[#fce7f3]", // Branco com toque de Rosa (Pink 100)
    cardBg: "bg-[#0a0a0a]/80", // Card quase preto com transparência
    cardTextColor: "text-white",
    border: "border-[#ff007f]", // Rosa Neon Vibrante
    primary: "text-[#ff007f]", // Ícones e Destaques em Pink
    bgSecondary: "bg-[#1a1a1a]", // Fundo secundário em cinza muito escuro
    bgAction: "bg-[#ff007f] text-white", // Botão Pink com texto branco
    radius: "rounded-2xl", // Bordas modernas e arredondadas
    shadow: "shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)]", // Glow Rosa Neon
    previewColor: "linear-gradient(135deg, #000000 0%, #ff007f 100%)",
  },

  // 2. BLACK IVORY (Preto Absoluto + Nude Vivo)
  // Identidade: Luxo Moderno, Minimalista e Elegante
  // Mix: Preto Oled + Nude Orgânico + Texto Off-White
  urban_black_nude: {
    label: "Urban - Black Ivory",
    layout: "urban",
    bgPage: "bg-[#000000]", // PRETO BEM NEGRO (Oled)
    textColor: "text-[#f3f4f6]", // Texto quase branco para brilhar no preto
    cardBg: "bg-[#111111]/90", // Card negro sólido com leve brilho
    cardTextColor: "text-white",
    border: "border-[#eab69f]", // A COR NUDE: Dando vida aos contornos
    primary: "text-[#eab69f]", // Ícones e detalhes na cor Nude
    bgSecondary: "bg-[#0a0a0a]",
    bgAction: "bg-[#eab69f] text-[#000000]", // Botão Nude com texto preto (Elegância máxima)
    radius: "rounded-2xl",
    shadow: "shadow-[0_0_20px_-5px_rgba(234,182,159,0.3)]", // Um "Glow Nude" sutil e chic
    previewColor: "linear-gradient(135deg, #000000 0%, #eab69f 100%)",
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

  showroom_tech: {
    label: "Showroom - Neon Slate",
    layout: "showroom",
    bgPage: "bg-[#1e293b]", // Fundo Slate 800
    textColor: "text-[#f1f5f9]",
    cardBg: "bg-[#0f172a]", // Card muito mais escuro (Slate 900)
    border: "border-[#38bdf8]/30", // Borda Ciano neon sutil
    primary: "text-[#38bdf8]",
    bgSecondary: "bg-[#0c4a6e]",
    bgAction: "bg-[#38bdf8] text-[#082f49]",
    previewColor: "linear-gradient(135deg, #1e293b 0%, #38bdf8 100%)",
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

  showroom_candy: {
    label: "Showroom - Cotton Candy",
    layout: "showroom",
    bgPage: "bg-[#f5f3ff]", // Fundo Lavanda
    textColor: "text-[#4c1d95]", // Texto Roxo Escuro
    cardBg: "bg-white",
    border: "border-[#ddd6fe]",
    primary: "text-[#f43f5e]", // Rosa Cereja
    bgSecondary: "bg-[#fff1f2]",
    bgAction: "bg-[#f43f5e] text-white",
    previewColor: "linear-gradient(135deg, #f5f3ff 0%, #f43f5e 100%)",
  },

  showroom_electric: {
    label: "Showroom - Electric Mono",
    layout: "showroom",
    bgPage: "bg-[#111827]", // Cinza quase preto
    textColor: "text-white",
    cardBg: "bg-[#111827]", // O card é da mesma cor do fundo (Efeito Seamless)
    border: "border-[#374151]", // A borda é o que define o card
    primary: "text-[#fde047]", // Amarelo Elétrico
    bgSecondary: "bg-[#374151]",
    bgAction: "bg-[#fde047] text-black", // Botão que "explode" na tela
    previewColor: "linear-gradient(135deg, #111827 0%, #fde047 100%)",
  },

  showroom_nude: {
    label: "Showroom - Nude Luxe",
    layout: "showroom",
    bgPage: "bg-[#f2e9e4]", // Nude Areia Suave (Fundo)
    textColor: "text-[#4a3728]", // Marrom Café Escuro (Aparece em TUDO)
    cardBg: "bg-[#fdfaf9]", // Nude Creme (Card - faz a letra "pular" pra fora)
    border: "border-[#c9ada7]", // Borda Nude Rosé para detalhe
    primary: "text-[#9a8c98]", // Lavanda Acinzentado (Toque exótico)
    bgSecondary: "bg-[#f2e9e4]", // Fundo de ícones igual ao fundo da página
    bgAction: "bg-[#4a3728] text-white", // Botão Café com texto branco (Destaque total)
    previewColor: "linear-gradient(135deg, #f2e9e4 0%, #4a3728 100%)",
  },
};
