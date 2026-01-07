import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // During migration
  },
  experimental: {},
  // @ts-ignore - Next.js 16/Turbopack custom experimental key
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
