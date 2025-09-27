"use client";
import { useMyContext } from "../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const totalVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
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
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98
  }
};

const emptyCartVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Cart() {
  const { cart, removeFromCart } = useMyContext();
  const router = useRouter();

  // حساب التوتال بالسعر الأصلي والسعر النهائي
  const totals = cart.reduce(
    (acc, item) => {
      const originalPrice = item.newprice ? item.newprice : item.price * item.quantity;
      const finalPrice = (item.newprice ? item.newprice : item.price) * item.quantity;
      console.log(cart);
      
      return {
        originalTotal: acc.originalTotal + originalPrice,
        finalTotal: acc.finalTotal + finalPrice,
        totalSavings: acc.totalSavings + (originalPrice - finalPrice)
      };
    },
    { originalTotal: 0, finalTotal: 0, totalSavings: 0 }
  );

  const goToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 mt-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        variants={itemVariants}
      >
        Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
      </motion.h1>

      {cart.length === 0 ? (
        <motion.div
          className="text-center py-16"
          variants={emptyCartVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some fragrances to get started!</p>
          <motion.button
            onClick={() => router.push('/store')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="space-y-6 mb-8"
            variants={containerVariants}
          >
            {cart.map((item, index) => {
              const colorIndex = item.colors?.indexOf(item.selectedColor) ?? 0;
              const imgSrc = item.pictures?.[colorIndex] || item.pictures?.[0] || "/fallback.png";
              const hasDiscount = item.newprice && item.newprice < item.price;
              const itemSavings = hasDiscount ? (item.price - item.newprice) * item.quantity : 0;
              const discountPercentage = hasDiscount ? Math.round(((item.price - item.newprice) / item.price) * 100) : 0;

              return (
                <motion.div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="bg-white rounded-lg shadow-sm border p-6"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                  layout
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <div className="w-24 h-32 md:w-32 md:h-40 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 96px, 128px"
                        />
                      </div>
                    </motion.div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        {/* Product Info */}
                        <div className="mb-4 md:mb-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          
                          {item.brand && (
                            <p className="text-sm text-gray-600 mb-2">
                              Brand: {item.brand}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span>Quantity: <strong>{item.quantity}</strong></span>
                            
                            {item.colors && item.colors.length > 1 && item.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span>Color:</span>
                                <span
                                  style={{ backgroundColor: item.selectedColor }}
                                  className="inline-block w-4 h-4 rounded-full border-2 border-gray-300"
                                ></span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-right">
                          {hasDiscount ? (
                            <div className="space-y-1">
                              {/* Original Price */}
                              <div className="text-sm text-gray-500 line-through">
                                {item.price} 
                              </div>
                              
                              {/* Sale Price */}
                              <div className="text-lg font-bold text-gray-900">
                                {item.newprice} LE
                              </div>
                              
                              {/* Discount Badge & Savings */}
                              <div className="flex flex-col items-end gap-1">

                                <span className="text-green-800 text-sm font-medium">
                                  You save: {itemSavings} LE
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">
                              {item.price} LE 
                            </div>
                          )}

                          {/* Remove Button */}
                          <motion.button
                            className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium"
                            onClick={() =>
                              removeFromCart(item.id, item.selectedColor, item.selectedSize)
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Remove from cart
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Cart Summary */}
          <motion.div 
            className="bg-gray-50 rounded-lg p-6"
            variants={totalVariants}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-2">
              {/* Original Total */}
              {totals.totalSavings > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Original Price):</span>
                  <span className="line-through">{totals.originalTotal} LE</span>
                </div>
              )}

              {/* Savings */}
              {totals.totalSavings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Total Savings:</span>
                  <span>-{totals.totalSavings} LE</span>
                </div>
              )}

              {/* Final Total */}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{totals.finalTotal} LE</span>
                </div>
              </div>

              {/* Savings Summary */}
              {totals.totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-lg">🎉</span>
                    <span className="font-medium">
                      Great! You're saving {totals.totalSavings} LE on this order!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Checkout Button */}
          <motion.div
            className="mt-8"
            variants={buttonVariants}
          >
            <motion.button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-lg"
              onClick={goToCheckout}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Proceed to Checkout ({totals.finalTotal} LE)
            </motion.button>
            
            <motion.p
              className="text-center text-gray-600 mt-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Your order details will be sent to WhatsApp for quick confirmation.
              {totals.totalSavings > 0 && (
                <span className="block mt-1 text-green-600 font-medium">
                  💰 Your total savings: {totals.totalSavings} LE
                </span>
              )}
            </motion.p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}