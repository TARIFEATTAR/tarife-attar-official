"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useShopifyCart } from "@/context";

interface Props {
  variantId?: string;
  inStock?: boolean;
  className?: string;
  quantity?: number;
}

export function AddToCartButton({ 
  variantId, 
  inStock = true, 
  className = "",
  quantity = 1
}: Props) {
  const { addItem } = useShopifyCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!variantId || !inStock || isAdding) return;

    setIsAdding(true);
    
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }

    try {
      await addItem(variantId, quantity);
      setTimeout(() => setIsAdding(false), 1500);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <motion.button
      layout
      onClick={handleAdd}
      disabled={!inStock || !variantId || isAdding}
      whileHover={inStock && !isAdding ? { scale: 1.01 } : {}}
      whileTap={inStock && !isAdding ? { scale: 0.99 } : {}}
      className={`relative flex items-center justify-center gap-3 py-5 font-mono text-sm md:text-base uppercase tracking-[0.4em] transition-all overflow-hidden ${
        inStock
          ? isAdding 
            ? "bg-theme-gold text-theme-alabaster"
            : "bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90"
          : "bg-theme-charcoal/20 text-theme-charcoal/40 cursor-not-allowed"
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="adding"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Added</span>
          </motion.div>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {inStock ? "Add to Satchel" : "Out of Stock"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
