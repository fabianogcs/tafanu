import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { businessThemes } from "@/lib/themes";
import { Metadata } from "next";

// IMPORTAÇÃO DOS TEMPLATES
import LuxeLayout from "@/components/templates/LuxeLayout";
import UrbanLayout from "@/components/templates/UrbanLayout";
import ComercialLayout from "@/components/templates/ComercialLayout";
import ShowroomLayout from "@/components/templates/ShowroomLayout";

// COMPONENTES DE SUPORTE
import ViewCounter from "@/components/ViewCounter";

// --- 1. SEO DINÂMICO (TURBINADO) ---
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
  // 1. Identificamos qual imagem usar
  const rawImage = business.imageUrl || business.heroImage;

  // 2. Garantimos que o link da imagem seja completo (começando com http)
  // Se a imagem for um link externo (ex: Uploadthing), usamos direto.
  // Se for um caminho do site, grudamos o siteUrl na frente.
  const displayImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/og-default.jpg`;

  return {
    title: `${business.name.toUpperCase()} | Tafanu`,
    description:
      business.description?.slice(0, 160) ||
      "Confira este anúncio exclusivo no Tafanu.",
    keywords: business.keywords,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${business.name.toUpperCase()} - Guia Tafanu`,
      description:
        business.description?.slice(0, 160) ||
        "Veja mais fotos e informações no nosso site oficial.",
      url: fullUrl,
      siteName: "Tafanu",
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
  // Criamos uma data baseada no fuso de SP para garantir precisão no servidor
  const serverDate = new Date();
  const brazilDate = new Date(
    serverDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );

  const currentDay = brazilDate.getDay(); // 0 = Domingo, 1 = Segunda...
  const currentTime = brazilDate.getHours() * 100 + brazilDate.getMinutes(); // Ex: 1430 para 14:30

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

  // --- CORREÇÃO 1: Normalização do Layout ---
  // Se vier "influencer" (nome antigo) ou vazio, convertemos para "urban"
  let currentLayout = business.layout || "urban";
  if (currentLayout === "influencer") currentLayout = "urban";

  // --- CORREÇÃO 2: Tema Seguro ---
  // Se o tema salvo não existir no arquivo themes, usa 'urban_gold' como padrão
  const theme =
    businessThemes[business.theme as keyof typeof businessThemes] ||
    businessThemes["urban_gold"];

  const fullAddress = [business.address, business.city, business.state]
    .filter(Boolean)
    .join(", ");

  // Formatação dos Horários para o Template
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
    business, // Passamos o objeto inteiro aqui
    theme,
    realHours,
    fullAddress,
    isOpen,
  };

  return (
    <main className="min-h-screen">
      {/* Contador de Visualizações (Roda em background) */}
      <ViewCounter businessId={business.id} userId={userId} />

      {/* Renderização Condicional do Template (AGORA CORRIGIDA) */}
      {currentLayout === "editorial" && <LuxeLayout {...layoutProps} />}

      {/* Aceita tanto urban quanto o fallback do influencer aqui */}
      {currentLayout === "urban" && <UrbanLayout {...layoutProps} />}

      {currentLayout === "businessList" && <ComercialLayout {...layoutProps} />}
      {currentLayout === "showroom" && <ShowroomLayout {...layoutProps} />}
    </main>
  );
}
