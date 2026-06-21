import type { NextConfig } from "next";

// Backend URL: use env var (set on Vercel dashboard), fallback to localhost for dev
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // NOTE: Remove "standalone" for Vercel deployment (it's only for Docker/self-hosting)
  // output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "file.hstatic.net" },
      { protocol: "https", hostname: "theme.hstatic.net" },
      { protocol: "https", hostname: "product.hstatic.net" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "fashion-backend-production-8e3b.up.railway.app" },
    ],
    dangerouslyAllowSVG: true,
  },
  // Proxy /api/* → Spring Boot backend (reads BACKEND_URL env var)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
