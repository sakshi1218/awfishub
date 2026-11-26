/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config) => {
    if (config.output) {
      config.output.chunkLoadTimeout = 120000;
    }
    return config;
  },
};

export default nextConfig;
