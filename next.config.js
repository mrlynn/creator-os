/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Prevent jose vendor-chunks error with NextAuth v5 (Next.js 14)
  experimental: {
    serverComponentsExternalPackages: ['jose'],
  },
  async redirects() {
    return [
      { source: '/scripts/:id', destination: '/app/scripts/:id', permanent: true },
    ];
  },
};

module.exports = nextConfig;
