/** @type {import('next').NextConfig} */

//const isProd = process.env.NODE_ENV = 'production'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  distDir: 'docs',
  //basePath: isProd ? '/RepoPortfolio-Your-GitHub-Story' : '',
  images: {
    unoptimized: true,
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
