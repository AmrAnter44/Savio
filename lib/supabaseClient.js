// lib/supabaseClient.js - Fixed with better error handling and logging
import { createClient } from "@supabase/supabase-js";

// ✅ Enhanced logging for debugging
console.log('🔧 Initializing Supabase clients...')

// Environment variables check
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serverUrl = process.env.SUPABASE_URL
const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Environment check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', publicUrl ? '✅ Set' : '❌ Missing')
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', publicKey ? '✅ Set' : '❌ Missing') 
console.log('- SUPABASE_URL:', serverUrl ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', serverKey ? '✅ Set' : '❌ Missing')

// ✅ Frontend client (browser)
let supabase = null
try {
  if (publicUrl && publicKey) {
    supabase = createClient(publicUrl, publicKey)
    console.log('✅ Frontend Supabase client created successfully')
  } else {
    console.error('❌ Missing frontend Supabase credentials')
  }
} catch (error) {
  console.error('❌ Failed to create frontend Supabase client:', error)
}

// ✅ Server client factory (server-side/build-time)
const supabaseServer = () => {
  try {
    // Try server credentials first (preferred for build)
    const url = serverUrl || publicUrl
    const key = serverKey || publicKey

    if (!url || !key) {
      console.error('❌ Missing Supabase credentials for server client')
      console.error('💡 Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
      throw new Error('Missing Supabase credentials')
    }

    console.log('🚀 Creating server Supabase client...')
    console.log('- Using URL:', url)
    console.log('- Using key type:', serverKey ? 'Service Role' : 'Anon Key')

    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'User-Agent': 'Next.js SSG Build'
        }
      }
    })

    console.log('✅ Server Supabase client created successfully')
    return client

  } catch (error) {
    console.error('❌ Failed to create server Supabase client:', error)
    throw error
  }
}

// ✅ Test the server client creation immediately
try {
  const testClient = supabaseServer()
  console.log('✅ Server client test successful')
} catch (error) {
  console.error('❌ Server client test failed:', error.message)
}

export { supabase, supabaseServer }