/** @type {import('next').NextConfig} */
const nextConfig = {
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
