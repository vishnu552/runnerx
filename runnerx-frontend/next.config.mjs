/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1', 'admin.runnerx.in'],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "admin.runnerx.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
