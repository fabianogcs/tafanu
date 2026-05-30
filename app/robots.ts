import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 🚀 BLINDAGEM DE CRAWL BUDGET: Impede o Google de gastar tempo em painéis fechados
      disallow: ["/dashboard/", "/admin/", "/checkout/", "/login", "/api/"],
    },
    sitemap: "https://tafanu.com.br/sitemap.xml",
  };
}
