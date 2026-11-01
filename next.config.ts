import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone: servidor mínimo (server.js) + só as dependências
  // usadas, para uma imagem Docker enxuta (ver Dockerfile).
  output: "standalone",
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
