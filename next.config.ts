import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 A linha transpilePackages foi removida para parar de corromper o UploadThing
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "tafanu.com.br" },
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
