"use client";
import { useState } from "react";
import { useMyContext } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Page() {
  const { cart, clearCart } = useMyContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

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

    let cartDetails = "";
    cart.forEach((item) => {
      const itemPrice = item.newPrice ? item.newPrice : item.price;
      cartDetails += `${item.name}\n`;
      cartDetails += `Quantity: ${item.quantity}\n`;

      if (item.selectedColor && item.selectedColor.trim() !== "") {
        cartDetails += `Color: ${item.selectedColor}\n`;
      }

      if (item.selectedSize && item.selectedSize.trim() !== "") {
        cartDetails += `Size: ${item.selectedSize}\n`;
      }

      cartDetails += `Price: ${itemPrice} EGP\n`;
      cartDetails += "-------------------------\n";
    });

    const total = cart.reduce(
      (acc, item) =>
        acc + (item.newPrice ? item.newPrice : item.price) * item.quantity,
      0
    );

    const message =
      `WN Store:\n\n` +
      `Name: ${name}\n` +
      `Address: ${address}\n` +
      `Phone: ${phone}\n\n` +
      `Products:\n${cartDetails}` +
      `Total: ${total} EGP\n`;

    const yourWhatsAppNumber = "201063439705";
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`, "_blank");

    clearCart();
    router.push("/succses");
  };

  return (
    <motion.div 
      className="max-w-md min-h-screen mx-auto p-4 justify-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-4"
        variants={formVariants}
      >
        Checkout
      </motion.h1>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm"
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
        <motion.input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
        />
        
        <motion.input
          type="tel"
          placeholder="Phone"
          className="border p-2 w-full mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
        />
        
        <motion.input
          type="text"
          placeholder="Address"
          className="border p-2 w-full h-30 mb-3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
        />

        <motion.button
          onClick={handleSendWhatsApp}
          className="bg text-white px-4 py-2 rounded mx-auto"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Confirm Order via WhatsApp
        </motion.button>
      </motion.div>
    </motion.div>
  );
}