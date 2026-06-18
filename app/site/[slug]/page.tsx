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

// 🚀 A VACINA DA VERCEL: Obriga a página a carregar em Tempo Real (Server-Side Rendering puro)
// Isso resolve imediatamente o erro DYNAMIC_SERVER_USAGE sem quebrar a sua contagem de visualizações ou relógio.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    // 🚀 VILÃO REMOVIDO: Apagamos o userScalable: false e maximumScale: 1
    // Agora o Google vai te dar nota 100 em acessibilidade para deficientes visuais!
    maximumScale: 5,
  };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // 🚀 BUSCA TAMBÉM CATEGORIA, SUBCATEGORIA E CIDADE PARA O SEO LOCAL
  const business = await db.business.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      description: true,
      keywords: true,
      imageUrl: true,
      category: true,
      subcategory: true, // 👈 Agora ele puxa a subcategoria do banco!
      city: true,
    },
  });

  if (!business) return { title: "Negócio não encontrado | Tafanu" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";
  const fullUrl = `${siteUrl}/site/${business.slug}`;

  // 🎯 O ALVO: imageUrl
  const logoAssinante = business.imageUrl;

  let displayImage = `${siteUrl}/og-default.png`; // Começa com o padrão do Tafanu

  if (logoAssinante) {
    if (logoAssinante.startsWith("http")) {
      displayImage = logoAssinante;
    } else {
      displayImage = `${siteUrl}${logoAssinante.startsWith("/") ? "" : "/"}${logoAssinante}`;
    }
  }

  // 🚀 TÍTULO RICO PARA O GOOGLE (SEO LOCAL AVANÇADO)
  const locationTag = business.city ? `em ${business.city}` : "";

  // Pega a primeira subcategoria da lista (já que é um Array), se existir
  const primeiraSubcategoria =
    business.subcategory && business.subcategory.length > 0
      ? ` - ${business.subcategory[0]}`
      : "";

  const categoryTag =
    business.category && business.category !== "Geral"
      ? `${business.category}${primeiraSubcategoria} ${locationTag}`
      : locationTag;

  // Monta o título dinâmico.
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

  const [business, loggedUser] = await Promise.all([
    db.business.findUnique({
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
        catalogPdf: true, // 🚀 AQUI! Agora o Prisma puxa o PDF do banco de dados para a tela!
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
        hasDelivery: true,
        published: true,
        isActive: true,
        expiresAt: true,
        userId: true,
        user: { select: { role: true } },
        hours: true,
        favorites: userId ? { where: { userId } } : false,
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
    }),
    userId
      ? db.user.findUnique({
          where: { id: userId },
          select: { emailVerified: true, role: true },
        })
      : null,
  ]);
  // 2. TRAVA DE SEGURANÇA: Se não existe
  if (!business) return notFound();

  const now = new Date();
  // 🚀 CORREÇÃO: Admins e Afiliados têm imunidade vitalícia na vitrine
  const isOwnerImmune =
    business.user?.role === "ADMIN" || business.user?.role === "AFILIADO";
  const isVisitorAdmin = loggedUser?.role === "ADMIN";

  // 🚀 A MATEMÁTICA DA MORTE: Calcula as 48 horas de carência
  const limiteCarencia = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const isVencidoDeVerdade = business.expiresAt
    ? new Date(business.expiresAt) < limiteCarencia
    : false;

  const isOwner = userId === business.userId;

  // 🚀 A TRAVA DEFINITIVA: Se passou das 48h OU a loja foi desativada, dá erro 404 (Not Found) na hora!
  if (!isOwnerImmune && (isVencidoDeVerdade || !business.isActive)) {
    return notFound();
  }

  // 2. Bloqueio por "Modo Rascunho" (published: false)
  if (!business.published) {
    // Se a loja está pausada, SÓ o Dono ou o Admin podem entrar
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
    isOpen = currentTime >= openVal && currentTime < closeVal;
  }

  let currentLayout = business.layout || "urban";
  if (currentLayout === "influencer") currentLayout = "urban";

  const theme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes["urban_gold"];

  // 🚀 CORREÇÃO 3: Endereço completo agora com o Número e o Complemento que você adicionou hoje!
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

  const layoutProps = {
    business,
    theme,
    currentUserId: userId,
    isAdmin: isVisitorAdmin,
    realHours,
    fullAddress,
    isOpen,
    isLoggedIn: !!userId,
    isFavorited: business.favorites && business.favorites.length > 0,
    emailVerified: loggedUser ? !!loggedUser.emailVerified : false,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ViewCounter businessId={business.id} />

      {/* SCRIPT DE SEGURANÇA: Aqui o next/script funciona perfeitamente (usando children em vez de dangerouslySetInnerHTML) */}
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

      {/* 🚀 SEO AVANÇADO: Para JSON-LD, a recomendação oficial do Next.js é a tag HTML nativa! */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            image: appIcon,
            description: business.description,
            telephone: business.whatsapp || business.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: streetWithNumber,
              addressLocality: business.city,
              addressRegion: business.state,
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
          }),
        }}
      />

      <MainLayoutSwitcher
        business={business}
        theme={theme}
        realHours={realHours}
        fullAddress={fullAddress}
        isLoggedIn={!!userId}
        isFavorited={business.favorites && business.favorites.length > 0}
        emailVerified={loggedUser ? !!loggedUser.emailVerified : false}
        currentUserId={userId || ""}
        isAdmin={isVisitorAdmin}
        isOpen={isOpen}
      />
    </div>
  );
}
