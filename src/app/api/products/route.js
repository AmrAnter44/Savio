// app/api/products/route.js
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"

export async function POST(request) {
  console.log('=== POST /api/products ===')
  
  try {
    const body = await request.json()
    console.log('Received data:', body)
    
    // Validate required fields
    if (!body.name || !body.price || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, type' },
        { status: 400 }
      )
    }
    
    // Prepare data for Supabase
    const productData = {
      name: body.name,
      price: parseFloat(body.price),
      type: body.type,
      brand: body.brand || 'Other',
      pictures: body.pictures || [],
      sizes: body.sizes || [],
      owner_id: body.owner_id || 'admin'
    }
    
    // Add newprice if provided
    if (body.newprice && !isNaN(parseFloat(body.newprice))) {
      productData.newprice = parseFloat(body.newprice)
    }
    
    console.log('Inserting to Supabase:', productData)
    
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      )
    }
    
    console.log('Product created successfully:', data.uuid)
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  console.log('=== GET /api/products ===')
  
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    
    let query = supabaseServer().from('products').select('*')
    
    if (type) {
      if (type === 'Box') {
        query = query.eq('type', 'master')
      } else {
        query = query.eq('type', type)
      }
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    query = query.order('id', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Transform for compatibility
    const products = (data || []).map(product => ({
      ...product,
      id: product.uuid,
      description: product.brand
    }))
    
    console.log(`Retrieved ${products.length} products`)
    return NextResponse.json(products)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}