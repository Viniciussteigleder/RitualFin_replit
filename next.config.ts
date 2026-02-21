import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    scrollRestoration: false, // Disable automatic scroll restoration
  },
  // @ts-ignore - Next.js 16/Turbopack custom experimental key
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Wikimedia / Wikipedia (brand logos)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      // Clearbit logo API (common merchant logo source)
      { protocol: "https", hostname: "logo.clearbit.com" },
      // Brandfetch
      { protocol: "https", hostname: "asset.brandfetch.io" },
      // Portermetrics (from user error)
      { protocol: "https", hostname: "portermetrics.com" },
      // IHLE / Neo Koenigsbrunn (from user error)
      { protocol: "https", hostname: "neo-koenigsbrunn.de" },
      // Allow any HTTPS images (most flexible for merchant logos)
      { protocol: "https", hostname: "**" },
      // Google Favicons / logos
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "*.google.com" },
      // GitHub
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      // Generic HTTPS sources (for any other external logos)
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: process.env.NODE_ENV === 'production' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
            value: cspReportOnly,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
