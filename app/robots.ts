import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 🚀 BLINDAGEM SEO & FINOPS: Protege rotas privadas, filtros infinitos e parâmetros de afiliados
      disallow: [
        "/dashboard/",
        "/admin/",
        "/checkout/",
        "/login",
        "/verificar-email",
        "/api/",
        "/busca?*",
        "/*?ref=*", // 🔒 Impede varredura de links duplicados de Afiliados
        "/*?token=*", // 🔒 Impede indexação de Links Mágicos e tokens de segurança
      ],
    },
    sitemap: "https://tafanu.com.br/sitemap.xml",
  };
}
