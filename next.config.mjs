/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary's host
        pathname: '/**', // Match all paths
      },
    ],
  },
};

export default nextConfig;
