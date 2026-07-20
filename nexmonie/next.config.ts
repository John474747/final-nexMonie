import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  webpack: (config) => {
    // Stub all Node.js built-ins that firebase-admin pulls in
    // (edge runtime cannot use them; the API route using firebase-admin
    //  is excluded from the Pages build by @cloudflare/next-on-pages)
    const nodeBuiltins = [
      'stream', 'fs', 'tls', 'net', 'zlib', 'http', 'https', 'crypto',
      'http2', 'dns', 'os', 'child_process', 'path', 'url', 'util',
      'events', 'buffer', 'querystring', 'string_decoder', 'domain',
      'assert', 'constants', 'vm', 'readline', 'perf_hooks',
      'worker_threads', 'dgram', 'cluster',
    ];
    const fallback: Record<string, false> = { ...config.resolve.fallback };
    for (const mod of nodeBuiltins) {
      fallback[mod] = false;
      fallback[`node:${mod}`] = false;
    }
    config.resolve.fallback = fallback;
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
