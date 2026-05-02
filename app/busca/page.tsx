import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { SlidersHorizontal } from "lucide-react";
import LocationTracker from "@/components/LocationTracker";
import SearchBar from "@/components/SearchBar";
import FilterModal, { LocationTree } from "@/components/FilterModal";
import BusinessCard from "@/components/BusinessCard";
import { auth } from "@/auth";
import Link from "next/link";
import { normalizeText } from "@/lib/normalize";

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
  return R * c * 1.3;
}

// 🚀 DICIONÁRIO DE SINÔNIMOS (Bidirecional Automático e Completo)
const SINONIMOS_BASE: Record<string, string[]> = {
  pao: ["padaria", "panificadora", "confeitaria", "baguete"],
  lanche: [
    "hamburguer",
    "hamburgueria",
    "sanduiche",
    "fast food",
    "hot dog",
    "cachorro quente",
  ],
  pizza: ["pizzaria", "calzone", "rodizio"],
  marmita: ["quentinha", "pf", "prato feito", "restaurante", "comida caseira"],
  carne: ["churrasco", "churrascaria", "espetinho", "acougue"],
  doce: ["bolo", "doceria", "confeitaria", "sobremesa", "chocolate"],
  japones: ["sushi", "temaki", "japonesa", "oriental", "sashimi"],
  sorvete: ["sorveteria", "acai", "gelato", "picole"],
  cerveja: ["chopp", "adega", "bar", "bebidas", "distribuidora"],
  carro: [
    "mecanica",
    "mecanico",
    "oficina",
    "automotivo",
    "auto pecas",
    "veiculo",
  ],
  bateria: ["auto eletrica", "arranque", "alternador"],
  pneu: ["borracharia", "borracheiro", "alinhamento", "balanceamento"],
  lavagem: ["lavar", "lava jato", "estetica automotiva", "polimento"],
  lataria: ["batida", "funilaria", "martelinho", "pintura automotiva"],
  unha: ["manicure", "pedicure", "esmalteria", "salao"],
  cabelo: [
    "salao",
    "cabeleireiro",
    "barbearia",
    "corte",
    "mechas",
    "coloracao",
  ],
  pelo: ["depilacao", "cera", "laser"],
  rosto: ["sobrancelha", "cilios", "maquiagem", "limpeza de pele", "estetica"],
  remedio: ["farmacia", "drogaria", "medicamento"],
  roupa: ["vestuario", "loja", "moda", "boutique", "calcados", "sapato"],
  celular: ["smartphone", "capinha", "assistencia", "eletronicos", "conserto"],
  presente: ["lembrancinha", "floricultura", "papelaria", "variedades"],
  mercado: ["supermercado", "mercearia", "hortifruti", "sacolao"],
  pet: [
    "animal",
    "cachorro",
    "gato",
    "pet shop",
    "veterinario",
    "clinica veterinaria",
  ],
  tosa: ["banho", "estetica animal", "cuidado pet"],
  racao: ["petisco", "agropecuaria", "comida pet"],
  vazamento: ["cano", "encanador", "hidraulico", "desentupidora"],
  energia: ["luz", "tomada", "eletricista", "eletrica", "fiacao"],
  limpeza: ["diarista", "faxina", "faxineira"],
  parede: ["tinta", "pintor", "pintura", "textura"],
  madeira: ["movel", "marceneiro", "marcenaria", "planejados"],
  vidro: ["box", "vidracaria", "espelho"],
  clima: ["ar condicionado", "refrigeracao", "climatizacao", "limpeza de ar"],
  justica: ["processo", "advogado", "advocacia", "juridico"],
  imposto: ["cnpj", "contador", "contabilidade"],
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
    if (normalizedTerm.endsWith("s") && normalizedTerm.length > 3) {
      result.add(normalizedTerm.slice(0, -1));
    }
    if (SYNONYMS_MAP[normalizedTerm]) {
      SYNONYMS_MAP[normalizedTerm].forEach((s) => result.add(s));
    }
  });
  return Array.from(result);
}

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
    modo?: string; // 🚀 NOVO PARÂMETRO DA NOSSA ESTRATÉGIA
  }>;
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const session = await auth();
  const userId = session?.user?.id;

  const params = await searchParams;
  const rawQuery = (params.q || "").trim();
  let query = normalizeText(rawQuery);

  // 🚀 MODO ONLINE (O SEGREDO DA NOVA ESTRATÉGIA)
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

  if (!isOnlineMode) {
    // Só busca abertos se NÃO for online
    openKeywords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      if (regex.test(query)) {
        isIntentOpen = true;
        query = query.replace(regex, "").trim();
      }
    });
  }

  const page = Number(params.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  const category = params.category || "";
  const subcategoryParam = params.subcategory || "";
  const rawCityFilter = params.city || "";

  const statusFilter = isIntentOpen ? "open" : params.status || "all";
  const subcategoryArray = subcategoryParam ? subcategoryParam.split(",") : [];

  // Se for modo online, a gente ignora a cidade para buscar no Brasil todo
  const cityFilter = isOnlineMode ? "" : normalizeText(rawCityFilter);
  const sort = params.sort || "relevance";

  const userLat = params.lat ? parseFloat(String(params.lat)) : null;
  const userLng = params.lng ? parseFloat(String(params.lng)) : null;

  const smartTerms = getSmartTerms(query);
  const searchTerms = smartTerms;

  // --- 1. CONSTRUÇÃO DO FILTRO BASE ---
  const baseWhereClause: Prisma.BusinessWhereInput = {
    isActive: true,
    published: true,

    // 🚀 A MÁGICA: Se for online, só traz quem tem link de venda
    ...(isOnlineMode
      ? {
          OR: [
            { shopee: { not: "" } },
            { mercadoLivre: { not: "" } },
            { shein: { not: "" } },
            { ifood: { not: "" } },
          ],
        }
      : {}),

    AND: [
      ...(cityFilter
        ? [
            {
              OR: [
                {
                  city: { contains: cityFilter, mode: "insensitive" as const },
                },
                {
                  state: { contains: cityFilter, mode: "insensitive" as const },
                },
                {
                  neighborhood: {
                    contains: cityFilter,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          ]
        : []),
      ...(searchTerms.length > 0
        ? [
            {
              OR: searchTerms.slice(0, 3).flatMap((term) => {
                const termCap = term.charAt(0).toUpperCase() + term.slice(1);
                return [
                  { name: { contains: term, mode: "insensitive" as const } },
                  {
                    category: { contains: term, mode: "insensitive" as const },
                  },
                  { keywords: { hasSome: [term, termCap] } },
                  { subcategory: { hasSome: [term, termCap] } },
                ];
              }),
            },
          ]
        : []),
    ],
  };

  // --- 2. BUSCA DE CATEGORIAS DINÂMICAS E LOCALIZAÇÃO ---
  const [categoriesData, locationRaw] = await Promise.all([
    db.business.findMany({
      where: baseWhereClause,
      select: { category: true, subcategory: true },
    }),
    // Locais só importam se não for modo online
    isOnlineMode
      ? Promise.resolve([])
      : db.business.findMany({
          where: { isActive: true, published: true },
          select: { state: true, city: true, neighborhood: true },
          distinct: ["state", "city", "neighborhood"],
        }),
  ]);

  const filterMap: Record<string, Set<string>> = {};
  categoriesData.forEach((item) => {
    if (!filterMap[item.category]) filterMap[item.category] = new Set();
    item.subcategory.forEach((sub) => filterMap[item.category].add(sub));
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
    if (!locationData[b.state][b.city].includes(b.neighborhood)) {
      locationData[b.state][b.city].push(b.neighborhood);
    }
  });

  const finalWhereClause: Prisma.BusinessWhereInput = {
    ...baseWhereClause,
    category: category
      ? { equals: category, mode: "insensitive" as const }
      : undefined,
  };

  // A busca online agora também é um alvo válido, mesmo sem digitar nada!
  const hasSearchTarget = !!(
    rawQuery ||
    category ||
    subcategoryParam ||
    isOnlineMode
  );

  const [businessesData, totalCount] = hasSearchTarget
    ? await Promise.all([
        db.business.findMany({
          where: finalWhereClause,
          take: 400,
          include: {
            hours: true,
            favorites: userId ? { where: { userId } } : false,
            _count: { select: { favorites: true } },
          },
        }),
        db.business.count({ where: finalWhereClause }),
      ])
    : [[], 0];

  // --- 4. RANKING E SCORE ---
  const serverTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const now = new Date(serverTime);
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  let businesses = businessesData.map((b) => {
    const matchesSubcategoryFilter =
      subcategoryArray.length === 0 ||
      b.subcategory.some((sub) =>
        subcategoryArray.some(
          (filterSub) => normalizeText(filterSub) === normalizeText(sub),
        ),
      );

    let distanceValue: number | null = null;
    if (!isOnlineMode && userLat && userLng && b.latitude && b.longitude) {
      distanceValue = calculateDistance(
        userLat,
        userLng,
        b.latitude,
        b.longitude,
      );
    }

    let isOpen = false;
    const todayHours = b.hours.find((h) => h.dayOfWeek === currentDay);
    if (
      todayHours &&
      !todayHours.isClosed &&
      todayHours.openTime &&
      todayHours.closeTime
    ) {
      const [oH, oM] = todayHours.openTime.split(":").map(Number);
      const [cH, cM] = todayHours.closeTime.split(":").map(Number);
      isOpen = currentTime >= oH * 100 + oM && currentTime < cH * 100 + cM;
    }

    let score = 0;
    if (query) {
      const nName = normalizeText(b.name);
      const nCat = normalizeText(b.category);
      const nSubs = b.subcategory.map((s) => normalizeText(s));
      const nSubsString = nSubs.join(" ");
      const nKeys = b.keywords.map((k) => normalizeText(k)).join(" ");

      if (nName === query) score += 120;
      else if (nName.startsWith(query)) score += 90;
      else if (nName.includes(query)) score += 60;

      if (nSubs.includes(query)) score += 70;

      let termScore = 0;
      smartTerms.forEach((t) => {
        if (nKeys.includes(t)) termScore += 50;
        if (nCat.includes(t)) termScore += 40;
        if (nSubsString.includes(t)) termScore += 40;
      });

      score += Math.min(termScore, 200);

      if (distanceValue !== null) score += Math.max(0, 50 - distanceValue);
      if (b.keywords.length === 0) score -= 10;
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

  if (subcategoryArray.length > 0) {
    businesses = businesses.filter((b) => b.matchesSubcategoryFilter);
  }

  if (statusFilter === "open" && !isOnlineMode) {
    businesses = businesses.filter((b) => b.isOpen);
  }

  // 🚀 O ALGORITMO REI DA COLINA PARA O MODO ONLINE
  if (isOnlineMode) {
    // No modo online, o que importa são as views, a menos que haja uma busca forte de texto
    businesses.sort((a, b) => b.views - a.views);
  } else if (sort === "distance" && userLat && userLng) {
    businesses.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
  } else if (sort === "popular") {
    businesses.sort((a, b) => b.views - a.views);
  } else if (sort === "recent" || sort === "newest") {
    businesses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else if (query && sort === "relevance") {
    // Se a pessoa digitou algo na barra de pesquisa (query), usa o seu sistema de pontos!
    businesses = businesses
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score);
  } else {
    // 🚀 REGRA PADRÃO (CATEGORIAS):
    // Se a pessoa SÓ clicou na categoria (a query está vazia e nenhuma regra acima bateu),
    // o sistema organiza automaticamente colocando os MAIS VISTOS no topo!
    businesses.sort((a, b) => b.views - a.views);
  }

  const paginatedResults = businesses.slice(skip, skip + PAGE_SIZE);
  const totalPages = Math.ceil(businesses.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0f172a] text-white py-8 md:py-10 px-4 shadow-xl relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              {/* 🚀 Feedback visual elegante se estiver no modo online */}
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
                {statusFilter === "open" && !isOnlineMode ? (
                  <>
                    Exibindo{" "}
                    <strong className="text-white">{businesses.length}</strong>{" "}
                    abertos de {totalCount}
                  </>
                ) : (
                  <>
                    Encontramos{" "}
                    <strong className="text-white">{totalCount}</strong>{" "}
                    resultados {isOnlineMode && "online"}
                  </>
                )}
              </p>
            </div>
            <FilterModal
              availableCategories={orderedFilterMap}
              locationData={locationData}
              currentSort={sort}
              isDisabled={totalCount === 0 && !isOnlineMode}
            />
          </div>
          <div className="w-full">
            <SearchBar initialQuery={rawQuery} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <LocationTracker />
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {paginatedResults.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-50 font-bold text-gray-400">
                  {isOnlineMode
                    ? "Nenhuma loja online encontrada para esta categoria."
                    : "Nenhum resultado encontrado."}
                </div>
              ) : (
                paginatedResults.map((item) => (
                  <BusinessCard
                    key={item.id}
                    business={item}
                    isLoggedIn={!!userId}
                    showDistance={sort === "distance" && !isOnlineMode}
                  />
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex gap-2 mt-12 justify-center">
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
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all ${
                        active
                          ? "bg-tafanu-action text-white scale-110 shadow-lg"
                          : "bg-white text-gray-400 hover:bg-gray-100"
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
