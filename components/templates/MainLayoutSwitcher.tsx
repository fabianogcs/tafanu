"use client";

import dynamic from "next/dynamic";
import { businessThemes } from "@/lib/themes";

// 🚀 ARQUITETURA 10/10: Lazy loading por chunk isolado + sem flicker de tela
const layouts = {
  editorial: dynamic(() => import("./LuxeLayout"), { loading: () => null }),
  influencer: dynamic(() => import("./UrbanLayout"), { loading: () => null }),
  urban: dynamic(() => import("./UrbanLayout"), { loading: () => null }),
  businessList: dynamic(() => import("./ComercialLayout"), { loading: () => null }),
  showroom: dynamic(() => import("./ShowroomLayout"), { loading: () => null }),
} as const;

interface LayoutSwitcherProps {
  business: any;
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
  realHours,
  fullAddress,
  isLoggedIn,
  isFavorited,
  emailVerified,
  currentUserId,
  isAdmin,
  isOpen = false,
}: LayoutSwitcherProps) {
  // TRAVA DE SEGURANÇA ANTI-QUEBRA
  if (!business) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
        </div>
      </div>
    );
  }

  // 🛡️ RESOLUÇÃO SEGURA DE TEMA (Com tipagem estrita do TS)
  const safeTheme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes.showroom_clean;

  // 🚀 RESOLUÇÃO DE LAYOUT O(1) COM FALLBACK SEGURO
  const LayoutComponent =
    layouts[business.layout as keyof typeof layouts] ?? layouts.showroom;

  // 📦 AGRUPADOR DE PROPS LIMPO
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

  return <LayoutComponent {...sharedProps} />;
}