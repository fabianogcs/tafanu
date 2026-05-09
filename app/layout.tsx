import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next"; // ✅ Adicionado Viewport aqui
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import PasswordAlert from "@/components/PasswordAlert";
import { Providers } from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import PwaListener from "@/components/PwaListener";
import AffiliateTracker from "@/components/AffiliateTracker";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br",
  ),
  title: "TAFANU | O que você precisa, perto de você",
  description:
    "Encontre os melhores serviços e comércios. Explore vitrines exclusivas e conecte-se diretamente pelo WhatsApp.",
  manifest: "/manifest.json",
  keywords: [
    "guia comercial",
    "negócios locais",
    "serviços",
    "vitrine virtual",
    "empresas",
  ],
  applicationName: "Tafanu",

  // 🚀 AQUI ESTÁ A CHAVE DE MESTRE DO GOOGLE SEARCH CONSOLE:
  verification: {
    google: "-kDSLFRyjNWv42JCNpcfI92VMIaB-TyRAuZxMTnXlbY",
  },

  openGraph: {
    title: "TAFANU | Descubra e Conecte-se",
    description:
      "O guia mais completo para você achar exatamente o que precisa, perto de você.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br",
    siteName: "Tafanu",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Logo Tafanu",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAFANU | Guia de Negócios",
    description: "Encontre os melhores serviços da sua cidade em um só lugar.",
    images: ["/og-default.png"],
  },
};

// 🚀 A MÁGICA DA ACESSIBILIDADE DE ZOOM ESTÁ AQUI
export const viewport: Viewport = {
  themeColor: "#0f172a", // Cor da barra de status no celular
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Isso permite que pessoas com visão reduzida deem zoom
  userScalable: true, // Isso resolve a nota vermelha no Lighthouse
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🛡️ SEGURANÇA MÁXIMA: Lendo dados validados do JWT
  const session = await auth();
  const userId = session?.user?.id || null;
  const userRole = session?.user?.role || "VISITANTE";

  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        {/* 1. SISTEMA DE AFILIADOS */}
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>

        {/* 2. SCRIPT DE CONTROLE PWA E SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
              if (!isStandalone) {
                window.deferredPrompt = null;
                window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  window.deferredPrompt = e;
                  window.dispatchEvent(new Event('pwa-ready')); 
                });
                window.addEventListener('appinstalled', () => {
                  window.deferredPrompt = null;
                  window.dispatchEvent(new Event('pwa-ready'));
                });
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {
                      console.log('Falha no SW:', err);
                    });
                  });
                }
              }
            `,
          }}
        />

        {/* 3. ESTRUTURA VISUAL */}
        <Providers>
          <PwaListener />
          <Toaster position="top-center" richColors />
          <PasswordAlert />
          <Navbar isLoggedIn={!!userId} userRole={userRole as string} />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Analytics />
          <SpeedInsights />
          <CookieBanner />
        </Providers>

        <div id="modal-root"></div>
      </body>
    </html>
  );
}
