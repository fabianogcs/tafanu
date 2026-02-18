import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  // 1. Pega o slug da URL
  const { slug } = await params;

  // 2. Busca os dados do cliente no banco
  const business = await db.business.findUnique({
    where: { slug },
  });

  if (!business) {
    return new NextResponse("Business not found", { status: 404 });
  }

  // 3. Define a URL base do site
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.vercel.app";

  // 4. Lógica da Imagem (A mesma que usamos na página)
  const rawImage = business.imageUrl || business.heroImage;
  const iconUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${siteUrl}${rawImage}`
    : `${siteUrl}/icon-512.png`; // Fallback para o ícone padrão

  // 5. GERA O JSON DO MANIFESTO
  return NextResponse.json({
    name: business.name, // Nome do App será o nome do Cliente!
    short_name:
      business.name.length > 12 ? business.name.slice(0, 12) : business.name,
    description: business.description || `App oficial de ${business.name}`,
    start_url: `/site/${slug}`, // <--- IMPORTANTE: Abre direto na página do cliente
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: iconUrl, // <--- Usa a mesma URL da imagem do cliente
        sizes: "192x192", // Diz pro navegador: "Pode usar aqui como 192"
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: iconUrl, // <--- Usa a mesma URL de novo
        sizes: "512x512", // Diz pro navegador: "Aqui é a original de 512"
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  });
}
