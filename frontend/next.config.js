/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-video-editor/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: true, // For external images
  },
  eslint: {
    // Allow build to continue with warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Allow build to continue with type errors (for now)
    ignoreBuildErrors: false,
  },
  // For monorepo support
  webpack: (config, { isServer }) => {
    // Resolve shared package - use source for transpilation
    const path = require('path');
    const sharedPath = path.resolve(__dirname, '../shared/src');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ai-video-editor/shared': sharedPath,
    };
    return config;
  },
};

module.exports = nextConfig;
