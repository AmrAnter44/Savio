// app/api/revalidate/route.js - تحديث للـ Manual Update فقط
import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { clearProductsCache, getCacheInfo, forceRefreshAllData } from "@/lib/productService"

// Simple admin check
function isAuthorized(request) {
  try {
    const authHeader = request.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_TOKEN || ''
    if (!expected) return true
    return authHeader === expected
  } catch {
    return false
  }
}

/**
 * ✅ UPDATED: POST /api/revalidate - Force Manual Update
 */
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { paths, action, productId } = body

    console.log("🔄 Manual revalidation request:", { action, productId, paths })

    // ✅ 1. مسح الcache الحالي
    clearProductsCache()
    console.log("🗑️ Cleared in-memory cache")

    // ✅ 2. جلب البيانات الجديدة من Supabase قسرياً
    console.log("📡 Force fetching fresh data from Supabase...")
    await forceRefreshAllData()
    console.log("✅ Fresh data loaded into cache")

    // ✅ 3. تحديد الصفحات المطلوب تحديثها
    const defaultPaths = ["/", "/store"]
    let pathsToRevalidate = paths || defaultPaths

    if (action && productId) {
      switch (action) {
        case "add":
        case "full_update":
          pathsToRevalidate = [...defaultPaths]
          break
        case "update":
          pathsToRevalidate = [...defaultPaths, `/product/${productId}`]
          break
        case "delete":
          pathsToRevalidate = [...defaultPaths, `/product/${productId}`]
          break
      }
    }

    // ✅ 4. تحديث الصفحات
    const results = []
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
        results.push({ path, status: "success" })
        console.log(`✅ Revalidated: ${path}`)
      } catch (error) {
        results.push({ path, status: "error", error: error.message })
        console.error(`❌ Failed to revalidate ${path}:`, error)
      }
    }

    // ✅ 5. تحديث الtags
    const tags = ["products", "categories"]
    for (const tag of tags) {
      try {
        revalidateTag(tag)
        console.log(`✅ Revalidated tag: ${tag}`)
      } catch (error) {
        console.error(`❌ Failed to revalidate tag ${tag}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Manual update completed successfully",
      details: "Cache cleared, fresh data loaded, pages revalidated",
      results,
      timestamp: new Date().toISOString(),
      cacheInfo: getCacheInfo()
    })

  } catch (error) {
    console.error("❌ Manual revalidation error:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

/**
 * ✅ UPDATED: GET - Cache info with manual-only status
 */
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const cache = getCacheInfo()
    return NextResponse.json({ 
      success: true, 
      cache, 
      updateMethod: "manual-only",
      message: "Data updates only when 'Update Website' button is pressed",
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/**
 * ✅ DELETE - Clear cache only (no refresh)
 */
export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    clearProductsCache()
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleared successfully (data will be fetched on next request)', 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}