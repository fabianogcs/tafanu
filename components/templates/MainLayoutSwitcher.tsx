"use client";

import LuxeLayout from "./LuxeLayout";
import UrbanLayout from "./UrbanLayout";
import ComercialLayout from "./ComercialLayout";
import ShowroomLayout from "./ShowroomLayout";
import { businessThemes } from "@/lib/themes";

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
  // --- REDE DE PROTEÇÃO: Busca o objeto do tema ou usa o padrão 'porcelain_white' ---
  const safeTheme =
    businessThemes[business?.theme] || businessThemes.porcelain_white;

  // TRAVA DE SEGURANÇA: Só barra se não houver os dados do business
  if (!business) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
        </div>
      </div>
    );
  }

  // Lógica de seleção passando o safeTheme (nosso tema oficial garantido)
  switch (business.layout) {
    case "editorial":
      return (
        <LuxeLayout
          business={business}
          theme={safeTheme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "influencer":
    case "urban":
      return (
        <UrbanLayout
          business={business}
          theme={safeTheme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "businessList":
      return (
        <ComercialLayout
          business={business}
          theme={safeTheme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    case "showroom":
      return (
        <ShowroomLayout
          business={business}
          theme={safeTheme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );

    default:
      return (
        <LuxeLayout
          business={business}
          theme={safeTheme}
          realHours={realHours}
          fullAddress={fullAddress}
        />
      );
  }
}
