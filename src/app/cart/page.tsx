"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { useShopifyCart } from "@/context";
import { GlobalFooter } from "@/components/navigation";

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    itemCount, 
    cartTotal, 
    checkoutUrl, 
    isLoading, 
    error,
    updateItemQuantity, 
    removeItem, 
    clearCart 
  } = useShopifyCart();

  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Gallery
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

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded">
                <p className="font-mono text-xs uppercase tracking-widest text-red-800">
                  Error: {error}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-600 mt-2 opacity-80">
                  Please check your Shopify configuration or try refreshing the page.
                </p>
              </div>
            )}

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
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-6 p-6 border border-theme-charcoal/10 bg-white/50 backdrop-blur-sm"
                      >
                        <div className="w-24 h-32 bg-theme-charcoal/5 flex items-center justify-center border border-theme-charcoal/5">
                          <span className="font-mono text-[8px] opacity-30 text-center px-2">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif italic text-xl mb-1">{item.title}</h3>
                          <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-4">
                            Shopify Variant: {item.handle}
                          </p>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center border border-theme-charcoal/20">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5 transition-colors"
                                disabled={isLoading}
                              >
                                −
                              </button>
                              <span className="px-4 py-1 font-mono text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5 transition-colors"
                                disabled={isLoading}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg">
                            ${(() => {
                              if (typeof item.price === 'string') {
                                return parseFloat(item.price).toFixed(2);
                              } else if (typeof item.price === 'number') {
                                return item.price.toFixed(2);
                              }
                              return '0.00';
                            })()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={clearCart}
                      className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      Clear Satchel
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="p-8 bg-theme-charcoal/[0.02] border border-theme-charcoal/10 sticky top-32">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8 opacity-40">
                      Order Summary
                    </h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between">
                        <span className="opacity-60 font-mono text-xs uppercase">Subtotal</span>
                        <span className="font-mono">
                          ${(() => {
                            if (typeof cartTotal === 'string') {
                              return parseFloat(cartTotal).toFixed(2);
                            } else if (typeof cartTotal === 'number') {
                              return cartTotal.toFixed(2);
                            }
                            return '0.00';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60 font-mono text-xs uppercase">Shipping</span>
                        <span className="font-mono text-[10px] uppercase opacity-40">Calculated at checkout</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-theme-charcoal/10">
                      <div className="flex justify-between mb-8">
                        <span className="font-serif italic text-lg">Total</span>
                        <div className="text-right">
                          <span className="font-mono text-xl block">
                            ${(() => {
                              if (typeof cartTotal === 'string') {
                                return parseFloat(cartTotal).toFixed(2);
                              } else if (typeof cartTotal === 'number') {
                                return cartTotal.toFixed(2);
                              }
                              return '0.00';
                            })()}
                          </span>
                          <span className="font-mono text-[9px] uppercase opacity-40 tracking-widest">USD</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleCheckout}
                        disabled={isLoading || !checkoutUrl}
                        className="w-full py-5 bg-theme-charcoal text-theme-alabaster font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-theme-obsidian transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isLoading ? "Syncing..." : (
                          <>
                            Secure Checkout
                            <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </button>
                      
                      <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-30 grayscale contrast-200">
                        {/* Simple placeholder icons for payment methods */}
                        <div className="font-mono text-[8px] uppercase border border-theme-charcoal px-2 py-1">Visa</div>
                        <div className="font-mono text-[8px] uppercase border border-theme-charcoal px-2 py-1">Amex</div>
                        <div className="font-mono text-[8px] uppercase border border-theme-charcoal px-2 py-1">Apple Pay</div>
                      </div>
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
