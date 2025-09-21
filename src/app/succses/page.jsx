"use client";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  }
};

const iconVariants = {
  hidden: { 
    scale: 0,
    rotate: -180
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const textVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Page() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={iconVariants}>
        <FaCheckCircle className="text text-6xl mb-4" />
      </motion.div>
      
      <motion.h1 variants={textVariants}>
        Your order has been placed and is now under review.
      </motion.h1>
    </motion.div>
  );
}