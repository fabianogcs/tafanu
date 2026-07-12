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
  isLoggedIn: boolean;
  isFavorited: boolean;
  emailVerified: boolean;
  currentUserId: string;
  isAdmin: boolean;
  isOpen?: boolean;
}

export default function MainLayoutSwitcher({
  business,
  theme,
  realHours,
  fullAddress,
  isLoggedIn,
  isFavorited,
  emailVerified,
  currentUserId,
  isAdmin,
  isOpen = false,
}: LayoutSwitcherProps) {
  // --- REDE DE PROTEÇÃO ---
  const safeTheme =
    business && businessThemes[business.theme]
      ? businessThemes[business.theme]
      : businessThemes.showroom_clean;

  // TRAVA DE SEGURANÇA
  if (!business) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
        </div>
      </div>
    );
  }

  // 🚀 AGRUPADOR DE PROPS: Repassa tudo, incluindo nota, avaliações e status para as vitrines públicas
  const sharedProps = {
    business,
    theme: safeTheme,
    realHours,
    fullAddress,
    isLoggedIn,
    isFavorited,
    emailVerified,
    currentUserId,
    isAdmin,
    isOpen,
  };

  switch (business.layout) {
    case "editorial":
      return <LuxeLayout {...sharedProps} />;

    case "influencer":
    case "urban":
      return <UrbanLayout {...sharedProps} />;

    case "businessList":
      return <ComercialLayout {...sharedProps} />;

    case "showroom":
    default:
      return <ShowroomLayout {...sharedProps} />;
  }
}
