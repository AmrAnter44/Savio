// src/app/api/admin/login/route.js
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }

    // رجع session للمستخدم
    return new Response(JSON.stringify({ success: true, user: data.user }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response("Use POST to login", { status: 405 });
}
