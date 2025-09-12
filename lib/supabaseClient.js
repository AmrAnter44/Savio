// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 🟣 للـ Client (Frontend)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 🟢 للـ Server (API Routes, Server Components)
export const supabaseServer = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
