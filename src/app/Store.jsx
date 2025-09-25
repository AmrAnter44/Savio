// app/store/page.jsx
import StoreSSG from "../app/StoreSSG"
import { supabase } from "@/lib/supabaseClient"

/**
 * Get all products with error handling
 */
async function getAllProducts(buildMode = true) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

/**
 * Get sale products (products with newprice)
 */
async function getSaleProducts(limit = 4, buildMode = true) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .not("newprice", "is", null)
      .gt("newprice", 0)
      .order("id", { ascending: false })
      .limit(limit)
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching sale products:", error)
    return []
  }
}

/**
 * Get product categories
 */
async function getProductCategories(buildMode = true) {
  try {
    // Get unique types from products
    const { data: products, error } = await supabase
      .from("products")
      .select("type")
      
    if (error) throw error
    
    const uniqueTypes = [...new Set(products?.map(p => p.type).filter(Boolean))] || []
    
    // Create category data with proper mapping
    const categoryMapping = {
      women: {
        key: "women",
        name: "Women",
        description: "Elegant fragrances for women",
        image: "/women.jpg"
      },
      men: {
        key: "men", 
        name: "Men",
        description: "Bold scents for men",
        image: "/men.jpg"
      },
      master: {
        key: "Box",
        name: "Master-box", 
        description: "Premium fragrance collections",
        image: "/master.jpg"
      }
    }
    
    // Return only categories that exist in products
    const categories = uniqueTypes
      .map(type => categoryMapping[type])
      .filter(Boolean)
    
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return [
      {
        key: "women",
        name: "Women",
        description: "Elegant fragrances for women",
        image: "/women.jpg"
      },
      {
        key: "Box", 
        name: "Master-box",
        description: "Premium fragrance collections",
        image: "/master.jpg"
      },
      {
        key: "men", 
        name: "Men",
        description: "Bold scents for men",
        image: "/men.jpg"
      }
    ]
  }
}

/**
 * Store Page - Static Generation with Error Handling
 */
export default async function StorePage() {
  try {
    console.log('🏪 Building fragrance store page...')
    
    // Fetch data at build time
    const [allProducts, saleProducts, categories] = await Promise.all([
      getAllProducts(true),
      getSaleProducts(4, true),
      getProductCategories(true)
    ])

    console.log(`🏪 Store page built with:`)
    console.log(`   - Total products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)

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
    console.error('❌ Store page build error:', error)
    
    // Provide fallback UI with empty data
    return (
      <div className="min-h-screen">
        <StoreSSG
          initialProducts={[]}
          initialSaleProducts={[]}
          initialCategories={[]}
        />
      </div>
    )
  }
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: "Our Fragrance Collection - Premium Perfumes & Scents",
  description: "Discover premium perfumes and captivating scents. Shop our complete fragrance collection for men, women, and master-box collections.",
  keywords: "perfume store, fragrances, scents, men perfume, women perfume, master box, premium fragrances, Egypt",
  openGraph: {
    title: "Our Fragrance Collection - Premium Perfumes & Scents",
    description: "Discover premium perfumes and captivating scents from our curated collection.",
    type: "website",
    url: "https://your-domain.com/store",
    images: [
      {
        url: "/store-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Premium Fragrance Collection"
      }
    ]
  }
}

/**
 * Cache settings for optimal performance
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'default-cache'