"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Trash2, ExternalLink, Bookmark, Check } from "lucide-react";
import { useShopifyCart } from "@/context";
import { GlobalFooter } from "@/components/navigation";

export default function CartPage() {
  const router = useRouter();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showSaveCart, setShowSaveCart] = useState(false);
  const [saveCartEmail, setSaveCartEmail] = useState('');
  const [saveCartSubmitted, setSaveCartSubmitted] = useState(false);
  const [isSavingCart, setIsSavingCart] = useState(false);
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

  // Show "Save your satchel" prompt after 15 seconds on cart page with items
  useEffect(() => {
    if (items.length === 0) return;

    const hasSaved = localStorage.getItem('satchel-saved');
    if (hasSaved) return;

    const timer = setTimeout(() => {
      setShowSaveCart(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [items.length]);

  // #region agent log
  useEffect(() => {
    // Log cart state for debug session (H1: ensure render without unused vars)
    fetch('http://127.0.0.1:7243/ingest/6c3a1000-6649-4e7a-a50a-9f4301ecbd6a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'lint-verify',
        hypothesisId: 'H1',
        location: 'cart/page.tsx:log-state',
        message: 'Cart render',
        data: { items: items.length, checkoutUrl: !!checkoutUrl },
        timestamp: Date.now()
      })
    }).catch(() => { });
  }, [items.length, checkoutUrl]);
  // #endregion

  const handleSaveCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveCartEmail) return;

    setIsSavingCart(true);

    try {
      // Send to Omnisend via API
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: saveCartEmail,
          source: 'satchel',
          cartItems: items.map(item => ({
            title: item.title,
            price: item.price
          })),
        }),
      });

      // Also store in localStorage for redundancy
      const savedCarts = JSON.parse(localStorage.getItem('saved-carts') || '[]');
      savedCarts.push({
        email: saveCartEmail,
        items: items.map(item => ({ title: item.title, price: item.price, quantity: item.quantity })),
        total: cartTotal,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('saved-carts', JSON.stringify(savedCarts));
      localStorage.setItem('satchel-saved', 'true');

      setSaveCartSubmitted(true);
    } catch (error) {
      console.error('Error saving cart:', error);
      // Still show success to user
      setSaveCartSubmitted(true);
    } finally {
      setIsSavingCart(false);
    }
  };

  // Log checkout URL for debugging
  useEffect(() => {
    if (checkoutUrl) {
      console.log('Checkout URL available:', checkoutUrl);
      setCheckoutError(null); // Clear error when URL becomes available
    } else {
      console.warn('Checkout URL is missing. Cart state:', { items, itemCount, cartTotal });
    }
  }, [checkoutUrl, items, itemCount, cartTotal]);

  const handleCheckout = () => {
    setCheckoutError(null); // Clear previous errors

    if (items.length === 0) {
      setCheckoutError('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!checkoutUrl) {
      setCheckoutError('Checkout URL not available. Please try refreshing the page or adding items again.');
      console.error('Checkout URL is missing:', { checkoutUrl, items, itemCount });
      return;
    }

    // Validate checkout URL format
    if (!checkoutUrl.startsWith('http://') && !checkoutUrl.startsWith('https://')) {
      setCheckoutError('Invalid checkout URL. Please refresh the page and try again.');
      console.error('Invalid checkout URL format:', checkoutUrl);
      return;
    }

    // Final check: ensure checkout URL uses Shopify domain, not custom domain
    const shopifyDomain = 'vasana-perfumes.myshopify.com';
    let finalCheckoutUrl = checkoutUrl;

    if (checkoutUrl.includes('tarifeattar.com')) {
      console.warn('⚠️ Checkout URL still contains tarifeattar.com, transforming...');
      try {
        const url = new URL(checkoutUrl);
        const pathAndQuery = url.pathname + url.search;
        finalCheckoutUrl = `https://${shopifyDomain}${pathAndQuery}`;
        console.log('🔄 Transforming checkout URL:', { from: checkoutUrl, to: finalCheckoutUrl });
      } catch (error) {
        console.error('Error transforming checkout URL:', error);
      }
    }

    // Add return URL parameter to checkout URL so Shopify knows where to redirect back
    // This helps with post-checkout and error redirects
    try {
      const url = new URL(finalCheckoutUrl);
      // Add return URL parameter - Shopify may use this for redirects
      url.searchParams.set('return_to', 'https://www.tarifeattar.com/cart');
      url.searchParams.set('redirect', 'https://www.tarifeattar.com');
      finalCheckoutUrl = url.toString();
      console.log('✅ Added return URL parameters to checkout:', finalCheckoutUrl);
    } catch (error) {
      console.warn('Could not add return URL parameters:', error);
    }

    console.log('✅ Redirecting to checkout:', finalCheckoutUrl);
    window.location.href = finalCheckoutUrl;
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-24 py-4 md:py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 md:gap-3 font-mono text-[10px] uppercase tracking-[0.3em] md:tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Return to Gallery</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-theme-gold">
            Satchel ({itemCount})
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 md:px-24 py-8 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-6 md:mb-12">
              Your Satchel
            </h1>

            {(error || checkoutError) && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded">
                <p className="font-mono text-xs uppercase tracking-widest text-red-800">
                  Error: {error || checkoutError}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-600 mt-2 opacity-80">
                  {error
                    ? 'Please check your Shopify configuration or try refreshing the page.'
                    : 'Please try refreshing the page or adding items to your cart again.'}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 md:gap-6 p-4 md:p-6 border border-theme-charcoal/10 bg-white/50 backdrop-blur-sm"
                      >
                        <div className="relative w-16 h-20 md:w-24 md:h-32 bg-theme-charcoal/5 flex items-center justify-center border border-theme-charcoal/5 flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 64px, 96px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[8px] opacity-30 text-center px-2">
                              {item.title}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-serif italic text-lg md:text-xl truncate min-w-0">{item.title}</h3>
                            <p className="font-mono text-base md:text-lg flex-shrink-0">
                              ${parseFloat(item.price || '0').toFixed(2)}
                            </p>
                          </div>
                          <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-3 md:mb-4">
                            Shopify Variant: {item.handle}
                          </p>
                          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                            <div className="flex items-center border border-theme-charcoal/20">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="px-2 md:px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5 transition-colors"
                                disabled={isLoading}
                              >
                                −
                              </button>
                              <span className="px-3 md:px-4 py-1 font-mono text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="px-2 md:px-3 py-1 font-mono text-sm hover:bg-theme-charcoal/5 transition-colors"
                                disabled={isLoading}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
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
                  <div className="p-4 md:p-8 bg-theme-charcoal/[0.02] border border-theme-charcoal/10 sticky top-32">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-8 opacity-40">
                      Order Summary
                    </h3>
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      <div className="flex justify-between">
                        <span className="opacity-60 font-mono text-xs uppercase">Subtotal</span>
                        <span className="font-mono">
                          ${parseFloat(cartTotal || '0').toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60 font-mono text-xs uppercase">Shipping</span>
                        <span className="font-mono text-[10px] uppercase opacity-40">Calculated at checkout</span>
                      </div>
                    </div>
                    <div className="pt-4 md:pt-6 border-t border-theme-charcoal/10">
                      <div className="flex justify-between mb-6 md:mb-8">
                        <span className="font-serif italic text-lg">Total</span>
                        <div className="text-right">
                          <span className="font-mono text-xl block">
                            ${parseFloat(cartTotal || '0').toFixed(2)}
                          </span>
                          <span className="font-mono text-[9px] uppercase opacity-40 tracking-widest">USD</span>
                        </div>
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading || !checkoutUrl || items.length === 0}
                        className="w-full py-4 md:py-5 bg-theme-charcoal text-theme-alabaster font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-theme-obsidian transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        title={!checkoutUrl ? 'Checkout URL not available. Please refresh the page.' : items.length === 0 ? 'Your cart is empty' : 'Proceed to secure checkout'}
                      >
                        {isLoading ? "Syncing..." : !checkoutUrl ? "Preparing Checkout..." : (
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

                    {/* Save Your Satchel - Email Capture */}
                    <AnimatePresence>
                      {showSaveCart && !saveCartSubmitted && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 p-4 bg-theme-gold/5 border border-theme-gold/20 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Bookmark className="w-4 h-4 text-theme-gold" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-gold">
                              Save for Later
                            </span>
                          </div>
                          <p className="font-serif italic text-sm text-theme-charcoal/70 mb-4">
                            Not ready? Save your satchel and we'll remind you.
                          </p>
                          <form onSubmit={handleSaveCart} className="space-y-3">
                            <input
                              type="email"
                              value={saveCartEmail}
                              onChange={(e) => setSaveCartEmail(e.target.value)}
                              placeholder="your@email.com"
                              required
                              className="w-full px-4 py-3 rounded-lg border border-theme-charcoal/10 bg-white/80 font-serif text-sm focus:outline-none focus:border-theme-gold/50"
                              style={{ fontSize: '16px' }}
                            />
                            <button
                              type="submit"
                              disabled={isSavingCart}
                              className="w-full py-3 bg-theme-gold/90 text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-theme-gold transition-colors rounded-lg disabled:opacity-50"
                            >
                              {isSavingCart ? 'Saving...' : 'Save My Satchel'}
                            </button>
                          </form>
                          <button
                            onClick={() => setShowSaveCart(false)}
                            className="w-full mt-2 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-theme-charcoal/40 hover:text-theme-charcoal/60 transition-colors"
                          >
                            No thanks
                          </button>
                        </motion.div>
                      )}

                      {saveCartSubmitted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                        >
                          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="font-serif italic text-sm text-green-800">
                            Satchel saved! We'll send you a reminder.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
