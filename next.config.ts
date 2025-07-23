import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Allow cross-origin requests for development
  allowedDevOrigins: ['34.9.67.237:3000', 'localhost:3000'],
  
  // External packages for server components
  serverExternalPackages: ['mongoose'],
  
  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      '*.tsx': {
        loaders: ['@next/react-refresh-utils/loader'],
      },
    },
  },
  
  // Webpack configuration for better chunk handling
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
  
  // Environment variables that should be available on the client side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Image optimization for production
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Disable source maps in development to avoid chunk loading issues
  productionBrowserSourceMaps: false,
};

export default nextConfig;
