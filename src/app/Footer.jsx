"use client";

import { Facebook, Instagram, Mail } from "lucide-react"; 
import { motion } from "framer-motion";

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.9
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export default function Footer() {
  return (
    <motion.footer 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="bg text-white p-6 mt-10 bottom-0 w-full"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        <motion.div 
          variants={itemVariants}
          className="text-lg font-semibold"
        >
          © {new Date().getFullYear()} Savio Fragrance
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex space-x-6"
        >
          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            <Facebook size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://www.instagram.com/wn_store_eg_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors duration-200"
          >
            <Instagram size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="mailto:your@email.com"
            className="hover:text-green-400 transition-colors duration-200"
          >
            <Mail size={22} />
          </motion.a>
        </motion.div>
      </div>
    </motion.footer>
  );
}