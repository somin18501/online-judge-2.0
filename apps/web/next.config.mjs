/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@au/types'],
  experimental: {
    typedRoutes: false,
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
