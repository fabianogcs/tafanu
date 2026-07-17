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
      { protocol: "https", hostname: "www.tafanu.com.br" }, // 🛡️ WHITE HAT FIX: Libera o domínio oficial com www!
      // 🛡️ PREVENÇÃO UX: Garante que os avatares de quem loga pelo Google carreguem
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  // 🛡️ Headers de Segurança HTTP para produção (Livres de bloqueios front-end)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" }, // 🚀 Permite que os lojistas usem iframes com segurança
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)", // 🚀 Libera o microfone também!
          },
        ],
      },
    ];
  },
};

export default nextConfig;
