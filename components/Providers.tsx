"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={true}
      refetchInterval={5 * 60} // Dá um check-up na sessão a cada 5 minutos
    >
      {children}
    </SessionProvider>
  );
}
