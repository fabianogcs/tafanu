"use client";

import LuxeLayout from "./LuxeLayout";
import UrbanLayout from "./UrbanLayout";
import ComercialLayout from "./ComercialLayout";
import ShowroomLayout from "./ShowroomLayout";

interface LayoutSwitcherProps {
  business: any;
  theme: any;
  realHours: any;
  fullAddress: string;
}

export default function MainLayoutSwitcher({
  business,
  theme,
  realHours,
  fullAddress,
}: LayoutSwitcherProps) {
  // TRAVA DE SEGURANÇA: Se não houver dados do negócio ou tema, não renderiza nada
  // Isso evita que os layouts internos tentem ler propriedades de "null"
  if (!business || !theme) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          {/* Um loader simples enquanto os dados carregam */}
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
        </div>
      </div>
    );
  }

  // Lógica de seleção baseada no que foi salvo no Editor
  switch (business.layout) {
    case "editorial":
      return (
        <LuxeLayout
          business={business}
          theme={theme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "influencer":
      return (
        <UrbanLayout
          business={business}
          theme={theme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "businessList":
      return (
        <ComercialLayout
          business={business}
          theme={theme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "showroom":
      return (
        <ShowroomLayout
          business={business}
          theme={theme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    default:
      // Layout padrão caso nada seja selecionado
      return (
        <LuxeLayout
          business={business}
          theme={theme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );
  }
}
