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

// 🚀 A NOVA FÓRMULA À PROVA DE IDIOTAS: Limpa links, arrobas, parâmetros e rastreadores!
export const cleanSocialHandle = (url: string = "") => {
  if (!url) return "";
  let clean = url.trim();

  // 1. Edge Case: Se for uma página de Facebook antiga (profile.php?id=...) preserva a ID
  if (clean.includes("profile.php?id=")) {
    return clean.replace(/.*facebook\.com\//, "");
  }

  // 2. Remove parâmetros de rastreio de links copiados pelo celular (ex: ?igshid=123, ?hl=pt)
  clean = clean.split("?")[0];

  // 3. Remove barras sobrando no final (ex: instagram.com/loja/)
  clean = clean.replace(/\/+$/, "");

  // 4. Pega só a última parte da URL (que é o nome de usuário de fato)
  const parts = clean.split("/");
  let handle = parts[parts.length - 1];

  // 5. Se o usuário colou com o "@" (ex: @minhaloja), a gente limpa também
  if (handle) {
    handle = handle.replace(/^@+/, "");
  }
  // 🛡️ TRAVA ANTI-DOMÍNIO: Impede que o nome da rede social vire o nome do usuário
  if (
    handle === "instagram.com" ||
    handle === "facebook.com" ||
    handle === "tiktok.com" ||
    handle === ""
  ) {
    return "";
  }
  return handle || "";
};

// Mantemos a antiga aqui apenas por segurança, caso algum outro arquivo ainda tente usá-la
export const cleanHandle = (url: string = "", regex: RegExp) => {
  const clean = (url || "").trim();
  return clean.replace(regex, "").replace(/^@+/, "").replace(/\/+$/, "");
};

// 🚀 ADICIONAMOS ESTA:
export const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  let numbers = value.replace(/\D/g, "");

  // 🛡️ TRAVA CÓDIGO DO PAÍS: Se o usuário colou com o "55" na frente, remove o excesso
  if (numbers.length > 11 && numbers.startsWith("55")) {
    numbers = numbers.slice(2);
  }

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
    coverImage: b.coverImage || "",
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
    videos: Array.isArray(b.videos) ? b.videos : [], // 🚀 CORREÇÃO: Filtro agora reconhece os vídeos!
    features: Array.isArray(b.features) ? b.features : [],
    faqs: Array.isArray(b.faqs) ? b.faqs : [],
    hours: Array.isArray(b.hours) ? b.hours : [],
    favorites: Array.isArray(b.favorites) ? b.favorites : [],

    // 🚀 4. INJETA SÓ AS PALAVRAS DO USUÁRIO NO EDITOR
    keywords: userOnlyKeywords,

    theme: b.theme || "urban_gold",
    layout: b.layout || "urban",

    // 🚀 HACKER FIX: Curando a "Amnésia" do Formulário!
    // Sem isso aqui, o lojista perde a configuração de GPS e Delivery toda vez que edita a loja.
    latitude: b.latitude || null,
    longitude: b.longitude || null,
    menuMode: b.menuMode || "PDF",
    catalogPdf: b.catalogPdf || "",

    // 🚀 O CAVALO DE TRÓIA PRECISA PASSAR NA ADUANA AQUI
    isExternalLink: !!b.isExternalLink,
    actionLink: b.actionLink || "",
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

// --- 3. VALIDADOR UNIVERSAL (CPF E CNPJ ALFANUMÉRICO 2026) ---
export function isCpfOrCnpjValid(doc: string): boolean {
  // Remove formatação e garante que qualquer letra inserida fique maiúscula
  const cleanDoc = (doc || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Se estiver vazio, não valida
  if (!cleanDoc) return false;

  // 🛡️ VALIDAÇÃO DE CPF (11 Dígitos Numéricos)
  if (cleanDoc.length === 11) {
    if (/[A-Z]/.test(cleanDoc)) return false; // CPF não tem letra
    if (/^(\d)\1{10}$/.test(cleanDoc)) return false; // Bloqueia 111.111.111-11

    let sum = 0;
    let rest;
    for (let i = 1; i <= 9; i++)
      sum += parseInt(cleanDoc.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanDoc.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++)
      sum += parseInt(cleanDoc.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanDoc.substring(10, 11))) return false;

    return true;
  }

  // 🛡️ VALIDAÇÃO NOVO CNPJ ALFANUMÉRICO (14 Dígitos)
  if (cleanDoc.length === 14) {
    const calcDigit = (cnpjStr: string, weights: number[]) => {
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        const char = cnpjStr[i];
        // Converte letras para números usando a tabela ASCII (Ex: A=17, B=18, C=19)
        const val =
          char.charCodeAt(0) >= 65 ? char.charCodeAt(0) - 48 : parseInt(char);
        sum += val * weights[i];
      }
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const dig1 = calcDigit(cleanDoc, weight1);
    const dig2 = calcDigit(cleanDoc.substring(0, 12) + dig1, weight2);

    return cleanDoc.endsWith(`${dig1}${dig2}`);
  }

  return false;
}
