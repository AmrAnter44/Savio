// lib/productService.js - تعديل للـ Manual Update فقط
import { supabaseServer } from './supabaseClient'

// Simple in-memory cache - بدون انتهاء صلاحية تلقائي
let productsCache = null
let cacheTimestamp = null

/**
 * ✅ UPDATED: Get all products - Cache لا ينتهي تلقائياً
 */
export async function getAllProducts(forceRefresh = false) {
  // ✅ تحقق من الcache فقط إذا forceRefresh = false
  if (!forceRefresh && productsCache && cacheTimestamp) {
    console.log('⚡ Using cached products (manual refresh only)')
    return productsCache
  }

  try {
    console.log('🔄 Fetching products from Supabase database...')
    
    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('id, name, price, newprice, type, pictures, colors, sizes, description')
        .order('id', { ascending: false }),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 30000)
      )
    ])

    if (error) {
      console.error('❌ Supabase error:', error)
      return productsCache || getFallbackProducts()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No products found in database')
      return productsCache || getFallbackProducts()
    }

    // ✅ تحديث الcache مع timestamp جديد
    productsCache = data
    cacheTimestamp = Date.now()
    
    console.log(`✅ Fetched ${productsCache.length} products from Supabase`)
    return productsCache
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return productsCache || getFallbackProducts()
  }
}

/**
 * ✅ UPDATED: Get product by ID - من الcache أولاً
 */
export async function getProductById(id) {
  try {
    // ✅ تحقق من الcache أولاً
    if (productsCache) {
      const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
      if (cachedProduct) {
        console.log(`⚡ Using cached product for ID: ${id}`)
        return cachedProduct
      }
    }

    // إذا مش موجود في الcache، اجلبه من Supabase
    console.log(`🔄 Fetching product ${id} from Supabase...`)

    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('*')
        .eq('id', id)
        .single(),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 15000)
      )
    ])

    if (error) {
      console.error(`❌ Supabase error for product ${id}:`, error)
      return null
    }

    console.log(`✅ Fetched product: ${data?.name} (ID: ${id})`)
    return data

  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * ✅ UPDATED: Get related products من الcache
 */
export async function getRelatedProducts(currentProduct, limit = 8) {
  if (!currentProduct) {
    return []
  }

  try {
    console.log(`🔄 Getting related products for: ${currentProduct.name}`)
    
    // ✅ استخدم الcache دايماً، لو مش موجود هيجيب من قاعدة البيانات
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for related products')
      return []
    }
    
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .slice(0, limit)

    console.log(`✅ Found ${related.length} related products from cache`)
    return related

  } catch (error) {
    console.error('❌ Error fetching related products:', error)
    return []
  }
}

/**
 * ✅ UPDATED: Get sale products من الcache
 */
export async function getSaleProducts(limit = 4) {
  try {
    console.log('🔄 Getting sale products from cache...')
    
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for sale products')
      return []
    }
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, limit)

    console.log(`✅ Found ${saleProducts.length} sale products from cache`)
    return saleProducts

  } catch (error) {
    console.error('❌ Error fetching sale products:', error)
    return []
  }
}

/**
 * ✅ UPDATED: Get product categories من الcache
 */
export async function getProductCategories() {
  try {
    console.log('🔄 Getting categories from cache...')
    
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for categories')
      return getFallbackCategories()
    }
    
    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
    
    console.log(`📂 Found categories from cache: ${uniqueTypes.join(', ')}`)
    
    const categoryMapping = {
      "casual": {
        name: "Casual",
        description: "Comfortable everyday wear",
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"
      },
      "dress": {
        name: "Dresses", 
        description: "Elegant dresses for special occasions",
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png"
      },
      "bag": {
        name: "Bags",
        description: "Stylish bags and accessories", 
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png"
      }
    }

    const categories = uniqueTypes.map(type => {
      const mapping = categoryMapping[type.toLowerCase()] || {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `Discover our ${type} collection`,
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"
      }
      
      const productCount = allProducts.filter(p => p.type === type).length
      
      return {
        key: type,
        ...mapping,
        count: productCount
      }
    })

    console.log(`✅ Generated ${categories.length} categories from cache`)
    return categories

  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return getFallbackCategories()
  }
}

/**
 * ✅ NEW: Force refresh all data - للاستخدام عند التحديث اليدوي
 */
export async function forceRefreshAllData() {
  console.log('🔄 Force refreshing all data from Supabase...')
  
  // مسح الcache الحالي
  clearProductsCache()
  
  // جلب البيانات الجديدة
  const products = await getAllProducts(true) // forceRefresh = true
  
  console.log(`✅ Force refresh completed: ${products.length} products loaded`)
  return products
}

/**
 * Fallback products - نفس الكود السابق
 */
function getFallbackProducts() {
  console.log('⚠️ Using fallback products (Supabase unavailable)')
  return [
    {
      id: 1,
      name: "Classic Black Dress",
      price: 299,
      newprice: 199,
      type: "dress",
      description: "Elegant black dress perfect for any occasion",
      pictures: ["https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png"],
      colors: ["black"],
      sizes: ["S", "M", "L"]
    },
    {
      id: 2,
      name: "Casual Summer Top",
      price: 149,
      newprice: null,
      type: "casual",
      description: "Light and comfortable summer wear",
      pictures: ["https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"],
      colors: ["white", "blue"],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: 3,
      name: "Luxury Handbag",
      price: 599,
      newprice: 399,
      type: "bag",
      description: "Premium quality leather handbag",
      pictures: ["https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png"],
      colors: ["brown", "black"],
      sizes: []
    }
  ]
}

function getFallbackCategories() {
  console.log('⚠️ Using fallback categories (Supabase unavailable)')
  return [
    {
      key: "casual",
      name: "Casual", 
      description: "Comfortable everyday wear",
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png",
      count: 0
    },
    {
      key: "dress",
      name: "Dresses",
      description: "Elegant dresses for special occasions", 
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png",
      count: 0
    },
    {
      key: "bag", 
      name: "Bags",
      description: "Stylish bags and accessories",
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png",
      count: 0
    }
  ]
}

/**
 * Clear cache - ✅ نفس الكود
 */
export function clearProductsCache() {
  console.log('🗑️ Clearing products cache...')
  productsCache = null
  cacheTimestamp = null
}

/**
 * Get cache info - ✅ محسن
 */
export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    manualUpdateOnly: true // ✅ إشارة إن التحديث يدوي فقط
  }
}