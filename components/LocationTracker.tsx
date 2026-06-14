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
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceEnv({ isPwa, isMobile });
  }, []);

  // 🚀 A MÁGICA AQUI: O componente sabe se o GPS já está ligado!
  const isGpsActive = searchParams.has("lat") && searchParams.has("lng");

  const handleGetLocation = () => {
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
        params.set("page", "1"); // 🚀 CIRÚRGICO: Reseta sempre para a página 1 ao ligar o GPS

        setLoading(false);
        router.replace(`/busca?${params.toString()}`);

        // 🚀 Feedback extra pra pessoa ficar feliz
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
            
            // Lógica inteligente de instruções baseada no ambiente
            if (deviceEnv.isPwa && deviceEnv.isMobile) {
               description = "Vá nas Configurações do seu celular > Aplicativos > Tafanu > Permissões e ative a Localização.";
            } else if (deviceEnv.isPwa && !deviceEnv.isMobile) {
               description = "Vá nas configurações de Privacidade do seu Windows/Mac e permita que o Tafanu acesse sua localização.";
            } else {
               description = "Clique no ícone de cadeado (ou informações) ao lado da barra de endereço e permita o GPS.";
            }
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Sinal fraco ou indisponível";
            description = "Não conseguimos obter sua localização agora. Verifique se o GPS do aparelho está ligado e tente em instantes.";
            break;
          case error.TIMEOUT:
            msg = "Busca lenta?";
            description = "O tempo de busca expirou. Tente clicar novamente para uma segunda busca mais rápida.";
            break;
          default:
            msg = "Erro ao buscar GPS";
            description = "Ocorreu um erro inesperado ao tentar acessar sua localização.";
        }

        if (error.code === error.PERMISSION_DENIED) {
          toast.error(msg, {
            description: description,
            duration: 8000, // Maior duração para dar tempo de ler as instruções
          });
        } else if (error.code === error.TIMEOUT) {
          toast.info(msg, {
            description: description,
          });
        } else {
          toast.warning(msg, {
             description: description,
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
            {isGpsActive ? "GPS Ativado (Até 30km)" : "Ver por proximidade?"}
          </h4>
          <p
            className={`text-[10px] font-bold uppercase italic mt-0.5 ${isGpsActive ? "text-emerald-600" : "text-gray-400"}`}
          >
            {isGpsActive
              ? "Negócios em um raio de 30km"
              : "Buscar até 30km ao seu redor"}
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