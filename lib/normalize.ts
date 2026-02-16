// lib/normalize.ts

// --- 1. FUNÇÕES AUXILIARES (Novas) ---

export function onlyNumbers(value: any) {
  return String(value || "").replace(/\D/g, "");
}

export function toSlug(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, "-") // Troca símbolos por traço
    .replace(/-+/g, "-") // Remove traços duplicados
    .replace(/^-|-$/g, ""); // Remove traço do início/fim
}

// --- 2. SUA FUNÇÃO ORIGINAL (Mantida e Atualizada) ---

export function normalizeBusiness(raw: any) {
  const b = raw || {};

  return {
    ...b,
    id: b.id || "",
    slug: b.slug || "",
    name: b.name || "", // Deixei vazio por padrão para não aparecer "Negócio sem Nome" no input
    description: b.description || "",

    // Status e Categorias
    published: b.published ?? true,
    category: b.category || "Alimentação",
    subcategory: Array.isArray(b.subcategory) ? b.subcategory : [],

    // Imagens e Vídeos
    imageUrl: b.imageUrl || "",
    heroImage: b.heroImage || "",
    videoUrl: b.videoUrl || "",

    // Contato e Redes Sociais
    whatsapp: b.whatsapp || "",
    phone: b.phone || "", // <--- O novo campo está protegido aqui
    instagram: b.instagram || "",
    facebook: b.facebook || "",
    tiktok: b.tiktok || "",
    website: b.website || "",

    // Localização
    address: b.address || "",
    city: b.city || "",
    state: b.state || "",
    cep: b.cep || "", // <--- Adicionamos o CEP que faltava!
    // Tenta pegar o número direto, se não tiver, tenta extrair do endereço longo
    number: b.number || b.address?.split(", ")[1]?.split(" - ")[0] || "",
    neighborhood: b.neighborhood || b.address?.split(" - ")[1] || "",

    // Textos de Layout
    urban_tag: b.urban_tag || "",
    luxe_quote: b.luxe_quote || "",
    comercial_badge: b.comercial_badge || "",
    showroom_collection: b.showroom_collection || "",

    // Garantia de Arrays
    gallery: Array.isArray(b.gallery) ? b.gallery : [],
    features: Array.isArray(b.features) ? b.features : [],
    faqs: Array.isArray(b.faqs) ? b.faqs : [],
    hours: Array.isArray(b.hours) ? b.hours : [], // Adicionei hours aqui por segurança
    favorites: Array.isArray(b.favorites) ? b.favorites : [],

    // Keywords
    keywords: Array.isArray(b.keywords)
      ? b.keywords
      : typeof b.keywords === "string"
        ? b.keywords
            .split(",")
            .map((k: string) => k.trim())
            .filter((k: string) => k !== "")
        : [],

    theme: b.theme || "urban_gold",
    layout: b.layout || "urban",
  };
}
