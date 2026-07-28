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

  if (clean.includes("profile.php?id=")) {
    return clean.replace(/.*facebook\.com\//, "");
  }

  clean = clean.split("?")[0];
  clean = clean.replace(/\/+$/, "");

  const parts = clean.split("/");
  let handle = parts[parts.length - 1];

  if (handle) {
    handle = handle.replace(/^@+/, "");
  }
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

export const cleanHandle = (url: string = "", regex: RegExp) => {
  const clean = (url || "").trim();
  return clean.replace(regex, "").replace(/^@+/, "").replace(/\/+$/, "");
};

export const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  let numbers = value.replace(/\D/g, "");

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

// ==============================================================================
// 🚀 ALGORITMO SÊNIOR DE HORÁRIO DE FUNCIONAMENTO (TURNO DA MADRUGADA 3.0)
// ==============================================================================
export function getBusinessStatusDetails(hours: any[]) {
  if (!Array.isArray(hours) || hours.length === 0) {
    return { status: "UNKNOWN" as const, text: null, isOpen: false };
  }

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) =>
      parts.find((p) => p.type === type)?.value || "";

    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const today = weekdayMap[getPart("weekday")] ?? now.getDay();
    const yesterday = today === 0 ? 6 : today - 1;

    let currentHour = parseInt(getPart("hour"), 10);
    if (currentHour === 24) currentHour = 0;
    const currentMinute = parseInt(getPart("minute"), 10) || 0;
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const daysMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const toMinutes = (timeStr: string) => {
      if (!timeStr || typeof timeStr !== "string") return -1;
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return -1;
      return h * 60 + m;
    };

    // 🚀 REGRA 1: O TURNO DE ONTEM (MADRUGADA / OVERNIGHT SHIFT)
    // Se ontem a loja abriu (ex: Dom 22:00) e o turno atravessa a meia-noite (fechamento < abertura, ex: 20:28),
    // checamos se o horário atual ainda não passou do fechamento de ontem!
    const yesterdayHours = hours.find(
      (h: any) => Number(h.dayOfWeek) === yesterday,
    );
    if (yesterdayHours && !yesterdayHours.isClosed) {
      const yOpen = toMinutes(yesterdayHours.openTime);
      const yClose = toMinutes(yesterdayHours.closeTime);

      if (yClose !== -1 && yOpen !== -1 && yClose < yOpen) {
        if (currentTotalMinutes < yClose) {
          const timeToClose = yClose - currentTotalMinutes;
          if (timeToClose <= 60 && timeToClose > 0) {
            return {
              status: "CLOSING_SOON" as const,
              text: `Fecha às ${yesterdayHours.closeTime}`,
              isOpen: true,
            };
          }
          return {
            status: "OPEN" as const,
            text: `Fecha às ${yesterdayHours.closeTime}`,
            isOpen: true,
          };
        }
      }
    }

    // 🚀 REGRA 2: O TURNO DE HOJE
    const todayHours = hours.find((h: any) => Number(h.dayOfWeek) === today);
    if (todayHours && !todayHours.isClosed) {
      const open = toMinutes(todayHours.openTime);
      const close = toMinutes(todayHours.closeTime);

      if (open !== -1 && close !== -1) {
        // Turno 24h ou horários iguais
        if (open === close) {
          return { status: "OPEN" as const, text: "Aberto 24h", isOpen: true };
        }

        const crossesMidnight = close < open;
        const isReallyOpen = crossesMidnight
          ? currentTotalMinutes >= open || currentTotalMinutes < close
          : currentTotalMinutes >= open && currentTotalMinutes <= close;

        if (isReallyOpen) {
          const timeToClose = crossesMidnight
            ? close + 1440 - currentTotalMinutes
            : close - currentTotalMinutes;

          if (timeToClose <= 60 && timeToClose > 0) {
            return {
              status: "CLOSING_SOON" as const,
              text: `Fecha às ${todayHours.closeTime}`,
              isOpen: true,
            };
          }
          return {
            status: "OPEN" as const,
            text: `Fecha às ${todayHours.closeTime}`,
            isOpen: true,
          };
        }

        // 🚀 A CIRURGIA FOI AQUI: Removido o "!crossesMidnight &&"
        // Se a loja não está aberta agora, mas a hora atual é menor que a hora de abrir, ELA ABRE HOJE!
        if (currentTotalMinutes < open) {
          return {
            status: "CLOSED" as const,
            text: `Abre hoje às ${todayHours.openTime}`,
            isOpen: false,
          };
        }
      }
    }

    // 🚀 REGRA 3: PRÓXIMO DIA DE ABERTURA (Se hoje estiver fechado ou já encerrou o turno de hoje)
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (today + i) % 7;
      const nextDayHours = hours.find(
        (h: any) => Number(h.dayOfWeek) === nextDayIndex,
      );

      if (nextDayHours && !nextDayHours.isClosed && nextDayHours.openTime) {
        const isTomorrow = i === 1;
        const dayText = isTomorrow ? "amanhã" : daysMap[nextDayIndex];
        return {
          status: "CLOSED" as const,
          text: `Abre ${dayText} às ${nextDayHours.openTime}`,
          isOpen: false,
        };
      }
    }

    return { status: "CLOSED" as const, text: "Fechado", isOpen: false };
  } catch (e) {
    console.error("Erro em getBusinessStatusDetails:", e);
    return { status: "CLOSED" as const, text: "Fechado", isOpen: false };
  }
}

export function checkIsOpen(hours: any[]): boolean {
  return getBusinessStatusDetails(hours).isOpen;
}

// --- 2. FUNÇÃO DE NORMALIZAÇÃO ---

export function normalizeBusiness(raw: any) {
  const b = raw || {};

  const baseSubcategories = Array.isArray(b.subcategory)
    ? b.subcategory.map((s: string) => normalizeText(s))
    : [];

  const splitSubcategories = baseSubcategories.flatMap((s: string) =>
    s.split(" "),
  );

  const systemTags = [
    normalizeText(b.name),
    normalizeText(b.category),
    ...baseSubcategories,
    ...splitSubcategories,
  ];

  const rawKeywords = Array.isArray(b.keywords)
    ? b.keywords
    : typeof b.keywords === "string"
      ? b.keywords.split(",").map((k: string) => k.trim())
      : [];

  const userOnlyKeywords = rawKeywords.filter(
    (k: string) => k !== "" && !systemTags.includes(k),
  );

  const safeHours = Array.isArray(b.hours) ? b.hours : [];

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
    cep: b.cep || "",
    number: b.number || "",
    complement: b.complement || "",
    neighborhood: b.neighborhood || "",
    urban_tag: b.urban_tag || "",
    luxe_quote: b.luxe_quote || "",
    comercial_badge: b.comercial_badge || "",
    showroom_collection: b.showroom_collection || "",
    gallery: Array.isArray(b.gallery) ? b.gallery : [],
    features: Array.isArray(b.features) ? b.features : [],
    faqs: Array.isArray(b.faqs) ? b.faqs : [],
    hours: safeHours,
    favorites: Array.isArray(b.favorites) ? b.favorites : [],
    keywords: userOnlyKeywords,
    theme: b.theme || "urban_gold",
    layout: b.layout || "urban",
    latitude: b.latitude || null,
    longitude: b.longitude || null,
    menuMode: b.menuMode || "PDF",
    catalogPdf: b.catalogPdf || "",
    isExternalLink: !!b.isExternalLink,
    actionLink: b.actionLink || "",
    agendaLink: b.agendaLink || "",

    // 🚀 O CÁLCULO SEGURO E AUTOMÁTICO INJETADO AQUI:
    isOpen: checkIsOpen(safeHours),
  };
}

export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// --- 3. VALIDADOR UNIVERSAL (CPF E CNPJ ALFANUMÉRICO 2026) ---
export function isCpfOrCnpjValid(doc: string): boolean {
  const cleanDoc = (doc || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (!cleanDoc) return false;

  if (cleanDoc.length === 11) {
    if (/[A-Z]/.test(cleanDoc)) return false;
    if (/^(\d)\1{10}$/.test(cleanDoc)) return false;

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

  if (cleanDoc.length === 14) {
    const calcDigit = (cnpjStr: string, weights: number[]) => {
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        const char = cnpjStr[i];
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
