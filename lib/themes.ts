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
  // 💎 EDITORIAL (LUXE) - 4 CLAROS + 1 ESCUROS
  // =========================================================

  // 1. Clássico & Camel (O verdadeiro Off-White com Ouro Velho)
  luxe_ivory: {
    label: "Luxe - Classic",
    layout: "editorial",
    bgPage: "bg-[#F9F6F0]", // Fundo creme real
    textColor: "text-[#2C2A28]", // Chumbo escuro
    subTextColor: "text-[#2C2A28]/70",
    border: "border-[#9A7B4F]/20",
    primary: "text-[#9A7B4F]", // Dourado Camel
    bgSecondary: "bg-[#F0ECE4]",
    bgAction: "bg-[#9A7B4F]",
    previewColor: "linear-gradient(135deg, #F9F6F0 0%, #9A7B4F 100%)",
  },

  // 2. Hamptons (Fundo Azul Gelo com Letras Azul Marinho)
  luxe_hamptons: {
    label: "Luxe - Hamptons",
    layout: "editorial",
    bgPage: "bg-[#F0F4F8]", // Azul gelo/pó
    textColor: "text-[#0F172A]", // Azul noite quase preto
    subTextColor: "text-[#0F172A]/70",
    border: "border-[#1E3A8A]/15",
    primary: "text-[#1E3A8A]", // Azul Marinho forte e elegante
    bgSecondary: "bg-[#E2E8F0]",
    bgAction: "bg-[#1E3A8A]",
    previewColor: "linear-gradient(135deg, #F0F4F8 0%, #1E3A8A 100%)",
  },

  // 3. Botânico (Fundo Verde Matcha suave com Verde Floresta)
  luxe_matcha: {
    label: "Luxe - Botanic",
    layout: "editorial",
    bgPage: "bg-[#F2F5F3]", // Verde pastel muito suave
    textColor: "text-[#1A2E24]", // Verde musgo escuro
    subTextColor: "text-[#1A2E24]/70",
    border: "border-[#2F4F40]/15",
    primary: "text-[#2F4F40]", // Verde Floresta
    bgSecondary: "bg-[#E6EBE7]",
    bgAction: "bg-[#2F4F40]",
    previewColor: "linear-gradient(135deg, #F2F5F3 0%, #2F4F40 100%)",
  },

  // 4. Noir Rosé (Fundo Preto Profundo com Rosa Iluminado)
  luxe_rose: {
    label: "Luxe - Dark Rose",
    layout: "editorial",
    bgPage: "bg-[#0F0A0C]", // Preto super profundo com uma gota de vinho
    textColor: "text-[#FCE8ED]", // Off-white rosado (perfeito para leitura no escuro)
    subTextColor: "text-[#FCE8ED]/60",
    border: "border-[#E67389]/20", // Linhas bem sutis
    primary: "text-[#E67389]", // Rosa iluminado / Rose Gold nas letras de destaque
    bgSecondary: "bg-[#170F13]", // Fundo levemente mais claro para criar profundidade
    bgAction: "bg-[#E67389]", // Botões e detalhes vibrantes em rosa
    previewColor: "linear-gradient(135deg, #0F0A0C 0%, #E67389 100%)",
  },

  // 5. Meia-Noite & Prata (Escuro - O último da lista)
  luxe_midnight: {
    label: "Luxe - Midnight",
    layout: "editorial",
    bgPage: "bg-[#0B1320]", // Azul Noturno Escuro
    textColor: "text-[#F8FAFC]", // Branco/Prata
    subTextColor: "text-[#F8FAFC]/60",
    border: "border-[#E0E5EC]/10",
    primary: "text-[#E0E5EC]", // Prata
    bgSecondary: "bg-[#111A2B]",
    bgAction: "bg-[#8E9EAF]",
    previewColor: "linear-gradient(135deg, #0B1320 0%, #E0E5EC 100%)",
  },
  // ==========================================
  // TEMAS CLAROS (A Nova Inteligência Camaleão)
  // ==========================================

  // 1. PLATINUM (Claro - Streetwear e Clean)
  // Identidade: Moda urbana, Arquitetura, Design Limpo (Highsnobiety)
  urban_platinum: {
    label: "Urban - Platinum",
    layout: "urban",
    bgPage: "bg-[#f8fafc]", // Cinza Gelo (Aciona o isLight)
    textColor: "text-[#0f172a]", // Azul marinho absurdamente escuro (quase preto)
    cardBg: "bg-[#ffffff]/90", // Cards brancos
    cardTextColor: "text-[#0f172a]",
    border: "border-[#cbd5e1]", // Borda cinza suave
    primary: "text-[#0f172a]", // Ícones pretos/chumbo
    bgSecondary: "bg-[#e2e8f0]",
    bgAction: "bg-[#0f172a] text-white", // Botão de Ação Preto
    radius: "rounded-2xl",
    shadow: "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]", // Sombra flutuante super leve
    previewColor: "linear-gradient(135deg, #f8fafc 0%, #0f172a 100%)",
  },

  // 2. ROSE GOLD (Claro - Beleza e Estética)
  // Identidade: Clínicas, Maquiadoras, Moda Feminina, Confeitaria
  urban_rose_gold: {
    label: "Urban - Rose Gold",
    layout: "urban",
    bgPage: "bg-[#ffffff]", // Branco Puro (Aciona o isLight)
    textColor: "text-[#3f2c32]", // Marrom/Vinho super escuro para texto
    cardBg: "bg-[#fff5f7]/90", // Fundo do card levemente rosado (bem sutil)
    cardTextColor: "text-[#3f2c32]",
    border: "border-[#fbcfe8]", // Borda em um rosa bem macio
    primary: "text-[#e11d48]", // Rosa forte e chique para ícones
    bgSecondary: "bg-[#ffe4e6]",
    bgAction: "bg-[#e11d48] text-white", // Botão Rosa Escuro
    radius: "rounded-3xl", // Bem arredondado, visual mais orgânico
    shadow: "shadow-[0_10px_30px_-10px_rgba(225,29,72,0.1)]", // Sombra com tom rosado
    previewColor: "linear-gradient(135deg, #ffffff 0%, #e11d48 100%)",
  },

  // 3. OCEAN LIGHT (Claro - Corporativo e Saúde)
  // Identidade: Dentistas, Advogados, Consultorias, Tecnologia
  urban_ocean: {
    label: "Urban - Ocean Light",
    layout: "urban",
    bgPage: "bg-[#f8fafc]", // Cinza Gelo (Aciona o isLight)
    textColor: "text-[#1e293b]", // Slate escuro
    cardBg: "bg-[#ffffff]/90", // Card branco
    cardTextColor: "text-[#1e293b]",
    border: "border-[#bae6fd]", // Azul claro na borda para dar contraste
    primary: "text-[#0284c7]", // Azul corporativo de alta confiança
    bgSecondary: "bg-[#e0f2fe]",
    bgAction: "bg-[#0284c7] text-white", // Botão Azul Vibrante
    radius: "rounded-lg", // Bordas mais quadradas (passa seriedade)
    shadow: "shadow-[0_10px_30px_-10px_rgba(2,132,199,0.12)]",
    previewColor: "linear-gradient(135deg, #f8fafc 0%, #0284c7 100%)",
  },

  // ==========================================
  // TEMAS ESCUROS (A Vibe Noturna Original)
  // ==========================================

  // 4. BLACK IVORY (Escuro - Luxo e Minimalismo)
  // Identidade: Boutique, Joalherias, Marcas de Alto Padrão
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

  // 5. GOLD (Escuro - Luxo Urbano e Exclusividade)
  // Identidade: Estilo VIP, Clubes Privados, Joalherias, Concessionárias Premium
  urban_gold: {
    label: "Urban - Gold",
    layout: "urban",
    bgPage: "bg-[#0A0A0A]", // Preto Absoluto e elegante
    textColor: "text-[#FEF3C7]", // Off-white levemente dourado (âmbar) para leitura perfeita
    cardBg: "bg-[#141414]/95", // Card em um tom de asfalto quase preto (translúcido)
    cardTextColor: "text-white",
    border: "border-[#D4AF37]", // Dourado Metálico Clássico
    primary: "text-[#D4AF37]", // Ícones e destaques em Dourado
    bgSecondary: "bg-[#33290F]", // Um fundo escuro amarronzado para dar profundidade
    bgAction: "bg-[#D4AF37] text-black", // Botão Dourado com texto Preto (Alto Contraste VIP)
    radius: "rounded-2xl",
    shadow: "shadow-[0_0_30px_-5px_rgba(212,175,55,0.25)]", // Glow Dourado de Luxo nos cards
    previewColor: "linear-gradient(135deg, #0A0A0A 0%, #D4AF37 100%)",
  },
  // =========================================================
  // 🏛️ SHOWROOM (3 CLAROS + 2 ESCUROS)
  // =========================================================
  // 1. Showroom Clean (Vibe: Apple, Minimalismo Absoluto, Tech)
  showroom_clean: {
    label: "Showroom - Clean",
    layout: "showroom",
    bgPage: "bg-[#FFFFFF]", // Branco puro no fundo
    cardBg: "bg-[#F9FAFB]", // Cinza quase imperceptível nos cards
    textColor: "text-[#111827]", // Quase preto
    subTextColor: "text-[#6B7280]",
    border: "border-[#E5E7EB]", // Borda cinza super leve
    primary: "text-[#000000]",
    bgSecondary: "bg-[#F3F4F6]",
    bgAction: "bg-[#000000]",
    previewColor: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)",
  },

  // 2. Showroom Latte (Vibe: Estúdios de Arquitetura, Móveis Planejados)
  showroom_latte: {
    label: "Showroom - Latte",
    layout: "showroom",
    bgPage: "bg-[#FDFBF7]", // Fundo creme ultra suave
    cardBg: "bg-[#FFFFFF]", // Cards brancos saltando do fundo creme
    textColor: "text-[#433831]", // Marrom acinzentado escuro
    subTextColor: "text-[#8A7E76]",
    border: "border-[#E8E2D9]", // Borda areia
    primary: "text-[#B48E6D]", // Destaques em caramelo
    bgSecondary: "bg-[#F4EFE6]",
    bgAction: "bg-[#B48E6D]",
    previewColor: "linear-gradient(135deg, #FDFBF7 0%, #B48E6D 100%)",
  },

  // 3. Showroom Cloud (Vibe: Clínicas, Odonto, Startups B2B)
  showroom_cloud: {
    label: "Showroom - Cloud",
    layout: "showroom",
    bgPage: "bg-[#F4F7FB]", // Fundo azul/gelo bem claro
    cardBg: "bg-[#FFFFFF]", // Cards brancos
    textColor: "text-[#0F172A]", // Azul marinho profundo
    subTextColor: "text-[#64748B]",
    border: "border-[#CBD5E1]", // Borda azulada
    primary: "text-[#0284C7]", // Cyan/Azul Tech
    bgSecondary: "bg-[#E2E8F0]",
    bgAction: "bg-[#0284C7]",
    previewColor: "linear-gradient(135deg, #F4F7FB 0%, #0284C7 100%)",
  },

  // 4. Showroom SaaS (Vibe: Dark Mode de Aplicativos, Agências de Marketing)
  showroom_saas: {
    label: "Showroom - SaaS",
    layout: "showroom",
    bgPage: "bg-[#09090B]", // Fundo quase preto (Zinc)
    cardBg: "bg-[#18181B]", // Cards um tom acima
    textColor: "text-[#FAFAFA]", // Branco Gelo
    subTextColor: "text-[#A1A1AA]",
    border: "border-[#27272A]", // Borda chumbo
    primary: "text-[#3B82F6]", // Azul vibrante brilhando no escuro
    bgSecondary: "bg-[#27272A]",
    bgAction: "bg-[#3B82F6]",
    previewColor: "linear-gradient(135deg, #09090B 0%, #3B82F6 100%)",
  },

  // 5. Showroom Obsidian (Vibe: Estúdios Premium, Fotografia, Tech Luxo)
  showroom_obsidian: {
    label: "Showroom - Obsidian",
    layout: "showroom",
    bgPage: "bg-[#000000]", // Fundo Preto Absoluto
    cardBg: "bg-[#0A0A0A]", // Cards quase invisíveis
    textColor: "text-[#E4E4E7]", // Cinza muito claro
    subTextColor: "text-[#71717A]",
    border: "border-[#27272A]", // Borda suave
    primary: "text-[#FFFFFF]", // Branco puro pros ícones
    bgSecondary: "bg-[#18181B]",
    bgAction: "bg-[#FFFFFF]",
    previewColor: "linear-gradient(135deg, #000000 0%, #27272A 100%)",
  },
};
