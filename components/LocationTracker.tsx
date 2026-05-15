"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Navigation, Loader2, MapPin } from "lucide-react"; // ⬅️ Adicionei o MapPin
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationTracker() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🚀 A MÁGICA AQUI: O componente sabe se o GPS já está ligado!
  const isGpsActive = searchParams.has("lat") && searchParams.has("lng");

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
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

        setLoading(false);
        router.replace(`/busca?${params.toString()}`);

        // 🚀 Feedback extra pra pessoa ficar feliz
        toast.success("Localização encontrada!", {
          description: "Mostrando os negócios mais próximos de você.",
        });
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
            msg =
              "O tempo acabou! Tente clicar novamente para uma segunda busca mais rápida.";
            break;
          default:
            msg = "Erro ao buscar GPS.";
        }

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
    <div
      className={`w-full bg-white rounded-2xl p-4 shadow-sm border transition-colors duration-500 mb-6 flex items-center justify-between ${isGpsActive ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"}`}
    >
      <div className="flex items-center gap-3">
        {/* 🚀 O ÍCONE TAMBÉM MUDA DE COR! */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isGpsActive ? "bg-emerald-500 text-white shadow-md" : "bg-[#1dbf8e]/10 text-[#1dbf8e]"}`}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isGpsActive ? (
            <MapPin size={18} className="animate-bounce" />
          ) : (
            <Navigation size={18} />
          )}
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-800 uppercase italic leading-tight">
            {isGpsActive ? "GPS Ativado" : "Ver por proximidade?"}
          </h4>
          <p
            className={`text-[10px] font-bold uppercase italic mt-0.5 ${isGpsActive ? "text-emerald-600" : "text-gray-400"}`}
          >
            {isGpsActive ? "Exibindo os mais próximos" : "GPS Inteligente"}
          </p>
        </div>
      </div>

      {/* 🚀 O BOTÃO MUDA DE COR E TEXTO! */}
      <button
        onClick={handleGetLocation}
        disabled={loading}
        className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all disabled:opacity-50 active:scale-95 shadow-sm ${
          isGpsActive
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-[#0f172a] text-white hover:bg-black"
        }`}
      >
        {loading
          ? "Localizando..."
          : isGpsActive
            ? "Atualizar"
            : "MAIS PRÓXIMO"}
      </button>
    </div>
  );
}
