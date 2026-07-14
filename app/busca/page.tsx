import React from "react";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import LocationTracker from "@/components/LocationTracker";
import SearchBar from "@/components/SearchBar";
import FilterModal, { LocationTree } from "@/components/FilterModal";
import BusinessCard from "@/components/BusinessCard";
import { auth } from "@/auth";
import Link from "next/link";
import { normalizeText } from "@/lib/normalize";
import { unstable_cache } from "next/cache";
import { SearchX, Plus, TrendingUp, ArrowRight, Info } from "lucide-react";

const PAGE_SIZE = 12;
const STOPWORDS = ["na", "no", "em", "de", "do", "da", "com", "para", "o", "a"];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SINONIMOS_BASE: Record<string, string[]> = {
  dente: [
    "dentista",
    "odontologia",
    "clinica odontologica",
    "aparelho",
    "clareamento",
    "implante",
  ],
  olho: [
    "oculos",
    "otica",
    "lente",
    "exame de vista",
    "lentes de contato",
    "armacao",
    "oftalmologista",
    "oculista",
  ],
  medico: [
    "clinica medica",
    "consulta",
    "exame",
    "laboratorio",
    "pediatra",
    "ginecologista",
    "cardiologista",
  ],
  mente: ["psicologo", "psicologia", "terapia", "psiquiatra", "terapeuta"],
  corpo: [
    "massagem",
    "drenagem",
    "clinica de estetica",
    "spa",
    "emagrecimento",
    "fisioterapia",
    "quiropraxia",
  ],
  pao: ["padaria", "panificadora", "confeitaria", "paes", "baguete"],
  lanche: [
    "hamburguer",
    "hamburgueria",
    "sanduiche",
    "fast food",
    "hot dog",
    "cachorro quente",
  ],
  pizza: ["pizzaria", "calzone", "rodizio"],
  marmita: [
    "quentinha",
    "pf",
    "prato feito",
    "restaurante",
    "comida caseira",
    "marmitex",
  ],
  carne: ["churrasco", "churrascaria", "espetinho", "acougue", "carnes"],
  doce: ["bolo", "doceria", "confeitaria", "sobremesa", "chocolate", "doces"],
  japones: ["sushi", "temaki", "japonesa", "oriental", "sashimi"],
  sorvete: ["sorveteria", "acai", "gelato", "picole"],
  cerveja: ["chopp", "adega", "bar", "bebidas", "distribuidora", "boteco"],
  cafe: ["cafeteria", "cappuccino", "espresso", "cafe da manha", "lanchonete"],
  pastel: ["pastelaria", "pasteis", "salgado", "salgaderia"],
  chave: ["chaveiro", "copia de chave", "fechadura", "cadeado"],
  vazamento: [
    "cano",
    "encanador",
    "hidraulico",
    "desentupidora",
    "bombeiro hidraulico",
  ],
  energia: ["luz", "tomada", "eletricista", "eletrica", "fiacao", "luzes"],
  limpeza: ["diarista", "faxina", "faxineira", "higienizacao"],
  parede: ["tinta", "pintor", "pintura", "textura"],
  madeira: ["movel", "marceneiro", "marcenaria", "planejados", "moveis"],
  vidro: ["box", "vidracaria", "espelho", "vidraceiro"],
  clima: ["ar condicionado", "refrigeracao", "climatizacao", "limpeza de ar"],
  costura: [
    "costureira",
    "conserto de roupa",
    "bainha",
    "alfaiate",
    "sapateiro",
  ],
  grafica: [
    "impressao",
    "copiadora",
    "xerox",
    "banner",
    "cartao de visita",
    "adesivo",
  ],
  carro: [
    "mecanica",
    "mecanico",
    "oficina",
    "automotivo",
    "auto pecas",
    "veiculo",
    "carros",
  ],
  moto: ["motocicleta", "oficina de moto", "motopeças", "motos"],
  bateria: ["auto eletrica", "arranque", "alternador"],
  pneu: ["borracharia", "borracheiro", "alinhamento", "balanceamento", "pneus"],
  lavagem: [
    "lavar",
    "lava jato",
    "estetica automotiva",
    "polimento",
    "lavar car",
    "lava rapido",
  ],
  lataria: ["batida", "funilaria", "martelinho", "pintura automotiva"],
  guincho: ["reboque", "socorro", "auto socorro", "bateria arriada"],
  unha: ["manicure", "pedicure", "esmalteria", "salao", "unhas"],
  cabelo: [
    "salao",
    "cabeleireiro",
    "barbearia",
    "corte",
    "mechas",
    "coloracao",
    "cabelereiro",
  ],
  pelo: ["depilacao", "cera", "laser", "pelos"],
  rosto: [
    "sobrancelha",
    "cilios",
    "maquiagem",
    "limpeza de pele",
    "estetica",
    "harmonizacao facial",
  ],
  roupa: [
    "vestuario",
    "loja",
    "moda",
    "boutique",
    "calcados",
    "sapato",
    "vestido",
    "camisa",
    "roupas",
  ],
  celular: [
    "smartphone",
    "capinha",
    "assistencia",
    "eletronicos",
    "conserto",
    "iphone",
    "celulares",
  ],
  informatica: [
    "computador",
    "notebook",
    "pc",
    "ti",
    "manutencao de pc",
    "tecnico",
    "formatacao",
  ],
  presente: [
    "lembrancinha",
    "floricultura",
    "papelaria",
    "variedades",
    "brinquedo",
  ],
  mercado: ["supermercado", "mercearia", "hortifruti", "sacolao", "atacadao"],
  remedio: ["farmacia", "drogaria", "medicamento"],
  academia: [
    "musculacao",
    "crossfit",
    "pilates",
    "personal",
    "fitness",
    "treino",
    "luta",
    "natacao",
  ],
  festa: [
    "eventos",
    "buffet",
    "decoracao de festas",
    "espaco para festas",
    "aniversario",
    "casamento",
    "festas",
  ],
  foto: ["fotografo", "ensaio", "book", "estudio fotografico", "filmagem"],
  casa: [
    "imobiliaria",
    "aluguel",
    "venda",
    "apartamento",
    "corretor",
    "terreno",
    "imovel",
  ],
  construcao: [
    "material de construcao",
    "cimento",
    "tijolo",
    "ferragem",
    "deposito",
    "tintas",
  ],
  frete: ["mudanca", "carreto", "transporte", "logistica", "caminhao"],
  escola: [
    "colegio",
    "creche",
    "bercario",
    "reforco escolar",
    "curso",
    "idiomas",
    "ingles",
    "autoescola",
  ],
  justica: ["processo", "advogado", "advocacia", "juridico", "cartorio"],
  imposto: ["cnpj", "contador", "contabilidade"],
  pet: [
    "animal",
    "cachorro",
    "gato",
    "pet shop",
    "veterinario",
    "clinica veterinaria",
    "animais",
  ],
  tosa: ["banho", "estetica animal", "cuidado pet"],
  racao: ["petisco", "agropecuaria", "comida pet", "banho e tosa"],
};

function expandSynonyms(map: Record<string, string[]>) {
  const expanded: Record<string, Set<string>> = {};
  Object.entries(map).forEach(([key, values]) => {
    const group = [key, ...values].map((v) => normalizeText(v));
    group.forEach((word1) => {
      if (!expanded[word1]) expanded[word1] = new Set();
      group.forEach((word2) => {
        if (word1 !== word2) expanded[word1].add(word2);
      });
    });
  });
  return Object.fromEntries(
    Object.entries(expanded).map(([k, v]) => [k, Array.from(v)]),
  );
}

const SYNONYMS_MAP = expandSynonyms(SINONIMOS_BASE);

function getSmartTerms(query: string) {
  const terms = query
    .toLowerCase()
    .split(" ")
    .filter((t) => t.length > 2 && !STOPWORDS.includes(t));
  const result = new Set<string>();
  terms.forEach((term) => {
    const normalizedTerm = normalizeText(term);
    result.add(normalizedTerm);
    if (normalizedTerm.endsWith("s") && normalizedTerm.length > 3)
      result.add(normalizedTerm.slice(0, -1));
    if (SYNONYMS_MAP[normalizedTerm])
      SYNONYMS_MAP[normalizedTerm].forEach((s) => result.add(s));
  });
  return Array.from(result);
}

const getGlobalFilters = unstable_cache(
  async () => {
    const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);
    return await Promise.all([
      db.business.findMany({
        where: {
          isActive: true,
          published: true,
          OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
        },
        select: { category: true, subcategory: true },
      }),
      db.business.findMany({
        where: {
          isActive: true,
          published: true,
          OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
        },
        select: { state: true, city: true, neighborhood: true },
        distinct: ["state", "city", "neighborhood"],
      }),
    ]);
  },
  ["global-filter-menu"],
  { revalidate: 3600 },
);

interface BuscaProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    lat?: string;
    lng?: string;
    sort?: string;
    status?: string;
    page?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
    modo?: string;
  }>;
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const session = await auth();
  const userId = session?.user?.id;

  const optimizedSelect: Prisma.BusinessSelect = {
    id: true,
    name: true,
    slug: true,
    imageUrl: true,
    category: true,
    subcategory: true,
    keywords: true,
    neighborhood: true,
    city: true,
    latitude: true,
    longitude: true,
    views: true,
    rating: true,
    createdAt: true,
    whatsapp: true,
    phone: true,
    hours: {
      select: {
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isClosed: true,
      },
    },
    favorites: userId ? { where: { userId }, select: { id: true } } : false,
    _count: { select: { favorites: true } },
  };

  const params = await searchParams;

  const rawQuery = String(params.q || "")
    .slice(0, 80)
    .trim();
  let query = normalizeText(rawQuery);

  const isOnlineMode = params.modo === "online";
  let isIntentOpen = false;
  const openKeywords = [
    "aberto",
    "aberta",
    "abertos",
    "abertas",
    "agora",
    "24h",
    "hoje",
  ];

  openKeywords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(query)) {
      isIntentOpen = true;
      query = query.replace(regex, "").trim();
    }
  });

  const rawPage = Number(params.page) || 1;
  const page = Math.min(Math.max(rawPage, 1), 100);
  const skip = (page - 1) * PAGE_SIZE;

  const category = String(params.category || "").slice(0, 50);
  const subcategoryParam = String(params.subcategory || "").slice(0, 200);

  const stateFilter = String(params.state || "").slice(0, 2);
  const cityFilter = String(params.city || "").slice(0, 100);
  const neighborhoodFilter = String(params.neighborhood || "").slice(0, 100);

  const statusFilter = isIntentOpen ? "open" : params.status || "all";
  const subcategoryArray = subcategoryParam ? subcategoryParam.split(",") : [];

  const sort = params.sort || "relevance";

  const userLat = params.lat ? parseFloat(String(params.lat)) : null;
  const userLng = params.lng ? parseFloat(String(params.lng)) : null;

  const smartTerms = getSmartTerms(query);
  const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const parsedTerms = query
    .split(" ")
    .filter((t) => t.length > 2 && !STOPWORDS.includes(t))
    .slice(0, 4);

  const strictSearchBlock: Prisma.BusinessWhereInput[] =
    parsedTerms.length > 0
      ? [
          {
            AND: parsedTerms.map((term) => {
              const termNormalized = normalizeText(term);
              const group = [termNormalized];
              if (SYNONYMS_MAP[termNormalized])
                group.push(...SYNONYMS_MAP[termNormalized]);
              if (termNormalized.endsWith("s") && termNormalized.length > 3)
                group.push(termNormalized.slice(0, -1));

              return {
                OR: group.flatMap((gTerm) => {
                  const gTermCap =
                    gTerm.charAt(0).toUpperCase() + gTerm.slice(1);
                  const isOriginalTerm =
                    gTerm === termNormalized ||
                    gTerm === termNormalized.slice(0, -1);

                  const baseConditions: Prisma.BusinessWhereInput[] = [
                    { keywords: { hasSome: [gTerm, gTermCap] } },
                    { subcategory: { hasSome: [gTerm, gTermCap] } },
                    {
                      category: { equals: gTerm, mode: "insensitive" as const },
                    },
                  ];

                  if (isOriginalTerm) {
                    baseConditions.push(
                      {
                        name: { contains: gTerm, mode: "insensitive" as const },
                      },
                      {
                        city: { contains: gTerm, mode: "insensitive" as const },
                      },
                      {
                        neighborhood: {
                          contains: gTerm,
                          mode: "insensitive" as const,
                        },
                      },
                    );
                  }
                  return baseConditions;
                }),
              };
            }),
          },
        ]
      : [];

  const looseSearchBlock: Prisma.BusinessWhereInput[] =
    parsedTerms.length > 0
      ? [
          {
            OR: parsedTerms.flatMap((term) => {
              const termNormalized = normalizeText(term);
              const group = [termNormalized];
              if (SYNONYMS_MAP[termNormalized])
                group.push(...SYNONYMS_MAP[termNormalized]);
              if (termNormalized.endsWith("s") && termNormalized.length > 3)
                group.push(termNormalized.slice(0, -1));

              return group.flatMap((gTerm) => {
                const gTermCap = gTerm.charAt(0).toUpperCase() + gTerm.slice(1);
                const isOriginalTerm =
                  gTerm === termNormalized ||
                  gTerm === termNormalized.slice(0, -1);

                const baseConditions: Prisma.BusinessWhereInput[] = [
                  { keywords: { hasSome: [gTerm, gTermCap] } },
                  { subcategory: { hasSome: [gTerm, gTermCap] } },
                  { category: { equals: gTerm, mode: "insensitive" as const } },
                ];

                if (isOriginalTerm) {
                  baseConditions.push(
                    { name: { contains: gTerm, mode: "insensitive" as const } },
                    { city: { contains: gTerm, mode: "insensitive" as const } },
                    {
                      neighborhood: {
                        contains: gTerm,
                        mode: "insensitive" as const,
                      },
                    },
                  );
                }
                return baseConditions;
              });
            }),
          },
        ]
      : [];

  const commonWhere: Prisma.BusinessWhereInput[] = [
    { OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }] },
    ...(subcategoryArray.length > 0
      ? [{ subcategory: { hasSome: subcategoryArray } }]
      : []),
    ...(stateFilter
      ? [{ state: { equals: stateFilter, mode: "insensitive" as const } }]
      : []),
    ...(cityFilter
      ? [{ city: { equals: cityFilter, mode: "insensitive" as const } }]
      : []),
    ...(neighborhoodFilter
      ? [
          {
            neighborhood: {
              equals: neighborhoodFilter,
              mode: "insensitive" as const,
            },
          },
        ]
      : []),
    ...(category
      ? [{ category: { equals: category, mode: "insensitive" as const } }]
      : []),
  ];

  const useGpsRestrict = userLat && userLng && !cityFilter && !stateFilter;
  const gpsBoundingBox: Prisma.BusinessWhereInput[] = useGpsRestrict
    ? [
        {
          latitude: { gte: userLat - 0.2, lte: userLat + 0.2 },
          longitude: { gte: userLng - 0.2, lte: userLng + 0.2 },
        },
      ]
    : [];

  const onlineWhere: Prisma.BusinessWhereInput = isOnlineMode
    ? {
        OR: [
          { shopee: { not: "" } },
          { mercadoLivre: { not: "" } },
          { shein: { not: "" } },
          { ifood: { not: "" } },
        ],
      }
    : {};

  const [categoriesData, locationRaw] = await getGlobalFilters();

  const filterMap: Record<string, Set<string>> = {};
  categoriesData.forEach((item) => {
    if (!item.category) return;
    if (!filterMap[item.category]) filterMap[item.category] = new Set();
    if (item.subcategory && Array.isArray(item.subcategory)) {
      item.subcategory.forEach((sub) => {
        if (sub) filterMap[item.category].add(sub);
      });
    }
  });

  const orderedFilterMap: Record<string, string[]> = {};
  Object.keys(filterMap)
    .sort()
    .forEach((key) => {
      orderedFilterMap[key] = Array.from(filterMap[key]).sort();
    });

  const locationData: LocationTree = {};
  locationRaw.forEach((b) => {
    if (!b.state || !b.city || !b.neighborhood) return;
    if (!locationData[b.state]) locationData[b.state] = {};
    if (!locationData[b.state][b.city]) locationData[b.state][b.city] = [];
    if (!locationData[b.state][b.city].includes(b.neighborhood))
      locationData[b.state][b.city].push(b.neighborhood);
  });

  const hasSearchTarget = !!(
    rawQuery ||
    category ||
    subcategoryParam ||
    isOnlineMode ||
    (userLat && userLng)
  );
  const needsJsEngine =
    query !== "" ||
    sort === "distance" ||
    sort === "relevance" ||
    statusFilter === "open";

  let businessesData: any[] = [];
  let totalCount = 0;
  let paginatedResults: any[] = [];
  let didExpandSearch = false;

  if (hasSearchTarget) {
    if (needsJsEngine) {
      let currentWhereClause: Prisma.BusinessWhereInput = {
        isActive: true,
        published: true,
        ...onlineWhere,
        AND: [...commonWhere, ...gpsBoundingBox, ...strictSearchBlock],
      };

      let dbResult = await db.business.findMany({
        where: currentWhereClause,
        take: 1500,
        select: optimizedSelect,
      });

      if (dbResult.length < 4 && parsedTerms.length > 0) {
        currentWhereClause.AND = [
          ...commonWhere,
          ...gpsBoundingBox,
          ...looseSearchBlock,
        ];
        dbResult = await db.business.findMany({
          where: currentWhereClause,
          take: 400,
          select: optimizedSelect,
        });
      }

      if (dbResult.length < 4 && useGpsRestrict) {
        didExpandSearch = true;
        currentWhereClause.AND = [...commonWhere, ...looseSearchBlock];
        dbResult = await db.business.findMany({
          where: currentWhereClause,
          take: 400,
          select: optimizedSelect,
        });
      }

      totalCount = await db.business.count({ where: currentWhereClause });
      businessesData = dbResult;
    } else {
      let currentWhereClause: Prisma.BusinessWhereInput = {
        isActive: true,
        published: true,
        ...onlineWhere,
        AND: [...commonWhere, ...gpsBoundingBox],
      };

      let dbOrderBy: any = { views: "desc" };
      if (sort === "recent" || sort === "newest")
        dbOrderBy = { createdAt: "desc" };

      let dbResult = await db.business.findMany({
        where: currentWhereClause,
        skip: skip,
        take: PAGE_SIZE,
        orderBy: dbOrderBy,
        select: optimizedSelect,
      });

      if (dbResult.length < 4 && useGpsRestrict) {
        didExpandSearch = true;
        currentWhereClause.AND = [...commonWhere];
        dbResult = await db.business.findMany({
          where: currentWhereClause,
          skip: skip,
          take: PAGE_SIZE,
          orderBy: dbOrderBy,
          select: optimizedSelect,
        });
      }

      businessesData = dbResult;
      totalCount = await db.business.count({ where: currentWhereClause });
    }
  }

  const serverTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const now = new Date(serverTime);
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  let businesses = businessesData.map((b) => {
    const matchesSubcategoryFilter =
      subcategoryArray.length === 0 ||
      b.subcategory.some((sub: string) =>
        subcategoryArray.some(
          (filterSub) => normalizeText(filterSub) === normalizeText(sub),
        ),
      );

    let distanceValue: number | null = null;
    if (userLat && userLng && b.latitude && b.longitude) {
      distanceValue = calculateDistance(
        userLat,
        userLng,
        b.latitude,
        b.longitude,
      );
    }

    let isOpen = false;
    const todayHours = b.hours.find((h: any) => h.dayOfWeek === currentDay);
    if (
      todayHours &&
      !todayHours.isClosed &&
      todayHours.openTime &&
      todayHours.closeTime
    ) {
      const [oH, oM] = todayHours.openTime.split(":").map(Number);
      const [cH, cM] = todayHours.closeTime.split(":").map(Number);
      const openVal = oH * 100 + oM;
      const closeVal = cH * 100 + cM;

      if (closeVal < openVal) {
        isOpen = currentTime >= openVal || currentTime < closeVal;
      } else {
        isOpen = currentTime >= openVal && currentTime < closeVal;
      }
    }

    let score = 0;
    if (query) {
      const nName = normalizeText(b.name);
      const nCat = normalizeText(b.category);
      const nSubs = b.subcategory.map((s: string) => normalizeText(s));
      const nSubsString = nSubs.join(" ");
      const nKeys = b.keywords.map((k: string) => normalizeText(k)).join(" ");
      const nameWords = nName.split(" ");
      const keysWords = nKeys.split(" ");

      if (nName === query) score += 300;
      else if (nName.includes(query)) score += 150;

      let matchedTermsCount = 0;
      parsedTerms.forEach((term, index) => {
        const isFirstTerm = index === 0;
        const isExactInName = nameWords.includes(term);
        const isExactInSubs = nSubs.includes(term);
        const isExactInCat = nCat === term;
        const isExactInKeys = keysWords.includes(term);

        if (isExactInName || isExactInSubs || isExactInCat || isExactInKeys)
          matchedTermsCount++;

        if (isFirstTerm) {
          if (isExactInName) score += 200;
          else if (isExactInSubs) score += 180;
          else if (isExactInCat) score += 150;
          else if (nName.includes(term)) score += 15;
        } else {
          if (isExactInName) score += 50;
          else if (isExactInSubs || isExactInKeys) score += 40;
          if (b.city === term || b.neighborhood === term) score += 100;
        }
      });

      if (parsedTerms.length > 1 && matchedTermsCount === parsedTerms.length) {
        score += 120;
      }

      let termScore = 0;
      smartTerms.forEach((t) => {
        if (nKeys.includes(t)) termScore += 50;
        if (nCat.includes(t)) termScore += 40;
        if (nSubsString.includes(t)) termScore += 40;
      });
      score += Math.min(termScore, 200);

      if (distanceValue !== null) {
        if (distanceValue <= 2) score += 250;
        else if (distanceValue <= 5) score += 150;
        else if (distanceValue <= 10) score += 70;
        else if (distanceValue <= 20) score += 20;
      }
      if (b.keywords.length === 0) score -= 10;

      if (b.rating && b.rating > 0) {
        score += Math.round(b.rating * 10);
      }

      const hasCoreIntentExact =
        nameWords.includes(parsedTerms[0]) ||
        nSubs.includes(parsedTerms[0]) ||
        nCat === parsedTerms[0];

      if (parsedTerms[0]?.length <= 3 && !hasCoreIntentExact) {
        score = 0;
      }
    } else {
      score = 1;
    }
    if (subcategoryArray.length > 0 && matchesSubcategoryFilter) score += 200;

    return {
      ...b,
      matchesSubcategoryFilter,
      distance: distanceValue,
      isOpen,
      score,
      isFavorited: userId ? b.favorites.length > 0 : false,
      favoritesCount: b._count.favorites,
    };
  });

  if (subcategoryArray.length > 0)
    businesses = businesses.filter((b) => b.matchesSubcategoryFilter);
  if (statusFilter === "open") businesses = businesses.filter((b) => b.isOpen);

  if (isOnlineMode && !cityFilter && !stateFilter) {
    businesses = businesses.map((b) => ({ ...b, score: b.score + 50 }));
  }

  if (needsJsEngine) {
    if (sort === "distance" && userLat && userLng)
      businesses.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    else if (isOnlineMode || sort === "popular")
      businesses.sort((a, b) => b.views - a.views);
    else if (sort === "recent" || sort === "newest")
      businesses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    else if (query && sort === "relevance")
      businesses = businesses
        .filter((b) => b.score > 0)
        .sort((a, b) => b.score - a.score);
    else businesses.sort((a, b) => b.views - a.views);

    paginatedResults = businesses.slice(skip, skip + PAGE_SIZE);
  } else {
    paginatedResults = businesses;
  }

  const effectiveTotal = needsJsEngine ? businesses.length : totalCount;
  const totalPages = Math.ceil(effectiveTotal / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 🚀 CIRURGIA FOCADA: O CABEÇALHO REORGANIZADO E INTUITIVO */}
      {/* Removi o overflow-hidden para o menu do filtro não ser cortado! */}
      <div className="bg-white border-b border-slate-200 py-6 md:py-8 px-4 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 md:gap-6 relative z-10">
          {/* TÍTULO E SUBTÍTULO (Sempre no topo esquerdo) */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter flex flex-wrap items-center gap-2 md:gap-3 text-slate-900">
              {isOnlineMode ? (
                <>
                  <span className="text-tafanu-action">Marketplace</span>
                  {rawQuery ? (
                    <span className="text-slate-500 tracking-normal text-xl md:text-3xl">
                      • "{rawQuery}"
                    </span>
                  ) : (
                    ""
                  )}
                </>
              ) : rawQuery ? (
                `"${rawQuery}"`
              ) : (
                "Explorar"
              )}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {statusFilter === "open" ? (
                <>
                  Exibindo{" "}
                  <strong className="text-slate-800">{effectiveTotal}</strong>{" "}
                  abertos
                </>
              ) : (
                <>
                  Encontramos{" "}
                  <strong className="text-slate-800">{effectiveTotal}</strong>{" "}
                  resultados {isOnlineMode && "online"}
                </>
              )}
            </p>
          </div>

          {/* 🚀 A MÁGICA: BARRA DE BUSCA + BOTÃO FILTRO LADO A LADO */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            {/* A barra de busca ocupa o máximo de espaço possível */}
            <div className="w-full flex-1">
              <SearchBar initialQuery={rawQuery} />
            </div>

            {/* O Filtro fica colado nela. O truque [&>button] injeta cor e altura no componente Modal sem precisar alterar o arquivo do modal! */}
            <div className="w-full md:w-auto shrink-0 flex items-center [&>button]:w-full md:[&>button]:w-auto [&>button]:h-12 md:[&>button]:h-[56px] [&>button]:bg-slate-100 [&>button]:border-slate-200 [&>button]:text-slate-700 [&>button]:hover:bg-slate-200 [&>button]:shadow-inner [&>button]:transition-all [&>button]:font-bold [&>button]:tracking-widest">
              <FilterModal
                availableCategories={orderedFilterMap}
                locationData={locationData}
                currentSort={sort}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          <aside className="w-full lg:col-span-1">
            <LocationTracker />
            {isOnlineMode && !userLat && !cityFilter && (
              <div className="hidden lg:block bg-amber-50 border border-amber-200 p-4 rounded-2xl mt-4 animate-pulse">
                <p className="text-[10px] font-black uppercase text-amber-600 mb-1">
                  ⚠️ Restringir Resultados
                </p>
                <p className="text-xs font-medium text-amber-700 leading-tight">
                  Ative o GPS acima ou use o botão{" "}
                  <strong>Filtros Online</strong> para escolher sua cidade.
                </p>
              </div>
            )}
          </aside>

          <div className="lg:col-span-3">
            {isOnlineMode && !userLat && !cityFilter && (
              <div className="lg:hidden mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl animate-pulse">
                <p className="text-[10px] font-black uppercase text-amber-600 mb-0.5">
                  ⚠️ Restringir Resultados
                </p>
                <p className="text-[11px] font-medium text-amber-700 leading-tight">
                  Ligue o GPS ou filtre sua cidade para evitar lojas distantes.
                </p>
              </div>
            )}

            {/* Aviso de Expansão */}
            {didExpandSearch && (
              <div className="bg-blue-50 border border-blue-200 p-4 md:p-5 rounded-2xl mb-6 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Info className="text-blue-500" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">
                    Expansão Automática
                  </p>
                  <p className="text-xs md:text-sm font-medium text-blue-800 leading-snug">
                    Não encontramos muitas opções perto de você. Expandimos o
                    raio de busca para mostrar os melhores resultados da região!
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {paginatedResults.length === 0 ? (
                // O BLOCO VAZIO (OPORTUNIDADE ABERTA) REFINADO
                <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm mt-4 animate-in fade-in zoom-in duration-500">
                  <div className="bg-emerald-50 p-6 rounded-full mb-6 shadow-inner border border-emerald-100">
                    <SearchX size={48} className="text-tafanu-action" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight uppercase italic">
                    Oportunidade{" "}
                    <span className="text-tafanu-action">Aberta!</span>
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed mb-8">
                    {isOnlineMode
                      ? "Os clientes estão buscando canais externos para isso na sua região. Cadastre sua vitrine agora e saia na frente da concorrência!"
                      : "Milhares de pessoas buscam por negócios assim todos os dias. Coloque sua empresa no topo do Tafanu e capture esses clientes primeiro!"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center"
                    >
                      Ver Lojas em Alta
                    </Link>
                    <Link
                      href="/anunciar"
                      className="w-full sm:w-auto px-6 py-4 bg-tafanu-action text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#00c27a] transition-all shadow-[0_5px_15px_rgba(0,168,107,0.3)] flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3} /> Dominar Esta Busca
                    </Link>
                  </div>
                </div>
              ) : (
                paginatedResults.map((item, index) => {
                  const isLastItemAndLessThan10 =
                    paginatedResults.length < 10 &&
                    index === paginatedResults.length - 1;
                  const isTenthPosition =
                    paginatedResults.length >= 10 && index === 8;
                  const showCtaCard =
                    page === 1 && (isLastItemAndLessThan10 || isTenthPosition);

                  return (
                    <React.Fragment key={item.id}>
                      {/* O Card do Lojista (Ele já puxa a cor branca do BusinessCard.tsx) */}
                      <BusinessCard
                        business={item}
                        isLoggedIn={!!userId}
                        showDistance={sort === "distance"}
                      />

                      {/* O CARD "OUTDOOR" NO MEIO DA BUSCA (O ÚNICO ESCURO) */}
                      {showCtaCard && (
                        <Link
                          href="/anunciar"
                          className="group relative bg-slate-900 p-6 md:p-8 rounded-[1.5rem] flex flex-col h-full overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-800 justify-center items-center text-center"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-tafanu-action opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700" />

                          <div className="w-14 h-14 bg-tafanu-action rounded-full flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(0,168,107,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                            <TrendingUp size={24} strokeWidth={2.5} />
                          </div>

                          <h3 className="font-black text-white text-lg md:text-xl uppercase tracking-tighter mb-2 leading-tight relative z-10">
                            Sua Empresa{" "}
                            <span className="text-tafanu-action">Aqui</span>
                          </h3>

                          <p className="text-slate-400 text-[10px] md:text-xs font-medium mb-6 relative z-10 max-w-[200px] leading-relaxed">
                            Crie sua Vitrine Digital em 2 minutos e venda para
                            clientes da sua região.
                          </p>

                          <span className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tafanu-action group-hover:text-emerald-300 transition-colors relative z-10">
                            Ver Planos <ArrowRight size={14} strokeWidth={3} />
                          </span>
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-12 justify-center flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const active = pNum === page;
                  const urlParams = new URLSearchParams();
                  Object.entries(params).forEach(([k, v]) => {
                    if (v) urlParams.set(k, String(v));
                  });
                  urlParams.set("page", String(pNum));

                  return (
                    <Link
                      key={pNum}
                      href={`/busca?${urlParams.toString()}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all border ${
                        active
                          ? "bg-tafanu-action border-tafanu-action text-white scale-110 shadow-lg"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
