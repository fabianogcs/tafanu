import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 LIBERAÇÃO DO IP: Sem as portas (:3000), exatamente como o terminal exigiu
  allowedDevOrigins: ["localhost", "192.168.15.152"],

  // 🚀 A linha transpilePackages foi removida para parar de corromper o UploadThing
  images: {
    qualities: [60, 75, 90, 100],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "tafanu.com.br" },
    ],
  },

  // 🛡️ NOVO: Headers de Segurança HTTP para produção
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
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

  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
