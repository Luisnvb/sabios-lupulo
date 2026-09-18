import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Driver neon-serverless (Pool sobre WebSocket) necesita `ws` como
  // dependencia nativa externa al bundle del servidor (igual que en
  // trivia-friends, ver src/db/client.ts).
  serverExternalPackages: ["@neondatabase/serverless", "ws"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
