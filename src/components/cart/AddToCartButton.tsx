"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useShopifyCart } from "@/context/ShopifyCartContext";
import { triggerEssenceDrop } from "@/components/cart/Satchel";

interface Props {
  variantId?: string;
  inStock?: boolean;
  className?: string;
  quantity?: number;
  /** Product name for toast notification */
  productName?: string;
  /** Dominant color of the product (hex) for essence drop */
  productColor?: string;
}

/**
 * AddToCartButton - Triggers Essence Drop Animation
 * 
 * When clicked:
 * 1. Captures button position
 * 2. Triggers EssenceDrop event (comet tail to satchel)
 * 3. Calls Shopify addItem
 * 4. Shows success state
 */
export function AddToCartButton({
  variantId,
  inStock = true,
  className = "",
  quantity = 1,
  productName = "Item",
  productColor = "#c5a66a", // Default to theme gold
}: Props) {
  const { addItem } = useShopifyCart();
  const [isAdding, setIsAdding] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!variantId || !inStock || isAdding) return;

    setIsAdding(true);

    // Haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }

    // Get button position for essence drop start point
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setTimeout(() => {
        triggerEssenceDrop({
          productColor,
          productName,
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
        });
      }, 0);
    }

    try {
      await addItem(variantId, quantity);
      // Keep success state visible for a moment
      setTimeout(() => setIsAdding(false), 1500);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      layout
      onClick={handleAdd}
      disabled={!inStock || !variantId || isAdding}
      whileHover={inStock && !isAdding ? { scale: 1.01 } : {}}
      whileTap={inStock && !isAdding ? { scale: 0.99 } : {}}
      className={`relative flex items-center justify-center gap-3 py-5 font-mono text-sm md:text-base uppercase tracking-[0.4em] transition-all overflow-hidden ${inStock
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

export default AddToCartButton;
