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

  const handleISRRevalidation = async () => {
    if (revalidating) return
    
    setRevalidating(true)
    
    try {
      console.log('🔄 ISR: Triggering manual revalidation...')
      
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'isr_revalidate',
          paths: ['/', '/store'],
          mode: 'isr'
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ ISR revalidation successful:', result)
        setLastRevalidation(new Date())
        await fetchCacheInfo()
        
        alert(`✅ تم تحديث الموقع بنجاح! 

🔄 ISR: البيانات ستُحدث تلقائياً خلال دقائق
🌐 التغييرات ستظهر للزوار تدريجياً
📊 تم إعادة بناء الصفحات الثابتة
⚡ صفر استعلامات على قاعدة البيانات في المستقبل

الموقع الآن يعمل بنظام ISR - تحديث تلقائي كل 24 ساعة!`)
        
      } else {
        console.error('❌ ISR revalidation failed:', result.error)
        alert('❌ فشل التحديث: ' + (result.error || 'خطأ غير معروف'))
      }
      
    } catch (error) {
      console.error('❌ ISR revalidation error:', error)
      alert('❌ فشل التحديث: ' + error.message)
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
        alert('🗑️ تم مسح الكاش بنجاح! سيتم إعادة البناء في التحديث التالي.')
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      alert('❌ فشل في مسح الكاش')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        جاري التحقق من المصادقة...
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >



      {/* Header with ISR Info */}
      <motion.div 
        className="bg-gradient-to-r from-black to-red-900 text-white rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">لوحة التحكم - ISR Mode</h1>
            <p className="text-red-100">
              إدارة المنتجات مع تحديث تلقائي ذكي
            </p>
            {lastRevalidation && (
              <p className="text-sm text-red-200 mt-2">
                آخر تحديث يدوي: {lastRevalidation.toLocaleString('ar-EG')}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cache Info */}
            {cacheInfo && (
              <div className="text-sm text-red-100 bg-white/10 rounded-lg p-3">
                <div><strong>نظام ISR:</strong></div>
                <div>{cacheInfo.hasCache ? '✅ نشط' : '🔄 قيد البناء'}</div>
                {cacheInfo.hasCache && (
                  <div>{cacheInfo.cacheSize} منتج محفوظ</div>
                )}
                <div className="text-xs mt-1">🔄 تحديث تلقائي كل 24 ساعة</div>
              </div>
            )}
            
            {/* ISR Manual Revalidation Button */}
            <motion.button
              onClick={handleISRRevalidation}
              disabled={revalidating}
              className={`px-6 py-3 rounded-lg font-semibold transition-all text-lg ${
                revalidating
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-white text-red-900 hover:bg-gray-100 shadow-lg'
              }`}
              whileHover={!revalidating ? { scale: 1.02 } : {}}
              whileTap={!revalidating ? { scale: 0.98 } : {}}
            >
              {revalidating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  جاري التحديث...
                </span>
              ) : (
                '🔄 تحديث فوري (ISR)'
              )}
            </motion.button>
            
            {/* Clear Cache Button */}
            <motion.button
              onClick={handleCacheClear}
              className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🗑️ مسح الكاش
            </motion.button>
          </div>
        </div>
        
        {/* ISR Instructions */}
        <div className="mt-4 p-4 bg-white/10 rounded-lg">
          <h3 className="font-semibold mb-2"> كيف يعمل نظام ISR:</h3>
          <div className="text-sm space-y-1">
            <p>• أضف/عدل المنتجات → <strong>يُحفظ في قاعدة البيانات</strong></p>
            <p>• الموقع يتحديث  ليعرض آخر التغييرات</p>
            <p>• للتحديث الفوري → اضغط "تحديث فوري (ISR)"</p>
            <p>• الزوار يستمتعون بـ <strong>سرعة فائقة</strong> - صفر انتظار لاستعلامات قاعدة البيانات</p>
          </div>
        </div>
        
        {/* ISR Benefits */}
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <h4 className="font-semibold text-red-200 mb-2">🚀 مميزات نظام ISR:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-red-100">
            <div>• صفر استعلامات في Runtime</div>
            <div>• تحديث تلقائي ذكي</div>
            <div>• سرعة فائقة للزوار</div>
            <div>• توفير 90%+ في استهلاك Supabase</div>
            <div>• SEO ممتاز</div>
            <div>• تحديث فوري عند الحاجة</div>
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
          ➕ إضافة منتج جديد
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
          📝 إدارة المنتجات
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
      
  
    </motion.div>
  )
}