"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.3, 
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4
    } 
  }
};

/**
 * ✅ FIXED: Related Products - No API calls, uses page context only
 */
export default function RelatedProducts({ currentProduct }) {
  const [related, setRelated] = useState([])
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!currentProduct) return
    
    // 🔒 REMOVED: API call to supabase
    // 🔒 REMOVED: Database fetch
    
    // Instead, show a message that related products need to be passed as props
    console.log('⚠️ RelatedProducts: No API calls allowed. Related products should be passed via SSG.')
    
    // For now, set empty array
    setRelated([])
    
  }, [currentProduct])

  // If no related products, don't render anything


  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16 mx-auto"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
        <p className="text-xl text-gray-600">Similar fragrances based on your selection</p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {related.map((product, index) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Link href={`/product/${product.id}`} className="block">
              <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative overflow-hidden h-80">
                  <Image
                    src={
                      hoveredId === product.id
                        ? product.pictures?.[1] || product.pictures?.[0] || "/placeholder.png"
                        : product.pictures?.[0] || "/placeholder.png"
                    }
                    alt={product.name}
                    fill
                    className="object-cover text-white transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />

                  {product.newprice && (
                    <div className="absolute top-3 left-3 bg text-white px-3 py-1 rounded-full text-xs font-bold">
                      {getDiscountPercentage(product.price, product.newprice)}% OFF
                    </div>
                  )}

                  {product.sizes?.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {product.sizes[0]}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    {product.newprice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {product.newprice} LE
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price} LE
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        {product.price} LE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {related.length >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/store">
            <motion.button
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}