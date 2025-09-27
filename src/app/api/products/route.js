// app/api/products/route.js - Restricted Access (Complete Fixed)
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"

// 🔒 Check if request is from admin or build process
function isAuthorizedRequest(request) {
  try {
    // Allow during build process
    if (process.env.NODE_ENV === 'production') return false
    
    // Check for admin token
    const authHeader = request.headers.get('x-admin-token') || ''
    const adminToken = process.env.ADMIN_TOKEN || ''
    
    // Check for build-time header
    const buildHeader = request.headers.get('x-build-request') || ''
    
    return (adminToken && authHeader === adminToken) || buildHeader === 'true'
  } catch {
    return false
  }
}

export async function POST(request) {
  console.log('=== POST /api/products ===')
  
  // 🔒 Always allow product creation for admin
  try {
    const body = await request.json()
    console.log('Received data:', body)
    
    if (!body.name || !body.price || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, type' },
        { status: 400 }
      )
    }
    
    const productData = {
      name: body.name,
      price: parseFloat(body.price),
      type: body.type,
      brand: body.brand || 'Other',
      pictures: body.pictures || [],
      sizes: body.sizes || [],
      owner_id: body.owner_id || 'admin'
    }
    
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
  
  // 🔒 CRITICAL: Block GET requests in production
  if (!isAuthorizedRequest(request)) {
    console.log('❌ Unauthorized GET request blocked')
    return NextResponse.json(
      { 
        error: 'Access denied',
        message: 'Products data is served statically. Use Dashboard → Update Website to refresh data.',
        hint: 'This API is restricted to prevent runtime database calls.'
      },
      { status: 403 }
    )
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    
    console.log('🔓 Authorized request - proceeding with database query')
    
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
    
    const products = (data || []).map(product => ({
      ...product,
      id: product.uuid,
      description: product.brand
    }))
    
    console.log(`Retrieved ${products.length} products (authorized request)`)
    return NextResponse.json(products)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}