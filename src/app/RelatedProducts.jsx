"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from '@/lib/supabaseClient'
import { motion } from "framer-motion"

// Animation variants - نفس StorePage
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

export default function RelatedProducts({ currentProduct }) {
  const [related, setRelated] = useState([])
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!currentProduct) return
    const fetchRelated = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", currentProduct.type)
        .neq("id", currentProduct.id)

      if (error) return console.error(error)

      const sorted = data
        .map((p) => ({ ...p, priceDiff: Math.abs(p.price - currentProduct.price) }))
        .sort((a, b) => a.priceDiff - b.priceDiff)
        .slice(0, 8)

      setRelated(sorted)
    }

    fetchRelated()
  }, [currentProduct])

  if (related.length === 0) return null

  // Calculate discount percentage - نفس StorePage
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
      {/* Header - نفس ستايل StorePage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
        <p className="text-xl text-gray-600">Similar fragrances based on your selection</p>
      </motion.div>
      
      {/* Grid - نفس تصميم StorePage بالضبط */}
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
                {/* Image Container - نفس StorePage */}
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

                  {/* Sale Badge - نفس StorePage */}
                  {product.newprice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {getDiscountPercentage(product.price, product.newprice)}% OFF
                    </div>
                  )}

                  {/* Size Info - نفس StorePage */}
                  {product.sizes?.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {product.sizes[0]}
                    </div>
                  )}

                  {/* Gradient Overlay - نفس StorePage */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info - نفس StorePage */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Brand - نفس StorePage */}
                  {product.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Price - نفس StorePage */}
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

      {/* View More Button - محسن */}
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