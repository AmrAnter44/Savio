"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AddProduct from "../add";
import RemoveProduct from "../remove";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("add");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } },
  };

  useEffect(() => {
    // تحقق من وجود session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <motion.div className="max-w-5xl mx-auto p-6" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Tabs للتبديل بين Add و Remove */}
      <div className="flex gap-4 mb-6 mx-auto justify-center items-center">
        <button
          className={`px-4 py-2 rounded ${activeTab === "add" ? "bg text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("add")}
        >
          Add Product
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "remove" ? "bg text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("remove")}
        >
          Remove Product
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
          {activeTab === "add" && <AddProduct />}
          {activeTab === "remove" && <RemoveProduct />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
