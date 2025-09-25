"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      console.error("Login error:", error.message);
    } else if (data?.session) {

 router.push("/admin/dashboard");
 router.replace("/admin/dashboard");

    } else {
      setError("Something went wrong, please try again.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="p-6 max-w-sm mx-auto bg-white rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-purple-600 text-white rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </form>
  );
}
