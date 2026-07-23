import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 SEGURANÇA MESTRA: Esconde a tecnologia do servidor (Cala o alerta do ZAP)
  poweredByHeader: false,

  // 🚀 LIBERAÇÃO DO IP: Configuração oficial do Next.js para Server Actions em rede local
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.15.152:3000"],
    },
  },

  // 🚀 A linha transpilePackages foi removida para parar de corromper o UploadThing
  images: {
    qualities: [60, 75, 90, 100],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "tafanu.com.br" },
      { protocol: "https", hostname: "www.tafanu.com.br" }, // ✅ corrigido, sem markdown
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  async headers() {
    return [
      // 🔓 Página da vitrine: libera só o "cadeado de iframe", mantém o resto
      {
        source: "/site/:slug*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // 🔒 Resto do site: todos os cadeados ativos, incluindo o de iframe
      {
        source: "/((?!site/).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
