import { db } from "@/lib/db";
import { SlidersHorizontal } from "lucide-react";
import LocationTracker from "@/components/LocationTracker";
import FilterModal from "@/components/FilterModal";
import BusinessCard from "@/components/BusinessCard";
import { auth } from "@/auth";

// Função de cálculo de distância (Haversine)
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

const normalize = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

interface BuscaProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    sort?: string;
    status?: string;
  }>;
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const session = await auth();
  const userId = session?.user?.id;

  const filters = await searchParams;
  const rawQuery = (filters.q || "").trim();
  const query = normalize(rawQuery);

  const category = filters.category || "";
  const subcategory = filters.subcategory || "";
  const sort = filters.sort || "distance";
  const status = filters.status || "all";

  const userLat = filters.lat ? parseFloat(String(filters.lat)) : null;
  const userLng = filters.lng ? parseFloat(String(filters.lng)) : null;

  // 1. BUSCA METADADOS (MAPA DE CATEGORIAS)
  const allMeta = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
      user: {
        OR: [
          { role: "ADMIN" },
          { role: "ASSINANTE", expiresAt: { gt: new Date() } },
        ],
      },
    },
    select: { category: true, subcategory: true },
  });

  const filterMap: Record<string, string[]> = {};
  allMeta.forEach((item) => {
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

  // 2. BUSCA NEGÓCIOS FILTRADOS
  const businessesData = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
      user: {
        OR: [
          { role: "ADMIN" },
          { role: "ASSINANTE", expiresAt: { gt: new Date() } },
        ],
      },
      AND: [
        ...(category
          ? [{ category: { equals: category, mode: "insensitive" as const } }]
          : []),
        ...(subcategory
          ? [{ subcategory: { hasSome: subcategory.split(",") } }]
          : []),
      ],
    },
    include: {
      hours: true,
      favorites: userId ? { where: { userId } } : false,
      _count: { select: { favorites: true } },
    },
  });

  // 3. ALGORITMO DE PROCESSAMENTO
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  let businesses = businessesData.map((b) => {
    let distanceValue: number | null = null;
    let internalSortKey: number = 999999;

    if (userLat && userLng) {
      if (b.latitude && b.longitude) {
        distanceValue = calculateDistance(
          userLat,
          userLng,
          b.latitude,
          b.longitude,
        );
        internalSortKey = distanceValue;
      } else {
        internalSortKey = 10000 + Math.random() * 5000;
      }
    }

    let isOpen = false;
    const todayHours = b.hours.find((h) => h.dayOfWeek === currentDay);
    if (
      todayHours &&
      !todayHours.isClosed &&
      todayHours.openTime &&
      todayHours.closeTime
    ) {
      const [openH, openM] = todayHours.openTime.split(":").map(Number);
      const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
      isOpen =
        currentTime >= openH * 100 + openM &&
        currentTime < closeH * 100 + closeM;
    }

    let score = !query ? 1 : 0;
    if (query) {
      const name = normalize(b.name);
      const cat = normalize(b.category);
      if (name === query) score += 50;
      else if (name.includes(query)) score += 20;
      if (cat.includes(query)) score += 30;
    }

    return {
      ...b,
      distance: distanceValue,
      internalSortKey,
      isOpen,
      score,
      isFavorited: userId ? b.favorites.length > 0 : false,
      favoritesCount: b._count.favorites,
    };
  });

  // 4. ORDENAÇÃO FINAL
  if (query) {
    businesses = businesses.filter((b) => b.score > 0);
    businesses.sort((a, b) => b.score - a.score);
  } else {
    businesses.sort((a, b) => {
      if (sort === "popular") {
        if (b.favoritesCount !== a.favoritesCount) {
          return b.favoritesCount - a.favoritesCount;
        }
        return a.internalSortKey - b.internalSortKey;
      }
      return a.internalSortKey - b.internalSortKey;
    });
  }

  if (status === "open") businesses = businesses.filter((b) => b.isOpen);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0f172a] text-white py-10 px-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tafanu-action rounded-full blur-[120px] opacity-10 -mr-20 -mt-20" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-tafanu-action/80 text-xs font-black uppercase tracking-widest">
              <SlidersHorizontal size={14} />
              {category || "Resultados"}
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              {rawQuery
                ? `"${rawQuery}"`
                : subcategory
                  ? subcategory.split(",")[0]
                  : "Explorar"}
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Encontramos{" "}
              <strong className="text-white">{businesses.length}</strong>{" "}
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
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <LocationTracker />
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-[2rem]">
              <p className="text-[10px] uppercase font-black text-blue-400 mb-1">
                Dica de Busca:
              </p>
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                Use os filtros para alternar entre os locais **mais próximos**
                ou os **mais favoritados**.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {businesses.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-50">
                  <p className="font-bold text-gray-400">
                    Nenhum resultado encontrado.
                  </p>
                </div>
              ) : (
                businesses.map((item) => (
                  <BusinessCard
                    key={item.id}
                    business={item}
                    isLoggedIn={!!userId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
