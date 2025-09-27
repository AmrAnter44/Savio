// app/Store.jsx - Manual Update Only Version
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories, getCacheInfo } from "@/lib/productService"

/**
 * ✅ FIXED: SSG functions that only fetch during build time
 */
async function getAllProductsSSG() {
  try {
    console.log('🏗️ SSG Build: Starting products fetch from Supabase...')
    const startTime = Date.now()
    
    // 🔒 buildMode = true: Only during SSG build
    const products = await getAllProducts(false, true) // forceRefresh=false, buildMode=true
    
    const endTime = Date.now()
    console.log(`⏱️ Products fetch completed in ${endTime - startTime}ms`)
    
    if (!products || products.length === 0) {
      console.warn('⚠️ No products returned from getAllProducts')
      return getFallbackProductsForSSG()
    }
    
    console.log(`📦 SSG: Successfully loaded ${products.length} products`)
    return products
    
  } catch (error) {
    console.error("❌ SSG Error fetching products:", error)
    return getFallbackProductsForSSG()
  }
}

async function getSaleProductsSSG(limit = 4) {
  try {
    console.log('🏗️ SSG Build: Fetching sale products...')
    const products = await getSaleProducts(limit, true) // buildMode = true
    
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
    const categories = await getProductCategories(true) // buildMode = true
    
    if (!categories || categories.length === 0) {
      console.log('📂 No categories found, using fallback')
      return getFallbackCategoriesForSSG()
    }
    
    console.log(`📂 SSG: Generated ${categories.length} categories`)
    return categories
    
  } catch (error) {
    console.error("❌ SSG Error fetching categories:", error)
    return getFallbackCategoriesForSSG()
  }
}

function getFallbackProductsForSSG() {
  console.log('🔄 Generating enhanced fallback products for SSG')
  
  return [
    {
      id: "ssg-fallback-1",
      uuid: "ssg-fallback-1",
      name: "🔒 Manual Update Required",
      price: 850,
      newprice: 699,
      type: "women",
      brand: "System Message",
      description: "Click 'Update Website' in Dashboard",
      pictures: ["/images/placeholder-fragrance.jpg"],
      sizes: ["50ml", "100ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    }
  ]
}

function getFallbackCategoriesForSSG() {
  return [
    {
      key: "women",
      name: "Women", 
      description: "Manual update required",
      image: "/women.jpg",
      count: 0
    },
    {
      key: "men", 
      name: "Men",
      description: "Manual update required",
      image: "/men.jpg",
      count: 0
    },
    {
      key: "Box", 
      name: "Master-Box",
      description: "Manual update required",
      image: "/master.jpg",
      count: 0
    }
  ]
}

/**
 * ✅ FIXED: Store Page - Manual Update Only
 */
export default async function StorePage() {
  console.log('🏪 Starting Manual-Only SSG build for Store page...')
  console.log('🔒 Manual Update Mode: ACTIVE')
  console.log('📅 Build time:', new Date().toISOString())
  
  try {
    const buildStartTime = Date.now()
    
    // 🔒 Fetch data only during build time (buildMode = true)
    console.log('🔄 Fetching build-time data only...')
    
    const [allProducts, saleProducts, categories] = await Promise.allSettled([
      getAllProductsSSG(),
      getSaleProductsSSG(4),
      getProductCategoriesSSG()
    ])

    // Handle results
    const finalProducts = allProducts.status === 'fulfilled' ? allProducts.value : getFallbackProductsForSSG()
    const finalSaleProducts = saleProducts.status === 'fulfilled' ? saleProducts.value : []
    const finalCategories = categories.status === 'fulfilled' ? categories.value : getFallbackCategoriesForSSG()
    
    const buildEndTime = Date.now()
    const buildDuration = buildEndTime - buildStartTime
    
    console.log(`🏪 Manual-Only Store page built successfully in ${buildDuration}ms:`)
    console.log(`   📦 Total products: ${finalProducts.length}`)
    console.log(`   💰 Sale products: ${finalSaleProducts.length}`)
    console.log(`   📂 Categories: ${finalCategories.length}`)
    console.log(`   🔒 Runtime updates: DISABLED (manual only)`)

    return (
      <div className="min-h-screen">
        {/* 🔒 Manual Update Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>🔒 Manual Update Mode Active:</strong> Data only updates when "Update Website" is pressed in dashboard.
                  <br />
                  Cache info: {JSON.stringify(getCacheInfo(), null, 2)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <StoreSSG
          initialProducts={finalProducts}
          initialSaleProducts={finalSaleProducts}
          initialCategories={finalCategories}
        />
      </div>
    )
    
  } catch (error) {
    console.error('❌ Critical SSG Store page build failure:', error)
    
    const emergencyProducts = getFallbackProductsForSSG()
    const emergencyCategories = getFallbackCategoriesForSSG()

    return (
      <div className="min-h-screen">
        <div className="bg-red-50 border border-red-200 p-4 m-4 rounded-lg">
          <h3 className="text-red-800 font-bold">⚠️ Store Running in Emergency Mode</h3>
          <p className="text-red-700 text-sm">Database connection issue. Use Dashboard → Update Website.</p>
        </div>
        
        <StoreSSG
          initialProducts={emergencyProducts}
          initialSaleProducts={[]}
          initialCategories={emergencyCategories}
        />
      </div>
    )
  }
}

/**
 * ✅ Static Generation Settings
 */
export const dynamic = 'force-static'
export const revalidate = false // 🔒 No automatic revalidation
export const fetchCache = 'force-cache'

export const metadata = {
  title: "Our Fragrance Collection - Premium Perfumes & Scents | Savio Fragrances",
  description: "Discover premium perfumes and captivating scents from our curated fragrance collection. Shop women's, men's, and master-box collections with authentic guarantees and fast delivery in Egypt.",
  keywords: "perfume store, fragrances, scents, men perfume, women perfume, master box, premium fragrances, Egypt, Savio Fragrances, authentic perfume",
}