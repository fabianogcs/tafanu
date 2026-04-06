// lib/normalize.ts

// --- 1. FUNÇÕES AUXILIARES ---

export function onlyNumbers(value: any) {
  return String(value || "").replace(/\D/g, "");
}

export function toSlug(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 🚀 ADICIONAMOS ESTA:
export const cleanHandle = (url: string = "", regex: RegExp) => {
  const clean = (url || "").trim();
  return clean.replace(regex, "").replace(/^@+/, "").replace(/\/+$/, "");
};

// 🚀 ADICIONAMOS ESTA:
export const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return numbers.slice(0, 11);
};

// --- 2. FUNÇÃO DE NORMALIZAÇÃO ---

export function normalizeBusiness(raw: any) {
  const b = raw || {};

  // 🚀 1. IDENTIFICA AS PALAVRAS FANTASMAS DO SISTEMA (Agora com as picotadas!)
  const baseSubcategories = Array.isArray(b.subcategory)
    ? b.subcategory.map((s: string) => normalizeText(s))
    : [];

  const splitSubcategories = baseSubcategories.flatMap((s: string) =>
    s.split(" "),
  ); // As palavras soltas

  const systemTags = [
    normalizeText(b.name),
    normalizeText(b.category),
    ...baseSubcategories,
    ...splitSubcategories, // 👈 Adicionamos as palavras picotadas na capa de invisibilidade!
  ];

  // 🚀 2. PEGA TODAS AS PALAVRAS-CHAVE DO BANCO
  const rawKeywords = Array.isArray(b.keywords)
    ? b.keywords
    : typeof b.keywords === "string"
      ? b.keywords.split(",").map((k: string) => k.trim())
      : [];

  // 🚀 3. FILTRA: Entrega pra tela SÓ o que o usuário digitou (esconde as do sistema)
  const userOnlyKeywords = rawKeywords.filter(
    (k: string) => k !== "" && !systemTags.includes(k),
  );

  return {
    ...b,
    id: b.id || "",
    slug: b.slug || "",
    name: b.name || "",
    description: b.description || "",
    published: b.published ?? true,
    category: b.category || "Alimentação",
    subcategory: Array.isArray(b.subcategory) ? b.subcategory : [],
    imageUrl: b.imageUrl || "",
    whatsapp: b.whatsapp || "",
    phone: b.phone || "",
    instagram: b.instagram || "",
    facebook: b.facebook || "",
    tiktok: b.tiktok || "",
    website: b.website || "",
    shopee: b.shopee || "",
    mercadoLivre: b.mercadoLivre || "",
    shein: b.shein || "",
    ifood: b.ifood || "",
    address: b.address || "",
    city: b.city || "",
    state: b.state || "",
    cep: b.cep || "", // ⬅️ CORREÇÃO: Lendo do banco
    number: b.number || "", // ⬅️ CORREÇÃO: Lendo direto do banco, sem adivinhar
    complement: b.complement || "", // ⬅️ NOVO: Lendo o complemento
    neighborhood: b.neighborhood || "", // ⬅️ CORREÇÃO: Lendo direto do banco, sem adivinhar
    urban_tag: b.urban_tag || "",
    luxe_quote: b.luxe_quote || "",
    comercial_badge: b.comercial_badge || "",
    showroom_collection: b.showroom_collection || "",
    gallery: Array.isArray(b.gallery) ? b.gallery : [],
    features: Array.isArray(b.features) ? b.features : [],
    faqs: Array.isArray(b.faqs) ? b.faqs : [],
    hours: Array.isArray(b.hours) ? b.hours : [],
    favorites: Array.isArray(b.favorites) ? b.favorites : [],

    // 🚀 4. INJETA SÓ AS PALAVRAS DO USUÁRIO NO EDITOR
    keywords: userOnlyKeywords,

    theme: b.theme || "urban_gold",
    layout: b.layout || "urban",
  };
}

export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "") // 🚀 CIRURGIA: Remove símbolos (ex: !, ?, -, &) para não bugar a busca
    .replace(/\s+/g, " ") // Garante que não fiquem espaços duplos
    .trim();
};
