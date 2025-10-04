// app/api/products/[id]/route.js
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"

export async function GET(request, { params }) {
  console.log('=== GET /api/products/[id] ===')
  
  try {
    const { id } = params
    console.log('Getting product ID:', id)
    
    const { data, error } = await supabaseServer()
      .from('products')
      .select('*')
      .eq('uuid', id)
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Transform for compatibility
    const product = {
      ...data,
      id: data.uuid,
      description: data.brand
    }
    
    return NextResponse.json(product)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  console.log('=== PUT /api/products/[id] ===')
  
  try {
    const { id } = params
    const body = await request.json()
    
    console.log('Updating product ID:', id)
    console.log('Update data:', body)
    
    // Clean data for update
    const updateData = {}
    // ✅ أضفنا top_notes, heart_notes, base_notes
    const allowedFields = [
      'name', 'price', 'newprice', 'brand', 
      'pictures', 'sizes', 'type',
      'top_notes', 'heart_notes', 'base_notes'  // ✅ الحقول الجديدة
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'newprice') {
          updateData[field] = body[field] ? parseFloat(body[field]) : null
        } else {
          // ✅ نسمح بـ null للـ Notes
          updateData[field] = body[field]
        }
      }
    })
    
    console.log('Clean update data:', updateData)
    
    const { data, error } = await supabaseServer()
      .from('products')
      .update(updateData)
      .eq('uuid', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    console.log('Product updated successfully:', data)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  console.log('=== DELETE /api/products/[id] ===')
  
  try {
    const { id } = params
    console.log('Deleting product ID:', id)
    
    const { error } = await supabaseServer()
      .from('products')
      .delete()
      .eq('uuid', id)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    console.log('Product deleted successfully')
    return NextResponse.json({
      message: 'Product deleted successfully'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}