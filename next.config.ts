import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para evitar processamento indevido de pacotes externos no servidor
  serverExternalPackages: ["@uploadthing/react", "uploadthing"],

  // Isso aqui avisa ao Next.js que está tudo bem usar Webpack mesmo com o Turbopack ativo
  turbopack: {},

  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
