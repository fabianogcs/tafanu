import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import PasswordAlert from "@/components/PasswordAlert";
import { Providers } from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import PwaListener from "@/components/PwaListener";
import AffiliateTracker from "@/components/AffiliateTracker"; // ⬅️ FUSÃO: Adicionado
import { Suspense } from "react"; // ⬅️ FUSÃO: Adicionado

export const metadata: Metadata = {
  title: "TAFANU | O que você precisa, perto de você",
  description: "Encontre os melhores serviços e comércios.",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mantive sua lógica original de Cookies e Role
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let userRole = null;
  if (userId) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      userRole = user?.role || "VISITANTE";
    } catch (error) {
      console.error("Erro ao buscar role:", error);
    }
  }

  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        {/* 1. SISTEMA DE AFILIADOS (Invisível, mas ativo) */}
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>

        {/* 2. SCRIPT DE CONTROLE PWA E SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Verifica se já está rodando dentro do App Instalado (Standalone)
              const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

              if (!isStandalone) {
                window.deferredPrompt = null;
                
                window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  window.deferredPrompt = e;
                  // 🚨 CORREÇÃO: O nome do evento agora é exatamente o que o Navbar espera!
                  window.dispatchEvent(new Event('pwa-ready')); 
                });

                // 2. Avisa quando o usuário termina de instalar para sumir com o botão na hora
                window.addEventListener('appinstalled', () => {
                  window.deferredPrompt = null;
                  window.dispatchEvent(new Event('pwa-ready'));
                });

                // 3. Registra o Service Worker (Sem ele, o botão não aparece)
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

        {/* 3. ESTRUTURA VISUAL (Mantida 100%) */}
        <Providers>
          <PwaListener />
          <Toaster position="top-center" richColors />
          <PasswordAlert />
          <Navbar isLoggedIn={!!userId} userRole={userRole} />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>

        <div id="modal-root"></div>
      </body>
    </html>
  );
}
