import React from "react";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import LocationTracker from "@/components/LocationTracker";
import SearchBar from "@/components/SearchBar";
import FilterModal, { LocationTree } from "@/components/FilterModal";
import BusinessCard from "@/components/BusinessCard";
import OpenNowButton from "@/components/OpenNowButton";
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

function subsHasWord(subs: string[], term: string) {
  return subs.some((s) => s.split(" ").includes(term));
}

// ============================================================================
// 🚀 ARQUITETURA DE INTENÇÃO E SEMÂNTICA 10.0
// ============================================================================

const EXCECOES_PLURAL = [
  "oculos",
  "tenis",
  "lapis",
  "onibus",
  "gratis",
  "simples",
  "pais",
  "gas",
  "virus",
  "cilios",
];

const IRREGULAR_PLURALS: Record<string, string> = {
  paes: "pao",
  caes: "cao",
  moveis: "movel",
  aneis: "anel",
  animais: "animal",
  hospitais: "hospital",
  papeis: "papel",
  farois: "farol",
  luzes: "luz",
  flores: "flor",
  cores: "cor",
};

// 1. SINÔNIMOS EXATOS, ERROS E GÊNEROS (A = B)
const TRUE_SYNONYMS: Record<string, string[]> = {
  mecanico: ["mecanica", "mecânico", "mecânica", "oficina"],
  mecanica: ["mecanico", "mecânica", "mecânico", "oficina"],
  cabeleireiro: [
    "cabeleireira",
    "cabelereiro",
    "cabelereira",
    "cabeleleiro",
    "cabeleleira",
    "salao",
  ],
  medico: [
    "medica",
    "doutor",
    "doutora",
    "dr",
    "dra",
    "clinico",
    "clínica",
    "clinica",
  ],
  veterinario: ["veterinaria", "vet", "veterinário", "veterinária"],
  psicologo: ["psicologa", "psicóloga", "psicólogo", "terapeuta"],
  advogado: ["advogada", "advocacia"],
  fotografo: ["fotografa", "fotógrafa", "fotógrafo", "fotografia", "estudio"],
  costureira: ["costureiro", "costura", "alfaiate"],
  pintor: ["pintora", "pinturas", "pintura"],
  marceneiro: ["marcenaria"],
  encanador: ["bombeiro hidraulico"],
  hamburguer: ["burger", "burguer", "x-burguer", "podrao", "x-tudo"],
  pizza: ["piza", "pissa"],
  pneu: ["peneu"],
  sobrancelha: ["sombrancelha"],
  marmita: ["quentinha", "marmitex"],
  carro: ["veiculo", "automovel", "automotivo"],
  moto: ["motocicleta"],
  dentista: ["odonto", "odontologista", "odontologia"],
  acai: ["açaí"],
  otica: ["ótica"],
  farmacia: ["farmácia", "drogaria"],
};

function expandTrueSynonyms(map: Record<string, string[]>) {
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
const TRUE_SYNONYMS_MAP = expandTrueSynonyms(TRUE_SYNONYMS);

// 2. INTENÇÃO DE COMPRA E TIPOS DE NEGÓCIO (A -> B)
const BUSINESS_TYPES: Record<string, string[]> = {
  // 🍔 Alimentação
  pao: ["padaria", "panificadora"],
  bolo: ["confeitaria", "doceria", "padaria"],
  carne: ["acougue", "churrascaria", "casa de carnes"],
  churrasco: ["churrascaria"],
  lanche: ["lanchonete", "fast food", "hamburgueria"],
  pizza: ["pizzaria"],
  esfiha: ["esfiharia"],
  pastel: ["pastelaria"],
  sushi: ["restaurante japones", "temakeria"],
  japones: ["restaurante japones", "temakeria"],
  sorvete: ["sorveteria"],
  acai: ["sorveteria", "acaiteria"],
  cerveja: ["adega", "distribuidora", "bar", "boteco"],
  chopp: ["adega", "distribuidora", "bar", "boteco"],
  bebida: ["adega", "distribuidora"],
  pf: ["restaurante"],
  hamburguer: ["hamburgueria", "lanchonete"],
  coxinha: ["salgaderia", "lanchonete", "padaria"],
  doce: ["doceria", "confeitaria"],
  salgado: ["padaria", "lanchonete", "salgaderia"],
  frango: ["rotisseria"],
  assado: ["rotisseria"],
  peixe: ["peixaria"],
  cafe: ["cafeteria"],
  cha: ["casa de cha", "cafeteria"],
  vinho: ["adega"],
  whisky: ["adega"],

  // 🏥 Saúde e Estética
  remedio: ["farmacia", "drogaria"],
  oculos: ["otica"],
  cabelo: ["salao", "barbearia", "salao de beleza"],
  unha: ["esmalteria", "salao"],
  nutricionista: ["clinica"],
  psicologo: ["clinica"],
  fonoaudiologo: ["clinica"],
  cardiologista: ["clinica"],
  dermatologista: ["clinica"],
  ginecologista: ["clinica"],
  pediatra: ["clinica"],
  aparelho: ["clinica odontologica"],
  implante: ["clinica odontologica"],
  canal: ["clinica odontologica"],

  // 🛠️ Serviços, Casa e Automotivo
  celular: ["assistencia", "assistencia tecnica", "loja de celulares"],
  pneu: ["borracharia", "centro automotivo"],
  madeira: ["marcenaria", "loja de moveis"],
  movel: ["marcenaria", "loja de moveis"],
  cano: ["encanador", "desentupidora"],
  vazamento: ["encanador", "desentupidora"],
  luz: ["eletricista"],
  tomada: ["eletricista"],
  motor: ["oficina", "mecanica", "centro automotivo"],
  carro: [
    "oficina",
    "mecanica",
    "centro automotivo",
    "lava rapido",
    "despachante",
    "auto eletrica",
    "guincho",
    "funilaria",
    "auto pecas",
    "estacionamento",
  ],
  bateria: ["auto eletrica", "centro automotivo"],
  oleo: ["centro automotivo"],
  alinhamento: ["centro automotivo"],
  balanceamento: ["centro automotivo"],
  escapamento: ["centro automotivo"],
  tinta: ["loja de tintas"],
  cimento: ["material de construcao"],
  areia: ["material de construcao"],
  telha: ["material de construcao"],
  roupa: ["loja de roupas", "boutique", "moda"],
  sapato: ["loja de calcados", "sapataria"],
  flor: ["floricultura"],
  presente: ["floricultura", "papelaria", "loja de presentes"],
  relogio: ["relojoaria"],
  joia: ["joalheria"],
  alianca: ["joalheria"],
  cachorro: ["pet shop", "clinica veterinaria"],
  gato: ["pet shop", "clinica veterinaria"],
  pet: ["pet shop", "clinica veterinaria", "banho e tosa"],
  vacina: ["clinica veterinaria"],
  racao: ["pet shop"],
  consulta: ["clinica veterinaria"],

  // 📚 Profissões -> Locais
  barbeiro: ["barbearia"],
  manicure: ["salao", "esmalteria"],
  depilacao: ["salao", "clinica de estetica"],
  estetica: ["clinica de estetica", "salao"],
  fisioterapeuta: ["clinica de fisioterapia"],
  pedreiro: ["material de construcao", "construtora"],
  serralheiro: ["serralheria"],
  vidraceiro: ["vidracaria"],
  gesseiro: ["gesso"],
};

// 3. TERMOS RELACIONADOS E VARIAÇÕES (Bônus Secundário)
const RELATED_TERMS: Record<string, string[]> = {
  restaurante: [
    "self service",
    "self-service",
    "a la carte",
    "buffet",
    "almoco",
    "jantar",
    "refeicao",
    "comida caseira",
  ],
  lanchonete: ["lanche", "lanches"],
  pastel: ["pastelzinho"],
  churrasco: ["espeto", "espetinho"],
  sorvete: ["gelato", "picole"],
  suco: ["sucos", "vitamina"],
  pizza: ["calzone", "esfiha", "massa"],
  hamburguer: ["batata", "refrigerante", "combo", "milkshake"],
  salgado: ["coxinha", "kibe", "empada", "esfiha"],
  cafe: ["cappuccino", "espresso", "pingado", "pao de queijo"],
  padaria: ["pao", "bolo", "rosca", "croissant", "cafe da manha"],
  fisioterapeuta: ["fisioterapia"],
  nutricionista: ["nutricao", "nutrição", "nutri"],
  fonoaudiologo: ["fono", "fonoaudiólogo", "fonoaudióloga"],
  ginecologista: ["gineco"],
  cardiologista: ["cardio"],
  oftalmologista: ["oculista"],
  corpo: ["massagem", "estetica", "drenagem", "pilates"],
  rosto: ["limpeza de pele", "harmonizacao", "botox", "maquiagem"],
  farmacia: ["remedio", "medicamento", "vitamina"],
  festa: ["evento", "decoracao", "salao de festas", "buffet", "dj"],
  carro: ["lavagem", "polimento", "funilaria", "martelinho"],
  casa: ["imobiliaria", "aluguel", "venda", "apartamento"],
  escola: ["colegio", "curso", "idiomas", "reforco"],
  borracharia: ["borracha"],
  funilaria: ["lanternagem", "chapeacao"],
  autoeletrica: ["auto elétrica", "injeção eletrônica"],
  guincho: ["reboque"],
  "lava rapido": ["lava-rápido", "lava jato", "lavajato"],
  imobiliaria: ["imobiliária", "corretor"],
  moveis: ["móveis", "mobilia", "mobília"],
  colchao: ["colchão", "cama"],
  petshop: ["pet shop"],
  racao: ["ração", "petisco"],
  banho: ["banho e tosa"],
  pet: ["racao", "vacina", "veterinario", "banho e tosa"],
  academia: ["musculacao", "crossfit", "personal", "treino"],
};

// 🚀 TABELA DE PESOS DO MOTOR DE BUSCA (Score Engine)
const SCORE_WEIGHTS = {
  EXACT_NAME: 300,
  CONTAINS_NAME: 220,
  KEYWORD: 180,
  SUBCATEGORY: 170,
  CATEGORY: 140,
  BUSINESS_TYPE: 100,
  RELATED: 20,
  SEC_NAME: 50,
  SEC_SUB_KEY: 40,
  SEC_BUSINESS: 30,
  SEC_RELATED: 10,
  CITY_NEIGHBORHOOD: 100,
  VERIFIED_BADGE: 50,
};

// 🚀 FUNÇÃO INTELIGENTE DE PLURAIS (Irregulares + Padrão)
function getPluralVariations(term: string): string[] {
  const variations = [term];

  if (IRREGULAR_PLURALS[term]) {
    variations.push(IRREGULAR_PLURALS[term]);
  }

  const irregularPluralForm = Object.keys(IRREGULAR_PLURALS).find(
    (k) => IRREGULAR_PLURALS[k] === term,
  );
  if (irregularPluralForm) {
    variations.push(irregularPluralForm);
  }

  if (
    !EXCECOES_PLURAL.includes(term) &&
    !IRREGULAR_PLURALS[term] &&
    !irregularPluralForm
  ) {
    if (term.endsWith("s") && term.length > 3) {
      variations.push(term.slice(0, -1));
    } else {
      variations.push(term + "s");
    }
  }

  return variations;
}

function getSmartTerms(query: string) {
  const terms = query
    .toLowerCase()
    .split(" ")
    .filter((t) => t.length > 2 && !STOPWORDS.includes(t));
  const result = new Set<string>();

  terms.forEach((term) => {
    const normalizedTerm = normalizeText(term);

    getPluralVariations(normalizedTerm).forEach((v) => result.add(v));

    if (TRUE_SYNONYMS_MAP[normalizedTerm])
      TRUE_SYNONYMS_MAP[normalizedTerm].forEach((s) => result.add(s));
    if (BUSINESS_TYPES[normalizedTerm])
      BUSINESS_TYPES[normalizedTerm].forEach((s) => result.add(s));
    if (RELATED_TERMS[normalizedTerm])
      RELATED_TERMS[normalizedTerm].forEach((s) => result.add(s));
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
    state: true,
    latitude: true,
    longitude: true,
    views: true,
    rating: true,
    createdAt: true,
    whatsapp: true,
    phone: true,
    isVerified: true,
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

  const queryCap = query.charAt(0).toUpperCase() + query.slice(1);

  const strictSearchBlock: Prisma.BusinessWhereInput[] =
    parsedTerms.length > 0
      ? [
          {
            OR: [
              { keywords: { hasSome: [query, queryCap] } },
              { subcategory: { hasSome: [query, queryCap] } },
              {
                AND: parsedTerms.map((term) => {
                  const termNormalized = normalizeText(term);
                  const coreGroup = getPluralVariations(termNormalized);

                  if (TRUE_SYNONYMS_MAP[termNormalized]) {
                    coreGroup.push(...TRUE_SYNONYMS_MAP[termNormalized]);
                  }

                  const businessGroup = BUSINESS_TYPES[termNormalized] || [];
                  const searchGroup = Array.from(
                    new Set([...coreGroup, ...businessGroup]),
                  );

                  return {
                    OR: searchGroup.flatMap((gTerm) => {
                      const gTermCap =
                        gTerm.charAt(0).toUpperCase() + gTerm.slice(1);
                      const isOriginalCoreTerm = coreGroup.includes(gTerm);

                      const baseConditions: Prisma.BusinessWhereInput[] = [
                        { keywords: { hasSome: [gTerm, gTermCap] } },
                        { subcategory: { hasSome: [gTerm, gTermCap] } },
                        {
                          category: {
                            equals: gTerm,
                            mode: "insensitive" as const,
                          },
                        },
                      ];

                      if (isOriginalCoreTerm) {
                        baseConditions.push(
                          {
                            name: {
                              contains: gTerm,
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            city: {
                              contains: gTerm,
                              mode: "insensitive" as const,
                            },
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
            ],
          },
        ]
      : [];

  const looseSearchBlock: Prisma.BusinessWhereInput[] =
    parsedTerms.length > 0
      ? [
          {
            OR: [
              { keywords: { hasSome: [query, queryCap] } },
              { subcategory: { hasSome: [query, queryCap] } },
              ...parsedTerms.flatMap((term) => {
                const termNormalized = normalizeText(term);
                const coreGroup = getPluralVariations(termNormalized);

                if (TRUE_SYNONYMS_MAP[termNormalized]) {
                  coreGroup.push(...TRUE_SYNONYMS_MAP[termNormalized]);
                }

                const businessGroup = BUSINESS_TYPES[termNormalized] || [];
                const searchGroup = Array.from(
                  new Set([...coreGroup, ...businessGroup]),
                );

                return searchGroup.flatMap((gTerm) => {
                  const gTermCap =
                    gTerm.charAt(0).toUpperCase() + gTerm.slice(1);
                  const isOriginalCoreTerm = coreGroup.includes(gTerm);

                  const baseConditions: Prisma.BusinessWhereInput[] = [
                    { keywords: { hasSome: [gTerm, gTermCap] } },
                    { subcategory: { hasSome: [gTerm, gTermCap] } },
                    {
                      category: { equals: gTerm, mode: "insensitive" as const },
                    },
                  ];

                  if (isOriginalCoreTerm) {
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
                });
              }),
            ],
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
          latitude: { gte: userLat - 0.1, lte: userLat + 0.1 },
          longitude: { gte: userLng - 0.1, lte: userLng + 0.1 },
        },
      ]
    : [];

  const onlineWhere: Prisma.BusinessWhereInput = isOnlineMode
    ? {
        OR: [
          { isExternalLink: true },
          { menuMode: { in: ["DIGITAL", "AGENDA"] } },
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

    if (todayHours && !todayHours.isClosed) {
      if (todayHours.openTime && todayHours.closeTime) {
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

      if (!isOpen && todayHours.openTime2 && todayHours.closeTime2) {
        const [oH2, oM2] = todayHours.openTime2.split(":").map(Number);
        const [cH2, cM2] = todayHours.closeTime2.split(":").map(Number);
        const openVal2 = oH2 * 100 + oM2;
        const closeVal2 = cH2 * 100 + cM2;

        if (closeVal2 < openVal2) {
          isOpen = currentTime >= openVal2 || currentTime < closeVal2;
        } else {
          isOpen = currentTime >= openVal2 && currentTime < closeVal2;
        }
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

      if (nName === query) score += SCORE_WEIGHTS.EXACT_NAME + 50;
      else if (nName.includes(query)) score += SCORE_WEIGHTS.CONTAINS_NAME;

      let matchedTermsCount = 0;
      parsedTerms.forEach((term, index) => {
        const isFirstTerm = index === 0;

        const coreGroup = getPluralVariations(term);
        if (TRUE_SYNONYMS_MAP[term]) coreGroup.push(...TRUE_SYNONYMS_MAP[term]);

        const businessGroup = BUSINESS_TYPES[term] || [];
        const relatedGroup = RELATED_TERMS[term] || [];

        const isCoreInName = coreGroup.some((t) => nameWords.includes(t));
        const isCoreInCat = coreGroup.some((t) => nCat === t);
        const isCoreInSubs = coreGroup.some((t) => subsHasWord(nSubs, t));
        const isCoreInKeys = coreGroup.some((t) => keysWords.includes(t));

        const isBusinessInCatOrSubs = businessGroup.some(
          (t) =>
            nCat === t ||
            subsHasWord(nSubs, t) ||
            keysWords.includes(t) ||
            nameWords.includes(t),
        );
        const isRelated = relatedGroup.some(
          (t) => keysWords.includes(t) || subsHasWord(nSubs, t),
        );

        if (
          isCoreInName ||
          isCoreInCat ||
          isCoreInSubs ||
          isCoreInKeys ||
          isBusinessInCatOrSubs
        )
          matchedTermsCount++;

        if (isFirstTerm) {
          if (isCoreInName) score += SCORE_WEIGHTS.EXACT_NAME;
          else if (isCoreInKeys) score += SCORE_WEIGHTS.KEYWORD;
          else if (isCoreInSubs) score += SCORE_WEIGHTS.SUBCATEGORY;
          else if (isCoreInCat) score += SCORE_WEIGHTS.CATEGORY;
          else if (isBusinessInCatOrSubs) score += SCORE_WEIGHTS.BUSINESS_TYPE;
          else if (isRelated) score += SCORE_WEIGHTS.RELATED;
          else if (nName.includes(term)) score += 15;
        } else {
          if (isCoreInName) score += SCORE_WEIGHTS.SEC_NAME;
          else if (isCoreInSubs || isCoreInKeys)
            score += SCORE_WEIGHTS.SEC_SUB_KEY;
          else if (isBusinessInCatOrSubs) score += SCORE_WEIGHTS.SEC_BUSINESS;
          else if (isRelated) score += SCORE_WEIGHTS.SEC_RELATED;

          if (b.city === term || b.neighborhood === term)
            score += SCORE_WEIGHTS.CITY_NEIGHBORHOOD;
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

      if (b.isVerified && score > 0) {
        score += SCORE_WEIGHTS.VERIFIED_BADGE;
      }

      const firstTerm = parsedTerms[0];
      const firstCoreGroup = getPluralVariations(firstTerm);

      if (TRUE_SYNONYMS_MAP[firstTerm])
        firstCoreGroup.push(...TRUE_SYNONYMS_MAP[firstTerm]);

      const firstBusinessGroup = BUSINESS_TYPES[firstTerm] || [];

      const hasCoreIntentExact =
        firstCoreGroup.some((t) => nameWords.includes(t)) ||
        firstCoreGroup.some((t) => subsHasWord(nSubs, t)) ||
        firstCoreGroup.some((t) => nCat === t) ||
        firstCoreGroup.some((t) => keysWords.includes(t)) ||
        firstBusinessGroup.some(
          (t) => nCat === t || subsHasWord(nSubs, t) || keysWords.includes(t),
        );

      if (parsedTerms.length > 1) {
        if (matchedTermsCount < parsedTerms.length) {
          score = 0;
        }
      } else if (matchedTermsCount === 0 && !hasCoreIntentExact) {
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

  // ============================================================================
  // 🚀 1. PRIMEIRO: Filtra pela relevância do texto digitado (score > 0)
  // ============================================================================
  if (query) {
    businesses = businesses.filter((b) => b.score > 0);
  }

  // ============================================================================
  // 🚀 2. O INTERCEPTADOR CONTEXTUAL (CTO / UX FIX)
  // Constrói as opções APENAS com o que existe na busca atual (Anti-Resultados Vazios)
  // ============================================================================
  let effectiveFilterMap = orderedFilterMap;
  let effectiveLocationData = locationData;

  if (query && businesses.length > 0) {
    const dynamicMap: Record<string, Set<string>> = {};
    const dynamicLoc: LocationTree = {};

    businesses.forEach((item) => {
      if (item.category) {
        if (!dynamicMap[item.category]) dynamicMap[item.category] = new Set();
        if (item.subcategory && Array.isArray(item.subcategory)) {
          item.subcategory.forEach((sub: string) => {
            if (sub) dynamicMap[item.category].add(sub);
          });
        }
      }

      if (item.state && item.city && item.neighborhood) {
        if (!dynamicLoc[item.state]) dynamicLoc[item.state] = {};
        if (!dynamicLoc[item.state][item.city])
          dynamicLoc[item.state][item.city] = [];
        if (!dynamicLoc[item.state][item.city].includes(item.neighborhood)) {
          dynamicLoc[item.state][item.city].push(item.neighborhood);
        }
      }
    });

    const sortedDynamicMap: Record<string, string[]> = {};
    Object.keys(dynamicMap)
      .sort()
      .forEach((key) => {
        sortedDynamicMap[key] = Array.from(dynamicMap[key]).sort();
      });

    Object.keys(dynamicLoc).forEach((st) => {
      Object.keys(dynamicLoc[st]).forEach((ct) => {
        dynamicLoc[st][ct].sort();
      });
    });

    effectiveFilterMap = sortedDynamicMap;
    effectiveLocationData = dynamicLoc;
  }

  // ============================================================================
  // 🚀 3. SEGUNDO: Aplica os filtros de Subcategoria e Abertos (após criar o menu)
  // ============================================================================
  if (subcategoryArray.length > 0) {
    businesses = businesses.filter((b) => b.matchesSubcategoryFilter);
  }
  if (statusFilter === "open") {
    businesses = businesses.filter((b) => b.isOpen);
  }

  if (isOnlineMode && !cityFilter && !stateFilter) {
    businesses = businesses.map((b) =>
      b.score > 0 ? { ...b, score: b.score + 50 } : b,
    );
  }

  // ============================================================================
  // 🚀 4. ORDENAÇÃO E PAGINAÇÃO
  // ============================================================================
  if (needsJsEngine) {
    if (sort === "distance" && userLat && userLng)
      businesses.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    else if (isOnlineMode || sort === "popular")
      businesses.sort((a, b) => b.views - a.views);
    else if (sort === "recent" || sort === "newest")
      businesses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    else if (query && sort === "relevance")
      businesses.sort((a, b) => b.score - a.score);
    else businesses.sort((a, b) => b.views - a.views);

    paginatedResults = businesses.slice(skip, skip + PAGE_SIZE);
  } else {
    paginatedResults = businesses;
  }

  const effectiveTotal = needsJsEngine ? businesses.length : totalCount;
  const totalPages = Math.ceil(effectiveTotal / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 py-6 md:py-8 px-4 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 md:gap-6 relative z-10">
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

          {/* 🚀 BARRA DE BUSCA + BOTÃO APENAS ABERTOS + FILTRO */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            <div className="w-full flex-1">
              <SearchBar initialQuery={rawQuery} />
            </div>

            {/* 🚀 O CHECKBOX / PILL DE APENAS ABERTOS INJETADO AQUI! */}
            <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
              <OpenNowButton />
            </div>

            <div className="w-full md:w-auto shrink-0 flex items-center [&>button]:w-full md:[&>button]:w-auto [&>button]:h-12 md:[&>button]:h-[56px] [&>button]:bg-slate-100 [&>button]:border-slate-200 [&>button]:text-slate-700 [&>button]:hover:bg-slate-200 [&>button]:shadow-inner [&>button]:transition-all [&>button]:font-bold [&>button]:tracking-widest">
              <FilterModal
                availableCategories={effectiveFilterMap}
                locationData={effectiveLocationData}
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

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {paginatedResults.length === 0 ? (
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
                <>
                  {paginatedResults.map((item) => (
                    <BusinessCard
                      key={item.id}
                      business={item}
                      isLoggedIn={!!userId}
                      showDistance={sort === "distance"}
                    />
                  ))}

                  {page === 1 && paginatedResults.length < 12 && (
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
                        Crie sua Vitrine Digital em 5 minutos e venda para
                        clientes que buscam por negócios como o seu todos os
                        dias!
                      </p>

                      <span className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tafanu-action group-hover:text-emerald-300 transition-colors relative z-10">
                        Ver Planos <ArrowRight size={14} strokeWidth={3} />
                      </span>
                    </Link>
                  )}
                </>
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
