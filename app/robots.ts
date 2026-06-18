import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 🚀 BLINDAGEM SEO: Impede o Google de ler painéis fechados e indexar filtros de busca dinâmicos infinitos
      disallow: [
        "/dashboard/",
        "/admin/",
        "/checkout/",
        "/login",
        "/api/",
        "/busca?*",
      ],
    },
    sitemap: "https://tafanu.com.br/sitemap.xml",
  };
}
