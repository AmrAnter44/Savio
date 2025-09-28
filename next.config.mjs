/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable React strict mode for better development
  reactStrictMode: true,
  
  // ✅ Image optimization settings - ENHANCED
  images: {
    domains: [
      "lblljhoouydfvekihqka.supabase.co"
    ],
    // ✅ Modern image formats for better compression
    formats: ['image/webp', 'image/avif'],
    
    // ✅ Responsive device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // ✅ Longer cache time for better performance
    minimumCacheTTL: 31536000, // 1 year
    
    // ✅ Better image quality vs size balance
    quality: 85,
    
    // ✅ Enable SVG support
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Performance optimizations
  swcMinify: true, // Use SWC instead of Babel
  
  // ✅ Experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'react-icons'],
    optimizeServerComponentsExports: true,
    forceSwcTransforms: true,
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
            value: '</css/b467b5769f28717c.css>; rel=preload; as=style',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
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
      },
      {
        source: '/:path*.webp',
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
      }
    ]
  },

  // ✅ Webpack optimizations for better chunking
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 244000,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
            maxSize: 244000,
          },
          // Separate framer-motion for better caching
          framerMotion: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          }
        }
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // ✅ Environment variables for browser targeting
  env: {
    BROWSERSLIST: 'defaults, not IE 11, not op_mini all'
  },

  // ✅ Logging for build debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig;