import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import PasswordAlert from "@/components/PasswordAlert"; // ⬅️ 1. ADICIONE ESSE IMPORT
import { Providers } from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import PwaListener from "@/components/PwaListener";

export const metadata: Metadata = {
  title: "TAFANU | O que você precisa, perto de você",
  description: "Encontre serviços e comércios locais em Guarulhos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Em Next.js 15/16, cookies() deve ser await
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
        {/* COLE ESTE BLOCO AQUI 👇 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.deferredPrompt = null;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            window.dispatchEvent(new Event('pwa-prompt-ready'));
          });
        `,
          }}
        />

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
