/** @type {import('next').NextConfig} */
const nextConfig = {
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
