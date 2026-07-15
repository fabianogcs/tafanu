"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Navigation,
  Loader2,
  MapPin,
  Map,
  Search,
  ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceEnv, setDeviceEnv] = useState({ isPwa: false, isMobile: false });
  const [cachedCity, setCachedCity] = useState<string | null>(null);

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

  // 🚀 BUSCA MANUAL POR CEP (Se o GPS falhar ou for recusado)
  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      toast.error("CEP Inválido", {
        description: "Digite um CEP com 8 dígitos.",
      });
      return;
    }

    setCepLoading(true);

    try {
      // Busca a geolocalização do CEP direto no OpenStreetMap
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cleanCep}&country=Brazil&format=json&limit=1`,
        {
          headers: {
            "Accept-Language": "pt-BR",
            "User-Agent": "Tafanu-App/1.0 (contato@tafanu.com.br)",
          },
        },
      );

      if (!res.ok) throw new Error();
      const data = await res.json();

      if (!data || data.length === 0) {
        toast.error("CEP não localizado", {
          description: "Tente digitar outro CEP próximo da sua região.",
        });
        setCepLoading(false);
        return;
      }

      const latitude = parseFloat(data[0].lat);
      const longitude = parseFloat(data[0].lon);

      // Descobre o nome da cidade baseando-se nas coordenadas do CEP
      let foundCity = null;
      try {
        const cityRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          { headers: { "Accept-Language": "pt-BR" } },
        );
        if (cityRes.ok) {
          const cityData = await cityRes.json();
          foundCity =
            cityData.address?.city ||
            cityData.address?.town ||
            cityData.address?.municipality ||
            null;
          if (foundCity) setCachedCity(foundCity);
        }
      } catch (err) {}

      localStorage.setItem(
        "tafanu_user_coords",
        JSON.stringify({ lat: latitude, lng: longitude, city: foundCity }),
      );

      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", latitude.toString());
      params.set("lng", longitude.toString());
      params.set("sort", "distance");
      params.set("page", "1");

      router.replace(`/busca?${params.toString()}`);
      toast.success("Região do CEP Ativada!", {
        description: foundCity
          ? `Buscando negócios próximos a ${foundCity}.`
          : "Buscando negócios próximos a você.",
      });
      setCepInput("");
    } catch (err) {
      toast.error("Erro de conexão", {
        description: "Não conseguimos validar o CEP agora. Tente novamente.",
      });
    } finally {
      setCepLoading(false);
    }
  };

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
      toast.info("Localização Removida", {
        description: "Mostrando resultados gerais novamente.",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Seu dispositivo não suporta geolocalização.");
      return;
    }

    setLoading(true);

    const executeGpsFetch = (isRetry = false) => {
      const options = {
        enableHighAccuracy: isRetry,
        timeout: isRetry ? 20000 : 12000,
        maximumAge: 300000,
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

            if (!res.ok) throw new Error();

            const data = await res.json();
            foundCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.municipality ||
              null;
            if (foundCity) setCachedCity(foundCity);
          } catch (e) {}

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
          if (error.code === error.TIMEOUT && !isRetry) {
            console.log("GPS Cold Start. Retentando automaticamente...");
            executeGpsFetch(true);
            return;
          }

          setLoading(false);

          let msg = "";
          let description = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = "Acesso ao GPS Negado";
              if (deviceEnv.isMobile) {
                description =
                  "Clique nos três pontinhos do navegador, vá em 'Configurações do Site' e ative a Localização.";
              } else {
                description =
                  "Clique no ícone de Cadeado 🔒 ao lado da URL e permita a Localização.";
              }
              break;
            case error.POSITION_UNAVAILABLE:
              msg = "Sinal indisponível";
              description =
                "Não conseguimos capturar seu sinal GPS de satélite.";
              break;
            case error.TIMEOUT:
              msg = "Sinal demorou a responder";
              description =
                "O sinal do GPS expirou. Digite seu CEP no campo abaixo.";
              break;
            default:
              msg = "Erro ao buscar GPS";
              description = "Por favor, digite seu CEP para prosseguir.";
          }

          toast.error(msg, { description: description, duration: 8000 });
        },
        options,
      );
    };

    executeGpsFetch(false);
  };

  // Se o usuário estiver no "Modo Exploração" (digitou cidade/estado específicos na busca)
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

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* CARD PRINCIPAL DO GPS */}
      <div
        className={`w-full bg-white rounded-2xl p-4 shadow-sm border transition-colors duration-500 flex items-center justify-between ${isGpsActive ? "border-rose-200 bg-rose-50/30" : "border-gray-100"}`}
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
              {isGpsActive
                ? cachedCity || "GPS Ativado"
                : "Ver por proximidade?"}
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

      {/* 🚀 PLANO DE CONTINGÊNCIA: CAMPO DE CEP PREMIUM LIGHT THEME */}
      {!isGpsActive && (
        <form
          onSubmit={handleCepSubmit}
          className="bg-slate-100 border border-slate-200 rounded-2xl p-4 shadow-inner flex flex-col gap-2.5 animate-in fade-in duration-500"
        >
          <label
            htmlFor="cep-input"
            className="text-[10px] font-black uppercase tracking-wider text-slate-500"
          >
            Ou digite seu CEP:
          </label>
          <div className="flex gap-2">
            <input
              id="cep-input"
              type="text"
              maxLength={9}
              placeholder="Ex: 14000-000"
              value={cepInput}
              disabled={cepLoading}
              onChange={(e) => {
                // Formatação visual automática de CEP (99999-999)
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 5) {
                  setCepInput(val);
                } else {
                  setCepInput(`${val.slice(0, 5)}-${val.slice(5, 8)}`);
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 text-slate-800 placeholder-slate-400 font-bold text-sm h-11 focus:outline-none focus:ring-2 focus:ring-tafanu-action/20 focus:border-tafanu-action transition-all"
            />
            <button
              type="submit"
              disabled={cepLoading || cepInput.replace(/\D/g, "").length !== 8}
              className="h-11 px-4 bg-[#0f172a] text-white hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
            >
              {cepLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
