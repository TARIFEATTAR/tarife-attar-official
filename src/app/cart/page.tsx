"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useSatchel } from "@/context/CartContext";
import { GlobalFooter } from "@/components/navigation";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, cartTotal, removeFromSatchel, updateQuantity } = useSatchel();

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-theme-gold">
            Satchel ({itemCount})
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-12">
              Your Satchel
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 mx-auto mb-8 opacity-20" />
                <p className="font-serif italic text-xl opacity-60 mb-8">
                  Your satchel is empty
                </p>
                <button
                  onClick={() => router.push("/atlas")}
                  className="px-12 py-4 bg-theme-charcoal text-theme-alabaster font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-theme-obsidian transition-colors"
                >
                  Explore the Atlas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-6 p-6 border border-theme-charcoal/10"
                    >
                      <div className="w-24 h-32 bg-theme-charcoal/5 flex items-center justify-center">
                        <span className="font-mono text-[8px] opacity-30">IMG</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif italic text-xl mb-2">{item.title}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-4">
                          {item.volume} · {item.productFormat}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-theme-charcoal/20">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 font-mono text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromSatchel(item.id)}
                            className="font-mono text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg">{item.price}</p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => items.forEach(item => removeFromSatchel(item.id))}
                    className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100"
                  >
                    Clear Satchel
                  </button>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="p-8 bg-theme-charcoal/[0.02] border border-theme-charcoal/10">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8 opacity-40">
                      Order Summary
                    </h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between">
                        <span className="opacity-60">Subtotal</span>
                        <span className="font-mono">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Shipping</span>
                        <span className="font-mono text-[10px] uppercase opacity-40">Calculated at checkout</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-theme-charcoal/10">
                      <div className="flex justify-between mb-8">
                        <span className="font-serif italic text-lg">Total</span>
                        <span className="font-mono text-xl">${cartTotal.toFixed(2)}</span>
                      </div>
                      <button className="w-full py-4 bg-theme-charcoal text-theme-alabaster font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-theme-obsidian transition-colors">
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
