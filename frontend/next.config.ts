import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for static export
  output: 'export',

  // Ensure proper trailing slash handling
  trailingSlash: false,

  // Image optimization for production (required for static export)
  images: {
    unoptimized: true
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Disable features not supported in static export
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
