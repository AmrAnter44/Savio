// app/api/products/[id]/route.js
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("uuid", id)
      .single()

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { error: error.message || "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        product: data 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const { 
      name, 
      price, 
      newprice, 
      brand, 
      pictures, 
      sizes, 
      type,
      top_notes,
      heart_notes,
      base_notes,
      in_stock  // ✅ دعم حقل in_stock
    } = body
    
    // ✅ DEBUG: طباعة البيانات المستلمة
    console.log('📦 API Received in_stock:', in_stock, typeof in_stock);

    // التحقق من الحقول المطلوبة
    if (!name || !price || !brand || !sizes || !type || !pictures) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()
    
    const updatePayload = {
      name,
      price: Number(price),
      newprice: newprice ? Number(newprice) : null,
      brand,
      pictures,
      sizes,
      type,
      top_notes: top_notes || null,
      heart_notes: heart_notes || null,
      base_notes: base_notes || null,
      in_stock: typeof in_stock === 'boolean' ? in_stock : true, // ✅ FIX: استخدام القيمة مباشرة
      updated_at: new Date().toISOString()
    };
    
    // ✅ DEBUG: طباعة البيانات قبل الإرسال لـ Supabase
    console.log('📦 API Sending to Supabase:', updatePayload);

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("uuid", id)
      .select()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update product" },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    // ✅ DEBUG: طباعة النتيجة من Supabase
    console.log('✅ API Supabase response:', data[0]);

    return NextResponse.json(
      { 
        success: true, 
        product: data[0],
        message: "Product updated successfully" 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    // أولاً، احصل على المنتج لحذف الصور
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("pictures")
      .eq("uuid", id)
      .single()

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // حذف الصور من Storage (اختياري)
    if (product?.pictures && Array.isArray(product.pictures)) {
      for (const pictureUrl of product.pictures) {
        try {
          if (pictureUrl && pictureUrl.includes('/product-images/')) {
            const urlParts = pictureUrl.split('/product-images/')
            const fileName = urlParts[urlParts.length - 1]
            
            await supabase.storage
              .from('product-images')
              .remove([fileName])
          }
        } catch (storageError) {
          console.warn("Storage delete error:", storageError)
          // استمر في الحذف حتى لو فشل حذف الصور
        }
      }
    }

    // حذف المنتج من قاعدة البيانات
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("uuid", id)

    if (deleteError) {
      console.error("Supabase delete error:", deleteError)
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete product" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Product deleted successfully" 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}