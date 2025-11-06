/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  experimental: {
      serverSourceMaps: true,
  },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'cloudflare-ipfs.com', 'dweb.link'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
        pathname: '/ipfs/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
      if(!isServer) {
        config.resolve.fallback = { 
          fs: false, 
          // net: false, 
          // tls: false 
        };
       }
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
      return config;
  },
};

export default nextConfig;
