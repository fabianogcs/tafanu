import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uploadthing/react", "uploadthing"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" }, // Padrão antigo do UploadThing (mantemos por segurança)
      { protocol: "https", hostname: "*.ufs.sh" }, // ⬅️ NOVO: Padrão atualizado e exclusivo do UploadThing!
      { protocol: "https", hostname: "tafanu.com.br" }, // Seu domínio
    ],
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
