/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PORT: process.env.PORT || 3000,
  },
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/dashboard/portfolio',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/platform/profilepic/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
  },
  experimental: {
    // Remove serverActions as it's now available by default
  },
};

module.exports = nextConfig; 