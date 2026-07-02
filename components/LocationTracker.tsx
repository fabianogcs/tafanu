"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Navigation, Loader2, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceEnv, setDeviceEnv] = useState({ isPwa: false, isMobile: false });

  // Detecta o ambiente do usuário apenas no client-side
  useEffect(() => {
    const isPwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setDeviceEnv({ isPwa, isMobile });
  }, []);

  // 🚀 A MÁGICA AQUI: O componente sabe se o GPS já está ligado!
  const isGpsActive = searchParams.has("lat") && searchParams.has("lng");

  const handleToggleLocation = () => {
    // 🚀 CIRURGIA: SE O GPS JÁ ESTÁ LIGADO, ELE DESLIGA E LIMPA A URL!
    if (isGpsActive) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lat");
      params.delete("lng");
      localStorage.removeItem("tafanu_user_coords"); // 🚀 LIMPA O CACHE
      params.delete("sort"); // Remove a obrigação de ordenar por distância
      params.set("page", "1");

      router.replace(`/busca?${params.toString()}`);
      toast.info("GPS Desativado", {
        description: "Mostrando os resultados de forma global novamente.",
      });
      return;
    }

    // Se estiver desligado, ele faz o processo normal de ligar (O seu código original intacto)
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
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams.toString());

        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.set("sort", "distance");
        params.set("page", "1");

        // 🚀 SALVA O CACHE AQUI TAMBÉM
        localStorage.setItem(
          "tafanu_user_coords",
          JSON.stringify({ lat: latitude, lng: longitude }),
        );

        setLoading(false);
        router.replace(`/busca?${params.toString()}`);

        toast.success("Localização encontrada!", {
          description: "Mostrando os negócios a até 30km de você.",
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

  return (
    <div
      className={`w-full bg-white rounded-2xl p-4 shadow-sm border transition-colors duration-500 mb-6 flex items-center justify-between ${isGpsActive ? "border-rose-200 bg-rose-50/30" : "border-gray-100"}`}
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
            {isGpsActive ? "GPS Ativado" : "Ver por proximidade?"}
          </h4>
          <p
            className={`text-[10px] font-bold uppercase italic mt-0.5 ${isGpsActive ? "text-rose-600" : "text-gray-400"}`}
          >
            {isGpsActive
              ? "Negócios em um raio de 30km"
              : "Buscar até 30km ao seu redor"}
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
        {loading ? "Aguarde..." : isGpsActive ? "Desativar" : "Ligar GPS"}
      </button>
    </div>
  );
}
