// 🚀 O PULO DO GATO: Força o sitemap a olhar o banco de dados em tempo real!
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tafanu.com.br";
  const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // 1. 🚀 BLINDAGEM SEO: Só avisa o Google sobre lojas que passaram no crivo das 48h
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
      OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
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

  // 3. Adiciona as páginas principais e institucionais do Tafanu
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

  // 4. Junta tudo e entrega pro Google!
  return [...staticUrls, ...businessUrls];
}
