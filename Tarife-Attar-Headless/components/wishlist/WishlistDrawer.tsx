
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useSatchel } from '../../context/CartContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isOpen, setIsOpen, toggleWishlist } = useWishlist();
  const { addToSatchel } = useSatchel();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[4000] bg-theme-obsidian/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md z-[4001] bg-theme-alabaster shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col text-theme-charcoal"
          >
            <div className="p-10 border-b border-theme-charcoal/10 flex justify-between items-end">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Personal Records</span>
                <h2 className="text-4xl font-serif italic">The Archive</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-1"
              >
                Close [x]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <div className="w-12 h-px bg-theme-charcoal/20" />
                  <p className="font-serif italic text-xl">The archive is currently empty.</p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-theme-charcoal/5 bg-white/30"
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
                              onClick={() => toggleWishlist(item)}
                              className="text-[9px] font-mono opacity-20 hover:opacity-100 transition-opacity"
                            >
                              [Remove]
                            </button>
                          </div>
                          <span className="font-mono text-[8px] uppercase tracking-widest opacity-30 block mt-1">
                            {item.collectionType.toUpperCase()} COLLECTION
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <button 
                            onClick={() => addToSatchel(item)}
                            className="font-mono text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 border-b border-current"
                          >
                            Add to Satchel
                          </button>
                          <span className="font-mono text-xs italic">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="p-10 border-t border-theme-charcoal/10 bg-white/10 text-center">
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] opacity-20 italic">
                Saved specimens are preserved for your next visitation.
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
