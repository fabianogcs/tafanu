"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }

    setLoading(true);

    // AJUSTE DE PERFORMANCE:
    // Aumentamos o timeout e permitimos localização por Wi-Fi/IP (mais estável)
    const options = {
      enableHighAccuracy: false, // Se true, falha muito em desktops. False usa Wi-Fi/Torre (muito rápido).
      timeout: 15000, // Aumentamos para 15 segundos (era 10)
      maximumAge: 60000, // Aceita uma localização de até 1 minuto atrás (evita novo cálculo demorado)
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());

        setLoading(false);
        // Usamos replace para não criar um histórico infinito de cliques
        router.push(`/busca?${params.toString()}`);
      },
      (error) => {
        setLoading(false);

        let msg = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg =
              "Permissão negada! Clique no cadeado na barra de endereços e permita o acesso à localização.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg =
              "Sinal fraco! Não conseguimos obter sua localização agora. Tente novamente em instantes.";
            break;
          case error.TIMEOUT:
            // No Timeout, sugerimos tentar de novo porque agora o navegador já "aqueceu" o sensor
            msg =
              "O tempo acabou! Tente clicar novamente para uma segunda busca mais rápida.";
            break;
          default:
            msg = "Erro ao buscar GPS.";
        }

        console.error("Erro detalhado:", error.message);

        // Se for Timeout, não damos o alert chato imediatamente, apenas paramos o loading
        // para o usuário tentar de novo se quiser.
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Localização negada", {
            description:
              "Clique no cadeado ao lado da URL e permita o acesso ao GPS.",
            duration: 5000,
          });
        } else if (error.code !== error.TIMEOUT) {
          toast.warning(msg);
        } else {
          toast.info("Busca lenta?", {
            description: "Tente clicar novamente para uma segunda tentativa.",
          });
        }
      },
      options,
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1dbf8e]/10 text-[#1dbf8e] rounded-full flex items-center justify-center">
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} />
          )}
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-800 uppercase italic leading-tight">
            Ver por proximidade?
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase italic mt-0.5">
            GPS Inteligente
          </p>
        </div>
      </div>
      <button
        onClick={handleGetLocation}
        disabled={loading}
        className="text-[10px] font-black uppercase bg-[#0f172a] text-white px-4 py-2 rounded-lg hover:bg-black transition-all disabled:opacity-50 active:scale-95 shadow-sm"
      >
        {loading ? "Localizando..." : "Ativar GPS"}
      </button>
    </div>
  );
}
