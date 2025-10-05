// app/api/products/route.js
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"

export async function POST(request) {
  try {
    const body = await request.json()
    
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
      in_stock,  // ✅ دعم حقل in_stock
      owner_id 
    } = body

    // التحقق من الحقول المطلوبة
    if (!name || !price || !brand || !sizes || !type || !pictures) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
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
          in_stock: in_stock !== false, // ✅ افتراضياً متاح
          owner_id: owner_id || "admin",
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to add product" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        product: data[0],
        message: "Product added successfully" 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to fetch products" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        products: data || [],
        count: data?.length || 0
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