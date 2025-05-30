import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper trailing slash handling
  trailingSlash: false,

  // Image optimization for production
  images: {
    unoptimized: true
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Disable strict mode for better compatibility
  reactStrictMode: false,

  // Optimize for production
  swcMinify: true,

  // Handle redirects properly
  async redirects() {
    return [];
  },

  // Handle rewrites for SPA behavior
  async rewrites() {
    return [];
  },
};

export default nextConfig;
