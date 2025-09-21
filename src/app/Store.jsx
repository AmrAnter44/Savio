"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaFilterCircleXmark, FaSpinner, FaFire } from "react-icons/fa6";

// Import supabase
import { supabase } from "@/lib/supabaseClient";

// Simplified Animation variants
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

const filterVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const categoryVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const saleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

export default function StorePage() {
  const [hoveredId, setHoveredId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });
          
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get all unique types from products and create category data - فقط للفئات المطلوبة
  const getAllProductTypes = () => {
    // فقط الفئات المطلوبة: النساء والرجال والماستر بوكس
    const defaultCategories = [
      {
        key: "women",
        name: "Women",
        description: "",
        bgColor: "",
        emoji: "",
        image: "/women.jpg"
      },
      {
        key: "Box", 
        name: "Master-box",
        description: "",
        bgColor: "",
        emoji: "",
        image: "/master.jpg"
      },
      {
        key: "men", 
        name: "Men",
        description: "",
        bgColor: "",
        emoji: "",
        image: "/men.jpg"
      },
    ];

    return defaultCategories;
  };

  const categories = getAllProductTypes();

  // Get sale products (products with newprice)
  const getSaleProducts = () => {
    return products.filter(product => product.newprice && product.newprice > 0);
  };

  const saleProducts = getSaleProducts();

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Get unique brands for filtering
  const getAllBrands = () => {
    return [...new Set(products.map(p => p.description).filter(Boolean))];
  };

  const brands = getAllBrands();

  // Enhanced filtering and sorting with special category logic
  const filteredProducts = products
    .filter((product) => {
      // Handle type filtering with special cases
      let typeMatch = true;
      if (typeFilter) {
        if (typeFilter === "women") {
          // Women category includes women products only
          typeMatch = product.type === "women";
        } else if (typeFilter === "men") {
          // Men category includes men products only
          typeMatch = product.type === "men";
        } else if (typeFilter === "Box") {
          // Master-box category includes master products
          typeMatch = product.type === "master";
        } else {
          // Default exact match for other categories
          typeMatch = product.type === typeFilter;
        }
      }

      return (
        typeMatch &&
        (!brandFilter || product.description === brandFilter) &&
        (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
        (!minPrice || product.price >= parseFloat(minPrice)) &&
        (!maxPrice || product.price <= parseFloat(maxPrice)) &&
        (!searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.newprice || a.price) - (b.newprice || b.price);
        case "price-high":
          return (b.newprice || b.price) - (a.newprice || a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.id - a.id; // newest first
      }
    });

  const clearAllFilters = () => {
    setTypeFilter("");
    setBrandFilter("");
    setSizeFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchTerm("");
  };

  const handleCategoryClick = (categoryKey) => {
    setTypeFilter(categoryKey);
    // Scroll to products section
    document.getElementById('products-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-screen "
      >
        <FaSpinner className="animate-spin text-4xl text mb-4" />
        
      </motion.div>
    );
  }

  return <>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen "
    >
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Our Fragrance Collection</h1>
          <p className="text-xl mb-8 text-gray-600">Discover premium perfumes and captivating scents</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
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
              placeholder="Search fragrances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
            />
          </div>
        </motion.div>

        {/* Sale Section */}
        {saleProducts.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <motion.div 
              variants={saleVariants}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-3  text px-6 py-3 rounded-full mb-4 ">
                <FaFire className="text-xl" />
                <span className="text-lg font-bold text">SALE UP TO 50% OFF</span>
                <FaFire className="text-xl" />
              </div>

              <p className="text">Limited time offers on selected fragrances</p>
            </motion.div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {saleProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={`sale-${product.id}`}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative"
                  onMouseEnter={() => setHoveredId(`sale-${product.id}`)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="group bgunded-xl overflow-hidden   transition-all duration-300 cursor-pointer ">
                      {/* Hot Deal Badge */}
                      <div className="absolute top-3 left-3 text-white   px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1 bg">
                      
                        {getDiscountPercentage(product.price, product.newprice)}% OFF
                      </div>

                      {/* Image Container */}
                      <div className="relative overflow-hidden h-60 lg:h-96">
                        <Image
                          src={
                            hoveredId === `sale-${product.id}`
                              ? product.pictures?.[1] || product.pictures?.[0] || "/placeholder.png"
                              : product.pictures?.[0] || "/placeholder.png"
                          }
                          alt={product.name}
                          fill
                          className=" transition-transform h-80 duration-700 "
                          
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900">
                          {product.name}
                        </h3>

                        {/* Brand */}
                        {product.description && (
                          <p className="text-sm text-gray-500 mb-2">
                            {product.description}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text">
                            {product.newprice} LE
                          </span>
                          <span className="text-sm line-through text-gray-400">
                            {product.price} LE
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Sections */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              // Calculate category products with same logic as filtering
              const categoryProducts = products.filter(product => {
                if (category.key === "women") {
                  return product.type === "women";
                } else if (category.key === "men") {
                  return product.type === "men";
                } else if (category.key === "Box") {
                  return product.type === "master";
                } else {
                  return product.type === category.key;
                }
              });
              
              return (
                <motion.div
                  key={category.key}
                  variants={categoryVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-to-br ${category.bgColor} cursor-pointer p-8 text-center relative overflow-hidden   hover: transition-all duration-300 text-white min-h-[300px] flex items-center justify-center`}
                  onClick={() => handleCategoryClick(category.key)}
                  style={{
                    backgroundImage: category.image ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${category.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32  rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24  rounded-full translate-y-12 -translate-x-12"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-3 capitalize text-white ">{category.name}</h3>
                    <p className="text-lg opacity-90 mb-6">{category.description}</p>

                  </div>
                  
                  {/* Active Filter Indicator */}
                  {typeFilter === category.key && (
                    <div className="absolute top-4 right-4 bgxt-gray-900 px-3 py-1 rounded-full text-sm font-bold ">
                      Active
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Products Section */}
        <div id="products-section">
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bgunded-xl  p-6 mb-8 border border-gray-200"
          >
            {/* Active Category Display */}
            {typeFilter && (
              <div className="mb-4 p-4 bgrounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Filtering by:</span>
                    <span className="bg text-white px-3 py-1 rounded-full text-sm font-medium">
                      {categories.find(c => c.key === typeFilter)?.name}
                      {typeFilter === "Box" && ""}
                    </span>
                  </div>
                  <button
                    onClick={() => setTypeFilter("")}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Category
                  </button>
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 bgunded-lg focus:outline-none focus:ring-2 focus:ring-red-900 text"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              
              {/* Action Buttons */}
              <div className="ml-auto flex gap-3">
                <button
                  className="px-4 py-3 bg hover:bg rounded-lg text-lg font-medium text-white transition-colors"
                  onClick={clearAllFilters}
                >
                  X
                </button>
                
                <button
                  className="p-3 bg hover:bg text-white rounded-lg transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 
                    <FaFilterCircleXmark className="w-5 h-5" /> : 
                    <FaFilter className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  variants={filterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>

                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">All Sizes</option>
                      <option value="50ml">50ml</option>
                      <option value="100ml">100ml</option>
                      <option value="150ml">150ml</option>
                      <option value="200ml">200ml</option>
                      <option value="250ml">250ml</option>
                    </select>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Price:</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Counter */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> fragrances
              {typeFilter && (
                <span className="ml-2 text-sm">
                  in <span className="font-semibold">{categories.find(c => c.key === typeFilter)?.name}</span>
                  {typeFilter === "Box" && " (Master)"}
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 text-sm">
                  for "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Product Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="group bgunded-xl overflow-hidden  hover: transition-all duration-300 cursor-pointer">
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-60 md:h-72 lg:h-96 ">
                      <Image
                        src={
                          hoveredId === product.id
                            ? product.pictures?.[1] || product.pictures?.[0] || "/placeholder.png"
                            : product.pictures?.[0] || "/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        className=" text-white transition-transform h-80 duration-500 "

                        priority={index < 8}
                      />

                      {/* Sale Badge */}
                      {product.newprice && (
                      <div className="absolute top-3 left-3 text-white   px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1 bg">
                      
                        {getDiscountPercentage(product.price, product.newprice)}% OFF
                      </div>
                      )}

                      {/* Size Info */}
                      {product.sizes?.length > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black text-white px-2 py-1 rounded text-xs">
                          {product.sizes[0]}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium  mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Brand */}
                      {product.description && (
                        <p className="text-sm  mb-3">
                          {product.description}
                        </p>
                      )}
                      
                      {/* Price */}
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

                      {/* Available Sizes */}

                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl lg:text-6xl mb-4">🔍</div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No fragrances found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg hover:bg text-white rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>

      {/* صورة كـ background */}
 





  
  </>
}