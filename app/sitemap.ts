import { db } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";

  // 1. Busca todos os negócios ativos e publicados do banco de dados
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // 2. Transforma cada loja em uma URL do Sitemap
  const businessUrls = businesses.map((business) => ({
    url: `${siteUrl}/site/${business.slug}`,
    lastModified: business.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. Adiciona as páginas principais do Tafanu
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
      priority: 0.7,
    },
  ];

  // 4. Junta tudo e entrega pro Google!
  return [...staticUrls, ...businessUrls];
}
