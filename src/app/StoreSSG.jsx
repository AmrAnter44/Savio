"use client"

import { useState, useMemo, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FaFilter, FaFilterCircleXmark, FaFire } from "react-icons/fa6"
import Buy2Get1Banner from "../app/components/Buy2Get1Banner"
import { useHasActivePromotion } from "../../hooks/useBuy2Get1Promotion"

const ProductImage = memo(({ product, isHovered, className, priority = false, index = 0 }) => {
  const [imageSrc, setImageSrc] = useState(product.pictures?.[0] || "/placeholder.png")
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isHovered && product.pictures?.[1]) {
      setImageSrc(product.pictures[1])
    } else if (product.pictures?.[0]) {
      setImageSrc(product.pictures[0])
    }
  }, [isHovered, product.pictures])

  const handleError = useCallback(() => {
    if (!imageError) {
      setImageSrc('/placeholder.png')
      setImageError(true)
    }
  }, [imageError])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 skeleton rounded-lg" />
      )}
      <Image
        src={imageSrc}
        alt={product.name}
        fill
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        fetchPriority={index < 4 ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  )
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.3, 
      staggerChildren: 0.02
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4
    } 
  }
}

const CategoryCard = memo(({ category, onClick, isActive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-gradient-to-br cursor-pointer p-8 text-center relative overflow-hidden rounded-2xl transition-all duration-300 text-white min-h-[300px] flex items-center justify-center ${isActive ? 'ring-4 ring-red-900' : ''}`}
    onClick={() => onClick(category.key)}
    style={{
      backgroundImage: category.image ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${category.image})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
    
    <div className="relative z-10">
      <h2 className="text-3xl font-bold mb-3 capitalize text-white">{category.name}</h2>
      <p className="text-white/80">{category.count} products</p>
    </div>
    
    {isActive && (
      <div className="absolute top-4 right-4 bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
        Active
      </div>
    )}
  </motion.div>
))

const ProductCard = memo(({ product, index, hoveredId, setHoveredId }) => {
  const isHovered = hoveredId === product.id
  
  const getDiscountPercentage = useCallback((originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  }, [])

  const isOutOfStock = product.in_stock === false

  return (
    <motion.div
      key={product.id}
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      onMouseEnter={() => setHoveredId(product.id)}
      onMouseLeave={() => setHoveredId(null)}
      className="group"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className={`group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}>
          <div className="relative overflow-hidden h-60 md:h-72 lg:h-96 bg-gray-50">
            <ProductImage
              product={product}
              isHovered={isHovered}
              className="object-cover transition-transform duration-900 group-hover:scale-105"
              priority={index < 4}
              index={index}
            />

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
                  Out of Stock
                </div>
              </div>
            )}

            {product.newprice && !isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-900 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                {getDiscountPercentage(product.price, product.newprice)}% OFF
              </div>
            )}

            {product.sizes?.length > 0 && !isOutOfStock && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {product.sizes[0]}
              </div>
            )}
          </div>

          <div className="p-4">
            <h2 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h2>
            
            {product.description && (
              <p className="text-sm text-gray-900 mb-3">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-4">
              {product.newprice && !isOutOfStock ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {product.newprice} LE
                  </span>
                  <span className="text-sm text-gray-900 line-through">
                    {product.price} LE
                  </span>
                </div>
              ) : (
                <span className={`text-lg font-semibold ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
                  {product.price} LE
                </span>
              )}
            </div>
            
            {isOutOfStock && (
              <div className="mt-2 text-center">
                <span className="text-red-600 font-semibold text-sm">
                  غير متوفر حالياً
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

const VirtualProductGrid = memo(({ products, hoveredId, setHoveredId }) => {
  const [visibleProducts, setVisibleProducts] = useState([])
  const [loadedCount, setLoadedCount] = useState(12)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          setVisibleProducts(products.slice(0, loadedCount))
          setIsLoading(false)
        })
      } else {
        setTimeout(() => {
          setVisibleProducts(products.slice(0, loadedCount))
          setIsLoading(false)
        }, 0)
      }
    }

    loadProducts()
  }, [products, loadedCount])

  const loadMore = useCallback(() => {
    if (!isLoading && loadedCount < products.length) {
      setLoadedCount(prev => Math.min(prev + 12, products.length))
    }
  }, [isLoading, loadedCount, products.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadMore, isLoading])

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        ))}
      </motion.div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-red-900 rounded-full animate-spin"></div>
        </div>
      )}

      {loadedCount < products.length && (
        <div id="scroll-sentinel" className="h-10"></div>
      )}

      {!isLoading && loadedCount < products.length && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Load More ({products.length - loadedCount} remaining)
          </button>
        </div>
      )}
    </>
  )
})

export default function StoreSSG({ 
  initialProducts = [], 
  initialSaleProducts = [], 
  initialCategories = [] 
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [typeFilter, setTypeFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // ✅ استخدام الـ Hook للتحقق من العرض النشط
  const { hasPromotion, loading: promotionLoading } = useHasActivePromotion()

  console.log(`🏪 StoreSSG rendered with ${initialProducts.length} products (STATIC DATA ONLY)`)

  const getAllBrands = useCallback(() => {
    return [...new Set(initialProducts.map(p => p.description).filter(Boolean))]
  }, [initialProducts])

  const brands = useMemo(() => getAllBrands(), [getAllBrands])

  const filteredProducts = useMemo(() => {
    let filtered = initialProducts.filter((product) => {
      let typeMatch = true
      if (typeFilter) {
        if (typeFilter === "women") {
          typeMatch = product.type === "women"
        } else if (typeFilter === "men") {
          typeMatch = product.type === "men"
        } else if (typeFilter === "Box") {
          typeMatch = product.type === "master"
        } else {
          typeMatch = product.type === typeFilter
        }
      }

      return (
        typeMatch &&
        (!brandFilter || product.description === brandFilter) &&
        (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
        (!minPrice || product.price >= parseFloat(minPrice)) &&
        (!maxPrice || product.price <= parseFloat(maxPrice)) &&
        (!searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    })

    filtered = filtered.sort((a, b) => {
      const aInStock = a.in_stock !== false
      const bInStock = b.in_stock !== false
      
      if (aInStock && !bInStock) return -1
      if (!aInStock && bInStock) return 1
      
      switch (sortBy) {
        case "price-low":
          return (a.newprice || a.price) - (b.newprice || b.price)
        case "price-high":
          return (b.newprice || b.price) - (a.newprice || a.price)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return b.id - a.id
      }
    })

    return filtered
  }, [initialProducts, typeFilter, brandFilter, sizeFilter, minPrice, maxPrice, searchTerm, sortBy])

  const clearAllFilters = useCallback(() => {
    setTypeFilter("")
    setBrandFilter("")
    setSizeFilter("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("newest")
    setSearchTerm("")
  }, [])

  const handleCategoryClick = useCallback((categoryKey) => {
    setTypeFilter(categoryKey)
    document.getElementById('products-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Our Fragrance Collection</h1>
          <p className="text-xl mb-8 text-gray-600">Discover premium perfumes and captivating scents</p>
        </motion.div>

        {/* ✅ عرض البانر عند تفعيل Buy 2 Get 1 */}
        {!promotionLoading && hasPromotion && <Buy2Get1Banner />}

        {initialSaleProducts.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <motion.div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-red-900 text-white px-6 py-3 rounded-full mb-4">
                <FaFire className="text-xl text-white" />
                <span className="text-lg font-bold text-white">SALE UP TO 50% OFF</span>
                <FaFire className="text-xl text-white" />
              </div>
              <p className="text-gray-600">Limited time offers on selected fragrances</p>
            </motion.div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {initialSaleProducts.slice(0, 4).map((product, index) => (
                <ProductCard
                  key={`sale-${product.id}`}
                  product={product}
                  index={index}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initialCategories.map((category) => (
              <CategoryCard
                key={category.key}
                category={category}
                onClick={handleCategoryClick}
                isActive={typeFilter === category.key}
              />
            ))}
          </div>
        </motion.div>
        

        <div id="products-section">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{initialProducts.length}</span> fragrances
            </p>
            
            <div className="flex gap-3">
              <label htmlFor="sortBy" className="sr-only">
                Sort products by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 text-gray-900"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              
              <button
                className="px-4 py-2 bg-red-900 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto relative my-15">
            <svg 
              className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 text-gray-900 text-lg transition-all shadow-sm hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-900 transition-colors"
                aria-label="Clear search"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>

          <VirtualProductGrid
            products={filteredProducts}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </div>
      </div>
    </motion.div>
  );
}