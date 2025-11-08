"use client"

import { motion } from "framer-motion"
import { FaFire } from "react-icons/fa6"

const bannerVariants = {
  hidden: { 
    opacity: 0, 
    y: -50 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const shimmerVariants = {
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export default function Buy2Get1Banner() {
  return (
    <motion.div
      className="w-full py-8 px-4 mb-12"
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-7xl mx-auto relative overflow-hidden"
        variants={pulseVariants}
        animate="pulse"
      >
        {/* Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-3xl"
          variants={shimmerVariants}
          animate="shimmer"
          style={{
            backgroundSize: "200% 100%"
          }}
        />

        {/* Content */}
        <div className="relative z-10 bg-gradient-to-r from-red-800/95 via-red-700/95 to-red-800/95 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Side - Icon & Text */}
            <div className="flex items-center gap-6">
              {/* Animated Fire Icons */}
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FaFire className="text-4xl md:text-8xl text-yellow-300 drop-shadow-lg" />
                </motion.div>
                
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Text Content */}
              <div>
                <motion.h2
                  className="text-2xl md:text-6xl font-black mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Buy 2 Get 1 FREE
                </motion.h2>
                

              </div>
            </div>

            {/* Right Side - CTA Badge */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >

            </motion.div>
          </div>

          {/* Bottom Details */}


        </div>
      </motion.div>
    </motion.div>
  )
}