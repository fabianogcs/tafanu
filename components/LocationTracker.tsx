"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Navigation, Loader2, MapPin, Map, ArrowRight } from "lucide-react";
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

  // 🚀 A MÁGICA HÍBRIDA (VIACEP + OPENSTREETMAP): 100% de precisão no Brasil!
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
      // 1º Passo: Consulta o ViaCEP para descobrir o endereço brasileiro exato
      const viaCepRes = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const viaCepData = await viaCepRes.json();

      if (viaCepData.erro) {
        toast.error("CEP não encontrado", {
          description: "Verifique os números digitados e tente novamente.",
        });
        setCepLoading(false);
        return;
      }

      const city = viaCepData.localidade;
      const state = viaCepData.uf;
      const street = viaCepData.logradouro || viaCepData.bairro || "";

      // 2º Passo: Pede as coordenadas para o OpenStreetMap usando o Nome da Rua e Cidade (Infalível!)
      const queryAddress = encodeURIComponent(
        `${street}, ${city}, ${state}, Brasil`,
      );
      let osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${queryAddress}&format=json&limit=1`,
        {
          headers: {
            "Accept-Language": "pt-BR",
            "User-Agent": "Tafanu-App/1.0",
          },
        },
      );
      let osmData = await osmRes.json();

      // Se por acaso não achar a rua específica, busca pelas coordenadas do Centro da Cidade/Bairro
      if (!osmData || osmData.length === 0) {
        const fallbackQuery = encodeURIComponent(
          `${viaCepData.bairro || ""}, ${city}, ${state}, Brasil`,
        );
        osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`,
          {
            headers: {
              "Accept-Language": "pt-BR",
              "User-Agent": "Tafanu-App/1.0",
            },
          },
        );
        osmData = await osmRes.json();
      }

      const params = new URLSearchParams(searchParams.toString());

      // Se conseguiu a coordenada, aplica o filtro por proximidade perfeito!
      if (osmData && osmData.length > 0) {
        const latitude = parseFloat(osmData[0].lat);
        const longitude = parseFloat(osmData[0].lon);

        localStorage.setItem(
          "tafanu_user_coords",
          JSON.stringify({ lat: latitude, lng: longitude, city: city }),
        );
        setCachedCity(city);

        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.set("sort", "distance");
        params.set("page", "1");
        params.delete("city");
        params.delete("state");

        router.replace(`/busca?${params.toString()}`);
        toast.success(`Região de ${city} Ativada!`, {
          description: "Mostrando os negócios mais próximos ao CEP.",
        });
      } else {
        // 3º Passo (Escudo de Aço): Se o mapa não tiver coordenadas, filtra pela Cidade do ViaCEP!
        params.delete("lat");
        params.delete("lng");
        params.set("city", city);
        params.set("state", state);
        params.set("page", "1");

        router.replace(`/busca?${params.toString()}`);
        toast.success(`Filtrando por ${city} - ${state}!`, {
          description: "Buscando comércios na sua cidade.",
        });
      }

      setCepInput("");
    } catch (err) {
      toast.error("Erro de conexão", {
        description: "Falha ao consultar o CEP. Tente novamente em instantes.",
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

  if (isExploreMode) {
    return (
      <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-3.5 md:p-4 shadow-sm mb-6 flex items-center justify-between transition-all animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shadow-inner shrink-0">
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
    // 🚀 CIRURGIA DE UX MOBILE: O CARD ÚNICO E COMPACTO
    <div
      className={`w-full bg-white rounded-2xl p-3.5 md:p-4 shadow-sm border transition-all duration-300 mb-6 ${
        isGpsActive ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
      }`}
    >
      {/* LINHA 1: CONTROLE DE GPS */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors duration-500 shrink-0 ${
              isGpsActive
                ? "bg-rose-500 text-white shadow-md"
                : "bg-[#1dbf8e]/10 text-[#1dbf8e]"
            }`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isGpsActive ? (
              <MapPin size={18} className="animate-pulse" />
            ) : (
              <Navigation size={18} />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-800 uppercase italic leading-tight truncate">
              {isGpsActive ? cachedCity || "GPS Ativado" : "Localização"}
            </h4>
            <p
              className={`text-[10px] font-bold uppercase italic mt-0.5 truncate ${
                isGpsActive ? "text-rose-600" : "text-slate-400"
              }`}
            >
              {isGpsActive ? "Na sua região" : "Ative para ver próximos"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleLocation}
          disabled={loading}
          className={`text-[10px] font-black uppercase px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-sm shrink-0 ${
            isGpsActive
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-[#0f172a] text-white hover:bg-black"
          }`}
        >
          {loading ? "Aguarde..." : isGpsActive ? "Desligar" : "Ligar GPS"}
        </button>
      </div>

      {/* LINHA 2: CAMPO DE CEP INTEGRADO NA MESMA DIV (Só aparece quando o GPS não está ativo) */}
      {!isGpsActive && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 animate-in fade-in duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 hidden sm:inline">
            Ou CEP:
          </span>
          <form
            onSubmit={handleCepSubmit}
            className="flex items-center gap-1.5 w-full"
          >
            <input
              type="text"
              maxLength={9}
              placeholder="Digitar CEP (ex: 14000-000)"
              value={cepInput}
              disabled={cepLoading}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 5) {
                  setCepInput(val);
                } else {
                  setCepInput(`${val.slice(0, 5)}-${val.slice(5, 8)}`);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 placeholder-slate-400 font-bold text-xs h-9 focus:outline-none focus:ring-2 focus:ring-tafanu-action/20 focus:border-tafanu-action transition-all"
            />
            <button
              type="submit"
              disabled={cepLoading || cepInput.replace(/\D/g, "").length !== 8}
              className="h-9 px-3 bg-slate-900 text-white hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 text-xs font-bold shadow-sm"
              title="Buscar por CEP"
            >
              {cepLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} strokeWidth={2.5} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
