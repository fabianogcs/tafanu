import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { businessThemes } from "@/lib/themes";
import { Metadata, Viewport } from "next";

// IMPORTAÇÃO DOS TEMPLATES
import LuxeLayout from "@/components/templates/LuxeLayout";
import UrbanLayout from "@/components/templates/UrbanLayout";
import ComercialLayout from "@/components/templates/ComercialLayout";
import ShowroomLayout from "@/components/templates/ShowroomLayout";

// COMPONENTES DE SUPORTE
import ViewCounter from "@/components/ViewCounter";

export const revalidate = 0; // Isso força o Next.js a sempre buscar dados novos do banco
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

// --- 1. SEO DINÂMICO & PWA (VERSÃO FINAL: LOGO OU TAFANU) ---
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

  // 🎯 O ALVO: imageUrl
  const logoAssinante = business.imageUrl;

  let displayImage = `${siteUrl}/og-default.png`; // Começa com o padrão do Tafanu

  if (logoAssinante) {
    if (logoAssinante.startsWith("http")) {
      // Se for Cloudinary (http), usa o link puro!
      displayImage = logoAssinante;
    } else {
      // Se for imagem local, monta o link com o seu domínio
      displayImage = `${siteUrl}${logoAssinante.startsWith("/") ? "" : "/"}${logoAssinante}`;
    }
  }
  return {
    title: `${business.name.toUpperCase()} | Tafanu`,
    description:
      business.description?.slice(0, 160) ||
      "Confira este anúncio exclusivo no Tafanu.",
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
      title: `${business.name.toUpperCase()} - Guia Tafanu`,
      description: "Veja fotos, informações e entre em contato agora mesmo.",
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
  const session = await auth();
  const userId = session?.user?.id || null;

  // 1. BUSCA O NEGÓCIO + DADOS DO DONO E O USUÁRIO LOGADO AO MESMO TEMPO
  const [business, loggedUser] = await Promise.all([
    db.business.findUnique({
      where: { slug },
      include: {
        user: { select: { role: true } }, // 🚀 CORREÇÃO 1: Tiramos o expiresAt daqui!
        hours: true,
        favorites: userId ? { where: { userId } } : false,
        _count: { select: { favorites: true } },
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { name: true, image: true, role: true } },
            replies: {
              include: {
                user: { select: { name: true, image: true, role: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
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

  // 🚀 CORREÇÃO 2: Agora olhamos o expiresAt direto da raiz do 'business'
  const isExpired = business.expiresAt
    ? new Date(business.expiresAt) < now
    : true;

  // 🚀 TRAVA TAFANU: Separação entre Financeiro (isActive) e Visual (published)
  const isOwner = userId === business.userId;

  // 1. Bloqueio por falta de pagamento ou expiração
  if (!isOwnerImmune && (isExpired || !business.isActive)) {
    // Se estiver expirado/inativo, nem o dono vê (força o cara a pagar)
    return notFound();
  }

  // 2. Bloqueio por "Modo Rascunho" (published: false)
  if (!business.published) {
    // Se a loja está pausada, SÓ o Dono ou o Admin podem entrar
    if (!isOwner && !isVisitorAdmin) {
      return notFound();
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";
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
      {/* 🚀 SEO AVANÇADO: SCHEMA MARKUP PARA O GOOGLE (LocalBusiness) */}
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
      {currentLayout === "editorial" && <LuxeLayout {...layoutProps} />}
      {currentLayout === "urban" && <UrbanLayout {...layoutProps} />}
      {currentLayout === "businessList" && <ComercialLayout {...layoutProps} />}
      {currentLayout === "showroom" && <ShowroomLayout {...layoutProps} />}
    </div>
  );
}
