
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSatchel } from '../../context/CartContext';

export const SatchelDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, removeFromSatchel, updateQuantity, cartTotal } = useSatchel();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[4000] bg-theme-obsidian/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md z-[4001] bg-theme-alabaster shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col"
          >
            {/* Header */}
            <div className="p-10 border-b border-theme-charcoal/10 flex justify-between items-end">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Commerce Ledger</span>
                <h2 className="text-4xl font-serif italic text-theme-charcoal">Your Satchel</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-1"
              >
                Close [x]
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <div className="w-12 h-px bg-theme-charcoal/20" />
                  <p className="font-serif italic text-xl">Your satchel is light. The journey awaits.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-[10px] uppercase tracking-[0.4em] underline underline-offset-8"
                  >
                    Return to Threshold
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 transition-all duration-500 ${
                      item.collectionType === 'relic' 
                        ? 'border-l-4 border-theme-charcoal bg-white/50' 
                        : 'border border-theme-charcoal/5'
                    }`}
                  >
                    <div className="flex gap-6">
                      <div className="w-20 h-24 bg-theme-obsidian/5 overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale brightness-110" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-serif italic text-lg leading-tight">{item.title}</h3>
                            <button 
                              onClick={() => removeFromSatchel(item.id)}
                              className="text-[9px] font-mono opacity-20 hover:opacity-100 transition-opacity"
                            >
                              [Remove]
                            </button>
                          </div>
                          <span className="font-mono text-[8px] uppercase tracking-widest opacity-30 block mt-1">
                            {item.collectionType === 'relic' ? `Artifact_${item.id.split('-')[1]}` : `Archive_${item.id.split('-')[1]}`}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-4 border border-theme-charcoal/10 rounded-full px-3 py-1 scale-90 origin-left">
                            <button onClick={() => updateQuantity(item.id, -1)} className="opacity-40 hover:opacity-100">-</button>
                            <span className="font-mono text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="opacity-40 hover:opacity-100">+</button>
                          </div>
                          <span className="font-mono text-xs italic">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-10 border-t border-theme-charcoal/10 space-y-8 bg-white/30 backdrop-blur-md">
                <div className="flex justify-between items-baseline font-serif">
                  <span className="text-xl italic opacity-60">Subtotal Extraction</span>
                  <span className="text-3xl tracking-tighter">${cartTotal.toFixed(2)}</span>
                </div>
                
                <button className="w-full py-6 bg-theme-charcoal text-theme-alabaster font-mono text-[11px] uppercase tracking-[1em] relative group overflow-hidden shadow-xl">
                  <span className="relative z-10">Proceed to Ritual</span>
                  <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s]" />
                </button>
                
                <div className="text-center">
                  <span className="font-mono text-[8px] uppercase tracking-[0.4em] opacity-20 italic">
                    All extractions are shipped in archival-grade vacuum packaging.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
