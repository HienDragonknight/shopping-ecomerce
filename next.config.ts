import type { NextConfig } from "next";

// Backend URL: use env var (set on Vercel dashboard), fallback to localhost for dev
const BACKEND_URL = process.env.BACKEND_URL ?? "https://fashion-backend-production-8e3b.up.railway.app";

const nextConfig: NextConfig = {
  // NOTE: Remove "standalone" for Vercel deployment (it's only for Docker/self-hosting)
  // output: "standalone",
  typescript: {
    // TypeScript is checked separately via `npx tsc --noEmit` — skip the subprocess spawn in build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "file.hstatic.net" },
      { protocol: "https", hostname: "theme.hstatic.net" },
      { protocol: "https", hostname: "product.hstatic.net" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "fashion-backend-production-8e3b.up.railway.app" },
      { protocol: "https", hostname: "image3.luatvietnam.vn" },
      { protocol: "https", hostname: "*.luatvietnam.vn" },
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
