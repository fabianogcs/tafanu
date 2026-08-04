"use client";

import { useState, useEffect, useTransition } from "react";
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

  // 🚀 FIX CTO: O motor concorrente do React. Ele gerencia rotas pesadas sem travar a UI.
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 🔒 TRAVA DE SEGURANÇA E PERFORMANCE
    if (query.trim().length < 2) {
      if (query.trim().length === 1) {
        toast.info("Digite um pouco mais", {
          description: "Por favor, digite pelo menos 2 letras para buscar.",
        });
      }
      return;
    }

    setIsSearching(true);

    // =========================================================================
    // 🚀 O VERDADEIRO RESET NUCLEAR (Sem vazamento de dados antigos)
    // Usamos new URLSearchParams() VAZIO. Ele destrói qualquer cidade, estado,
    // ou categoria que estava preso na URL anterior. É um recomeço limpo!
    // =========================================================================
    const params = new URLSearchParams();
    params.set("q", query.trim());

    // Se a pessoa estiver na aba "Online/Marketplace", nós preservamos apenas isso.
    if (searchParams.has("modo")) {
      params.set("modo", searchParams.get("modo") as string);
    }

    // Cenário 1: GPS no Cache
    try {
      const cachedCoords = localStorage.getItem("tafanu_user_coords");
      if (cachedCoords) {
        const { lat, lng, timestamp } = JSON.parse(cachedCoords);
        const tempoPassado = Date.now() - (timestamp || 0);
        const TRES_HORAS = 3 * 60 * 60 * 1000;

        if (lat && lng && tempoPassado < TRES_HORAS) {
          params.set("lat", lat);
          params.set("lng", lng);
          params.set("sort", "distance");

          startTransition(() => {
            router.push(`/busca?${params.toString()}`);
          });
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {}

    // Cenário 2: Verificação Geolocation
    if (!navigator.geolocation) {
      startTransition(() => {
        router.push(`/busca?${params.toString()}`);
      });
      setIsSearching(false);
      return;
    }

    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          startTransition(() => {
            router.push(`/busca?${params.toString()}`);
          });
          setIsSearching(false);
          return;
        }
      } catch (e) {}
    }

    // Cenário 3: Busca com GPS otimizado (2.5s)
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
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            if (res.ok) {
              const data = await res.json();
              foundCity =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                null;
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

          startTransition(() => {
            router.push(`/busca?${params.toString()}`);
          });
          setIsSearching(false);
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            executeGpsFetch(true);
            return;
          }

          startTransition(() => {
            router.push(`/busca?${params.toString()}`);
          });
          setIsSearching(false);

          if (error.code === error.PERMISSION_DENIED) {
            toast.warning("Buscando em todo o diretório", {
              description:
                "Para achar resultados mais próximos, permita o uso do GPS.",
            });
          }
        },
        {
          enableHighAccuracy: isRetry,
          timeout: isRetry ? 3000 : 2500,
          maximumAge: 300000,
        },
      );
    };

    executeGpsFetch(false);
  };

  return (
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
        disabled={isSearching || isPending}
      />

      <button
        type="submit"
        disabled={isSearching || isPending || !query.trim()}
        className="h-9 md:h-10 px-4 md:px-6 rounded-xl bg-tafanu-action text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:bg-emerald-600"
      >
        {isSearching || isPending ? (
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
