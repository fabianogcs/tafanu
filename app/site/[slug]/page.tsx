import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { businessThemes } from "@/lib/themes";
import { Metadata } from "next";

// IMPORTAÇÃO DOS TEMPLATES
import LuxeLayout from "@/components/templates/LuxeLayout";
import UrbanLayout from "@/components/templates/UrbanLayout";
import ComercialLayout from "@/components/templates/ComercialLayout";
import InstallPrompt from "@/components/InstallPrompt";
import ShowroomLayout from "@/components/templates/ShowroomLayout";

// COMPONENTES DE SUPORTE
import ViewCounter from "@/components/ViewCounter";

// --- 1. SEO DINÂMICO & PWA (TURBINADO) ---
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

  // 1. Identificamos qual imagem usar (Ícone do App)
  const rawImage = business.imageUrl || business.heroImage;
  const displayImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/og-default.png`;

  // 2. Identificamos a Cor do Tema para a barra do navegador
  const themeKey =
    (business.theme as keyof typeof businessThemes) || "urban_gold";
  const themeColor = businessThemes[themeKey]?.previewColor || "#000000";

  return {
    title: `${business.name.toUpperCase()} | Tafanu`,
    description:
      business.description?.slice(0, 160) ||
      "Confira este anúncio exclusivo no Tafanu.",
    keywords: business.keywords,
    alternates: {
      canonical: fullUrl,
    },

    // --- PWA: IDENTIDADE DO CLIENTE ---
    applicationName: business.name, // Nome que aparece embaixo do ícone no celular
    manifest: `/api/manifest/${business.slug}`, // <--- O PULO DO GATO: Manifesto Dinâmico
    themeColor: themeColor, // Pinta a barra do navegador com a cor do cliente

    // Configurações para iOS (iPhone)
    appleWebApp: {
      capable: true,
      title: business.name,
      statusBarStyle: "black-translucent",
    },

    // Ícones Dinâmicos (Favicon e Ícone de Instalação)
    icons: {
      icon: displayImage,
      shortcut: displayImage,
      apple: displayImage, // Ícone da tela inicial do iPhone
    },

    openGraph: {
      title: `${business.name.toUpperCase()} - Guia Tafanu`,
      description:
        business.description?.slice(0, 160) ||
        "Veja mais fotos e informações no nosso site oficial.",
      url: fullUrl,
      siteName: business.name, // Agora mostramos o nome do negócio, não Tafanu
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

  // Busca o negócio com tudo o que precisamos
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

  // --- 2. LÓGICA DE FUNCIONAMENTO (FUSO HORÁRIO BRASIL) ---
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

  // Normalização do Layout
  let currentLayout = business.layout || "urban";
  if (currentLayout === "influencer") currentLayout = "urban";

  // Tema Seguro
  const theme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes["urban_gold"];

  const fullAddress = [business.address, business.city, business.state]
    .filter(Boolean)
    .join(", ");

  // Formatação dos Horários
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

  // --- 3. DADOS ENVIADOS PARA OS TEMPLATES ---
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
    <main className="min-h-screen">
      {/* Contador de Visualizações */}
      <ViewCounter businessId={business.id} userId={userId} />
      {/* COMPONENTE NOVO DE INSTALAÇÃO */}
      <InstallPrompt businessName={business.name} />

      {/* Renderização Condicional do Template */}
      {currentLayout === "editorial" && <LuxeLayout {...layoutProps} />}
      {currentLayout === "urban" && <UrbanLayout {...layoutProps} />}
      {currentLayout === "businessList" && <ComercialLayout {...layoutProps} />}
      {currentLayout === "showroom" && <ShowroomLayout {...layoutProps} />}
    </main>
  );
}
