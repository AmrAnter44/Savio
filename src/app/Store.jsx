// app/Store.jsx - ISR Implementation: Zero runtime DB calls
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * ✅ ISR OPTIMIZED: Single fetch at build/revalidation time only
 */
async function fetchAllStoreDataISR() {
  try {
    console.log('🔄 ISR: Fetching store data at build/revalidation time...')
    const startTime = Date.now()
    
    // 🔥 SINGLE FETCH: Get all products once (only during ISR)
    const allProducts = await getAllProducts(false, true) // buildMode = true
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ ISR: No products found, using fallbacks')
      return {
        products: getEmptyState(),
        saleProducts: [],
        categories: getEmptyCategories(),
        lastBuilt: new Date().toISOString(),
        source: 'fallback'
      }
    }

    // 🔥 PROCESS: Extract sale products from the same data
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, 6) // More sale products for ISR

    // 🔥 PROCESS: Generate categories from the same data
    const categories = generateCategoriesFromProducts(allProducts)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`🚀 ISR: Data fetched in ${duration}ms:`)
    console.log(`   📦 Total products: ${allProducts.length}`)
    console.log(`   💰 Sale products: ${saleProducts.length}`)
    console.log(`   📂 Categories: ${categories.length}`)
    console.log(`   🔄 Next revalidation: in 24 hours`)
    
    return {
      products: allProducts,
      saleProducts,
      categories,
      lastBuilt: new Date().toISOString(),
      source: 'database',
      stats: {
        totalProducts: allProducts.length,
        saleProducts: saleProducts.length,
        categories: categories.length,
        buildDuration: duration
      }
    }
    
  } catch (error) {
    console.error("❌ ISR Error:", error)
    return {
      products: getEmptyState(),
      saleProducts: [],
      categories: getEmptyCategories(),
      lastBuilt: new Date().toISOString(),
      source: 'error',
      error: error.message
    }
  }
}

function generateCategoriesFromProducts(products) {
const uniqueTypes = [
  ...new Set(products.map(p => p.type).filter(type => type && type !== "unisex"))
];

  
  const categoryMapping = {
    "women": {
      name: "Women",
      description: "Elegant fragrances for women",
      image: "/women.webp"
    },
    "men": {
      name: "Men", 
      description: "Bold scents for men",
      image: "/men.webp"
    },
    "master": {
      name: "Master-Box",
      description: "Premium fragrance collections", 
      image: "/master.webp"
    },
  }

  return uniqueTypes.map(type => {
    const mapping = categoryMapping[type.toLowerCase()] || {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      description: `Discover our ${type} collection`,
      image: "/images/placeholder-fragrance.jpg"
    }
    
    const productCount = products.filter(p => p.type === type).length
    
    return {
      key: type === 'master' ? 'Box' : type,
      ...mapping,
      count: productCount
    }
  })
}

function getEmptyState() {
  return [
    {
      id: "isr-placeholder-1",
      uuid: "isr-placeholder-1",
      name: "🔄 ISR: قيد التحديث...",
      price: 0,
      type: "women",
      brand: "ISR System",
      description: "البيانات قيد التحديث التلقائي",
      pictures: ["/images/placeholder-fragrance.jpg"],
      sizes: ["50ml"],
      colors: [],
      owner_id: "system",
      created_at: new Date().toISOString()
    }
  ]
}

function getEmptyCategories() {
  return [
    {
      key: "women",
      name: "Women", 
      description: "قيد التحديث التلقائي...",
      image: "/women.jpg",
      count: 0
    },
    {
      key: "men", 
      name: "Men",
      description: "قيد التحديث التلقائي...",
      image: "/men.jpg",
      count: 0
    },
    {
      key: "Box", 
      name: "Master-Box",
      description: "قيد التحديث التلقائي...",
      image: "/master.jpg",
      count: 0
    }
  ]
}

/**
 * ✅ ISR: Store Page - Zero runtime DB calls
 */
export default async function StorePage() {
  console.log('🚀 ISR Store: Building with zero runtime DB calls...')
  console.log('🔄 ISR Mode: Data updates automatically every 24 hours')
  console.log('⚡ Runtime: Serves from static files only')
  console.log('📅 Build time:', new Date().toISOString())
  
  const buildStartTime = Date.now()
  
  // 🔥 ISR: Fetch data only during build/revalidation
  const storeData = await fetchAllStoreDataISR()
  
  const buildEndTime = Date.now()
  const buildDuration = buildEndTime - buildStartTime
  
  console.log(`🚀 ISR Store built in ${buildDuration}ms:`)
  console.log(`   📊 Source: ${storeData.source}`)
  console.log(`   🕐 Last built: ${storeData.lastBuilt}`)
  console.log(`   📦 Products: ${storeData.products.length}`)
  console.log(`   💰 Sale items: ${storeData.saleProducts.length}`)
  console.log(`   📂 Categories: ${storeData.categories.length}`)
  console.log(`   🔄 Next auto-update: in 24 hours`)

  return (
    <div>

      {/* ISR Data Status */}
      <div className="hidden" data-isr-info={JSON.stringify({
        lastBuilt: storeData.lastBuilt,
        source: storeData.source,
        productCount: storeData.products.length,
        revalidateIn: '24 hours'
      })} />
      
      <StoreSSG
        initialProducts={storeData.products}
        initialSaleProducts={storeData.saleProducts}
        initialCategories={storeData.categories}
        isrMode={true}
        lastBuilt={storeData.lastBuilt}
      />
    </div>
  )
}

/**
 * ✅ ISR Configuration: Auto-revalidation every 24 hours
 */
export const revalidate = false // 24 hours = 86400 seconds

// Alternative shorter intervals for testing:
// export const revalidate = 3600   // 1 hour
// export const revalidate = 1800   // 30 minutes  
// export const revalidate = 300    // 5 minutes (for testing)

export const dynamic = 'force-static'
export const fetchCache = 'force-cache'

export const metadata = {
  title: "Perfume Collection - Luxury & Unique Fragrances | Savio Fragrances",
  description: "Discover our exclusive collection of luxury perfumes for men and women. Authentic fragrances, competitive prices, and fast delivery in Egypt. Products are automatically updated.",
  keywords: "perfumes, fragrances, women perfumes, men perfumes, master box, luxury perfumes, Egypt, Savio Fragrances, authentic perfumes",
  openGraph: {
    title: "Perfume Collection - Luxury & Unique Fragrances",
    description: "Luxury perfumes at competitive prices with authenticity guarantee and automatic product updates",
    type: "website"
  }
}
