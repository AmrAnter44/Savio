// components/ProductImage.jsx - Optimized for performance
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

const ProductImage = ({ 
  product, 
  isHovered, 
  className = "", 
  priority = false, 
  index = 0,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
}) => {
  const [imageSrc, setImageSrc] = useState(product.pictures?.[0] || "/placeholder.png")
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Memoized image change handler
  const updateImage = useCallback(() => {
    if (isHovered && product.pictures?.[1]) {
      setImageSrc(product.pictures[1])
    } else if (product.pictures?.[0]) {
      setImageSrc(product.pictures[0])
    }
  }, [isHovered, product.pictures])

  useEffect(() => {
    updateImage()
  }, [updateImage])

  // ✅ Error handling with fallback
  const handleError = useCallback(() => {
    if (!imageError) {
      setImageSrc('/placeholder.png')
      setImageError(true)
      console.warn(`Failed to load image for product: ${product.name}`)
    }
  }, [imageError, product.name])

  // ✅ Loading state handler
  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // ✅ Generate blur data URL for better loading experience
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* ✅ Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            📸
          </div>
        </div>
      )}

      {/* ✅ Optimized Image component */}
      <Image
        src={imageSrc}
        alt={product.name}
        fill
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        priority={priority}
        quality={85} // ✅ Balanced quality vs file size
        placeholder="blur"
        blurDataURL={blurDataURL}
        // ✅ LCP optimization for first 4 images
        fetchPriority={index < 4 ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        // ✅ Performance attributes
        decoding="async"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* ✅ Error state indicator */}
      {imageError && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-500 text-xs">⚠</span>
        </div>
      )}

      {/* ✅ Product discount badge */}
      {product.newprice && product.newprice < product.price && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
          {Math.round(((product.price - product.newprice) / product.price) * 100)}% OFF
        </div>
      )}

      {/* ✅ Size indicator */}
      {product.sizes?.length > 0 && (
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {product.sizes[0]}
        </div>
      )}
    </div>
  )
}

// ✅ Memoize component to prevent unnecessary re-renders
export default React.memo(ProductImage)