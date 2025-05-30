import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for production
  output: 'standalone',

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

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Disable powered by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

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
