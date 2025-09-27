"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants (keeping the same as original)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const backdropVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95
  }
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const searchVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    transition: {
      duration: 0.2
    }
  }
};

const confirmationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function ManageFragrances() {
  const [products, setProducts] = useState([]);
  const [staticProducts, setStaticProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staticLoading, setStaticLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastStaticUpdate, setLastStaticUpdate] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editSizes, setEditSizes] = useState([]);
  const [editType, setEditType] = useState("");
  const [editPictures, setEditPictures] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fragrance-specific options
  const sizeOptions = ["50ml", "100ml", "150ml", "200ml", "250ml"];
  const typeOptions = ["women", "men", "master"]; // master for Box category
  const brandOptions = [
    "Chanel", "Dior", "Tom Ford", "Creed", "Hermès", "Yves Saint Laurent",
    "Versace", "Gucci", "Prada", "Armani", "Calvin Klein", "Hugo Boss",
    "Dolce & Gabbana", "Viktor & Rolf", "Jean Paul Gaultier", "Thierry Mugler",
    "Maison Margiela", "Byredo", "Le Labo", "Diptyque", "Other"
  ];

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    );
  }, [products, searchTerm]);

  // Fetch static products (what visitors see) - from generated files
  const fetchStaticProducts = async () => {
    setStaticLoading(true);
    try {
      // Try to fetch from the actual static files that visitors see
      const response = await fetch('/products.json', { 
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaticProducts(data || []);
        
        // Try to get last update from a meta file or headers
        try {
          const metaResponse = await fetch('/api/site-meta');
          if (metaResponse.ok) {
            const metaData = await metaResponse.json();
            setLastStaticUpdate(metaData.lastStaticUpdate);
          }
        } catch (metaError) {
          console.log('No meta endpoint available');
          setLastStaticUpdate(null);
        }
      } else {
        console.log('No static products file found - all products will show as pending');
        setStaticProducts([]);
      }
    } catch (error) {
      console.log('Static products file not accessible - showing database only');
      setStaticProducts([]);
    } finally {
      setStaticLoading(false);
    }
  };

  const checkStorageSetup = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Storage check error:', error);
        setMessage('Call 01028518754');
        return;
      }

      const bucketExists = data.some(bucket => bucket.name === 'product-images');
      
    } catch (error) {
      console.error('Storage setup check failed:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
        
      if (error) {
        console.error(error);
        setMessage("Error loading fragrances: " + error.message);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error loading fragrances: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorageSetup();
    fetchProducts();
    fetchStaticProducts();
  }, []);

  const showDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);

    try {
      const productId = productToDelete.uuid || productToDelete.id;
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Keep the HTTP status message
          }
        }
        
        setMessage(errorMessage);
        setTimeout(() => setMessage(""), 5000);
        return;
      }

      // DON'T trigger revalidation for new products - only update database
      // try {
      //   await fetch('/api/revalidate', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ action: 'delete', productId: productId })
      //   });
      // } catch (revError) {
      //   console.warn('Revalidation request failed:', revError);
      // }

      setMessage("تم حذف العطر من قاعدة البيانات بنجاح! التغيير مؤقت - اضغط 'تحديث الموقع' لتطبيق التغيير على الموقع.");
      fetchProducts();
      // Don't refresh static products automatically
      setTimeout(() => setMessage(""), 6000);
      
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Error deleting fragrance: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setDeleting(false);
      setShowConfirmation(false);
      setProductToDelete(null);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price);
    setEditNewPrice(prod.newprice || "");
    setEditBrand(prod.brand || "");
    setEditSizes(prod.sizes || []);
    setEditType(prod.type || "");
    setEditPictures(prod.pictures || []);
  };

  const toggleSize = (size) => {
    setEditSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Image resize function
  const resizeImage = (file, targetWidth = 768, targetHeight = 950) => {
    return new Promise((resolve) => {
      // Create image element properly for browser environment
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onload = (e) => { 
        img.src = e.target.result; 
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { 
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, 0.8); // 0.8 quality for better compression
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setMessage("Processing images...");
    
    try {
      const processedFiles = [];
      const uploadedUrls = [];

      // First, resize all images
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          setMessage(`File ${file.name} is not an image`);
          continue;
        }

        if (file.size > 5242880) {
          console.warn(`File too large: ${file.name}`);
          setMessage(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        // Resize the image
        const resizedFile = await resizeImage(file);
        processedFiles.push(resizedFile);
      }

      if (processedFiles.length === 0) {
        setMessage("No valid images to process");
        setUploadingImages(false);
        return;
      }

      setMessage("Uploading images...");

      // Now upload the resized images
      for (const file of processedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3900',
            upsert: false
          });

        if (error) {
          console.error('Upload error for', file.name, ':', error);
          
          if (error.message.includes('Bucket not found')) {
            setMessage('Storage bucket "product-images" not found. Please create it manually in Supabase Dashboard');
            setTimeout(() => setMessage(""), 10000);
            break;
          } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
            setMessage('RLS Policy Error: Please run the SQL commands to fix storage policies');
            setTimeout(() => setMessage(""), 15000);
            break;
          } else if (error.message.includes('permission') || error.message.includes('denied')) {
            setMessage('Permission denied. Please check your Supabase storage policies');
            setTimeout(() => setMessage(""), 8000);
            break;
          } else {
            setMessage(`Error uploading ${file.name}: ${error.message}`);
          }
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setEditPictures(prev => [...prev, ...uploadedUrls]);
        setMessage(`Successfully uploaded ${uploadedUrls.length} image(s)`);
        setTimeout(() => setMessage(""), 3000);
      } else if (uploadedUrls.length === 0 && processedFiles.length > 0) {
        setMessage("No images were uploaded successfully");
        setTimeout(() => setMessage(""), 3000);
      }

    } catch (error) {
      console.error('Image upload error:', error);
      setMessage("Error uploading images: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = editPictures[indexToRemove];
    
    try {
      if (imageUrl && imageUrl.includes('/product-images/')) {
        const urlParts = imageUrl.split('/product-images/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error } = await supabase.storage
          .from('product-images')
          .remove([fileName]);
          
        if (error) {
          console.error('Error deleting image from storage:', error);
        }
      }
    } catch (error) {
      console.error('Storage delete error:', error);
    }
    
    setEditPictures(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveEdit = async () => {
    // تحقق من البيانات المطلوبة
    const requiredFields = [];
    
    if (!editName.trim()) requiredFields.push("اسم البرفان");
    if (!editPrice || editPrice <= 0) requiredFields.push("السعر");
    if (!editBrand) requiredFields.push("البراند");
    if (editSizes.length === 0) requiredFields.push("الأحجام");
    if (!editType) requiredFields.push("الفئة");
    
    if (requiredFields.length > 0) {
      setMessage(`برجاء إدخال: ${requiredFields.join(" - ")}`);
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    
    // تحقق من صحة السعر
    if (editNewPrice && (isNaN(editNewPrice) || editNewPrice <= 0)) {
      setMessage("سعر التخفيض يجب أن يكون رقم صحيح أكبر من الصفر");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    // تحقق من وجود صور
    if (editPictures.length === 0) {
      setMessage("برجاء إضافة صورة واحدة على الأقل للبرفان");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const productId = editingProduct.uuid || editingProduct.id;
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          newprice: editNewPrice ? Number(editNewPrice) : null,
          brand: editBrand,
          sizes: editSizes,
          type: editType,
          pictures: editPictures
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update fragrance");
      }

      // DON'T trigger revalidation automatically - let admin control when to update site
      // try {
      //   await fetch('/api/revalidate', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ action: 'update', productId: productId })
      //   });
      // } catch (revError) {
      //   console.warn('Revalidation request failed:', revError);
      // }

      setEditingProduct(null);
      setMessage("تم تحديث العطر في قاعدة البيانات! التغيير مؤقت - اضغط 'تحديث الموقع' لتطبيق التغيير على الموقع.");
      fetchProducts();
      // Don't automatically refresh static products
      setTimeout(() => setMessage(""), 6000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Error updating fragrance: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const getCategoryDisplayName = (type) => {
    if (type === 'master') return 'Master-Box';
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  };

  return (
    <motion.div 
      className="p-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Manage Fragrances
      </motion.h1>

      {/* Data Comparison Banner */}
      <motion.div 
        className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="font-semibold text-blue-800 mb-2">📊 Database Management Mode</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>⚠️ ما تراه هنا:</strong> {products.length} منتج من قاعدة البيانات (أحدث التغييرات)</p>
          <p><strong>👥 ما يراه الزوار:</strong> {staticProducts.length} منتج من البيانات الثابتة 
            {lastStaticUpdate && (
              <span> (آخر تحديث: {new Date(lastStaticUpdate).toLocaleString('ar-EG')})</span>
            )}
          </p>
          <p><strong>🔄 للمزامنة:</strong> اضغط "تحديث الموقع" في الداشبورد بعد الانتهاء من التعديلات</p>
          {staticProducts.length === 0 && (
            <p className="text-orange-600 font-medium">
              ⚠️ لا توجد بيانات ثابتة - جميع المنتجات ستظهر كـ "Pending" حتى يتم تحديث الموقع
            </p>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative">
          <motion.input
            type="text"
            placeholder="Search fragrances by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-900 transition-all duration-200"
            variants={searchVariants}
            whileFocus="focus"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </div>
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search Results Info */}
        <AnimatePresence>
          {searchTerm && (
            <motion.p 
              className="text-sm text-gray-900 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length === 0 
                ? `No fragrances found for "${searchTerm}"` 
                : `Found ${filteredProducts.length} fragrance${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
              }
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.p 
            className={`text-center mb-4 p-3 rounded ${
              message.includes("successfully") || message.includes("بنجاح") 
                ? "text-green-900 bg-green-50" 
                : "text-red-900 bg-red-50"
            }`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-gray-300 border-t-red-900 rounded-full mb-4"
            variants={loadingVariants}
            animate="animate"
          />
          <p className="text-center">Loading fragrances...</p>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-4">🌸</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No fragrances found' : 'No fragrances yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Try searching for something else or clear the search to see all fragrances.` 
              : 'Add your first fragrance to get started!'
            }
          </p>
          {searchTerm && (
            <motion.button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-red-900 text-white rounded hover:bg-red-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Show All Fragrances
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* Products Grid */
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          key={searchTerm}
        >
          {filteredProducts.map((prod, index) => (
            <motion.div
              key={prod.uuid || prod.id}
              className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition"
              variants={cardVariants}
              whileHover="hover"
              custom={index}
              layout
            >
              {/* Badge to show if product is in static data */}
              <div className="absolute top-2 right-2 z-10">
                {staticProducts.some(sp => (sp.uuid || sp.id) === (prod.uuid || prod.id)) ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Live</span>
                ) : (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">⏳ Pending</span>
                )}
              </div>

              <motion.div
                className="lg:w-full h-72 lg:h-58 mb-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Image
                  src={prod.pictures?.[0] || "/placeholder.png"}
                  alt={prod.name}
                  width={400}
                  height={550}
                  className="rounded object-cover w-full h-full"
                />
              </motion.div>

              <motion.h2 
                className="font-semibold text-lg text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {prod.name}
              </motion.h2>

              <motion.div
                className="text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.15 }}
              >
                {prod.brand && <p className="text-gray-500 text-sm font-medium">{prod.brand}</p>}
                <p className="text-gray-700 font-medium">{prod.price} LE</p>
                {prod.newprice && <p className="text-red-500 font-medium">Sale: {prod.newprice} LE</p>}
              </motion.div>

              <motion.div
                className="text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {prod.type && (
                  <p className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full inline-block mb-1">
                    {getCategoryDisplayName(prod.type)}
                  </p>
                )}
                {prod.sizes && prod.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {prod.sizes.map((size, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
                        {size}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}