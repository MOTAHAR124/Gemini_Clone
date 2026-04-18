/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: '/api/avatar',
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
