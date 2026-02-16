import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businessThemes } from "@/lib/themes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const business = await db.business.findUnique({
    where: { slug },
  });

  if (!business) {
    return new NextResponse(JSON.stringify({ error: "Business not found" }), {
      status: 404,
    });
  }

  // --- CONFIGURAÇÃO DE URL E IMAGEM ---
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";

  // AQUI: Usamos a imagem que você JÁ TEM na pasta public
  const DEFAULT_ICON = `${siteUrl}/og-default.png`;

  const rawImage = business.imageUrl || business.heroImage;

  // Se a imagem do cliente for válida (http...), usa ela.
  // Se não, usa o seu og-default.png
  const iconUrl =
    rawImage && rawImage.startsWith("http") ? rawImage : DEFAULT_ICON;

  // --- CONFIGURAÇÃO DE COR (CORREÇÃO DE GRADIENTE) ---
  const themeKey =
    (business.theme as keyof typeof businessThemes) || "urban_gold";
  let themeColor = businessThemes[themeKey]?.previewColor || "#000000";

  // O Android exige cor sólida (Hex). Se for gradiente, pega a primeira cor.
  if (themeColor.includes("gradient")) {
    const match = themeColor.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
    themeColor = match ? match[0] : "#000000";
  }

  // 3. Montamos o JSON Final
  const manifest = {
    name: business.name,
    short_name:
      business.name.length > 12
        ? business.name.slice(0, 12) + "..."
        : business.name,
    description:
      business.description?.slice(0, 150) || "App exclusivo do Tafanu",
    start_url: `/site/${slug}/?source=pwa`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    orientation: "portrait",
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
  };

  return NextResponse.json(manifest);
}
