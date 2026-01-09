/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.106'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Fix for OneDrive sync issues
  outputFileTracingRoot: __dirname,
  // Ignore TypeScript errors during build (temporary for Firebase issues)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

