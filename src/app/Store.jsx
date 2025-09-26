// app/Store.jsx - Proper SSG for Next.js 15 ✅
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * ✅ FIXED: Proper SSG functions for Next.js 15
 */
async function getAllProductsSSG() {
  try {
    console.log('🏗️ SSG Build: Fetching all products from Supabase...')
    const startTime = Date.now()
    
    // ✅ Force fresh data from Supabase (no cache)
    const products = await getAllProducts(true, true) // forceRefresh=true, buildMode=true
    
    const endTime = Date.now()
    console.log(`⏱️ Products fetch took ${endTime - startTime}ms`)
    console.log(`📦 SSG: Loaded ${products.length} products`)
    
    return products || []
  } catch (error) {
    console.error("❌ SSG Error fetching products:", error)
    console.log("🔄 SSG will use fallback data")
    return []
  }
}

async function getSaleProductsSSG(limit = 4) {
  try {
    console.log('🏗️ SSG Build: Fetching sale products...')
    const products = await getSaleProducts(limit, true) // buildMode=true
    console.log(`💰 SSG: Found ${products.length} sale products`)
    return products || []
  } catch (error) {
    console.error("❌ SSG Error fetching sale products:", error)
    return []
  }
}

async function getProductCategoriesSSG() {
  try {
    console.log('🏗️ SSG Build: Fetching categories...')
    const categories = await getProductCategories(true) // buildMode=true
    console.log(`📂 SSG: Generated ${categories.length} categories`)
    return categories || []
  } catch (error) {
    console.error("❌ SSG Error fetching categories:", error)
    return [
      { key: "women", name: "Women", description: "Elegant fragrances for women", image: "/women.jpg", count: 0 },
      { key: "men", name: "Men", description: "Bold scents for men", image: "/men.jpg", count: 0 },
      { key: "Box", name: "Master-Box", description: "Premium fragrance collections", image: "/master.jpg", count: 0 }
    ]
  }
}

/**
 * ✅ FIXED: Store Page with proper SSG for Next.js 15
 */
export default async function StorePage() {
  console.log('🏪 Starting SSG build for Store page...')
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('📅 Build time:', new Date().toISOString())
  
  try {
    const buildStartTime = Date.now()
    
    // ✅ Fetch all data in parallel with timeout
    const dataPromise = Promise.all([
      getAllProductsSSG(),
      getSaleProductsSSG(4),
      getProductCategoriesSSG()
    ])
    
    // ✅ Add timeout to prevent hanging builds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SSG build timeout after 30 seconds')), 30000)
    )
    
    const [allProducts, saleProducts, categories] = await Promise.race([
      dataPromise,
      timeoutPromise
    ])
    
    const buildEndTime = Date.now()
    const buildDuration = buildEndTime - buildStartTime
    
    console.log(`🏪 SSG Store page built successfully in ${buildDuration}ms:`)
    console.log(`   📦 Total products: ${allProducts.length}`)
    console.log(`   💰 Sale products: ${saleProducts.length}`)
    console.log(`   📂 Categories: ${categories.length}`)
    console.log(`   ⚡ Build performance: ${buildDuration < 5000 ? 'FAST' : buildDuration < 15000 ? 'GOOD' : 'SLOW'}`)
    
    // ✅ Log sample data for verification
    if (allProducts.length > 0) {
      console.log('📋 Sample products:')
      allProducts.slice(0, 3).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name} - ${product.price} LE`)
      })
    }

    return (
      <div className="min-h-screen">
        <StoreSSG
          initialProducts={allProducts}
          initialSaleProducts={saleProducts}
          initialCategories={categories}
        />
      </div>
    )
    
  } catch (error) {
    console.error('❌ SSG Store page build failed:', error)
    console.log('🔄 Using fallback data for SSG')
    
    // ✅ Provide meaningful fallback
    const fallbackProducts = [
      {
        id: "build-fallback-1",
        uuid: "build-fallback-1",
        name: "Build Error - Demo Product 1",
        price: 850,
        newprice: 699,
        type: "women",
        brand: "Demo Brand",
        description: "Demo Brand", 
        pictures: ["/images/placeholder-fragrance.jpg"],
        sizes: ["50ml", "100ml"],
        colors: []
      },
      {
        id: "build-fallback-2", 
        uuid: "build-fallback-2",
        name: "Build Error - Demo Product 2",
        price: 920,
        newprice: null,
        type: "men",
        brand: "Demo Brand",
        description: "Demo Brand",
        pictures: ["/images/placeholder-fragrance.jpg"], 
        sizes: ["100ml", "150ml"],
        colors: []
      }
    ]

    const fallbackCategories = [
      { key: "women", name: "Women", description: "Elegant fragrances for women", image: "/women.jpg", count: 1 },
      { key: "men", name: "Men", description: "Bold scents for men", image: "/men.jpg", count: 1 },
      { key: "Box", name: "Master-Box", description: "Premium fragrance collections", image: "/master.jpg", count: 0 }
    ]

    return (
      <div className="min-h-screen">
        <StoreSSG
          initialProducts={fallbackProducts}
          initialSaleProducts={[fallbackProducts[0]]} // First product as sale
          initialCategories={fallbackCategories}
        />
      </div>
    )
  }
}

/**
 * ✅ CRITICAL: Next.js 15 SSG Configuration
 */
export const dynamic = 'force-static'        // ✅ Force static generation
export const revalidate = false              // ✅ Never auto-revalidate
export const fetchCache = 'force-cache'      // ✅ Force caching
export const preferredRegion = 'auto'        // ✅ Auto region selection

/**
 * ✅ Enhanced metadata with build info
 */
export const metadata = {
  title: "Our Fragrance Collection - Premium Perfumes & Scents",
  description: "Discover premium perfumes and captivating scents. Shop our complete fragrance collection for men, women, and master-box collections.",
  keywords: "perfume store, fragrances, scents, men perfume, women perfume, master box, premium fragrances, Egypt",
  openGraph: {
    title: "Our Fragrance Collection - Premium Perfumes & Scents",
    description: "Discover premium perfumes and captivating scents from our curated collection.",
    type: "website",
    images: [
      {
        url: "/store-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Premium Fragrance Collection"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}