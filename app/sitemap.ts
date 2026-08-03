import { db } from "@/lib/db";
import { MetadataRoute } from "next";
import { unstable_noStore as noStore } from "next/cache";

// 🚀 AS 3 MARRETAS ANTI-CACHE: Garante que a Vercel NUNCA congele este arquivo!
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  noStore(); // 🛡️ Invoca a quebra de cache em tempo de execução

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";
  const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // 1. Busca Lojas
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
      OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
      NOT: { slug: { startsWith: "deleted-" } },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const businessUrls = businesses.map((business) => ({
    url: `${siteUrl}/site/${business.slug}`,
    lastModified: business.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/busca`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/anunciar`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...businessUrls];
}
