import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloud Run deployment
  output: 'standalone',
  
  // External packages for server components
  serverExternalPackages: ['mongoose'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
