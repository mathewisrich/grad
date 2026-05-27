/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2be0edf7df284ee687e27abada475fed.r2.dev",
      },
    ],
  },
};

export default nextConfig;
