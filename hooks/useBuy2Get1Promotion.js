"use client"

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'

/**
 * ✅ Hook لحساب عرض Buy 2 Get 1 Free
 * يحسب السعر النهائي بناءً على العرض النشط
 */
export function useBuy2Get1Promotion(cart) {
  const [activePromotion, setActivePromotion] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ جلب العرض النشط من قاعدة البيانات
  useEffect(() => {
    const fetchActivePromotion = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .eq('type', 'buy_2_get_1')
          .single()

        if (!error && data) {
          setActivePromotion(data)
        } else {
          setActivePromotion(null)
        }
      } catch (error) {
        console.error('Error fetching promotion:', error)
        setActivePromotion(null)
      } finally {
        setLoading(false)
      }
    }

    fetchActivePromotion()

    // ✅ Realtime subscription للتحديثات الفورية
    const subscription = supabase
      .channel('promotions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          fetchActivePromotion()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ✅ حساب التفاصيل بناءً على العرض
  const promotionDetails = useMemo(() => {
    if (!activePromotion || !cart || cart.length === 0) {
      return {
        isActive: false,
        totalItems: 0,
        originalTotal: 0,
        finalTotal: 0,
        savings: 0,
        freeItemsCount: 0,
        message: null
      }
    }

    // حساب عدد العناصر الإجمالي
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    // حساب السعر الأصلي
    const originalTotal = cart.reduce((sum, item) => {
      const price = item.newprice || item.price
      return sum + (price * item.quantity)
    }, 0)

    // إذا كان العدد أقل من 3، لا يطبق العرض
    if (totalItems < 3) {
      return {
        isActive: false,
        totalItems,
        originalTotal,
        finalTotal: originalTotal,
        savings: 0,
        freeItemsCount: 0,
        message: `أضف ${3 - totalItems} منتج آخر للحصول على عرض Buy 2 Get 1 Free`
      }
    }

    // ✅ تطبيق عرض Buy 2 Get 1 Free
    // حساب عدد المجموعات (كل 3 منتجات = مجموعة واحدة)
    const sets = Math.floor(totalItems / 3)
    const remainingItems = totalItems % 3

    // إنشاء قائمة بجميع المنتجات مع الأسعار
    const allItems = []
    cart.forEach(item => {
      const price = item.newprice || item.price
      for (let i = 0; i < item.quantity; i++) {
        allItems.push({
          ...item,
          unitPrice: price,
          quantity: 1
        })
      }
    })

    // ترتيب المنتجات من الأغلى للأرخص
    allItems.sort((a, b) => b.unitPrice - a.unitPrice)

    // حساب السعر النهائي
    let finalTotal = 0
    let freeItemsCount = 0

    // معالجة المجموعات الكاملة (كل 3 منتجات)
    for (let i = 0; i < sets; i++) {
      const setStart = i * 3
      // ندفع ثمن الاثنين الأغلى فقط
      finalTotal += allItems[setStart].unitPrice // الأول (الأغلى)
      finalTotal += allItems[setStart + 1].unitPrice // الثاني
      // الثالث مجاني
      freeItemsCount++
    }

    // إضافة المنتجات المتبقية (أقل من 3)
    for (let i = sets * 3; i < totalItems; i++) {
      finalTotal += allItems[i].unitPrice
    }

    const savings = originalTotal - finalTotal

    return {
      isActive: true,
      totalItems,
      originalTotal,
      finalTotal,
      savings,
      freeItemsCount,
      message: freeItemsCount > 0 
        ? `🎉 مبروك! حصلت على ${freeItemsCount} منتج مجاناً`
        : null
    }
  }, [activePromotion, cart])

  return {
    ...promotionDetails,
    loading,
    hasActivePromotion: !!activePromotion
  }
}

/**
 * ✅ Hook للتحقق من وجود عرض نشط (للاستخدام في الصفحة الرئيسية)
 */
export function useHasActivePromotion() {
  const [hasPromotion, setHasPromotion] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPromotion = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('id')
          .eq('is_active', true)
          .eq('type', 'buy_2_get_1')
          .single()

        setHasPromotion(!error && !!data)
      } catch (error) {
        setHasPromotion(false)
      } finally {
        setLoading(false)
      }
    }

    checkPromotion()

    // Realtime subscription
    const subscription = supabase
      .channel('promotions_check')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          checkPromotion()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { hasPromotion, loading }
}