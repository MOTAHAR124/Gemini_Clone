/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: '/api/avatar',
      },
      {
        pathname: '/login-v1/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mermaid.ink',
      },
    ],
  },
};

export default nextConfig;
