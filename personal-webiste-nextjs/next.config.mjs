/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: '../docs',

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
};


export default nextConfig;
