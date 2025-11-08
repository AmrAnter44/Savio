"use client";
import { useState } from "react";
import { useMyContext } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBuy2Get1Promotion } from "../../../hooks/useBuy2Get1Promotion";

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

const formVariants = {
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

const inputVariants = {
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

const errorVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
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

export default function CheckoutPage() {
  const { cart, clearCart } = useMyContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // ✅ استخدام الـ Hook لحساب Buy 2 Get 1
  const promotion = useBuy2Get1Promotion(cart);

  // حساب التوتال والوفورات
  const regularTotals = cart.reduce(
    (acc, item) => {
      const originalPrice = item.price * item.quantity;
      const finalPrice = (item.newprice ? item.newprice : item.price) * item.quantity;
      
      return {
        originalTotal: acc.originalTotal + originalPrice,
        finalTotal: acc.finalTotal + finalPrice,
        totalSavings: acc.totalSavings + (originalPrice - finalPrice)
      };
    },
    { originalTotal: 0, finalTotal: 0, totalSavings: 0 }
  );

  // ✅ استخدام الأسعار من الـ promotion إذا كان نشط
  const finalTotals = promotion.isActive ? {
    originalTotal: promotion.originalTotal,
    finalTotal: promotion.finalTotal,
    totalSavings: promotion.savings
  } : regularTotals;

  const handleSendWhatsApp = () => {
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty. Please add at least one product.");
      return;
    }

    if (!name || !address || !phone) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!phone.startsWith("01")) {
      setErrorMessage("Phone number must start with 01.");
      return;
    }
    if (phone.length < 11) {
      setErrorMessage("Phone number must be at least 11 digits.");
      return;
    }

    // إنشاء رسالة WhatsApp محسنة مع عرض Buy 2 Get 1
    let cartDetails = "";
    let itemNumber = 1;

    cart.forEach((item) => {
      const itemPrice = item.newprice ? item.newprice : item.price;
      const originalItemPrice = item.price * item.quantity;
      const finalItemPrice = itemPrice * item.quantity;
      const itemSavings = originalItemPrice - finalItemPrice;

      cartDetails += `${itemNumber}. ${item.name}\n`;
      
      if (item.brand) {
        cartDetails += `   Brand: ${item.brand}\n`;
      }
      
      cartDetails += `   Quantity: ${item.quantity}\n`;

      if (item.selectedColor && item.selectedColor.trim() !== "") {
        cartDetails += `   Color: ${item.selectedColor}\n`;
      }

      if (item.selectedSize && item.selectedSize.trim() !== "") {
        cartDetails += `   Size: ${item.selectedSize}\n`;
      }

      // عرض السعر
      if (item.newprice && item.newprice < item.price) {
        const discountPercentage = Math.round(((item.price - item.newprice) / item.price) * 100);
        cartDetails += `   Sale Price: ${item.newprice} LE × ${item.quantity} = ${finalItemPrice} LE\n`;
        cartDetails += `   💰 Discount: ${discountPercentage}% OFF\n`;
      } else {
        cartDetails += `   Price: ${finalItemPrice} LE\n`;
      }

      cartDetails += "   ═══════════════════════\n";
      itemNumber++;
    });

    // إنشاء الرسالة النهائية
    let message = `🌸 *Savio Fragrances - New Order* 🌸\n\n`;
    message += `👤 *Customer Information:*\n`;
    message += `📝 Name: ${name}\n`;
    message += `📍 Address: ${address}\n`;
    message += `📱 Phone: ${phone}\n\n`;
    
    message += `🛍️ *Order Details:*\n`;
    message += `${cartDetails}\n`;

    // ملخص الأسعار
    message += `💵 *Price Summary:*\n`;
    message += `   Subtotal: ${finalTotals.originalTotal} LE\n`;

    // عرض خصومات المنتجات العادية
    if (regularTotals.totalSavings > 0 && !promotion.isActive) {
      message += `   Product Discounts: -${regularTotals.totalSavings} LE\n`;
    }

    // ✅ عرض Buy 2 Get 1 Free Savings
    if (promotion.isActive && promotion.savings > 0) {
      message += `   🎁 *Buy 2 Get 1 FREE*: -${promotion.savings} LE\n`;
      message += `   (${promotion.freeItemsCount} item${promotion.freeItemsCount > 1 ? 's' : ''} FREE!)\n`;
    }
    
    message += `   🏷️ *Final Total: ${finalTotals.finalTotal} LE*\n\n`;

    if (finalTotals.totalSavings > 0) {
      message += `🎉 *Congratulations!* You saved ${finalTotals.totalSavings} LE on this order!\n`;
      if (promotion.isActive) {
        message += `   💝 Includes Buy 2 Get 1 FREE savings\n`;
      }
      message += `\n`;
    }

    message += `✅ Please confirm this order to proceed with delivery.\n`;
    message += `🚚 Free delivery!\n`;
    message += `⏰ Expected delivery: 2-4 business days\n\n`;
    message += `Thank you for choosing Savio Fragrances! 🌸`;

    const yourWhatsAppNumber = "201155060205";
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`, "_blank");

    clearCart();
    router.push("/succses");
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 mt-16 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        variants={formVariants}
      >
        Checkout
      </motion.h1>

      {/* Order Summary */}
      <motion.div 
        className="bg-gray-50 rounded-lg p-6 mb-6"
        variants={formVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Items ({cart.length}):</span>
            <span>{cart.reduce((total, item) => total + item.quantity, 0)} pieces</span>
          </div>
          
          {finalTotals.totalSavings > 0 && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Original):</span>
                <span className="line-through">{finalTotals.originalTotal} LE</span>
              </div>

              {/* عرض خصومات المنتجات */}
              {regularTotals.totalSavings > 0 && !promotion.isActive && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Product Discounts:</span>
                  <span>-{regularTotals.totalSavings} LE</span>
                </div>
              )}

              {/* عرض Buy 2 Get 1 Savings */}
              {promotion.isActive && promotion.savings > 0 && (
                <div className="flex justify-between text-purple-600 font-medium">
                  <span>🎁 Buy 2 Get 1 FREE:</span>
                  <span>-{promotion.savings} LE</span>
                </div>
              )}
            </>
          )}
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span>{finalTotals.finalTotal} LE</span>
            </div>
          </div>

          {/* Buy 2 Get 1 Badge */}
          {promotion.isActive && promotion.freeItemsCount > 0 && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-purple-700 text-sm">
                <span>🎁</span>
                <div>
                  <p className="font-bold">Buy 2 Get 1 FREE Applied!</p>
                  <p className="text-xs">
                    {promotion.freeItemsCount} item{promotion.freeItemsCount > 1 ? 's' : ''} free - 
                    Saving {promotion.savings} LE
                  </p>
                </div>
              </div>
            </div>
          )}

          {finalTotals.totalSavings > 0 && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <span>🎉</span>
                <span className="font-medium">
                  You're saving {finalTotals.totalSavings} LE ({Math.round((finalTotals.totalSavings / finalTotals.originalTotal) * 100)}% discount)!
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-sm"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={formVariants}>
        <div className="space-y-4">
          <motion.div variants={inputVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must start with 01 and be at least 11 digits
            </p>
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <textarea
              placeholder="Enter your complete delivery address"
              className="w-full p-4 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </motion.div>

          <motion.button
            onClick={handleSendWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="flex items-center justify-center gap-3">
              <span>📱</span>
              <span>Complete Order via WhatsApp</span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">
                {finalTotals.finalTotal} LE
              </span>
            </div>
          </motion.button>

          <motion.div
            className="text-center text-sm text-gray-600 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p>🔒 Your order will be sent securely via WhatsApp</p>
            <p>🚚 Free delivery for orders over 2000 LE</p>
            <p>⏰ Expected delivery: 2-4 business days</p>
            {finalTotals.totalSavings > 0 && (
              <p className="text-green-600 font-medium">
                💰 You're saving {finalTotals.totalSavings} LE on this order!
              </p>
            )}
            {promotion.isActive && promotion.freeItemsCount > 0 && (
              <p className="text-purple-600 font-medium">
                🎁 Buy 2 Get 1 FREE Applied - {promotion.freeItemsCount} item{promotion.freeItemsCount > 1 ? 's' : ''} FREE!
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}