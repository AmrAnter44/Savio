"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error

      setPromotions(data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
      setMessage('❌ خطأ في تحميل العروض: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePromotion = async (promotionId, currentStatus) => {
    try {
      setUpdating(true)
      setMessage("")

      // ✅ إيقاف جميع العروض الأخرى أولاً (عرض واحد فقط نشط في نفس الوقت)
      if (!currentStatus) {
        await supabase
          .from('promotions')
          .update({ is_active: false })
          .neq('id', promotionId)
      }

      // ✅ تفعيل/إيقاف العرض المحدد
      const { error } = await supabase
        .from('promotions')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', promotionId)

      if (error) throw error

      // ✅ تحديث الموقع ليعكس التغييرات
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'promotion_update',
            paths: ['/', '/store', '/checkout', '/cart']
          })
        })
      } catch (revError) {
        console.warn('Revalidation warning:', revError)
      }

      await fetchPromotions()

      setMessage(`✅ تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} العرض بنجاح!`)
      setTimeout(() => setMessage(""), 3000)

    } catch (error) {
      console.error('Error toggling promotion:', error)
      setMessage('❌ خطأ في تحديث العرض: ' + error.message)
      setTimeout(() => setMessage(""), 5000)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-red-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-gray-900"
        variants={itemVariants}
      >
        🎁 إدارة العروض الترويجية
      </motion.h2>

      <AnimatePresence>
        {message && (
          <motion.div
            className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
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

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
      >
        {promotions.map((promo, index) => (
          <motion.div
            key={promo.id}
            className={`border-2 rounded-xl p-6 transition-all ${
              promo.is_active 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
            variants={itemVariants}
            custom={index}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {promo.name}
                  </h3>
                  {promo.is_active && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      مفعّل الآن
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-3">
                  {promo.type === 'buy_2_get_1' 
                    ? '🎉 عند شراء 3 منتجات، يتم الحساب على الاثنين الأغلى فقط'
                    : 'عرض ترويجي'}
                </p>

                {promo.is_active && (
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      ✨ كيف يعمل العرض:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• العميل يضيف 3 منتجات (أو مضاعفاتها)</li>
                      <li>• يتم حساب السعر على الاثنين الأغلى فقط</li>
                      <li>• الوفورات تظهر تلقائياً في السلة والـ Checkout</li>
                      <li>• يظهر بانر "Buy 2 Get 1 Free" في الصفحة الرئيسية</li>
                    </ul>
                  </div>
                )}
              </div>

              <motion.button
                onClick={() => togglePromotion(promo.id, promo.is_active)}
                disabled={updating}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  promo.is_active
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={!updating ? { scale: 1.05 } : {}}
                whileTap={!updating ? { scale: 0.95 } : {}}
              >
                {updating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحديث...</span>
                  </div>
                ) : (
                  promo.is_active ? '⏸️ إيقاف العرض' : '▶️ تفعيل العرض'
                )}
              </motion.button>
            </div>

            {promo.is_active && (
              <motion.div
                className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">ملاحظة هامة:</p>
                    <p>تأكد من الضغط على "تحديث فوري" في الداشبورد الرئيسي لتظهر التغييرات للزوار.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl"
        variants={itemVariants}
      >
        <h4 className="font-semibold text-blue-900 mb-3">
          📊 معلومات إضافية:
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• يمكن تفعيل عرض واحد فقط في نفس الوقت</p>
          <p>• العرض يطبق تلقائياً على جميع المنتجات في الموقع</p>
          <p>• الحسابات تتم بناءً على السعر النهائي للمنتج (بعد الخصم إن وُجد)</p>
          <p>• التحديثات تحتاج ضغطة زر "تحديث فوري" لتظهر للزوار</p>
        </div>
      </motion.div>
    </motion.div>
  )
}