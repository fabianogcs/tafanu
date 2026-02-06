import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para evitar processamento indevido de pacotes externos no servidor
  serverExternalPackages: ["@uploadthing/react", "uploadthing"],

  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
