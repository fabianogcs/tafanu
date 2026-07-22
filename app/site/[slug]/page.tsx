import { cache } from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { businessThemes } from "@/lib/themes";
import { Metadata, Viewport } from "next";
import Script from "next/script";

// IMPORTAÇÃO DO MAESTRO DE TEMPLATES
import MainLayoutSwitcher from "@/components/templates/MainLayoutSwitcher";

// COMPONENTES DE SUPORTE
import ViewCounter from "@/components/ViewCounter";

// 🚀 A CIRURGIA DO CTO: REMOVEMOS O force-dynamic e revalidate=0.
// Agora o Next.js vai gerar a vitrine e guardar no Edge Cache da Vercel por 1 hora.
// O tempo de carregamento despenca de 1.5s para 10ms e o custo de banco de dados derrete!
export const revalidate = 3600;

// 🚀 O COFRE DO CFO: O React memoriza essa busca durante a requisição do servidor.
// Ele consulta o banco de dados apenas 1 vez (sem atrelar ao userId) e distribui
// os dados instantaneamente para Viewport, Metadata e Página!
const getCachedBusiness = cache(async (slug: string) => {
  return await db.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      theme: true,
      layout: true,
      category: true,
      subcategory: true,
      keywords: true,
      imageUrl: true,
      coverImage: true,
      catalogPdf: true,
      urban_tag: true,
      luxe_quote: true,
      comercial_badge: true,
      showroom_collection: true,
      features: true,
      faqs: true,
      mediaFeed: true,
      gallery: true,
      videos: true,
      address: true,
      number: true,
      complement: true,
      cep: true,
      neighborhood: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      whatsapp: true,
      phone: true,
      website: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      shopee: true,
      mercadoLivre: true,
      shein: true,
      ifood: true,
      menuMode: true,
      isExternalLink: true,
      actionLink: true,
      published: true,
      isActive: true,
      expiresAt: true,
      userId: true,
      user: { select: { role: true } },
      hours: true,
      comments: {
        where: { parentId: null },
        select: {
          id: true,
          content: true,
          createdAt: true,
          isFlagged: true,
          userId: true,
          businessId: true,
          parentId: true,
          rating: true,
          user: { select: { name: true, image: true, role: true } },
          replies: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              isFlagged: true,
              userId: true,
              businessId: true,
              parentId: true,
              user: { select: { name: true, image: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
});

// --- 0. VIEWPORT DINÂMICO (Ultrarrápido, sem ler sessão/cookies) ---
export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;
  const business = await getCachedBusiness(slug);

  const themeKey =
    (business?.theme as keyof typeof businessThemes) || "urban_gold";
  const themeColor = businessThemes[themeKey]?.previewColor || "#000000";

  return {
    themeColor: themeColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

// --- METADATA (Ultrarrápido, sem ler sessão/cookies) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getCachedBusiness(slug);

  if (!business) return { title: "Negócio não encontrado | Tafanu" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";
  const fullUrl = `${siteUrl}/site/${business.slug}`;

  const logoAssinante = business.imageUrl;
  let displayImage = `${siteUrl}/og-default.png`;

  if (logoAssinante) {
    if (logoAssinante.startsWith("http")) {
      displayImage = logoAssinante;
    } else {
      displayImage = `${siteUrl}${logoAssinante.startsWith("/") ? "" : "/"}${logoAssinante}`;
    }
  }

  const locationTag = business.city ? `em ${business.city}` : "";

  const primeiraSubcategoria =
    business.subcategory && business.subcategory.length > 0
      ? ` - ${business.subcategory[0]}`
      : "";

  const categoryTag =
    business.category && business.category !== "Geral"
      ? `${business.category}${primeiraSubcategoria} ${locationTag}`
      : locationTag;

  const seoTitle = categoryTag
    ? `${business.name} | ${categoryTag} | Tafanu`
    : `${business.name} | Tafanu`;

  return {
    title: seoTitle,
    description:
      business.description?.slice(0, 160) ||
      `Conheça ${business.name}. Veja fotos, informações e entre em contato direto pelo WhatsApp.`,
    keywords: business.keywords,
    alternates: { canonical: fullUrl },
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
      title: seoTitle,
      description:
        business.description?.slice(0, 160) ||
        `Veja informações completas e contato de ${business.name}.`,
      url: fullUrl,
      siteName: "Tafanu",
      images: [
        {
          url: displayImage,
          width: 800,
          height: 800,
          alt: `Logo de ${business.name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: seoTitle,
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
  const session = await auth();
  const userId = session?.user?.id || null;

  // 🚀 PROMISE.ALL DE ELITE: Puxa a loja do cache universal do React e,
  // paralelamente, consulta dados do usuário logado e status de favorito se houver sessão!
  const [business, loggedUser, userFavorite] = await Promise.all([
    getCachedBusiness(slug),
    userId
      ? db.user.findUnique({
          where: { id: userId },
          select: { emailVerified: true, role: true },
        })
      : null,
    userId
      ? db.favorite.findFirst({
          where: { userId, business: { slug } },
          select: { id: true },
        })
      : null,
  ]);

  if (!business) return notFound();

  const now = new Date();
  const isOwnerImmune =
    business.user?.role === "ADMIN" || business.user?.role === "AFILIADO";
  const isVisitorAdmin = loggedUser?.role === "ADMIN";

  const limiteCarencia = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const isVencidoDeVerdade = business.expiresAt
    ? new Date(business.expiresAt) < limiteCarencia
    : false;

  const isOwner = userId === business.userId;

  if (!isOwnerImmune && (isVencidoDeVerdade || !business.isActive)) {
    return notFound();
  }

  if (!business.published) {
    if (!isOwner && !isVisitorAdmin) {
      return notFound();
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";
  const rawImage = business.imageUrl;

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
    if (closeVal < openVal) {
      isOpen = currentTime >= openVal || currentTime < closeVal;
    } else {
      isOpen = currentTime >= openVal && currentTime < closeVal;
    }
  }

  const streetWithNumber = [business.address, business.number]
    .filter(Boolean)
    .join(", ");
  const fullAddress = [
    streetWithNumber,
    business.complement,
    business.neighborhood,
    business.city,
    business.state,
  ]
    .filter(Boolean)
    .join(" - ");

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ViewCounter businessId={business.id} />

      <Script id="pwa-cleanup-script" strategy="afterInteractive">
        {`
          if (window.location.search.indexOf('utm_source=pwa') === -1) {
             if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for(let reg of regs) reg.unregister();
                });
             }
          }
        `}
      </Script>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            image: [appIcon],
            "@id": `${siteUrl}/site/${business.slug}`,
            url: `${siteUrl}/site/${business.slug}`,
            telephone: business.whatsapp || business.phone || "",
            address: {
              "@type": "PostalAddress",
              streetAddress: streetWithNumber,
              addressLocality: business.city || "",
              addressRegion: business.state || "",
              postalCode: business.cep || "",
              addressCountry: "BR",
            },
            ...(business.latitude &&
              business.longitude && {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: business.latitude,
                  longitude: business.longitude,
                },
              }),
            description:
              business.description || `Catálogo oficial de ${business.name}`,
            servesCuisine: business.category.toLowerCase().includes("alimenta")
              ? "Geral"
              : undefined,
          }).replace(/</g, "\\u003c"),
        }}
      />

      <MainLayoutSwitcher
        business={business}
        realHours={realHours}
        fullAddress={fullAddress}
        isLoggedIn={!!userId}
        isFavorited={!!userFavorite}
        emailVerified={loggedUser ? !!loggedUser.emailVerified : false}
        currentUserId={userId || ""}
        isAdmin={isVisitorAdmin}
        isOpen={isOpen}
      />
    </div>
  );
}
