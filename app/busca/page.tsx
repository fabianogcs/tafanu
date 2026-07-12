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
import { SearchX, Plus, TrendingUp, ArrowRight } from "lucide-react";

const PAGE_SIZE = 12;
const STOPWORDS = ["na", "no", "em", "de", "do", "da", "com", "para", "o", "a"];

// 🚀 CTO FIX: Fórmula exata da Terra. Sem inflacionar a distância!
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
  // --- SAÚDE E BEM-ESTAR ---
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

  // --- ALIMENTAÇÃO E BEBIDA ---
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

  // --- SERVIÇOS PROFISSIONAIS E MANUTENÇÃO ---
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

  // --- AUTOMOTIVO ---
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

  // --- BELEZA E MODA ---
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

  // --- TECNOLOGIA E VAREJO ---
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

  // --- EVENTOS E LAZER ---
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

  // --- IMÓVEIS E LOGÍSTICA ---
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

  // --- EDUCAÇÃO E BUROCRACIA ---
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

  // --- PETS ---
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
    rating: true, // 🚀 ADICIONADO AQUI PARA PUXAR A NOTA DA LOJA NA BUSCA
    createdAt: true,
    whatsapp: true,
    phone: true,
    deliveryRadius: true, // 🚀 FASE 3: PUXANDO O RAIO AQUI
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

  // 🚀 ESCUDO ANTI-CPU EXHAUSTION NA BUSCA: Trunca os parâmetros direto na raiz!
  // Impede que queries injetadas via URL com 10MB travem o Prisma.
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

  // 🚀 CIRURGIA DE SINÔNIMOS: O 'contains' guloso agora só aplica na palavra exata digitada!
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

                  // Regras que valem para TODOS (A palavra exata tem que estar nas tags/keywords)
                  const baseConditions: Prisma.BusinessWhereInput[] = [
                    { keywords: { hasSome: [gTerm, gTermCap] } },
                    { subcategory: { hasSome: [gTerm, gTermCap] } },
                    {
                      category: { equals: gTerm, mode: "insensitive" as const },
                    },
                  ];

                  // Regra exclusiva para o que o usuário DIGITOU (pode pesquisar pedaços da palavra)
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
      ? [
          {
            subcategory: {
              hasSome: subcategoryArray,
            },
          },
        ]
      : []),

    ...(stateFilter
      ? [{ state: { equals: stateFilter, mode: "insensitive" as const } }]
      : []),
    // ... resto do seu commonWhere
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
    ...(userLat && userLng
      ? [
          {
            latitude: { gte: userLat - 1.0, lte: userLat + 1.0 },
            longitude: { gte: userLng - 1.0, lte: userLng + 1.0 },
          },
        ]
      : []),
  ];

  const onlineWhere: Prisma.BusinessWhereInput = isOnlineMode
    ? {
        OR: [
          { shopee: { not: "" } },
          { mercadoLivre: { not: "" } },
          { shein: { not: "" } },
          { ifood: { not: "" } },
          { hasDelivery: true },
        ],
      }
    : {};

  const [categoriesData, locationRaw] = await getGlobalFilters();

  const filterMap: Record<string, Set<string>> = {};
  categoriesData.forEach((item) => {
    if (!item.category) return; // 🛡️ Protege contra categoria vazia

    if (!filterMap[item.category]) filterMap[item.category] = new Set();

    // 🛡️ O COLETE À PROVA DE BALAS: Só roda o forEach se o subcategory for realmente um array válido
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

  if (hasSearchTarget) {
    if (needsJsEngine) {
      let currentWhereClause: Prisma.BusinessWhereInput = {
        isActive: true,
        published: true,
        ...onlineWhere,
        AND: [...commonWhere, ...strictSearchBlock],
      };

      let dbResult = await db.business.findMany({
        where: currentWhereClause,
        take: 1500, // 🚀 CIRURGIA: Aumentado de 400 para 1500. Garante que nenhuma loja fique de fora do radar ao escalar uma cidade, mantendo a performance estável.
        orderBy: { views: "desc" },
        select: optimizedSelect,
      });

      if (dbResult.length === 0 && parsedTerms.length > 0) {
        currentWhereClause.AND = [...commonWhere, ...looseSearchBlock];

        dbResult = await db.business.findMany({
          where: currentWhereClause,
          take: 400,
          orderBy: { views: "desc" },
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
        AND: commonWhere,
      };

      let dbOrderBy: any = { views: "desc" };
      if (sort === "recent" || sort === "newest")
        dbOrderBy = { createdAt: "desc" };

      const [dbResult, count] = await Promise.all([
        db.business.findMany({
          where: currentWhereClause,
          skip: skip,
          take: PAGE_SIZE,
          orderBy: dbOrderBy,
          select: optimizedSelect,
        }),
        db.business.count({ where: currentWhereClause }),
      ]);
      businessesData = dbResult;
      totalCount = count;
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

      // 1. MATCH DA FRASE COMPLETA (Caso digite o nome exato da loja)
      if (nName === query) {
        score += 300;
      } else if (nName.includes(query)) {
        score += 150;
      }

      // 2. AVALIAÇÃO PALAVRA POR PALAVRA (Cirurgia para "bar em campinas")
      let matchedTermsCount = 0;

      parsedTerms.forEach((term, index) => {
        const isFirstTerm = index === 0; // Geralmente a intenção principal ("bar", "pizza")
        const isExactInName = nameWords.includes(term);
        const isExactInSubs = nSubs.includes(term);
        const isExactInCat = nCat === term;
        const isExactInKeys = keysWords.includes(term);

        if (isExactInName || isExactInSubs || isExactInCat || isExactInKeys) {
          matchedTermsCount++;
        }

        // Se for o termo principal (ex: "bar"), damos um peso gigantesco se a palavra for exata
        if (isFirstTerm) {
          if (isExactInName)
            score += 200; // "Bar do Zé" -> +200
          else if (isExactInSubs)
            score += 180; // Subcategoria exata "bar" -> +180
          else if (isExactInCat)
            score += 150; // Categoria exata -> +150
          else if (nName.includes(term)) {
            score += 15; // Contém apenas como pedaço (ex: "barbearia" contém "bar") -> Ganha quase nada!
          }
        } else {
          // Termos secundários do cliente (ex: "campinas", "premium")
          if (isExactInName) score += 50;
          else if (isExactInSubs || isExactInKeys) score += 40;

          // Se o termo bater com a cidade ou o bairro cadastrado na loja
          if (b.city === term || b.neighborhood === term) {
            score += 100; // Bônus crucial de localização!
          }
        }
      });

      // Super bônus se a loja der match com TODOS os termos digitados (Relevância Cruzada)
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

      // 🚀 CTO FIX: ZONAS DE CALOR (Proximidade é Rei no SEO Local)
      if (distanceValue !== null) {
        if (distanceValue <= 2) {
          score += 250; // 🎯 Super Quente (Até 2km - "No meu bairro")
        } else if (distanceValue <= 5) {
          score += 150; // 🔥 Quente (Até 5km - "Bairros vizinhos")
        } else if (distanceValue <= 10) {
          score += 70; // 🟡 Morno (Até 10km - "Na minha cidade")
        } else if (distanceValue <= 20) {
          score += 20; // 🔵 Frio (Até 20km - "Região metropolitana")
        }
        // Mais de 20km não ganha bônus de proximidade.
      }
      if (b.keywords.length === 0) score -= 10;

      // 3. O FILTRO ANTI-LIXO MULTI-TERMO
      // Se o termo principal tem 3 letras ou menos (ex: "bar", "sal", "pao")
      // Mas a loja não possui essa palavra de forma EXATA no nome, subcategoria ou categoria,
      // significa que é um lixo de substring (ex: pegou "barbearia" em vez de "bar"). Zeramos o score!
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

  // 🚀 CTO & CFO FIX: O FILTRO DO MODO DELIVERY BLINDADO (Agora protege TUDO!)
  if (userLat && userLng) {
    // 1. Cliente tem GPS Ligado: A gente arranca da lista quem não entrega na casa dele!
    businesses = businesses.filter((b) => {
      // Regra de Ouro: Se a loja não é de Agendamento, e tem Raio de Entrega, cortamos na faca!
      if (
        b.menuMode !== "AGENDA" &&
        b.deliveryRadius &&
        b.deliveryRadius > 0 &&
        b.distance !== null
      ) {
        return b.distance <= b.deliveryRadius;
      }
      return true; // Lojas de serviços (Agenda) ou frete nacional (raio 0) passam direto
    });
  } else if (isOnlineMode && !cityFilter && !stateFilter) {
    // 2. Cliente entrou no Modo Delivery SEM GPS e SEM CIDADE:
    // A gente derruba a nota de lojas locais (com raio) lá pro fundo, pra evitar que
    // o cara veja uma pizzaria de outro estado na cara dele.
    businesses = businesses.map((b) => ({
      ...b,
      score:
        b.deliveryRadius && b.deliveryRadius > 0
          ? Math.max(0, b.score - 500)
          : b.score + 100,
    }));
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0f172a] text-white py-8 md:py-10 px-4 shadow-xl relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                {isOnlineMode ? (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-tafanu-action to-emerald-400">
                      Marketplace
                    </span>
                    {rawQuery ? `• "${rawQuery}"` : ""}
                  </>
                ) : rawQuery ? (
                  `"${rawQuery}"`
                ) : (
                  "Explorar"
                )}
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {statusFilter === "open" ? (
                  <>
                    Exibindo{" "}
                    <strong className="text-white">{effectiveTotal}</strong>{" "}
                    abertos
                  </>
                ) : (
                  <>
                    Encontramos{" "}
                    <strong className="text-white">{effectiveTotal}</strong>{" "}
                    resultados {isOnlineMode && "online"}
                  </>
                )}
              </p>
            </div>
            <FilterModal
              availableCategories={orderedFilterMap}
              locationData={locationData}
              currentSort={sort}
            />
          </div>
          <div className="w-full">
            <SearchBar initialQuery={rawQuery} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-4 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          <aside className="w-full lg:col-span-1">
            <LocationTracker />
            {/* 🚀 AVISO DE UX: Se o usuário estiver no modo online mas sem GPS/Cidade, pedimos a ação dele */}
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
            {/* 🚀 O MESMO AVISO PARA O MOBILE */}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {paginatedResults.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm mt-4 animate-in fade-in zoom-in duration-500">
                  <div className="bg-orange-50 p-6 rounded-full mb-6 shadow-inner border border-orange-100">
                    <SearchX size={48} className="text-orange-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#023059] mb-3 tracking-tight uppercase italic">
                    Oportunidade{" "}
                    <span className="text-emerald-500">Aberta!</span>
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed mb-8">
                    {isOnlineMode
                      ? "Os clientes estão buscando delivery para isso na sua região. Cadastre sua loja agora e saia na frente da concorrência!"
                      : "Milhares de pessoas buscam por negócios assim todos os dias. Coloque sua empresa no topo do Tafanu e capture esses clientes primeiro!"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-4 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center justify-center"
                    >
                      Ver Lojas em Alta
                    </Link>
                    <Link
                      href="/anunciar"
                      className="w-full sm:w-auto px-6 py-4 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3} /> Dominar Esta Busca
                    </Link>
                  </div>
                </div>
              ) : (
                paginatedResults.map((item, index) => {
                  // 🚀 A LÓGICA DO CAVALO DE TRÓIA (Card de Vendas Nativo)
                  // 1. Se tem menos de 10 negócios, coloca o Card de Vendas no último espaço.
                  // 2. Se tem mais de 10 negócios, injeta o Card de Vendas exatamente na posição 10 (após o index 8).
                  // 3. Isso só aparece na primeira página (page === 1) para não irritar o usuário nas páginas seguintes.
                  const isLastItemAndLessThan10 =
                    paginatedResults.length < 10 &&
                    index === paginatedResults.length - 1;
                  const isTenthPosition =
                    paginatedResults.length >= 10 && index === 8;
                  const showCtaCard =
                    page === 1 && (isLastItemAndLessThan10 || isTenthPosition);

                  return (
                    <React.Fragment key={item.id}>
                      <BusinessCard
                        business={item}
                        isLoggedIn={!!userId}
                        showDistance={sort === "distance"}
                      />

                      {/* INJEÇÃO DO CARD DE VENDAS */}
                      {showCtaCard && (
                        <Link
                          href="/anunciar"
                          className="group relative bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col h-full overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-800 justify-center items-center text-center"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-tafanu-action opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-700" />

                          <div className="w-14 h-14 bg-tafanu-action rounded-full flex items-center justify-center text-[#0f172a] mb-5 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10">
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
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all ${active ? "bg-tafanu-action text-white scale-110 shadow-lg" : "bg-white text-gray-400 hover:bg-gray-100"}`}
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
