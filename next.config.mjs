/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable React strict mode for better development
  reactStrictMode: true,
  
  // ✅ Image optimization settings - FIXED for Next.js 15
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lblljhoouydfvekihqka.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    // ✅ Modern image formats for better compression
    formats: ['image/webp', 'image/avif'],
    
    // ✅ Responsive device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // ✅ Longer cache time for better performance
    minimumCacheTTL: 31536000, // 1 year
    
    // ✅ Enable SVG support
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Performance optimizations - FIXED
  // swcMinify is enabled by default in Next.js 15, no need to specify
  
  // ✅ Experimental features for better performance - FIXED
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'react-icons'],
    // Removed invalid options
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // ✅ Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Build output settings  
  output: 'standalone',
  
  // ✅ Performance optimizations
  compress: true,
  
  // ✅ Enhanced headers for caching and preloading
  async headers() {
    return [
      // Critical CSS preload
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</_next/static/css/app/layout.css>; rel=preload; as=style',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      // Static assets caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Image caching
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
        source: '/:path*\\.(jpg|jpeg|png|webp|avif|gif|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Font optimization
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Service Worker
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      }
    ]
  },

  // ✅ Webpack optimizations for better chunking
  webpack: (config, { dev, isServer }) => {
    // Only optimize for production client builds
    if (!dev && !isServer) {
      // Optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          // Separate large libraries
          framerMotion: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          },
          reactIcons: {
            test: /[\\/]node_modules[\\/](react-icons)[\\/]/,
            name: 'react-icons', 
            chunks: 'all',
            priority: 15,
          }
        }
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },

  // ✅ Static file serving optimization
  trailingSlash: false,
  
  // ✅ Logging for build debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ✅ Environment variables
  env: {
    CUSTOM_KEY: 'performance-optimized',
  },

  // ✅ Redirects for SEO
  async redirects() {
    return [
      // Add any redirects here if needed
    ]
  },

  // ✅ Rewrites for clean URLs
  async rewrites() {
    return [
      // Add any rewrites here if needed
    ]
  },
}

export default nextConfig;