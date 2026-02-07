import { db } from "@/lib/db";
import {
  MapPin,
  Navigation,
  ExternalLink,
  ArrowRight,
  Eye,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import LocationTracker from "@/components/LocationTracker";
import FilterModal from "@/components/FilterModal";

// Função de cálculo de distância
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

// --- FUNÇÃO DE LIMPEZA (REMOVE ACENTOS) ---
// Transforma "Açaí" em "acai", "Pão" em "pao", etc.
const normalize = (text: string) => {
  return text
    .normalize("NFD") // Separa o acento da letra
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .toLowerCase(); // Tudo minúsculo
};

interface BuscaProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    state?: string;
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
  const filters = await searchParams;
  const rawQuery = (filters.q || "").trim();
  const query = normalize(rawQuery); // Query já limpa (sem acento)

  const category = filters.category || "";
  const subcategory = filters.subcategory || "";

  const radius = filters.radius ? parseInt(filters.radius) : 50;
  const sort = filters.sort || "newest";
  const status = filters.status || "all";

  const userLat = filters.lat ? parseFloat(String(filters.lat)) : null;
  const userLng = filters.lng ? parseFloat(String(filters.lng)) : null;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "views") orderBy = { views: "desc" };

  const subcategoriesList = subcategory ? subcategory.split(",") : [];

  // 1. BUSCA NO BANCO (Trás tudo que é ativo/válido)
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
          ? [
              {
                category: {
                  equals: category,
                  mode: "insensitive" as const, // 👈 O segredo está no "as const"
                },
              },
            ]
          : []),
        ...(subcategory
          ? [
              {
                subcategory: {
                  hasSome: [subcategory],
                },
              },
            ]
          : []),
      ],
    },
    include: {
      hours: true,
      _count: { select: { favorites: true } },
    },
    orderBy: orderBy,
  });

  // 2. INTELIGÊNCIA DO FILTRO LATERAL
  const availableCategories: Record<string, Set<string>> = {};
  businessesData.forEach((b) => {
    if (!availableCategories[b.category]) {
      availableCategories[b.category] = new Set();
    }
    b.subcategory.forEach((sub) => availableCategories[b.category].add(sub));
  });

  const filterMap: Record<string, string[]> = {};
  Object.keys(availableCategories)
    .sort()
    .forEach((cat) => {
      filterMap[cat] = Array.from(availableCategories[cat]).sort();
    });

  // 3. PROCESSAMENTO E SCORE (NORMALIZADO)
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  let businesses = businessesData.map((b) => {
    // A. Distância
    let distance = null;
    const bLat = b.latitude ? Number(b.latitude) : null;
    const bLng = b.longitude ? Number(b.longitude) : null;
    if (userLat && userLng && bLat && bLng) {
      distance = calculateDistance(userLat, userLng, bLat, bLng);
    }

    // B. Horário
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
      const openVal = openH * 100 + openM;
      const closeVal = closeH * 100 + closeM;
      isOpen = currentTime >= openVal && currentTime < closeVal;
    }

    // C. SCORE INTELIGENTE (FROUXO / SEM ACENTOS)
    let score = 0;

    if (!query) {
      score = 1;
    } else {
      // Normalizamos TUDO antes de comparar
      const q = query; // Já normalizamos lá em cima
      const name = normalize(b.name);
      const desc = normalize(b.description || "");
      const cat = normalize(b.category);

      // 1. Nome (Peso 50)
      if (name === q) score += 50;
      else if (name.includes(q) || q.includes(name)) score += 20;

      // 2. Categoria (Peso 30)
      if (cat.includes(q) || q.includes(cat)) score += 30;

      // 3. Subcategorias (Peso 25)
      const matchedSub = b.subcategory.some((sub) => {
        const s = normalize(sub);
        return s.includes(q) || q.includes(s);
      });
      if (matchedSub) score += 25;

      // 4. Keywords (Peso 15)
      const matchedKey = b.keywords.some((key) => {
        const k = normalize(key);
        return k.includes(q) || q.includes(k);
      });
      if (matchedKey) score += 15;

      // 5. Descrição (Peso 5)
      if (desc.includes(q) || q.includes(desc)) score += 5;
    }

    return { ...b, distance, isOpen, score };
  });

  // 4. FILTRAGEM FINAL
  if (query) {
    businesses = businesses.filter((b) => b.score > 0);
  }

  // 5. ORDENAÇÃO
  businesses.sort((a, b) => {
    if (query && a.score !== b.score) return b.score - a.score;

    if (userLat && userLng && a.distance !== b.distance) {
      return (a.distance ?? 9999) - (b.distance ?? 9999);
    }

    if (sort === "likes")
      return (b._count.favorites || 0) - (a._count.favorites || 0);
    if (sort === "views") return (b.views || 0) - (a.views || 0);

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filtros extras
  if (userLat && userLng) {
    businesses = businesses.filter(
      (b) => b.distance !== null && b.distance <= radius,
    );
  }
  if (status === "open") {
    businesses = businesses.filter((b) => b.isOpen);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0f172a] text-white py-10 px-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tafanu-action rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-tafanu-action/80 text-xs font-black uppercase tracking-widest">
              <SlidersHorizontal size={14} />
              {category ? category : "Resultados"}
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter break-words">
              {rawQuery ? `"${rawQuery}"` : subcategory || "Explorar"}
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Encontramos{" "}
              <strong className="text-white">{businesses.length}</strong>{" "}
              negócios.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <FilterModal availableCategories={filterMap} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <LocationTracker />
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-black text-blue-400 mb-1">
                Dica:
              </p>
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                Ative sua localização para ver os negócios mais próximos.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {businesses.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <SlidersHorizontal size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400">
                    Nenhum resultado.
                  </h3>
                  <p className="text-sm text-gray-400">
                    Tente outra busca ou limpe os filtros.
                  </p>
                </div>
              )}

              {businesses.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:shadow-xl transition-all duration-300 relative"
                >
                  <div className="aspect-[4/3] md:aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl || "/og-default.png"}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!item.isOpen ? "grayscale" : ""}`}
                      alt={item.name}
                    />
                    {item.distance !== null && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/70 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded flex items-center gap-1 uppercase">
                          <Navigation size={8} className="text-tafanu-action" />
                          {item.distance < 1
                            ? `${(item.distance * 1000).toFixed(0)}m`
                            : `${item.distance.toFixed(1)} km`}
                        </div>
                      </div>
                    )}
                    <div
                      className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[8px] md:text-[9px] font-black uppercase tracking-wider shadow-sm ${item.isOpen ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                    >
                      {item.isOpen ? "Aberto" : "Fechado"}
                    </div>
                  </div>

                  <div className="p-3 md:p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-sm md:text-lg text-gray-900 leading-tight uppercase italic truncate mb-1 md:mb-2">
                      {item.name}
                    </h3>
                    <div className="flex items-start gap-1 text-gray-400 mb-2 md:mb-3">
                      <MapPin
                        size={10}
                        className="text-tafanu-action shrink-0 mt-0.5 md:mt-1 md:w-3.5 md:h-3.5"
                      />
                      <span className="font-bold text-[10px] md:text-xs uppercase italic truncate">
                        {item.neighborhood || item.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3 opacity-70">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Eye size={12} className="md:w-3.5 md:h-3.5" />
                        <span className="text-[10px] md:text-xs font-black">
                          {item.views || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-500">
                        <Heart
                          size={12}
                          fill="currentColor"
                          className="opacity-20 md:w-3.5 md:h-3.5"
                        />
                        <span className="text-[10px] md:text-xs font-black">
                          {item._count?.favorites || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <Link
                        href={`/site/${item.slug}`}
                        className="bg-gray-50 text-center py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wider text-tafanu-blue hover:bg-[#0f172a] hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        Ver <ArrowRight size={10} className="md:w-3 md:h-3" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0f172a] text-white text-center py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-1"
                      >
                        <ExternalLink size={10} className="md:w-3 md:h-3" />{" "}
                        Rota
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
