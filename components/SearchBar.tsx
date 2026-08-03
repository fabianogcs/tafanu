"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 🔒 TRAVA DE SEGURANÇA E PERFORMANCE (CFO/CTO): Aborta se estiver vazio!
    if (!query.trim()) return;

    setIsSearching(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query.trim());
    params.delete("page");

    // Cenário 1: Modo Explorar
    const isExploreMode = params.has("city") || params.has("state");
    if (isExploreMode) {
      router.push(`/busca?${params.toString()}`);
      return;
    }

    // Cenário 2: GPS no Cache
    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { lat, lng, timestamp } = JSON.parse(cachedCoords);
        const tempoPassado = Date.now() - (timestamp || 0);
        const TRES_HORAS = 3 * 60 * 60 * 1000;

        if (lat && lng && tempoPassado < TRES_HORAS) {
          if (!params.has("lat")) params.set("lat", lat);
          if (!params.has("lng")) params.set("lng", lng);
          params.set("sort", "distance");
          router.push(`/busca?${params.toString()}`);
          return;
        }
      }
    } catch (err) {}

    // Cenário 3: Verificação Geolocation
    if (!navigator.geolocation) {
      router.push(`/busca?${params.toString()}`);
      return;
    }

    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          router.push(`/busca?${params.toString()}`);
          return;
        }
      } catch (e) {}
    }

    // Cenário 4: Busca com GPS otimizado (2.5s)
    const executeGpsFetch = (isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          params.set("lat", latitude.toString());
          params.set("lng", longitude.toString());
          params.set("sort", "distance");

          let foundCity = null;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            if (res.ok) {
              const data = await res.json();
              const bairro =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.city_district;
              const cidade =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                "";

              foundCity = bairro ? `${bairro}, ${cidade}` : cidade || null;
            }
          } catch (e) {}

          localStorage.setItem(
            "tafanu_user_coords",
            JSON.stringify({
              lat: latitude,
              lng: longitude,
              city: foundCity,
              timestamp: Date.now(),
            }),
          );

          router.push(`/busca?${params.toString()}`);
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            executeGpsFetch(true);
            return;
          }

          router.push(`/busca?${params.toString()}`);

          if (error.code === error.PERMISSION_DENIED) {
            toast.warning("Buscando em todo o diretório", {
              description:
                "Para achar resultados mais próximos, permita o uso do GPS.",
            });
          }
        },
        {
          enableHighAccuracy: isRetry,
          timeout: isRetry ? 3000 : 2500, // ⚡ 2.5s para não travar!
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  return (
    // 🎨 HARMONIZAÇÃO UX/UI: Altura h-12 md:h-[56px] alinhada com o FilterModal, bg-slate-50, borda e foco verde esmeralda!
    <form
      onSubmit={(e) => handleSearch(e)}
      className="w-full h-12 md:h-[56px] flex flex-row items-center gap-2 bg-slate-50 rounded-2xl px-3 py-1.5 border border-slate-200/80 focus-within:bg-white focus-within:border-tafanu-action focus-within:ring-2 focus-within:ring-tafanu-action/20 transition-all shadow-sm"
    >
      <Search className="text-slate-400 w-4 h-4 md:w-5 md:h-5 ml-1 shrink-0" />

      <input
        id="search-input"
        name="searchQuery"
        autoComplete="search"
        type="text"
        placeholder="Buscar outro negócio..."
        className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-bold text-sm md:text-base h-full truncate disabled:opacity-50"
        value={query}
        maxLength={80}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isSearching}
      />

      <button
        type="submit"
        disabled={isSearching || !query.trim()}
        className="h-9 md:h-10 px-4 md:px-6 rounded-xl bg-tafanu-action text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:bg-emerald-600"
      >
        {isSearching ? (
          <>
            <Loader2 size={16} strokeWidth={3} className="animate-spin" />
            <span className="hidden sm:inline">Buscando...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4 sm:hidden" strokeWidth={3} />
            <span className="hidden sm:inline">Buscar</span>
          </>
        )}
      </button>
    </form>
  );
}
