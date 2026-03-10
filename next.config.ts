import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 REMOVEMOS o serverExternalPackages que estava travando o React
  // E usamos transpilePackages se necessário (geralmente o Next 14/15 nem precisa mais)
  transpilePackages: ["@uploadthing/react", "uploadthing"],

  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
