/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['v-arena.com'],
    minimumCacheTTL: 31536000, // Cache for 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v-arena.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      // Image proxy endpoint - aggressive CDN caching
      {
        source: '/api/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=86400, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static images in public folder
      {
        source: '/images/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      // Static assets
      {
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      // Site manifest and favicon
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig