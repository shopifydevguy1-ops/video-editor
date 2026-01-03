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
};

module.exports = nextConfig;

