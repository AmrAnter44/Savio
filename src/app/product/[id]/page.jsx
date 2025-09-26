// app/product/[id]/page.jsx - Fixed for SSG ✅
import { notFound } from 'next/navigation'
import { getProductById, getRelatedProducts } from '@/lib/productService'
import ProductDetailClient from './ProductDetailClient'

/**
 * ✅ FIXED: Get product with buildMode for SSG
 */
async function getProductSSG(id) {
  try {
    console.log(`🏗️ SSG: Fetching product ${id}...`)
    const product = await getProductById(id, true) // buildMode = true
    return product
  } catch (error) {
    console.error(`❌ SSG Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * ✅ FIXED: Get related products with buildMode for SSG
 */
async function getRelatedProductsSSG(product) {
  try {
    if (!product) return []
    console.log(`🏗️ SSG: Fetching related products for ${product.name}...`)
    const related = await getRelatedProducts(product, 8, true) // buildMode = true
    return related || []
  } catch (error) {
    console.error(`❌ SSG Error fetching related products:`, error)
    return []
  }
}

/**
 * ✅ FIXED: Product Detail Page with proper SSG
 */
export default async function ProductDetailPage({ params }) {
  const { id } = params
  
  try {
    console.log(`🏗️ Building product detail page for ID: ${id}`)
    
    // ✅ جلب المنتج مع buildMode = true
    const product = await getProductSSG(id)
    
    if (!product) {
      console.warn(`⚠️ Product ${id} not found during SSG`)
      notFound()
    }

    // ✅ جلب المنتجات المشابهة
    const relatedProducts = await getRelatedProductsSSG(product)
    
    console.log(`✅ SSG Product detail page built for: ${product.name}`)
    console.log(`   - Related products: ${relatedProducts.length}`)

    return (
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts}
      />
    )
    
  } catch (error) {
    console.error(`❌ SSG Product detail page build error for ${id}:`, error)
    notFound()
  }
}

/**
 * ✅ Generate static params for all products (Optional - for full SSG)
 */
export async function generateStaticParams() {
  try {
    console.log('🏗️ SSG: Generating static params for all products...')
    
    // ✅ استخدم buildMode = true للحصول على جميع المنتجات
    const { getAllProducts } = await import('@/lib/productService')
    const products = await getAllProducts(false, true)
    
    const params = (products || []).map((product) => ({
      id: product.id.toString(),
    }))
    
    console.log(`✅ Generated ${params.length} static params for products`)
    return params
    
  } catch (error) {
    console.error('❌ Error generating static params:', error)
    return [] // Return empty array if error
  }
}

/**
 * ✅ Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { id } = params
  
  try {
    const product = await getProductSSG(id)
    
    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.'
      }
    }

    const price = product.newprice || product.price
    const discount = product.newprice ? 
      Math.round(((product.price - product.newprice) / product.price) * 100) : null

    return {
      title: `${product.name} - ${product.brand || 'Premium Fragrance'}`,
      description: `${product.name} by ${product.brand || 'Premium Brand'}. ${discount ? `Save ${discount}% - ` : ''}Only ${price} LE. Premium quality fragrance with fast delivery.`,
      keywords: `${product.name}, ${product.brand}, perfume, fragrance, ${product.type}, scent, Egypt`,
      openGraph: {
        title: `${product.name} - Premium Fragrance`,
        description: `${product.name} - ${discount ? `${discount}% OFF - ` : ''}${price} LE`,
        images: product.pictures?.length > 0 ? [
          {
            url: product.pictures[0],
            width: 800,
            height: 1000,
            alt: product.name
          }
        ] : []
      },
      alternates: {
        canonical: `/product/${id}`
      }
    }
  } catch (error) {
    console.error(`Error generating metadata for product ${id}:`, error)
    return {
      title: 'Premium Fragrance',
      description: 'Discover premium fragrances and captivating scents.'
    }
  }
}

/**
 * ✅ FIXED: Cache settings for proper SSG
 */
export const dynamic = 'force-static'  // Force static generation
export const revalidate = false        // No automatic revalidation 
export const fetchCache = 'default-cache'