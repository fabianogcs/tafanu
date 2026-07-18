"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import {
  Navigation,
  Loader2,
  MapPin,
  Map,
  ArrowRight,
  MapPinned,
  CheckCircle2,
  Globe,
  Smartphone,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepInput, setCepInput] = useState("");

  // 🚀 ESTADO DO MODAL DE PERMISSÃO NEGADA
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [permissionState, setPermissionState] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceEnv, setDeviceEnv] = useState({ isPwa: false, isMobile: false });
  const [cachedCity, setCachedCity] = useState<string | null>(null);

  const isExploreMode = searchParams.has("city") || searchParams.has("state");
  const exploreCity = searchParams.get("city");
  const exploreState = searchParams.get("state");
  const isGpsActive = searchParams.has("lat") && searchParams.has("lng");

  // 🚀 FUNÇÃO CENTRAL DE BUSCA DE GPS
  const executeGpsFetch = useCallback(
    (isRetry = false) => {
      if (!navigator.geolocation) return;
      // 🛡️ CTO FIX: A Trava de Clique Duplo!
      // Ignora o clique se o celular já estiver buscando o satélite.
      if (loading) return;

      setLoading(true);
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
          params.delete("city");
          params.delete("state");

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

            if (res.ok) {
              const data = await res.json();
              foundCity =
                data.address?.city ||
                data.address?.town ||
                data.address?.municipality ||
                null;
              if (foundCity) setCachedCity(foundCity);
            }
          } catch (e) {}

          localStorage.setItem(
            "tafanu_user_coords",
            JSON.stringify({ lat: latitude, lng: longitude, city: foundCity }),
          );

          setLoading(false);
          setShowDeniedModal(false);
          router.replace(`/busca?${params.toString()}`);

          toast.success("Localização ativada!", {
            description: foundCity
              ? `Buscando negócios perto de você em ${foundCity}.`
              : "Mostrando os negócios perto de você.",
          });
        },
        (error) => {
          if (error.code === error.TIMEOUT && !isRetry) {
            executeGpsFetch(true);
            return;
          }

          setLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionState("denied");
            setShowDeniedModal(true);
          } else if (error.code === error.TIMEOUT) {
            toast.info("Sinal demorou a responder", {
              description:
                "O sinal do GPS expirou. Tente novamente em local aberto ou use seu CEP.",
            });
          } else {
            toast.warning("Sinal indisponível", {
              description:
                "Não conseguimos capturar seu sinal. Use o CEP abaixo.",
            });
          }
        },
        options,
      );
    },
    [searchParams, router],
  );

  // ⭐⭐⭐ OTIMIZAÇÃO DRY: Centraliza a ação de sucesso na liberação da permissão
  const handlePermissionGranted = useCallback(() => {
    if (isGpsActive) return; // Evita requisição duplicada se já estiver ativo (Ponto 2)

    setShowDeniedModal(false);
    toast.success("GPS Liberado!", {
      description: "Atualizando sua localização...",
    });
    executeGpsFetch(false);
  }, [isGpsActive, executeGpsFetch]);

  // ⭐⭐⭐ MONITORAMENTO PROATIVO E REATIVO
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

    let permissionObj: any = null;

    const checkAndWatchPermission = async () => {
      if (!navigator.permissions) return;

      try {
        permissionObj = await navigator.permissions.query({
          name: "geolocation",
        });
        setPermissionState(permissionObj.state);

        // ⭐ REATIVIDADE EM TEMPO REAL: Escuta mudanças na hora (Ponto 3 DRY)
        permissionObj.onchange = () => {
          setPermissionState(permissionObj.state);
          if (permissionObj.state === "granted") {
            handlePermissionGranted();
          } else if (permissionObj.state === "denied") {
            setShowDeniedModal(true);
          }
        };
      } catch (e) {}
    };

    checkAndWatchPermission();

    // ⭐ DETECTA RETORNO DAS CONFIGURAÇÕES DO ANDROID (Ponto 3 DRY)
    const handleAppReturn = async () => {
      if (document.visibilityState === "visible" && navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({
            name: "geolocation",
          });
          setPermissionState(perm.state);

          if (perm.state === "granted" && showDeniedModal) {
            handlePermissionGranted();
          }
        } catch (e) {}
      }
    };

    window.addEventListener("visibilitychange", handleAppReturn);
    window.addEventListener("focus", handleAppReturn);

    return () => {
      window.removeEventListener("visibilitychange", handleAppReturn);
      window.removeEventListener("focus", handleAppReturn);
      if (permissionObj) permissionObj.onchange = null;
    };
  }, [showDeniedModal, handlePermissionGranted]);

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
      const viaCepRes = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const viaCepData = await viaCepRes.json();

      if (viaCepData.erro) {
        toast.error("CEP não encontrado", {
          description: "Verifique os números digitados.",
        });
        setCepLoading(false);
        return;
      }

      const city = viaCepData.localidade;
      const state = viaCepData.uf;
      const street = viaCepData.logradouro || viaCepData.bairro || "";

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
        setShowDeniedModal(false);
      } else {
        params.delete("lat");
        params.delete("lng");
        params.set("city", city);
        params.set("state", state);
        params.set("page", "1");

        router.replace(`/busca?${params.toString()}`);
        toast.success(`Filtrando por ${city} - ${state}!`, {
          description: "Buscando comércios na sua cidade.",
        });
        setShowDeniedModal(false);
      }

      setCepInput("");
    } catch (err) {
      toast.error("Erro de conexão", {
        description: "Falha ao consultar o CEP.",
      });
    } finally {
      setCepLoading(false);
    }
  };

  const handleToggleLocation = async () => {
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

    if (permissionState === "denied") {
      setShowDeniedModal(true);
      return;
    }

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
          className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-100/50 text-blue-400 opacity-50 cursor-not-allowed shrink-0"
        >
          GPS Pausado
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full bg-white rounded-2xl p-4 md:p-5 shadow-sm border transition-all duration-300 mb-6 ${
          isGpsActive ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
        }`}
      >
        <div className="flex items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 shrink-0 ${
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

            <div className="flex-1">
              <h4 className="text-xs font-black text-slate-800 uppercase italic leading-tight">
                {isGpsActive ? cachedCity || "GPS Ativado" : "Localização"}
              </h4>
              <p
                className={`text-[10px] font-bold uppercase italic mt-0.5 leading-tight ${
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
            className={`text-[10px] font-black uppercase px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-sm shrink-0 self-center ${
              isGpsActive
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-[#0f172a] text-white hover:bg-black"
            }`}
          >
            {loading ? "Aguarde..." : isGpsActive ? "Desligar" : "Ligar GPS"}
          </button>
        </div>

        {!isGpsActive && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 animate-in fade-in duration-300">
            <form
              onSubmit={handleCepSubmit}
              className="flex items-center gap-2 w-full"
            >
              <input
                type="text"
                maxLength={9}
                placeholder="Buscar por CEP (ex: 14000-000)"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-slate-800 placeholder-slate-400 font-bold text-xs h-10 focus:outline-none focus:ring-2 focus:ring-tafanu-action/20 focus:border-tafanu-action transition-all"
              />
              <button
                type="submit"
                disabled={
                  cepLoading || cepInput.replace(/\D/g, "").length !== 8
                }
                className="h-10 px-3.5 bg-slate-900 text-white hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 text-xs font-bold shadow-sm"
                title="Buscar por CEP"
              >
                {cepLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ArrowRight size={15} strokeWidth={2.5} />
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 🚀 O MODAL 10/10: INSTRUÇÃO CIRÚRGICA E REATIVA (PWA vs NAVEGADOR) */}
      {showDeniedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col items-center shadow-2xl max-w-[400px] w-full animate-in fade-in zoom-in duration-300 relative">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm -mt-12">
              <MapPinned className="text-rose-500 w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2 tracking-tight text-center">
              GPS <span className="text-rose-500">Bloqueado</span>
            </h3>

            <p className="text-slate-500 text-xs font-medium mb-6 text-center leading-relaxed">
              O seu aparelho negou a permissão de localização. Você pode
              continuar usando o CEP ou desbloquear nas configurações:
            </p>

            <div className="w-full flex flex-col gap-4">
              {/* PROTAGONISTA 1: CEP IMEDIATO */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] font-black text-tafanu-action uppercase tracking-widest text-center">
                  Recomendado: Usar CEP
                </span>
                <form
                  onSubmit={handleCepSubmit}
                  className="flex items-center gap-2 w-full"
                >
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="Ex: 14000-000"
                    value={cepInput}
                    disabled={cepLoading}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 5) setCepInput(val);
                      else setCepInput(`${val.slice(0, 5)}-${val.slice(5, 8)}`);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 text-slate-800 font-bold text-xs h-10 focus:outline-none focus:border-tafanu-action transition-all"
                  />
                  <button
                    type="submit"
                    disabled={
                      cepLoading || cepInput.replace(/\D/g, "").length !== 8
                    }
                    className="h-10 px-4 bg-tafanu-action hover:bg-[#00c27a] text-white disabled:bg-slate-200 rounded-lg transition-all active:scale-95 shadow-md flex items-center justify-center"
                  >
                    {cepLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} strokeWidth={3} />
                    )}
                  </button>
                </form>
              </div>

              {/* ⭐⭐⭐ PROTAGONISTA 2: INSTRUÇÃO INTELIGENTE POR AMBIENTE */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center justify-center gap-1.5 mb-2.5">
                  {deviceEnv.isPwa ? (
                    <Smartphone size={14} className="text-slate-600" />
                  ) : (
                    <Globe size={14} className="text-slate-600" />
                  )}
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block text-center">
                    {deviceEnv.isPwa
                      ? "Como reativar no Aplicativo"
                      : "Como reativar no Navegador"}
                  </span>
                </div>

                {deviceEnv.isPwa ? (
                  <ul className="text-[11px] font-medium text-slate-500 leading-snug space-y-1.5 list-none pl-1">
                    <li>
                      <strong>1.</strong> Abra as{" "}
                      <strong className="text-slate-700">Configurações</strong>{" "}
                      do celular.
                    </li>
                    <li>
                      <strong>2.</strong> Vá em{" "}
                      <strong className="text-slate-700">
                        Aplicativos → Tafanu
                      </strong>
                      .
                    </li>
                    <li>
                      <strong>3.</strong> Acesse{" "}
                      <strong className="text-slate-700">
                        Permissões → Localização
                      </strong>
                      .
                    </li>
                    <li>
                      <strong>4.</strong> Selecione{" "}
                      <strong className="text-slate-700">Permitir</strong> e
                      volte aqui!
                    </li>
                  </ul>
                ) : (
                  <ul className="text-[11px] font-medium text-slate-500 leading-snug space-y-1.5 list-none pl-1">
                    <li>
                      <strong>1.</strong> Clique no ícone de{" "}
                      <strong className="text-slate-700">Cadeado 🔒</strong> (ou
                      opções) ao lado da URL no topo da tela.
                    </li>
                    <li>
                      <strong>2.</strong> Acesse{" "}
                      <strong className="text-slate-700">
                        Permissões do Site
                      </strong>
                      .
                    </li>
                    <li>
                      <strong>3.</strong> Mude a{" "}
                      <strong className="text-slate-700">Localização</strong>{" "}
                      para <strong className="text-slate-700">Permitir</strong>.
                    </li>
                  </ul>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 size={13} className="animate-pulse shrink-0" />
                  <span>O app atualizará sozinho ao permitir!</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDeniedModal(false)}
              className="mt-6 text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest underline underline-offset-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
