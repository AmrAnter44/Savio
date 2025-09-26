/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable React strict mode for better development
  reactStrictMode: true,
  
  // ✅ Image optimization settings
  images: {
    domains: [
      "lblljhoouydfvekihqka.supabase.co", // Your Supabase domain
      "dfurfmrwpyotjfrryatn.supabase.co"  // Backup domain if used
    ],
    // ✅ Add formats for better performance
    formats: ['image/webp', 'image/avif'],
    // ✅ Enable optimization
    minimumCacheTTL: 60,
  },

  // ✅ SSG and Performance optimizations
  experimental: {
    // ✅ Enable static generation optimizations
    optimizeCss: true,
    // ✅ Optimize server components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // ✅ Static generation settings
  trailingSlash: false,
  
  // ✅ Build output settings  
  output: 'standalone', // For better deployment
  
  // ✅ Performance optimizations
  compress: true,
  
  // ✅ Static file caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', 
          },
        ],
      }
    ]
  },

  // ✅ Logging for build debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig;