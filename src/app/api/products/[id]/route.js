// File: src/app/api/products/[id]/route.js

import { supabaseServer } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseServer()
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Product not found: " + error.message }, 
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log("Updating product:", id, body);

    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" }, 
        { status: 400 }
      );
    }

    // Update product in database
    const updateData = {
      name: body.name.trim(),
      price: Number(body.price),
      pictures: body.pictures || []
    };

    // Only add newprice if it exists and has a value
    if (body.newprice) {
      updateData.newprice = Number(body.newprice);
    }

    // Add brand if provided (adjust column name based on what you created)
    if (body.brand) {
      updateData.brand = body.brand;  // Use this if you created 'brand' column
      // updateData.description = body.brand;  // Use this if you created 'description' column
    }

    const { data, error } = await supabaseServer()
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update product: " + error.message }, 
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    console.log("Deleting product with ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" }, 
        { status: 400 }
      );
    }

    // Get product first to access images for deletion
    const { data: product, error: fetchError } = await supabaseServer()
      .from("products")
      .select("pictures")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching product:", fetchError);
    }

    // Delete images from storage if they exist
    if (product?.pictures && product.pictures.length > 0) {
      try {
        const imageUrls = product.pictures.map(url => {
          // Extract file path from Supabase URL
          if (url.includes('/product-images/')) {
            const urlParts = url.split('/product-images/');
            return urlParts[urlParts.length - 1];
          }
          return null;
        }).filter(Boolean);

        if (imageUrls.length > 0) {
          const { error: storageError } = await supabaseServer()
            .storage
            .from('product-images')
            .remove(imageUrls);

          if (storageError) {
            console.error("Error deleting images:", storageError);
            // Don't fail the whole operation if image deletion fails
          } else {
            console.log("Images deleted successfully:", imageUrls);
          }
        }
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete product from database
    const { data, error } = await supabaseServer()
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete product: " + error.message }, 
        { status: 500 }
      );
    }

    console.log("Product deleted successfully");
    
    return NextResponse.json(
      { success: true, message: "Product deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message }, 
      { status: 500 }
    );
  }
}