"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"

// Animation variants (same as original)
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
}

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

/**
 * Add Fragrance Product with Strict Manual Update Messages
 */
export default function AddFragranceProduct() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [brand, setBrand] = useState("")
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [sizes, setSizes] = useState([])
  const [type, setType] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [newprice, setNewprice] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)

  // Updated options for fragrances
  const sizeOptions = ["50ml", "100ml", "150ml", "200ml", "250ml"]
  const typeOptions = ["women", "men", "master","unisex"] // master for Box category
  const brandOptions = [
    "Chanel", "Dior", "Tom Ford", "Creed", "Hermès", "Yves Saint Laurent",
    "Versace", "Gucci", "Prada", "Armani", "Calvin Klein", "Hugo Boss",
    "Dolce & Gabbana", "Viktor & Rolf", "Jean Paul Gaultier", "Thierry Mugler",
    "Maison Margiela", "Byredo", "Le Labo", "Diptyque","Lattfa", "Other"
  ]

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((v) => v !== value))
    } else {
      setState([...state, value])
    }
  }

  // Image resize function
  const resizeImage = (file, targetWidth = 768, targetHeight = 950) => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => { 
        img.src = e.target.result 
      }

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { 
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        }, file.type, 0.8)
      }

      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploadingImages(true)
    setMessage("جاري معالجة الصور...")

    try {
      const resizedFiles = []
      const previews = []

      for (let file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`)
          setMessage(`الملف ${file.name} ليس صورة`)
          continue
        }

        if (file.size > 5242880) {
          console.warn(`File too large: ${file.name}`)
          setMessage(`الملف ${file.name} كبير جداً (أقصى حد 5 ميجا)`)
          continue
        }

        const resizedFile = await resizeImage(file)
        resizedFiles.push(resizedFile)
        
        const previewUrl = URL.createObjectURL(resizedFile)
        previews.push(previewUrl)
      }

      setFiles(prevFiles => [...prevFiles, ...resizedFiles])
      setPreviewUrls(prevPreviews => [...prevPreviews, ...previews])
      setMessage("")
    } catch (error) {
      console.error('Image processing error:', error)
      setMessage("خطأ في معالجة الصور: " + error.message)
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove])
    
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove))
    setPreviewUrls(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove))
  }

  const uploadImages = async () => {
    const pictureUrls = []

    for (let file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Upload error for', file.name, ':', error)
          setMessage(`خطأ في رفع ${file.name}: ${error.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          pictureUrls.push(urlData.publicUrl)
        }

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        setMessage(`خطأ في رفع ${file.name}: ${error.message}`)
        continue
      }
    }

    return pictureUrls
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!name || !price || !brand || sizes.length === 0 || !type || files.length === 0) {
      setMessage("برجاء ملء جميع الحقول المطلوبة.")
      setLoading(false)
      return
    }

    try {
      setMessage("جاري رفع الصور...")
      const pictureUrls = await uploadImages()

      if (pictureUrls.length === 0) {
        setMessage("لم يتم رفع أي صور بنجاح. برجاء المحاولة مرة أخرى.")
        setLoading(false)
        return
      }

      setMessage("جاري إنشاء المنتج...")

      const product = {
        name,
        price: Number(price),
        newprice: newprice ? Number(newprice) : null,
        brand: brand,
        pictures: pictureUrls,
        sizes,
        type,
        owner_id: "admin"
      }

      console.log('Sending product data:', product)

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })

      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Received non-JSON response:', text)
        throw new Error('السيرفر أرجع HTML بدلاً من JSON. تأكد من وجود API route.')
      }

      const result = await res.json()

      if (res.ok) {
        // Clean URLs from memory
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        
        // Reset form
        setName("")
        setPrice("")
        setNewprice("")
        setBrand("")
        setFiles([])
        setPreviewUrls([])
        setSizes([])
        setType("")
        
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''
        
        setMessage(`✅ تم حفظ "${name}" في قاعدة البيانات بنجاح!

🔒 هام: المنتج محفوظ في قاعدة البيانات لكن لن يظهر للزوار حتى تضغط "تحديث الموقع" من الداشبورد.

💡 هذا يتيح لك إضافة عدة منتجات ثم نشرها جميعاً مرة واحدة.`)
        
        setTimeout(() => setMessage(""), 15000)
        
      } else {
        setMessage("خطأ: " + (result.error || "خطأ في إضافة المنتج"))
        setTimeout(() => setMessage(""), 5000)
      }

    } catch (err) {
      console.error('Submit error:', err)
      setMessage("خطأ: " + err.message)
      setTimeout(() => setMessage(""), 5000)
    }

    setLoading(false)
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-4 p-4 max-w-lg mx-auto"
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
        إضافة عطر جديد
      </motion.h1>

      {/* Manual Update Notice */}
      <motion.div 
        className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
        variants={inputVariants}
      >
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>🔒</span>
          نظام Manual Update Only مُفعّل
        </h4>
        <ul className="space-y-1 text-xs">
          <li>• العطر سيُحفظ في قاعدة البيانات</li>
          <li>• <strong>لن يظهر للزوار</strong> حتى تضغط "تحديث الموقع"</li>
          <li>• يمكنك إضافة عدة منتجات ثم نشرها جميعاً مرة واحدة</li>
          <li>• هذا يتيح لك التحكم الكامل في وقت النشر</li>
        </ul>
      </motion.div>

      {/* Fragrance Name */}
      <motion.input 
        type="text" 
        placeholder="اسم العطر *" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-red-500 focus:border-transparent" 
        required 
        variants={inputVariants}
      />
      
      {/* Price */}
      <motion.input 
        type="number" 
        placeholder="السعر (جنيه مصري) *" 
        value={price} 
        onChange={(e) => setPrice(e.target.value)} 
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-red-500 focus:border-transparent" 
        required 
        variants={inputVariants}
      />
      
      {/* Sale Price */}
      <motion.input 
        type="number" 
        placeholder="سعر التخفيض (اختياري)" 
        value={newprice} 
        onChange={(e) => setNewprice(e.target.value)} 
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-red-500 focus:border-transparent" 
        variants={inputVariants}
      />

      {/* Brand */}
      <motion.div variants={inputVariants}>
        <select 
          value={brand} 
          onChange={(e) => setBrand(e.target.value)} 
          className="p-3 border rounded-md w-full focus:ring-2 focus:ring-red-500 focus:border-transparent" 
          required
        >
          <option value="">اختر البراند *</option>
          {brandOptions.map((brandOption) => (
            <option key={brandOption} value={brandOption}>
              {brandOption}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Type */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">الفئة (مطلوب) *:</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <motion.button 
              key={t} 
              type="button" 
              onClick={() => setType(t)} 
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                type === t 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t === 'master' ? 'Master-Box' : t.charAt(0).toUpperCase() + t.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sizes */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">الأحجام (مطلوب) *:</p>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <motion.button 
              key={size} 
              type="button" 
              onClick={() => handleCheckboxChange(size, sizes, setSizes)} 
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                sizes.includes(size) 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Images Upload */}
      <motion.div variants={inputVariants}>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={uploadingImages}
          />
          <label 
            htmlFor="image-upload" 
            className={`cursor-pointer text-red-600 hover:text-red-700 font-medium text-lg ${
              uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingImages ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                جاري معالجة الصور...
              </span>
            ) : (
              '📷 اختر صور العطر *'
            )}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            اختر عدة صور (أقصى حد 5 ميجا لكل صورة)<br />
            سيتم تغيير حجم الصور تلقائياً إلى 768x950 بكسل<br />
            يمكنك إضافة المزيد من الصور بالاختيار مرة أخرى
          </p>
        </div>
      </motion.div>
      
      {/* Image Previews */}
      <AnimatePresence>
        {previewUrls.length > 0 && (
          <motion.div 
            className="grid grid-cols-4 gap-3 mt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {previewUrls.map((url, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={url} 
                  alt={`Preview ${i + 1}`} 
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" 
                />
                <motion.button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div 
            className={`p-4 rounded-lg text-center font-medium whitespace-pre-line ${
              message.includes("بنجاح") || message.includes("✅") 
                ? "text-green-700 bg-green-50 border border-green-200" 
                : message.includes("جاري") || message.includes("معالجة") || message.includes("رفع")
                ? "text-blue-700 bg-blue-50 border border-blue-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button 
        type="submit" 
        disabled={loading || uploadingImages} 
        className={`mt-4 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          loading || uploadingImages
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg text-white shadow-lg hover:shadow-xl"
        }`}
        variants={inputVariants}
        whileHover={!loading && !uploadingImages ? { scale: 1.02, y: -2 } : {}}
        whileTap={!loading && !uploadingImages ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={loading ? "loading" : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                جاري إضافة العطر...
              </>
            ) : uploadingImages ? (
              "جاري معالجة الصور..."
            ) : (
              "💾 حفظ في قاعدة البيانات"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Bottom Warning */}
      <motion.div 
        className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
        variants={inputVariants}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-medium mb-1">تذكر:</div>
            <div>العطر سيُحفظ في قاعدة البيانات لكن <strong>لن يظهر للزوار</strong> حتى تضغط "تحديث الموقع" في الداشبورد.</div>
          </div>
        </div>
      </motion.div>
    </motion.form>
  )
}