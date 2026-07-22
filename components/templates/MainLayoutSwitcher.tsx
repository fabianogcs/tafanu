"use client";

import dynamic from "next/dynamic";
import { businessThemes } from "@/lib/themes";

// 🚀 ARQUITETURA SÊNIOR: Lazy Loading com Object Mapping
// O navegador só baixa o pacote JS do layout específico que a vitrine usa.
const layouts: Record<string, any> = {
  editorial: dynamic(() => import("./LuxeLayout")),
  influencer: dynamic(() => import("./UrbanLayout")),
  urban: dynamic(() => import("./UrbanLayout")),
  businessList: dynamic(() => import("./ComercialLayout")),
  showroom: dynamic(() => import("./ShowroomLayout")),
};

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
  isOpen, // Recebemos o cálculo estático inicial do servidor
}: LayoutSwitcherProps) {
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

  // --- REDE DE PROTEÇÃO DE TEMA ---
  const safeTheme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes.showroom_clean;

  // 🚀 CLEAN CODE: Resolve qual layout carregar sem precisar de um switch gigante
  const LayoutComponent = layouts[business.layout] || layouts.showroom;

  return (
    <LayoutComponent
      business={business}
      theme={safeTheme}
      realHours={realHours}
      fullAddress={fullAddress}
      isLoggedIn={isLoggedIn}
      isFavorited={isFavorited}
      emailVerified={emailVerified}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      isOpen={isOpen}
    />
  );
}
