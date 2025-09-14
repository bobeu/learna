/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ipfs.io'],
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
