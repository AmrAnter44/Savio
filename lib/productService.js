// lib/productService.js - Fixed version
import { supabaseServer } from './supabaseClient'

let productsCache = null
let cacheTimestamp = null

/**
 * ✅ FIXED: Better Supabase data fetching
 */
async function fetchProductsFromSupabase() {
  try {
    console.log('🔄 Fetching products from Supabase database...')
    
    const supabase = supabaseServer()
    
    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }), // Better ordering
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 30000) // Increased timeout
      )
    ])

    if (error) {
      console.error('❌ Supabase error:', error)
      console.error('💡 Error details:', JSON.stringify(error, null, 2))
      return getFallbackProducts()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No products found in database')
      return getFallbackProducts()
    }

    // ✅ FIXED: Transform real data properly with better validation
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
    console.log('📋 Sample products:')
    transformedProducts.slice(0, 3).forEach((product, i) => {
      const saleInfo = product.newprice ? ` (Sale: ${product.newprice} LE)` : ''
      console.log(`   ${i + 1}. ${product.name} - ${product.price} LE${saleInfo} [${product.type}]`)
      console.log(`      Pictures: ${product.pictures.length} images`)
    })
    
    return transformedProducts
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return getFallbackProducts()
  }
}

/**
 * ✅ FIXED: Better pictures validation - don't default to placeholder unless needed
 */
function validateAndFixPictures(pictures) {
  console.log('📸 Validating pictures:', pictures)
  
  // Handle different data formats from Supabase
  let pictureArray = []
  
  if (Array.isArray(pictures)) {
    pictureArray = pictures
  } else if (typeof pictures === 'string') {
    try {
      // Try to parse JSON string
      pictureArray = JSON.parse(pictures)
    } catch (e) {
      // If not JSON, treat as single URL
      pictureArray = [pictures]
    }
  } else {
    pictureArray = []
  }

  if (pictureArray && pictureArray.length > 0) {
    const validPictures = pictureArray
      .filter(pic => pic && typeof pic === 'string' && pic.trim())
      .map(pic => {
        const cleanPic = pic.trim()
        // Handle full URLs from Supabase storage
        if (cleanPic.startsWith('https://') || cleanPic.startsWith('http://')) {
          return cleanPic
        }
        // Handle relative paths
        if (cleanPic.startsWith('/')) {
          return cleanPic
        }
        // Assume it's a filename in public/images
        return `/images/${cleanPic}`
      })
      .filter(pic => pic.length > 0)
    
    if (validPictures.length > 0) {
      console.log(`✅ Found ${validPictures.length} valid pictures`)
      return validPictures
    }
  }
  
  // Only use placeholder if no valid pictures found
  console.log('⚠️ No valid pictures found, using placeholder')
  return ['/images/placeholder-fragrance.jpg']
}

/**
 * ✅ Handle sizes from Supabase
 */
function validateSizes(sizes) {
  if (Array.isArray(sizes) && sizes.length > 0) {
    const validSizes = sizes.filter(size => size && typeof size === 'string' && size.trim())
    if (validSizes.length > 0) {
      return validSizes
    }
  }
  
  // Default fragrance sizes
  return ['50ml', '100ml']
}

/**
 * ✅ Handle colors from Supabase (might be null/empty)
 */
function validateColors(colors) {
  if (Array.isArray(colors) && colors.length > 0) {
    return colors.filter(color => color && typeof color === 'string' && color.trim())
  }
  
  return [] // Empty array if no colors
}

/**
 * ✅ Simplified fallback products (used only if DB fails completely)
 */
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
    },
    {
      id: "fallback-2",
      uuid: "fallback-2",
      name: "Check Database Settings - Demo Product",
      price: 1299,
      newprice: null,
      type: "men",
      brand: "Test Brand",
      description: "Test Brand", 
      pictures: ['/images/placeholder-fragrance.jpg'],
      sizes: ["100ml", "150ml"],
      colors: [],
      owner_id: "admin",
      created_at: new Date().toISOString()
    }
  ]
}

// ✅ Main export functions
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  console.log(`📋 getAllProducts called (forceRefresh: ${forceRefresh}, buildMode: ${buildMode})`)
  
  // In build mode or force refresh, always fetch fresh data
  if (buildMode || forceRefresh) {
    console.log('🏗️ Build/Force mode: Fetching fresh data from Supabase...')
    const products = await fetchProductsFromSupabase()
    
    // Update cache
    productsCache = products
    cacheTimestamp = Date.now()
    
    return products
  }

  // Runtime: use cache if available and not too old (30 minutes)
  if (productsCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp
    if (cacheAge < 30 * 60 * 1000) { // 30 minutes
      console.log(`⚡ Using cached products (age: ${Math.round(cacheAge / 1000)}s)`)
      return productsCache
    }
  }

  // No cache or cache too old, fetch fresh
  console.log('📡 No fresh cache available, fetching from Supabase...')
  const products = await fetchProductsFromSupabase()
  productsCache = products
  cacheTimestamp = Date.now()
  
  return products
}

export async function getProductById(id, buildMode = false) {
  console.log(`🔍 getProductById: ${id} (buildMode: ${buildMode})`)
  
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

    console.log(`📂 Generated ${categories.length} categories:`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} products`)
    })
    
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

export async function forceRefreshAllData() {
  console.log('🔄 Force refreshing all data from Supabase...')
  clearProductsCache()
  const products = await getAllProducts(true, false)
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
    manualUpdateOnly: true
  }
}