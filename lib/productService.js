// lib/productService.js - ISR Optimized: Zero runtime DB calls
import { supabaseServer } from './supabaseClient'

let productsCache = null
let cacheTimestamp = null

// 🔄 ISR: Only fetch during build/revalidation, never in runtime
let ISR_MODE = true

/**
 * ✅ ISR OPTIMIZED: Fetch only during build/revalidation
 */
async function fetchProductsFromSupabaseISR() {
  try {
    console.log('🔄 ISR: Fetching products from Supabase (build/revalidation only)...')
    
    const supabase = supabaseServer()
    
    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('ISR timeout after 30s')), 30000)
      )
    ])

    if (error) {
      console.error('❌ ISR Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ ISR: No products found in database')
      return []
    }

    const transformedProducts = data.map(product => {
      return {
        id: product.uuid || product.id?.toString() || `isr_${Date.now()}`,
        uuid: product.uuid || product.id?.toString() || `isr_${Date.now()}`,
        name: product.name || 'Unnamed Product',
        price: parseFloat(product.price) || 0,
        newprice: product.newprice ? parseFloat(product.newprice) : null,
        type: product.type || 'general',
        brand: product.brand || 'Unknown Brand',
        description: product.brand || 'Premium Fragrance',
        pictures: validateAndFixPictures(product.pictures),
        sizes: validateSizes(product.sizes), 
        colors: validateColors(product.colors),
        owner_id: product.owner_id || 'admin',
        created_at: product.created_at || new Date().toISOString(),
        isr_fetched_at: new Date().toISOString() // ISR timestamp
      }
    })
    
    console.log(`✅ ISR: Successfully fetched ${transformedProducts.length} products`)
    return transformedProducts
    
  } catch (error) {
    console.error('❌ ISR Error fetching products:', error)
    throw error
  }
}

function validateAndFixPictures(pictures) {
  if (Array.isArray(pictures) && pictures.length > 0) {
    const validPictures = pictures
      .filter(pic => pic && typeof pic === 'string' && pic.trim())
      .map(pic => {
        const cleanPic = pic.trim()
        if (cleanPic.startsWith('https://') || cleanPic.startsWith('http://')) {
          return cleanPic
        }
        if (cleanPic.startsWith('/')) {
          return cleanPic
        }
        return `/images/${cleanPic}`
      })
      .filter(pic => pic.length > 0)
    
    if (validPictures.length > 0) {
      return validPictures
    }
  }
  
  return ['/images/placeholder-fragrance.jpg']
}

function validateSizes(sizes) {
  if (Array.isArray(sizes) && sizes.length > 0) {
    const validSizes = sizes.filter(size => size && typeof size === 'string' && size.trim())
    if (validSizes.length > 0) {
      return validSizes
    }
  }
  return ['50ml', '100ml']
}

function validateColors(colors) {
  if (Array.isArray(colors) && colors.length > 0) {
    return colors.filter(color => color && typeof color === 'string' && color.trim())
  }
  return []
}

function getISRFallbackProducts() {
  console.log('⚠️ ISR: Using fallback products')
  
  return [
    {
      id: "isr-fallback-1",
      uuid: "isr-fallback-1", 
      name: "🔄 ISR: البيانات قيد التحديث التلقائي",
      price: 0,
      type: "women",
      brand: "ISR System",
      description: "سيتم تحديث البيانات تلقائياً",
      pictures: ['/images/placeholder-fragrance.jpg'],
      sizes: ["50ml"],
      colors: [],
      owner_id: "isr",
      created_at: new Date().toISOString(),
      isr_fallback: true
    }
  ]
}

/**
 * ✅ ISR MAIN FUNCTION: Zero runtime DB calls
 */
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  console.log(`📋 ISR getAllProducts called (forceRefresh: ${forceRefresh}, buildMode: ${buildMode})`)
  
  // 🔄 ISR BUILD/REVALIDATION: Only time we fetch from DB
  if (buildMode) {
    console.log('🔄 ISR: Build/revalidation time - fetching from Supabase...')
    try {
      const products = await fetchProductsFromSupabaseISR()
      productsCache = products
      cacheTimestamp = Date.now()
      
      console.log(`✅ ISR: Cached ${products.length} products for static serving`)
      return products
    } catch (error) {
      console.error('❌ ISR Build error:', error)
      const fallback = getISRFallbackProducts()
      productsCache = fallback
      cacheTimestamp = Date.now()
      return fallback
    }
  }

  // 🚀 ISR RUNTIME: Always serve from cache/static (NEVER fetch DB)
  if (productsCache) {
    const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : 0
    console.log(`⚡ ISR Runtime: Serving ${productsCache.length} products from static cache (age: ${Math.round(cacheAge / 1000)}s)`)
    return productsCache
  }

  // 🔄 ISR: No cache means we're in build process
  console.warn('⚠️ ISR: No cache in runtime - this should not happen in production')
  return getISRFallbackProducts()
}

/**
 * ✅ ISR: Get product by ID (static only in runtime)
 */
export async function getProductById(id, buildMode = false) {
  console.log(`🔍 ISR getProductById: ${id} (buildMode: ${buildMode})`)
  
  // 🔄 ISR BUILD: Can fetch from DB during build/revalidation
  if (buildMode) {
    // Try cache first to avoid extra DB calls
    if (productsCache) {
      const product = productsCache.find(p => p.id === id || p.uuid === id)
      if (product) {
        console.log(`✅ ISR Build: Found ${product.name} in cache`)
        return product
      }
    }

    // Fetch single product if not in cache
    try {
      console.log(`🔄 ISR Build: Fetching single product ${id} from DB...`)
      const supabase = supabaseServer()
      const { data, error } = await Promise.race([
        supabase.from('products').select('*').eq('uuid', id).single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ISR product timeout')), 15000)
        )
      ])

      if (error) {
        console.error(`❌ ISR: Product ${id} not found:`, error.message)
        return null
      }

      const transformedProduct = {
        id: data.uuid || data.id?.toString(),
        uuid: data.uuid || data.id?.toString(),
        name: data.name,
        price: parseFloat(data.price),
        newprice: data.newprice ? parseFloat(data.newprice) : null,
        type: data.type,
        brand: data.brand,
        description: data.brand || 'Premium Fragrance',
        pictures: validateAndFixPictures(data.pictures),
        sizes: validateSizes(data.sizes),
        colors: validateColors(data.colors),
        owner_id: data.owner_id,
        created_at: data.created_at,
        isr_fetched_at: new Date().toISOString()
      }

      console.log(`✅ ISR Build: Fetched ${transformedProduct.name}`)
      return transformedProduct

    } catch (error) {
      console.error(`❌ ISR Error fetching product ${id}:`, error)
      return null
    }
  }

  // 🚀 ISR RUNTIME: Use cache only (NEVER fetch from DB)
  if (!productsCache) {
    console.warn('❌ ISR Runtime: No product cache available')
    return null
  }

  const product = productsCache.find(p => p.id === id || p.uuid === id)
  if (product) {
    console.log(`✅ ISR Runtime: Found ${product.name} in static cache`)
    return product
  }

  console.warn(`❌ ISR Runtime: Product ${id} not found in static cache`)
  return null
}

/**
 * ✅ ISR: Related products (from static cache)
 */
export async function getRelatedProducts(currentProduct, limit = 8, buildMode = false) {
  if (!currentProduct) return []

  try {
    // 🚀 ISR: Always use cache in runtime, build mode for ISR
    const allProducts = productsCache || await getAllProducts(false, buildMode)
    
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .slice(0, limit)

    console.log(`🔗 ISR: Found ${related.length} related products (static)`)
    return related

  } catch (error) {
    console.error('❌ ISR Error getting related products:', error)
    return []
  }
}

/**
 * ✅ ISR: Sale products (from static cache)
 */
export async function getSaleProducts(limit = 4, buildMode = false) {
  try {
    // 🚀 ISR: Always use cache in runtime
    const allProducts = productsCache || await getAllProducts(false, buildMode)
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, limit)

    console.log(`💰 ISR: Found ${saleProducts.length} products on sale (static)`)
    return saleProducts

  } catch (error) {
    console.error('❌ ISR Error getting sale products:', error)
    return []
  }
}

/**
 * ✅ ISR: Categories (from static cache)
 */
export async function getProductCategories(buildMode = false) {
  try {
    // 🚀 ISR: Always use cache in runtime
    const allProducts = productsCache || await getAllProducts(false, buildMode)
    
    if (!allProducts || allProducts.length === 0) {
      return getISRFallbackCategories()
    }
    
    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
    
    const categoryMapping = {
      "women": {
        name: "Women",
        description: "Elegant fragrances for women",
        image: "/women.jpg"
      },
      "men": {
        name: "Men", 
        description: "Bold scents for men",
        image: "/men.jpg"
      },
      "master": {
        name: "Master-Box",
        description: "Premium fragrance collections", 
        image: "/master.jpg"
      },
      "unisex": {
        name: "Unisex",
        description: "Perfect for everyone",
        image: "/unisex.jpg"
      }
    }

    const categories = uniqueTypes.map(type => {
      const mapping = categoryMapping[type.toLowerCase()] || {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `Discover our ${type} collection`,
        image: "/images/placeholder-fragrance.jpg"
      }
      
      const productCount = allProducts.filter(p => p.type === type).length
      
      return {
        key: type === 'master' ? 'Box' : type,
        ...mapping,
        count: productCount
      }
    })

    console.log(`📂 ISR: Generated ${categories.length} categories (static)`)
    return categories

  } catch (error) {
    console.error('❌ ISR Error generating categories:', error)
    return getISRFallbackCategories()
  }
}

function getISRFallbackCategories() {
  return [
    {
      key: "women",
      name: "Women", 
      description: "قيد التحديث التلقائي",
      image: "/women.jpg",
      count: 0
    },
    {
      key: "men", 
      name: "Men",
      description: "قيد التحديث التلقائي",
      image: "/men.jpg",
      count: 0
    },
    {
      key: "Box", 
      name: "Master-Box",
      description: "قيد التحديث التلقائي",
      image: "/master.jpg",
      count: 0
    }
  ]
}

/**
 * ✅ ISR: Manual refresh (for emergency use only)
 */
export async function forceRefreshAllData() {
  console.log('🔄 ISR: Force refresh requested (emergency only)...')
  console.warn('⚠️ ISR: Consider using ISR auto-revalidation instead of manual refresh')
  
  clearProductsCache()
  const products = await getAllProducts(false, true) // buildMode = true
  console.log(`✅ ISR: Emergency refresh completed: ${products.length} products`)
  return products
}

export function clearProductsCache() {
  console.log('🗑️ ISR: Clearing products cache...')
  productsCache = null
  cacheTimestamp = null
}

export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    mode: 'ISR (Incremental Static Regeneration)',
    runtimeDBCalls: 0,
    revalidation: 'Auto every 24 hours',
    message: productsCache ? 'ISR cache available - zero runtime DB calls' : 'ISR building cache'
  }
}

/**
 * ✅ ISR: Disable manual mode (ISR handles updates automatically)
 */
export function setManualMode(enabled = false) {
  ISR_MODE = !enabled
  console.log(`🔄 ISR Mode: ${ISR_MODE ? 'ENABLED' : 'DISABLED'}`)
  console.log(`📝 Manual Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`)
}