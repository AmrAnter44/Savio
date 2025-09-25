"use client"

import React, { useState, useEffect } from "react"
import AddProduct from "../add"
import RemoveProduct from "../remove"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
}

const tabVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
}

const buttonVariants = {
  idle: { scale: 1 },
  active: {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  tap: { scale: 0.98 },
}

const revalidationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

/**
 * Dashboard محسن مع Manual Revalidation
 */
export default function DashboardWithRevalidation() {
  const [activeTab, setActiveTab] = useState("add")
  const [loading, setLoading] = useState(true)
  const [revalidating, setRevalidating] = useState(false)
  const [lastRevalidation, setLastRevalidation] = useState(null)
  const [cacheInfo, setCacheInfo] = useState(null)
  const router = useRouter()

  // تحقق من authentication
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/admin/login")
      } else {
        setLoading(false)
        fetchCacheInfo()
      }
    }
    checkAuth()
  }, [router])

  // جلب معلومات الcache
  const fetchCacheInfo = async () => {
    try {
      const response = await fetch('/api/revalidate', { method: 'GET' })
      const data = await response.json()
      setCacheInfo(data.cache)
    } catch (error) {
      console.error('Error fetching cache info:', error)
    }
  }

  // Manual revalidation للموقع كله
  const handleFullRevalidation = async () => {
    if (revalidating) return
    
    setRevalidating(true)
    
    try {
      console.log('🔄 Starting full site revalidation...')
      
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'full_update',
          paths: ['/', '/store'] // الصفحات الأساسية
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Full revalidation successful:', result)
        setLastRevalidation(new Date())
        
        // Update cache info
        await fetchCacheInfo()
        
        // Success notification
        alert('✅ Website updated successfully! Changes are now live.')
        
      } else {
        console.error('❌ Revalidation failed:', result.error)
        alert('❌ Update failed: ' + result.error)
      }

    } catch (error) {
      console.error('❌ Revalidation error:', error)
      alert('❌ Update failed: ' + error.message)
    } finally {
      setRevalidating(false)
    }
  }

  // مسح الcache فقط
  const handleCacheClear = async () => {
    try {
      const response = await fetch('/api/revalidate', { method: 'DELETE' })
      const result = await response.json()
      
      if (result.success) {
        await fetchCacheInfo()
        alert('🗑️ Cache cleared successfully!')
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      alert('❌ Failed to clear cache')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Checking authentication...
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with Manual Update */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-8"
        variants={revalidationVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100">
              Manage products and update the website manually for optimal performance
            </p>
            {lastRevalidation && (
              <p className="text-sm text-purple-200 mt-2">
                Last updated: {lastRevalidation.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cache Info */}
            {cacheInfo && (
              <div className="text-sm text-purple-100 bg-white/10 rounded-lg p-3">
                <div>Cache: {cacheInfo.hasCache ? '✅ Active' : '❌ Empty'}</div>
                {cacheInfo.hasCache && (
                  <div>{cacheInfo.cacheSize} products cached</div>
                )}
              </div>
            )}
            
            {/* Manual Update Button */}
            <motion.button
              onClick={handleFullRevalidation}
              disabled={revalidating}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                revalidating
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-gray-100'
              }`}
              variants={buttonVariants}
              initial="idle"
              whileHover={!revalidating ? "hover" : {}}
              whileTap={!revalidating ? "tap" : {}}
            >
              {revalidating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                '🚀 Update Website'
              )}
            </motion.button>
            
            {/* Clear Cache Button */}
            <motion.button
              onClick={handleCacheClear}
              className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              🗑️ Clear Cache
            </motion.button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 p-4 bg-white/10 rounded-lg">
          <h3 className="font-semibold mb-2">💡 How it works:</h3>
          <div className="text-sm space-y-1">
            <p>• Add/Edit/Delete products using the tabs below</p>
            <p>• Click "Update Website" to make changes live for visitors</p>
            <p>• The website uses cached data for ultra-fast loading</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-4 mb-6 justify-center items-center"
        variants={tabVariants}
      >
        <motion.button
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "add"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("add")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "add" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          ➕ Add Product
        </motion.button>

        <motion.button
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "remove"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("remove")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "remove" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          📝 Manage Products
        </motion.button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab === "add" && <AddProduct />}
          {activeTab === "remove" && <RemoveProduct />}
        </motion.div>
      </AnimatePresence>
      
      {/* Footer Instructions */}
      <motion.div 
        className="mt-12 p-6 bg-gray-50 rounded-xl border-l-4 border-purple-500"
        variants={revalidationVariants}
      >
        <h3 className="font-semibold text-gray-900 mb-3">🎯 Performance Tips:</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• This setup minimizes database calls and Vercel function usage</p>
          <p>• Products are cached in memory for ultra-fast loading</p>
          <p>• Manual updates ensure data consistency and optimal performance</p>
          <p>• Perfect for Supabase and Vercel free tiers</p>
        </div>
      </motion.div>
    </motion.div>
  )
}