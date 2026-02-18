import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const business = await db.business.findUnique({
    where: { slug },
  });

  if (!business) {
    return new NextResponse("Business not found", { status: 404 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";

  const rawImage = business.imageUrl || business.heroImage;
  const iconUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/icon-512.png`;

  // --- AQUI ESTÁ A MÁGICA PARA SEPARAR OS APPS ---
  // ID: Identidade única do app
  // Scope: Até onde esse app manda (só dentro da pasta dele)

  return NextResponse.json({
    id: `/site/${slug}`, // <--- NOVO: O RG Único deste App
    name: business.name,
    short_name:
      business.name.length > 12 ? business.name.slice(0, 12) : business.name,
    description: business.description || `App oficial de ${business.name}`,
    start_url: `/site/${slug}`,
    scope: `/site/${slug}/`, // <--- NOVO: O App só "existe" dentro dessa URL
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: iconUrl,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  });
}
