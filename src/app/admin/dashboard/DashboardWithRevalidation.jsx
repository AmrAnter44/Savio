"use client"

import React, { useState, useEffect } from "react"
import AddProduct from "../add"
import RemoveProduct from "../remove"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function DashboardWithRevalidation() {
  const [activeTab, setActiveTab] = useState("add")
  const [loading, setLoading] = useState(true)
  const [revalidating, setRevalidating] = useState(false)
  const [lastRevalidation, setLastRevalidation] = useState(null)
  const [cacheInfo, setCacheInfo] = useState(null)
  const router = useRouter()

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

  const fetchCacheInfo = async () => {
    try {
      const response = await fetch('/api/revalidate', { method: 'GET' })
      const data = await response.json()
      setCacheInfo(data.cache)
    } catch (error) {
      console.error('Error fetching cache info:', error)
    }
  }

  const handleFullRevalidation = async () => {
    if (revalidating) return
    
    setRevalidating(true)
    
    try {
      console.log('🔒 Starting manual website update...')
      
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'full_update',
          paths: ['/', '/store']
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Manual update successful:', result)
        setLastRevalidation(new Date())
        await fetchCacheInfo()
        
        alert(`✅ Website updated successfully! 

📄 Static data has been refreshed with latest products from database.
🌐 Changes are now live on the website.
📊 Updated: ${result.freshProductsCount || 0} products`)
        
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 🔒 STATIC MODE WARNING */}
      <motion.div 
        className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">📄</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">🔒 Static Data Mode Active</h3>
            <div className="text-blue-100 text-sm space-y-1">
              <p>• <strong>Adding/editing products:</strong> Saved to database but NOT visible on website yet</p>
              <p>• <strong>Website visitors:</strong> See static data only (fast loading)</p>
              <p>• <strong>To make changes visible:</strong> Click "Update Website" button below</p>
              <p>• <strong>No automatic updates:</strong> Full manual control over when changes go live</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Header with Manual Update */}
      <motion.div 
        className="bg-gradient-to-r from-red-900 to-pink-900 text-white rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">
              Manage products and update the website manually for optimal performance
            </p>
            {lastRevalidation && (
              <p className="text-sm text-red-200 mt-2">
                Last updated: {lastRevalidation.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cache Info */}
            {cacheInfo && (
              <div className="text-sm text-red-100 bg-white/10 rounded-lg p-3">
                <div>Static Data: {cacheInfo.hasCache ? '✅ Available' : '❌ Empty'}</div>
                {cacheInfo.hasCache && (
                  <div>{cacheInfo.cacheSize} products in static file</div>
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
                  : 'bg-white text-red-900 hover:bg-gray-100'
              }`}
              whileHover={!revalidating ? { scale: 1.02 } : {}}
              whileTap={!revalidating ? { scale: 0.98 } : {}}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🗑️ Clear Cache
            </motion.button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 p-4 bg-white/10 rounded-lg">
          <h3 className="font-semibold mb-2">💡 How it works:</h3>
          <div className="text-sm space-y-1">
            <p>• Add/Edit/Delete products using the tabs below (saved to database)</p>
            <p>• Products are NOT visible to customers until you update</p>
            <p>• Click "Update Website" to copy database → static file → live website</p>
            <p>• Website loads from static file = ultra-fast performance</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-4 mb-6 justify-center items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "add"
              ? "bg-red-900 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("add")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ➕ Add Product
        </motion.button>

        <motion.button
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "remove"
              ? "bg-red-900 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("remove")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📝 Manage Products
        </motion.button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "add" && <AddProduct />}
          {activeTab === "remove" && <RemoveProduct />}
        </motion.div>
      </AnimatePresence>
      
      {/* Footer Instructions */}
      <motion.div 
        className="mt-12 p-6 bg-gray-50 rounded-xl border-l-4 border-red-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3 className="font-semibold text-gray-900 mb-3">🎯 Static Data Benefits:</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• <strong>Lightning fast:</strong> Website loads from static files, not database</p>
          <p>• <strong>Zero database load:</strong> Visitors never hit the database</p>
          <p>• <strong>Perfect for SSG:</strong> Works with Next.js static generation</p>
          <p>• <strong>Manual control:</strong> You decide exactly when changes go live</p>
          <p>• <strong>Reliable:</strong> Website works even if database is down</p>
        </div>
      </motion.div>
    </motion.div>
  )
}