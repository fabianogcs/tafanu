import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { businessThemes } from "@/lib/themes";
import { Metadata, Viewport } from "next";

// IMPORTAÇÃO DOS TEMPLATES
import LuxeLayout from "@/components/templates/LuxeLayout";
import UrbanLayout from "@/components/templates/UrbanLayout";
import ComercialLayout from "@/components/templates/ComercialLayout";
import InstallButton from "@/components/InstallButton";
import ShowroomLayout from "@/components/templates/ShowroomLayout";

// COMPONENTES DE SUPORTE
import ViewCounter from "@/components/ViewCounter";

// --- 0. VIEWPORT DINÂMICO ---
export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;
  const business = await db.business.findUnique({
    where: { slug },
    select: { theme: true },
  });

  const themeKey =
    (business?.theme as keyof typeof businessThemes) || "urban_gold";
  const themeColor = businessThemes[themeKey]?.previewColor || "#000000";

  return {
    themeColor: themeColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

// --- 1. SEO DINÂMICO & PWA (AQUI ESTÁ A MUDANÇA) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await db.business.findUnique({ where: { slug } });

  if (!business) return { title: "Negócio não encontrado | Tafanu" };

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";
  const fullUrl = `${siteUrl}/site/${business.slug}`;

  const rawImage = business.imageUrl || business.heroImage;
  const displayImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/og-default.png`;

  // TRUQUE DO CACHE: Cria um número único baseada na hora atual
  const cacheBuster = new Date().getTime();

  return {
    title: `${business.name.toUpperCase()} | Tafanu`,
    description:
      business.description?.slice(0, 160) ||
      "Confira este anúncio exclusivo no Tafanu.",
    keywords: business.keywords,
    alternates: {
      canonical: fullUrl,
    },

    // --- MUDANÇA AQUI: Adicionei ?v=${cacheBuster} ---
    // Isso obriga o celular a baixar o manifesto novo, ignorando o antigo.
    manifest: `/api/manifest/${business.slug}?v=${cacheBuster}`,

    applicationName: business.name,
    appleWebApp: {
      capable: true,
      title: business.name,
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: displayImage,
      shortcut: displayImage,
      apple: displayImage,
    },
    openGraph: {
      title: `${business.name.toUpperCase()} - Guia Tafanu`,
      description:
        business.description?.slice(0, 160) ||
        "Veja mais fotos e informações no nosso site oficial.",
      url: fullUrl,
      siteName: business.name,
      images: [
        {
          url: displayImage,
          width: 1200,
          height: 630,
          alt: `Foto de ${business.name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: business.name,
      description: business.description?.slice(0, 160),
      images: [displayImage],
    },
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const business = await db.business.findUnique({
    where: { slug },
    include: {
      hours: true,
      favorites: userId ? { where: { userId } } : false,
      _count: {
        select: { favorites: true },
      },
    },
  });

  if (!business) return notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";
  const rawImage = business.imageUrl || business.heroImage;

  const appIcon = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/og-default.png`;

  const serverDate = new Date();
  const brazilDate = new Date(
    serverDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );

  const currentDay = brazilDate.getDay();
  const currentTime = brazilDate.getHours() * 100 + brazilDate.getMinutes();
  const todayHours = business.hours.find((h) => h.dayOfWeek === currentDay);

  let isOpen = false;
  if (
    todayHours &&
    !todayHours.isClosed &&
    todayHours.openTime &&
    todayHours.closeTime
  ) {
    const [openH, openM] = todayHours.openTime.split(":").map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
    const openVal = openH * 100 + openM;
    const closeVal = closeH * 100 + closeM;
    isOpen = currentTime >= openVal && currentTime < closeVal;
  }

  let currentLayout = business.layout || "urban";
  if (currentLayout === "influencer") currentLayout = "urban";

  const theme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes["urban_gold"];
  const fullAddress = [business.address, business.city, business.state]
    .filter(Boolean)
    .join(", ");
  const DAYS_MAP = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const realHours = Array.from({ length: 7 }).map((_, index) => {
    const dbDay = business.hours.find((h) => h.dayOfWeek === index);
    return {
      day: DAYS_MAP[index],
      time: dbDay?.isClosed
        ? "Fechado"
        : dbDay?.openTime
          ? `${dbDay.openTime} - ${dbDay.closeTime}`
          : "Fechado",
      isClosed: dbDay?.isClosed || !dbDay,
    };
  });

  const layoutProps = {
    business,
    theme,
    realHours,
    fullAddress,
    isOpen,
    isLoggedIn: !!userId,
    isFavorited: business.favorites && business.favorites.length > 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ViewCounter businessId={business.id} userId={userId} />

      {/* SCRIPT DE SEGURANÇA: Garante que o navegador atualize o manifesto ao entrar aqui */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.search.indexOf('utm_source=pwa') === -1) {
               // Se não for PWA, tenta limpar workers antigos para liberar instalação
               if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for(let reg of regs) reg.unregister();
                  });
               }
            }
          `,
        }}
      />

      {currentLayout === "editorial" && <LuxeLayout {...layoutProps} />}
      {currentLayout === "urban" && <UrbanLayout {...layoutProps} />}
      {currentLayout === "businessList" && <ComercialLayout {...layoutProps} />}
      {currentLayout === "showroom" && <ShowroomLayout {...layoutProps} />}

      <div className="w-full bg-slate-950 py-12">
        <InstallButton
          businessSlug={business.slug}
          businessName={business.name}
          businessLogo={appIcon}
        />
      </div>
    </div>
  );
}
