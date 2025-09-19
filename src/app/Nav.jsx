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
        ${scrolled ? "bg-white/90 text-white shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-black">
          {/* ✅ Logo */}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Image
              src={scrolled ? "/darklogo.png" : "/whitelogo.png"}
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </motion.div>

          {/* ✅ Links */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 lg:gap-4  lg:mr-9">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/cart" className="relative m-2">
                  <FontAwesomeIcon
                    className={`fa-solid fa-cart-shopping text-2xl w-8 ${
                      scrolled ? "bgg" : "text-white"
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
                <Link href="https://wa.me/+201211661802" className="m-2">
                  <FontAwesomeIcon
                    className={`fa-brands fa-whatsapp text-3xl w-9 ${
                      scrolled ? "bgg" : "text-white"
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
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ backgroundImage: "url('/bg.png')" }}
        className="w-full h-60 bg-cover bg-center bg-no-repeat flex items-center md:items-start justify-center md:justify-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full h-60 bg-black/60 flex flex-col items-start justify-start text-center p-4"
        >
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-bold text-5xl md:text-6xl text-white"
          >
            <span className="text-red-800"></span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg md:text-xl text-gray-200 mt-2"
          ></motion.p>
        </motion.div>
      </motion.section>
    </>
  );
}
