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

  const total = cart.reduce(
    (acc, item) =>
      acc + (item.newPrice ? item.newPrice : item.price) * item.quantity,
    0
  );

  const goToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 mt-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-4"
        variants={itemVariants}
      >
        Your Cart
      </motion.h1>

      {cart.length === 0 ? (
        <motion.p
          variants={emptyCartVariants}
          initial="hidden"
          animate="visible"
        >
          Your cart is empty.
        </motion.p>
      ) : (
        <>
          <motion.ul 
            className="space-y-4"
            variants={containerVariants}
          >
            {cart.map((item, index) => {
              const colorIndex = item.colors?.indexOf(item.selectedColor) ?? 0;
              const imgSrc =
                item.pictures?.[colorIndex] || item.pictures?.[0] || "/fallback.png";

              return (
                <motion.li
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex justify-between items-center"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                  layout
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ 
    duration: 0.4, 
    delay: index * 0.1,
    ease: "easeOut"
  }}
>
  <div>
    <img
      src={imgSrc}
      alt={`Product image ${index}`}
      className="w-50 object-cover mb-4 rounded"
      width={100}
      height={400}
    />
  </div>
</motion.div>
                  </motion.div>

                  <motion.div 
                    className="w-40"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <p className="p-2">
                      Price:{" "}
                      {item.newPrice ? (
                        <span>{item.newPrice}.LE</span>
                      ) : (
                        <>{item.price} .LE</>
                      )}
                    </p>

                    <p className="p-2">Quantity: {item.quantity}</p>

                    {item.colors && item.colors.length > 1 && (
                      <p className="p-2">
                        Color:{" "}
                        <span
                          style={{ backgroundColor: item.selectedColor }}
                          className="inline-block w-4 h-4 rounded-full border-2"
                        ></span>
                      </p>
                    )}

                    <p className="p-2">Size: {item.selectedSize}</p>

                    <motion.button
                      className="text-red-400 text-xl hover:text-red-500 m-5"
                      onClick={() =>
                        removeFromCart(item.id, item.selectedColor, item.selectedSize)
                      }
                      whileHover={{ 
                        scale: 1.1,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Remove
                    </motion.button>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div 
            className="mt-6 font-bold text-lg"
            variants={totalVariants}
          >
            Total: {total} .LE
          </motion.div>
        </>
      )}

      <motion.div
        variants={buttonVariants}
      >
        {cart.length >= 1 && (
          <div>
            <motion.button
              className="bg hover:bg-fuchsia-500 text-white font-bold py-2 px-4 rounded w-full"
              onClick={goToCheckout}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Order Now
            </motion.button>
            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              To make the ordering process easier for both you and us, your order details will be
              sent to WhatsApp for quick confirmation.
            </motion.h4>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}