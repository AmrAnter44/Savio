// lib/productService.js - Final version for real Supabase data
import { supabaseServer } from './supabaseClient'

let productsCache = null
let cacheTimestamp = null

/**
 * ✅ FINAL: Working with real Supabase data
 */
async function fetchProductsFromSupabase() {
  try {
    console.log('🔄 Fetching products from Supabase database...')
    
    const supabase = supabaseServer()
    
    // ✅ Query with all available columns
    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select(`
          id, 
          uuid, 
          name, 
          price, 
          newprice, 
          type, 
          brand,
          pictures, 
          sizes, 
          colors,
          owner_id,
          created_at
        `)
        .order('id', { ascending: false }),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 15000)
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

    // ✅ Transform real data properly
    const transformedProducts = data.map(product => {
      return {
        id: product.uuid || product.id?.toString() || 'unknown',
        uuid: product.uuid || product.id?.toString() || 'unknown',
        name: product.name || 'Unnamed Product',
        price: parseFloat(product.price) || 0,
        newprice: product.newprice ? parseFloat(product.newprice) : null,
        type: product.type || 'general',
        brand: product.brand || 'Unknown Brand',
        description: product.brand || 'Premium Fragrance',
        pictures: validatePictures(product.pictures),
        sizes: validateSizes(product.sizes), 
        colors: validateColors(product.colors),
        owner_id: product.owner_id || 'admin',
        created_at: product.created_at || new Date().toISOString()
      }
    })
    
    console.log(`✅ Successfully fetched ${transformedProducts.length} products from Supabase`)
    console.log('📋 Products loaded:')
    transformedProducts.slice(0, 5).forEach((product, i) => {
      const saleInfo = product.newprice ? ` (Sale: ${product.newprice} LE)` : ''
      console.log(`   ${i + 1}. ${product.name} - ${product.price} LE${saleInfo} [${product.type}]`)
    })
    
    return transformedProducts
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return getFallbackProducts()
  }
}

/**
 * ✅ Handle pictures from Supabase (array of URLs)
 */
function validatePictures(pictures) {
  // Handle Supabase array format
  if (Array.isArray(pictures) && pictures.length > 0) {
    const validPictures = pictures
      .filter(pic => typeof pic === 'string' && pic.trim())
      .map(pic => {
        // Handle Supabase URLs or placeholder paths
        if (pic.startsWith('https://') || pic.startsWith('/')) {
          return pic.trim()
        }
        return `/images/${pic.trim()}`
      })
    
    if (validPictures.length > 0) {
      return validPictures
    }
  }
  
  // Fallback to placeholder
  console.log('📸 Using placeholder image')
  return ['/images/placeholder-fragrance.jpg']
}

/**
 * ✅ Handle sizes from Supabase
 */
function validateSizes(sizes) {
  if (Array.isArray(sizes) && sizes.length > 0) {
    const validSizes = sizes.filter(size => typeof size === 'string' && size.trim())
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
    return colors.filter(color => typeof color === 'string' && color.trim())
  }
  
  return [] // Empty array if no colors
}

/**
 * ✅ Simplified fallback products (used only if DB fails)
 */
function getFallbackProducts() {
  console.log('⚠️ Using fallback products - Database connection failed')
  
  return [
    {
      id: "fallback-1",
      uuid: "fallback-1",
      name: "Connection Error - Demo Product",
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

// ✅ Main export functions
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  console.log(`📋 getAllProducts (forceRefresh: ${forceRefresh}, buildMode: ${buildMode})`)
  
  // ✅ In build mode or force refresh, always fetch fresh data
  if (buildMode || forceRefresh) {
    console.log('🏗️ Build/Force mode: Fetching fresh data from Supabase...')
    const products = await fetchProductsFromSupabase()
    
    // ✅ Update cache even in build mode for consistency
    productsCache = products
    cacheTimestamp = Date.now()
    
    return products
  }

  // ✅ Runtime: use cache if available
  if (productsCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp
    console.log(`⚡ Using cached products (age: ${Math.round(cacheAge / 1000)}s)`)
    return productsCache
  }

  // ✅ No cache available, fetch fresh
  console.log('📡 No cache available, fetching from Supabase...')
  const products = await fetchProductsFromSupabase()
  productsCache = products
  cacheTimestamp = Date.now()
  
  return products
}

export async function getProductById(id, buildMode = false) {
  console.log(`🔍 getProductById: ${id} (buildMode: ${buildMode})`)
  
  try {
    if (buildMode || !productsCache) {
      console.log(`🔄 Fetching product ${id} directly from database...`)
      
      const supabase = supabaseServer()
      const { data, error } = await Promise.race([
        supabase.from('products').select('*').eq('uuid', id).single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
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
        pictures: validatePictures(data.pictures),
        sizes: validateSizes(data.sizes),
        colors: validateColors(data.colors),
        owner_id: data.owner_id,
        created_at: data.created_at
      }

      console.log(`✅ Fetched product: ${transformedProduct.name}`)
      return transformedProduct
    }

    // Try cache
    const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
    if (cachedProduct) {
      console.log(`⚡ Using cached product: ${cachedProduct.name}`)
      return cachedProduct
    }

    return await getProductById(id, true)

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