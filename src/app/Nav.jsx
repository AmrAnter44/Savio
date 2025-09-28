"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { useMyContext } from "../context/CartContext";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useMyContext();
  const cartCount = cart.length;

  /* ✅ تغيير حالة الـ Navbar عند الـ Scroll */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ✅ Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500  
        ${scrolled ? "bg-white/90 text shadow-lg" : "bg-transparent bg "}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-black">
          {/* ✅ Logo */}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Image
              src={scrolled ? "/darklogo.webp" : "/whitelogo.webp"}
              alt="Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </motion.div>

          {/* ✅ Links */}
          <div className="flex gap-4">
            <div className=" h-16 flex items-center justify-between text-2xl font-bold text ">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/cart" className="relative m-2">
                  <FontAwesomeIcon
                    className={`fa-solid fa-cart-shopping text-2xl w-8 ${
                      scrolled ? "text" : "text-white"
                    } shadow-2xl shadow-black`}
                    icon={faCartShopping}
                  />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="absolute -top-3 left-4 bg-white text-purple-600 text-xs w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="https://wa.me/+201063439705" className="m-2">
                  <FontAwesomeIcon
                    className={`fa-brands fa-whatsapp text-3xl w-9 mr-6 ${
                      scrolled ? "text" : "text-white"
                    } shadow-2xl shadow-black`}
                    icon={faWhatsapp}
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ✅ Hero Section بخلفية شغالة على Safari */}

    </>
  );
}
