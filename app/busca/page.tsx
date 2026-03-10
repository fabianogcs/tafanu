import { db } from "@/lib/db";
import { SlidersHorizontal } from "lucide-react";
import LocationTracker from "@/components/LocationTracker";
import FilterModal from "@/components/FilterModal";
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
  return R * c;
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
  }>;
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const session = await auth();
  const userId = session?.user?.id;

  const params = await searchParams;
  const rawQuery = (params.q || "").trim();
  const query = normalizeText(rawQuery);
  const page = Number(params.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  // 📍 PARÂMETROS DE LOCALIZAÇÃO E FILTROS
  const category = params.category || "";
  const rawCityFilter = params.city || "";
  const cityFilter = normalizeText(rawCityFilter); // Limpa "São Paulo" para "sao paulo"
  const stateFilter = params.state || "";
  const neighborhoodFilter = params.neighborhood || "";
  const sort = params.sort || "relevance";

  const userLat = params.lat ? parseFloat(String(params.lat)) : null;
  const userLng = params.lng ? parseFloat(String(params.lng)) : null;

  // --- 1. METADADOS PARA O MODAL ---
  const categoriesData = await db.business.findMany({
    where: { isActive: true, published: true },
    select: { category: true, subcategory: true },
    distinct: ["category"],
  });

  const filterMap: Record<string, string[]> = {};
  categoriesData.forEach((item) => {
    if (!filterMap[item.category]) filterMap[item.category] = [];
    item.subcategory.forEach((sub) => {
      if (!filterMap[item.category].includes(sub))
        filterMap[item.category].push(sub);
    });
  });

  const orderedFilterMap: Record<string, string[]> = {};
  Object.keys(filterMap)
    .sort()
    .forEach((key) => {
      orderedFilterMap[key] = filterMap[key].sort();
    });

  // --- 2. PREPARAÇÃO DA BARRA DE PESQUISA ---
  // O usuário digita "Espaço" -> vira "espaco"
  const searchTerms = query
    .split(" ")
    .filter((w) => w.length > 0 && !STOPWORDS.includes(w));

  const whereClause: any = {
    isActive: true,
    published: true,
    user: {
      OR: [
        { role: "ADMIN" },
        { role: "ASSINANTE", expiresAt: { gt: new Date() } },
      ],
    },
    AND: [
      // 📍 ONDE ESTÁ?
      ...(category
        ? [{ category: { equals: category, mode: "insensitive" as const } }]
        : []),
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

      // 🍕 O QUE É?
      ...(searchTerms.length > 0
        ? searchTerms.map((term) => ({
            OR: [
              { name: { contains: term, mode: "insensitive" as const } },
              { category: { contains: term, mode: "insensitive" as const } },
              // 🚀 A MÁGICA AQUI: O banco vai achar "espaco mulher" escondido nas keywords!
              { keywords: { hasSome: [term] } },
              { subcategory: { hasSome: [term] } },
            ],
          }))
        : []),
    ],
  };

  // --- 3. BUSCA NO BANCO ---
  const [businessesData, totalCount] = await Promise.all([
    db.business.findMany({
      where: whereClause,
      take: 150,
      include: {
        hours: true,
        favorites: userId ? { where: { userId } } : false,
        _count: { select: { favorites: true } },
      },
    }),
    db.business.count({ where: whereClause }),
  ]);

  // --- 4. RANKING E SCORE (Apenas para Identidade) ---
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  let businesses = businessesData.map((b) => {
    // Calcula distância SE a loja tiver latitude salva no banco (resolve o erro do null)
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

      // Transforma as listas em frases para achar "pizza" dentro de "pizzaria"
      const nSubs = b.subcategory.map((s) => normalizeText(s)).join(" ");
      const nKeys = b.keywords.map((k) => normalizeText(k)).join(" ");

      if (nName === query) score += 100;
      if (nName.includes(query)) score += 60;

      searchTerms.forEach((t) => {
        if (nName.includes(t)) score += 40;
        if (nSubs.includes(t)) score += 50;
        if (nKeys.includes(t)) score += 45;
        if (nCat.includes(t)) score += 30;
      });
    } else {
      score = 1;
    }

    return {
      ...b,
      distance: distanceValue as number | null,
      isOpen,
      score,
      isFavorited: userId ? b.favorites.length > 0 : false,
      favoritesCount: b._count.favorites,
    };
  });

  // --- 5. ORDENAÇÃO E PAGINAÇÃO ---
  if (query && sort === "relevance") {
    businesses = businesses
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score);
  } else if (sort === "distance" && userLat && userLng) {
    // Coloca quem não tem distância (null) no final da lista
    businesses.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
  } else if (sort === "popular") {
    businesses.sort((a, b) => b.views - a.views);
  } else if (sort === "newest") {
    businesses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const paginatedResults = businesses.slice(skip, skip + PAGE_SIZE);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0f172a] text-white py-10 px-4 shadow-xl relative overflow-hidden z-[100]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              {rawQuery ? `"${rawQuery}"` : "Explorar"}
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Encontramos <strong className="text-white">{totalCount}</strong>{" "}
              negócios.
            </p>
          </div>
          <FilterModal
            availableCategories={orderedFilterMap}
            currentSort={sort}
          />
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
                  Nenhum resultado encontrado.
                </div>
              ) : (
                paginatedResults.map((item) => (
                  <BusinessCard
                    key={item.id}
                    business={item}
                    isLoggedIn={!!userId}
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
