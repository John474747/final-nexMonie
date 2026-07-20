import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: false,
      fs: false,
      tls: false,
      net: false,
      zlib: false,
      http: false,
      https: false,
      crypto: false,
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
