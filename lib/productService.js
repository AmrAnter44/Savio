// lib/productService.js - Manual Update Only Version
import { supabaseServer } from './supabaseClient'

let productsCache = null
let cacheTimestamp = null
let MANUAL_UPDATE_ONLY = true // 🔒 Force manual updates only

/**
 * ✅ FIXED: Fetch from Supabase (only during manual update or build)
 */
async function fetchProductsFromSupabase() {
  try {
    console.log('🔄 Fetching products from Supabase database...')
    
    const supabase = supabaseServer()
    
    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 30000)
      )
    ])

    if (error) {
      console.error('❌ Supabase error:', error)
      return getFallbackProducts()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No products found in database')
      return getFallbackProducts()
    }

    const transformedProducts = data.map(product => {
      return {
        id: product.uuid || product.id?.toString() || `temp_${Date.now()}`,
        uuid: product.uuid || product.id?.toString() || `temp_${Date.now()}`,
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
        created_at: product.created_at || new Date().toISOString()
      }
    })
    
    console.log(`✅ Successfully fetched ${transformedProducts.length} products from Supabase`)
    return transformedProducts
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return getFallbackProducts()
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

function getFallbackProducts() {
  console.log('⚠️ Using fallback products - Database connection failed')
  
  return [
    {
      id: "fallback-1",
      uuid: "fallback-1",
      name: "Database Connection Error - Demo Fragrance",
      price: 999,
      newprice: 799,
      type: "women",
      brand: "Demo Brand",
      description: "Demo Brand",
      pictures: ['/images/placeholder-fragrance.jpg'],
      sizes: ["50ml", "100ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    }
  ]
}

// 🔒 MAIN FUNCTION: Only returns cached data OR builds fresh during SSG
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  console.log(`📋 getAllProducts called (forceRefresh: ${forceRefresh}, buildMode: ${buildMode})`)
  
  // 🔒 BUILD MODE: Always fetch fresh (for SSG)
  if (buildMode) {
    console.log('🏗️ Build mode: Fetching fresh data from Supabase...')
    const products = await fetchProductsFromSupabase()
    productsCache = products
    cacheTimestamp = Date.now()
    return products
  }

  // 🔒 MANUAL UPDATE: Only when forceRefresh = true
  if (forceRefresh && MANUAL_UPDATE_ONLY) {
    console.log('🔄 Manual update: Force refreshing from Supabase...')
    const products = await fetchProductsFromSupabase()
    productsCache = products
    cacheTimestamp = Date.now()
    return products
  }

  // 🔒 RUNTIME: Always return cached data (never auto-fetch)
  if (productsCache) {
    const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : 0
    console.log(`⚡ Using cached products (age: ${Math.round(cacheAge / 1000)}s) - Manual update only`)
    return productsCache
  }

  // 🔒 NO CACHE: Return fallback and warn
  console.warn('❌ No cache available and manual update not triggered')
  console.warn('💡 Use "Update Website" button in dashboard to load fresh data')
  return getFallbackProducts()
}

export async function getProductById(id, buildMode = false) {
  console.log(`🔍 getProductById: ${id} (buildMode: ${buildMode})`)
  
  // 🔒 Only fetch from DB during build mode
  if (buildMode) {
    try {
      const supabase = supabaseServer()
      const { data, error } = await Promise.race([
        supabase.from('products').select('*').eq('uuid', id).single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 15000)
        )
      ])

      if (error) {
        console.error(`❌ Product ${id} not found:`, error.message)
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
        created_at: data.created_at
      }

      console.log(`✅ Fetched product: ${transformedProduct.name}`)
      return transformedProduct

    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error)
      return null
    }
  }

  // 🔒 RUNTIME: Use cache only
  if (!productsCache) {
    console.warn('❌ No product cache available - use manual update')
    return null
  }

  const product = productsCache.find(p => p.id === id || p.uuid === id)
  if (product) {
    console.log(`✅ Found product in cache: ${product.name}`)
    return product
  }

  console.warn(`❌ Product ${id} not found in cache`)
  return null
}

export async function getRelatedProducts(currentProduct, limit = 8, buildMode = false) {
  if (!currentProduct) return []

  try {
    const allProducts = await getAllProducts(false, buildMode)
    
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .slice(0, limit)

    console.log(`🔗 Found ${related.length} related products for ${currentProduct.name}`)
    return related

  } catch (error) {
    console.error('❌ Error fetching related products:', error)
    return []
  }
}

export async function getSaleProducts(limit = 4, buildMode = false) {
  try {
    const allProducts = await getAllProducts(false, buildMode)
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, limit)

    console.log(`💰 Found ${saleProducts.length} products on sale`)
    return saleProducts

  } catch (error) {
    console.error('❌ Error fetching sale products:', error)
    return []
  }
}

export async function getProductCategories(buildMode = false) {
  try {
    const allProducts = await getAllProducts(false, buildMode)
    
    if (!allProducts || allProducts.length === 0) {
      return getFallbackCategories()
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

    console.log(`📂 Generated ${categories.length} categories`)
    return categories

  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return getFallbackCategories()
  }
}

function getFallbackCategories() {
  return [
    {
      key: "women",
      name: "Women", 
      description: "Elegant fragrances for women",
      image: "/women.jpg",
      count: 0
    },
    {
      key: "men", 
      name: "Men",
      description: "Bold scents for men",
      image: "/men.jpg",
      count: 0
    },
    {
      key: "Box", 
      name: "Master-Box",
      description: "Premium fragrance collections",
      image: "/master.jpg",
      count: 0
    }
  ]
}

// 🔒 MANUAL REFRESH: Only way to update cache
export async function forceRefreshAllData() {
  console.log('🔄 Force refreshing all data from Supabase...')
  clearProductsCache()
  const products = await getAllProducts(true, false) // forceRefresh = true
  console.log(`✅ Force refresh completed: ${products.length} products loaded`)
  return products
}

export function clearProductsCache() {
  console.log('🗑️ Clearing products cache...')
  productsCache = null
  cacheTimestamp = null
}

export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    manualUpdateOnly: MANUAL_UPDATE_ONLY,
    message: productsCache ? 'Cache available' : 'No cache - manual update required'
  }
}

// 🔒 DISABLE AUTO-REFRESH: Turn on/off manual mode
export function setManualMode(enabled = true) {
  MANUAL_UPDATE_ONLY = enabled
  console.log(`🔒 Manual update mode: ${enabled ? 'ENABLED' : 'DISABLED'}`)
}