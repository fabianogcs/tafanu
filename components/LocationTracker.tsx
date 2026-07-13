"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Navigation, Loader2, MapPin, Map } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceEnv, setDeviceEnv] = useState({ isPwa: false, isMobile: false });
  const [cachedCity, setCachedCity] = useState<string | null>(null);

  // 🚀 O RASTREADOR DE INTENÇÃO (Fase 3): Detecta se o usuário está viajando (Airbnb Mode)
  const isExploreMode = searchParams.has("city") || searchParams.has("state");
  const exploreCity = searchParams.get("city");
  const exploreState = searchParams.get("state");

  useEffect(() => {
    const isPwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setDeviceEnv({ isPwa, isMobile });

    try {
      const coords = localStorage.getItem("tafanu_user_coords");
      if (coords) {
        const parsed = JSON.parse(coords);
        if (parsed.city) setCachedCity(parsed.city);
      }
    } catch (e) {}
  }, []);

  const isGpsActive = searchParams.has("lat") && searchParams.has("lng");

  const handleToggleLocation = () => {
    if (isExploreMode) {
      toast.info("Modo Exploração Ativo", {
        description: "Remova o filtro de cidade/estado para usar o GPS local.",
      });
      return;
    }

    if (isGpsActive) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lat");
      params.delete("lng");
      localStorage.removeItem("tafanu_user_coords");
      setCachedCity(null);
      params.delete("sort");
      params.set("page", "1");

      router.replace(`/busca?${params.toString()}`);
      toast.info("GPS Desativado", {
        description: "Mostrando os resultados de forma global novamente.",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Seu dispositivo não suporta geolocalização.");
      return;
    }

    setLoading(true);

    const options = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams.toString());

        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.set("sort", "distance");
        params.set("page", "1");

        let foundCity = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
              headers: {
                "Accept-Language": "pt-BR",
                "User-Agent": "Tafanu-App/1.0 (contato@tafanu.com.br)",
              },
            },
          );

          if (!res.ok) throw new Error("Falha na API de Mapas");

          const data = await res.json();
          foundCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            null;
          if (foundCity) setCachedCity(foundCity);
        } catch (e) {
          // Ignora silenciosamente, é só um bônus visual
        }

        localStorage.setItem(
          "tafanu_user_coords",
          JSON.stringify({ lat: latitude, lng: longitude, city: foundCity }),
        );

        setLoading(false);
        router.replace(`/busca?${params.toString()}`);

        toast.success("Localização encontrada!", {
          description: foundCity
            ? `Buscando negócios perto de você em ${foundCity}.`
            : "Mostrando os negócios perto de você.",
        });
      },
      (error) => {
        setLoading(false);

        let msg = "";
        let description = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Localização Bloqueada";
            if (deviceEnv.isPwa && deviceEnv.isMobile) {
              description =
                "Vá nas Configurações do seu celular > Aplicativos > Tafanu > Permissões e ative a Localização.";
            } else if (deviceEnv.isPwa && !deviceEnv.isMobile) {
              description =
                "Vá nas configurações de Privacidade do seu Windows/Mac e permita que o Tafanu acesse sua localização.";
            } else {
              description =
                "Clique no cadeado ao lado da barra de endereço e permita o GPS.";
            }
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Sinal fraco ou indisponível";
            description =
              "Não conseguimos obter sua localização agora. Verifique se o GPS do aparelho está ligado e tente em instantes.";
            break;
          case error.TIMEOUT:
            msg = "Busca lenta?";
            description =
              "O tempo de busca expirou. Tente clicar novamente para uma segunda busca mais rápida.";
            break;
          default:
            msg = "Erro ao buscar GPS";
            description =
              "Ocorreu um erro inesperado ao tentar acessar sua localização.";
        }

        if (error.code === error.PERMISSION_DENIED) {
          toast.error(msg, {
            description: description,
            duration: 8000,
          });
        } else if (error.code === error.TIMEOUT) {
          toast.info(msg, { description: description });
        } else {
          toast.warning(msg, { description: description });
        }
      },
      options,
    );
  };

  // 🚀 INTERFACE DO MODO EXPLORAR (AIRBNB MODE)
  if (isExploreMode) {
    return (
      <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between transition-all animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shadow-inner">
            <Map size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-900 uppercase italic leading-tight">
              Explorando Região
            </h4>
            <p className="text-[10px] font-bold uppercase italic mt-0.5 text-blue-600 truncate max-w-[150px]">
              {exploreCity || exploreState}
            </p>
          </div>
        </div>

        <button
          disabled
          className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-100/50 text-blue-400 opacity-50 cursor-not-allowed"
        >
          GPS Pausado
        </button>
      </div>
    );
  }

  // 🚀 INTERFACE DO MODO GPS NORMAL
  return (
    <div
      className={`w-full bg-white rounded-2xl p-4 shadow-sm border transition-colors duration-500 flex items-center justify-between ${isGpsActive ? "border-rose-200 bg-rose-50/30" : "border-gray-100 mb-6"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isGpsActive ? "bg-rose-500 text-white shadow-md" : "bg-[#1dbf8e]/10 text-[#1dbf8e]"}`}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isGpsActive ? (
            <MapPin size={18} className="animate-pulse" />
          ) : (
            <Navigation size={18} />
          )}
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-800 uppercase italic leading-tight">
            {isGpsActive ? cachedCity || "GPS Ativado" : "Ver por proximidade?"}
          </h4>
          <p
            className={`text-[10px] font-bold uppercase italic mt-0.5 ${isGpsActive ? "text-rose-600" : "text-gray-400"}`}
          >
            {isGpsActive
              ? "Negócios na sua região"
              : "Buscando lojas ao seu redor"}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleLocation}
        disabled={loading}
        className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all disabled:opacity-50 active:scale-95 shadow-sm ${
          isGpsActive
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "bg-[#0f172a] text-white hover:bg-black"
        }`}
      >
        {loading ? "Aguarde..." : isGpsActive ? "Desligar" : "Ligar GPS"}
      </button>
    </div>
  );
}
