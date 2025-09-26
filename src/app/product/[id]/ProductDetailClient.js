"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import RelatedProducts from "../../RelatedProducts"
import { useMyContext } from "../../../context/CartContext"
import toast, { Toaster } from 'react-hot-toast'

/**
 * ✅ FIXED: ProductDetailClient now receives data as props (SSG compatible)
 */
export default function ProductDetailClient({ product, relatedProducts = [] }) {
  const { addToCart } = useMyContext()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImage, setSelectedImage] = useState("")
  const [added, setAdded] = useState(false)

  // ✅ Initialize state when component mounts
  useState(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || "")
      setSelectedImage(product.pictures?.[0] || "")
    }
  }, [product])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first!", {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
        }
      })
      return
    }

    try {
      addToCart({ ...product, selectedSize })
      setAdded(true)
      
      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: 'white',
        }
      })

      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.")
    }
  }

  // ✅ Handle missing product
  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 text-center min-h-screen flex items-center justify-center"
      >
        <div>
          <div className="text-4xl mb-4">🌸</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fragrance not found</h2>
          <p className="text-gray-600">The fragrance you're looking for doesn't exist.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontWeight: '500',
          },
        }}
      />
      
      <motion.div 
        className="max-w-6xl mx-auto p-6 mt-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="p-6 flex flex-col lg:flex-row gap-8 bg-white rounded-2xl shadow-sm"
          variants={itemVariants}
        >
          {/* Product Images */}
          <motion.div 
            className="flex flex-col-reverse lg:w-1/2"
            variants={itemVariants}
          >
            {/* Thumbnails */}
            {product.pictures?.length > 1 && (
              <motion.div 
                className="flex gap-3 mt-4 overflow-x-auto pb-2"
                variants={itemVariants}
              >
                {product.pictures.map((img, idx) => (
                  <motion.div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`cursor-pointer flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-gray-800' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      width={60} 
                      height={80}
                      className="object-cover"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedImage}
                className="rounded-xl overflow-hidden bg-gray-50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image 
                  src={selectedImage || product.pictures?.[0] || "/placeholder.png"} 
                  alt={product.name} 
                  width={500} 
                  height={600}
                  className="w-full object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Product Details */}
          <motion.div 
            className="flex flex-col gap-6 lg:w-1/2"
            variants={itemVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              
              {/* Brand */}
              {(product.brand || product.description) && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Brand</span>
                  <p className="text-lg font-medium text-gray-800">{product.brand || product.description}</p>
                </div>
              )}

              {/* Category */}
              {product.type && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</span>
                  <p className="text-lg font-medium text-gray-800 capitalize">
                    {product.type === 'master' ? 'Master-Box' : product.type}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Price */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
            >
              {product.newprice ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    {product.newprice} LE
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {product.price} LE
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round((1 - product.newprice / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {product.price} LE
                </span>
              )}
            </motion.div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Size: {selectedSize || "Please select"}
                </h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size
                    return (
                      <motion.button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                          isSelected 
                            ? "border-gray-800 bg-gray-800 text-white" 
                            : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {size}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Add to Cart Button */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={added}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.div
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>Added to Cart!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Add to Cart</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Additional Information */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">🚚</span>
                  <span>Free shipping over 2000 LE</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">🔄</span>
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">⭐</span>
                  <span>Authentic guarantee</span>
                </div>
              </motion.div>

              {/* Fragrance Notes */}
              <motion.div 
                className="bg-gray-50 rounded-lg p-4 mt-6"
                variants={itemVariants}
              >
                <h4 className="font-semibold text-gray-900 mb-3">Fragrance Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Top Notes</span>
                    <p className="text-gray-600">Fresh & Citrusy</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Heart Notes</span>
                    <p className="text-gray-600">Floral & Elegant</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Base Notes</span>
                    <p className="text-gray-600">Warm & Lasting</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Related Products - Pass relatedProducts as prop */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.3 }}
        >
          {relatedProducts?.length > 0 ? (
            <RelatedProductsSSG products={relatedProducts} currentProduct={product} />
          ) : (
            <RelatedProducts currentProduct={product} />
          )}
        </motion.div>
      </motion.div>
    </>
  )
}

/**
 * ✅ NEW: Static Related Products Component for SSG
 */
function RelatedProductsSSG({ products, currentProduct }) {
  if (!products || products.length === 0) return null

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <a href={`/product/${product.id}`} className="block">
              <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative overflow-hidden h-80">
                  <Image
                    src={product.pictures?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {product.newprice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {Math.round(((product.price - product.newprice) / product.price) * 100)}% OFF
                    </div>
                  )}

                  {product.sizes?.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {product.sizes[0]}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {(product.brand || product.description) && (
                    <p className="text-sm text-gray-500 mb-3">
                      {product.brand || product.description}
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
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}