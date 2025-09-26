// app/Store.jsx - Enhanced with better error handling
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * ✅ Enhanced: Better SSG functions with comprehensive error handling
 */
async function getAllProductsSSG() {
  try {
    console.log('🏗️ SSG Build: Starting products fetch from Supabase...')
    const startTime = Date.now()
    
    // Force fresh data from Supabase with extended timeout
    const products = await getAllProducts(true, true)
    
    const endTime = Date.now()
    console.log(`⏱️ Products fetch completed in ${endTime - startTime}ms`)
    
    if (!products || products.length === 0) {
      console.warn('⚠️ No products returned from getAllProducts')
      return getFallbackProductsForSSG()
    }
    
    console.log(`📦 SSG: Successfully loaded ${products.length} products`)
    
    // Log first few products for verification
    console.log('🔍 Sample products loaded:')
    products.slice(0, 3).forEach((product, i) => {
      const saleInfo = product.newprice ? ` (Sale: ${product.newprice} LE)` : ''
      console.log(`   ${i + 1}. ${product.name} - ${product.price} LE${saleInfo}`)
      console.log(`      Type: ${product.type}, Pictures: ${product.pictures.length}`)
    })
    
    return products
    
  } catch (error) {
    console.error("❌ SSG Error fetching products:", error)
    console.error("Stack trace:", error.stack)
    console.log("🔄 Using enhanced fallback data for SSG")
    return getFallbackProductsForSSG()
  }
}

async function getSaleProductsSSG(limit = 4) {
  try {
    console.log('🏗️ SSG Build: Fetching sale products...')
    const products = await getSaleProducts(limit, true)
    
    if (!products || products.length === 0) {
      console.log('💰 No sale products found')
      return []
    }
    
    console.log(`💰 SSG: Found ${products.length} sale products`)
    return products
    
  } catch (error) {
    console.error("❌ SSG Error fetching sale products:", error)
    return []
  }
}

async function getProductCategoriesSSG() {
  try {
    console.log('🏗️ SSG Build: Fetching categories...')
    const categories = await getProductCategories(true)
    
    if (!categories || categories.length === 0) {
      console.log('📂 No categories found, using fallback')
      return getFallbackCategoriesForSSG()
    }
    
    console.log(`📂 SSG: Generated ${categories.length} categories`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} products`)
    })
    
    return categories
    
  } catch (error) {
    console.error("❌ SSG Error fetching categories:", error)
    return getFallbackCategoriesForSSG()
  }
}

/**
 * ✅ Enhanced fallback products for SSG testing
 */
function getFallbackProductsForSSG() {
  console.log('🔄 Generating enhanced fallback products for SSG')
  
  return [
    {
      id: "ssg-fallback-1",
      uuid: "ssg-fallback-1",
      name: "Elegant Rose Perfume - SSG Test",
      price: 850,
      newprice: 699,
      type: "women",
      brand: "Premium Collection",
      description: "Premium Collection",
      pictures: ["/images/placeholder-fragrance.jpg", "/women.jpg"],
      sizes: ["50ml", "100ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    },
    {
      id: "ssg-fallback-2",
      uuid: "ssg-fallback-2", 
      name: "Bold Masculine Scent - SSG Test",
      price: 920,
      newprice: null,
      type: "men",
      brand: "Luxury Line",
      description: "Luxury Line",
      pictures: ["/images/placeholder-fragrance.jpg", "/men.jpg"],
      sizes: ["100ml", "150ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    },
    {
      id: "ssg-fallback-3",
      uuid: "ssg-fallback-3",
      name: "Master Collection Box - SSG Test",
      price: 1500,
      newprice: 1200,
      type: "master",
      brand: "Elite Series",
      description: "Elite Series",
      pictures: ["/images/placeholder-fragrance.jpg", "/master.jpg"],
      sizes: ["Set", "Full Collection"],
      colors: [],
      owner_id: "admin", 
      created_at: new Date().toISOString()
    },
    {
      id: "ssg-fallback-4",
      uuid: "ssg-fallback-4",
      name: "Fresh Citrus Delight - SSG Test",
      price: 750,
      newprice: null,
      type: "women",
      brand: "Fresh Collection",
      description: "Fresh Collection",
      pictures: ["/images/placeholder-fragrance.jpg"],
      sizes: ["30ml", "50ml", "100ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    }
  ]
}

/**
 * ✅ Enhanced fallback categories
 */
function getFallbackCategoriesForSSG() {
  return [
    {
      key: "women",
      name: "Women", 
      description: "Elegant fragrances for women",
      image: "/women.jpg",
      count: 2
    },
    {
      key: "men", 
      name: "Men",
      description: "Bold scents for men", 
      image: "/men.jpg",
      count: 1
    },
    {
      key: "Box", 
      name: "Master-Box",
      description: "Premium fragrance collections",
      image: "/master.jpg",
      count: 1
    }
  ]
}

/**
 * ✅ Enhanced: Store Page with comprehensive error handling and detailed logging
 */
export default async function StorePage() {
  console.log('🏪 Starting enhanced SSG build for Store page...')
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('📅 Build time:', new Date().toISOString())
  console.log('🔧 Supabase URL set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 Supabase Key set:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    const buildStartTime = Date.now()
    
    // Fetch all data with individual error handling
    console.log('🔄 Starting parallel data fetch...')
    
    const [allProducts, saleProducts, categories] = await Promise.allSettled([
      getAllProductsSSG(),
      getSaleProductsSSG(4),
      getProductCategoriesSSG()
    ])

    // Handle results
    const finalProducts = allProducts.status === 'fulfilled' ? allProducts.value : getFallbackProductsForSSG()
    const finalSaleProducts = saleProducts.status === 'fulfilled' ? saleProducts.value : []
    const finalCategories = categories.status === 'fulfilled' ? categories.value : getFallbackCategoriesForSSG()
    
    // Log any failures
    if (allProducts.status === 'rejected') {
      console.error('❌ Products fetch failed:', allProducts.reason)
    }
    if (saleProducts.status === 'rejected') {
      console.error('❌ Sale products fetch failed:', saleProducts.reason)
    }
    if (categories.status === 'rejected') {
      console.error('❌ Categories fetch failed:', categories.reason)
    }
    
    const buildEndTime = Date.now()
    const buildDuration = buildEndTime - buildStartTime
    
    console.log(`🏪 Enhanced SSG Store page built successfully in ${buildDuration}ms:`)
    console.log(`   📦 Total products: ${finalProducts.length}`)
    console.log(`   💰 Sale products: ${finalSaleProducts.length}`)
    console.log(`   📂 Categories: ${finalCategories.length}`)
    console.log(`   ⚡ Build performance: ${buildDuration < 3000 ? '🚀 EXCELLENT' : buildDuration < 8000 ? '✅ GOOD' : '⚠️ SLOW'}`)
    
    // Detailed verification logging
    if (finalProducts.length > 0) {
      console.log('✅ Product data verification:')
      finalProducts.slice(0, 2).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name}`)
        console.log(`      ID: ${product.id}`)
        console.log(`      Type: ${product.type}`) 
        console.log(`      Price: ${product.price} LE`)
        console.log(`      Pictures: ${product.pictures.length} images`)
        console.log(`      Sizes: ${product.sizes.join(', ')}`)
      })
    } else {
      console.warn('⚠️ No products to display - check database connection')
    }

    return (
      <div className="min-h-screen">
        <StoreSSG
          initialProducts={finalProducts}
          initialSaleProducts={finalSaleProducts}
          initialCategories={finalCategories}
        />
      </div>
    )
    
  } catch (error) {
    console.error('❌ Critical SSG Store page build failure:', error)
    console.error('Stack trace:', error.stack)
    console.log('🆘 Using emergency fallback for entire Store page')
    
    const emergencyProducts = getFallbackProductsForSSG()
    const emergencyCategories = getFallbackCategoriesForSSG()

    return (
      <div className="min-h-screen">
        <div className="bg-red-50 border border-red-200 p-4 m-4 rounded-lg">
          <h3 className="text-red-800 font-bold">⚠️ Store Running in Fallback Mode</h3>
          <p className="text-red-700 text-sm">Database connection issue. Check console for details.</p>
        </div>
        
        <StoreSSG
          initialProducts={emergencyProducts}
          initialSaleProducts={[emergencyProducts[0], emergencyProducts[2]]}
          initialCategories={emergencyCategories}
        />
      </div>
    )
  }
}

/**
 * ✅ Enhanced: Next.js 15 SSG Configuration with better caching
 */
export const dynamic = 'force-static'
export const revalidate = false
export const fetchCache = 'force-cache'
export const preferredRegion = 'auto'

/**
 * ✅ Enhanced metadata
 */
export const metadata = {
  title: "Our Fragrance Collection - Premium Perfumes & Scents | Savio Fragrances",
  description: "Discover premium perfumes and captivating scents from our curated fragrance collection. Shop women's, men's, and master-box collections with authentic guarantees and fast delivery in Egypt.",
  keywords: "perfume store, fragrances, scents, men perfume, women perfume, master box, premium fragrances, Egypt, Savio Fragrances, authentic perfume",
  openGraph: {
    title: "Premium Fragrance Collection - Savio Fragrances",
    description: "Discover premium perfumes and captivating scents from our curated collection. Authentic fragrances with fast delivery.",
    type: "website",
    images: [
      {
        url: "/store-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Premium Fragrance Collection - Savio Fragrances"
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
  alternates: {
    canonical: '/store'
  }
}