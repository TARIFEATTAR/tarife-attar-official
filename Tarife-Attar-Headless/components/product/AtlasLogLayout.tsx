
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { useSatchel } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface Props {
  product: Product;
  onBack: () => void;
}

export const AtlasLogLayout: React.FC<Props> = ({ product, onBack }) => {
  const { addToSatchel } = useSatchel();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>('description');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToSatchel(product);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-theme-alabaster text-theme-charcoal min-h-screen overflow-x-hidden relative"
    >
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-theme-alabaster/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-theme-charcoal/5 lg:hidden">
        <button onClick={onBack} className="font-mono text-[10px] uppercase tracking-widest">← Back</button>
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] opacity-40">Protocol: Atlas_04</span>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 pt-24 md:pt-32 pb-32 lg:pb-24">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left: Specimen Visual (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="hidden lg:block">
              <button 
                onClick={onBack}
                className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all"
              >
                <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">←</span>
                Archive Index
              </button>
            </div>
            
            <div className="relative aspect-[4/5] bg-white border border-theme-charcoal/5 shadow-sm overflow-hidden group">
              <div className="absolute top-8 left-8 z-10 font-mono text-[10px] uppercase tracking-[0.6em] opacity-30">
                A_SPECIMEN_{product.id.split('-')[1] || '01'}
              </div>
              <motion.img 
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                src={product.imageUrl} 
                alt={product.title} 
                className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 transition-all duration-[2.5s] ease-liquid"
              />
            </div>
          </div>

          {/* Right: Technical Ledger (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col pt-0 lg:pt-12">
            <header className="space-y-6">
              <div className="flex justify-between items-center border-b border-theme-charcoal/10 pb-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Protocol: Atlas_04</span>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest transition-all ${isSaved ? 'text-[#c5a66a]' : 'opacity-40 hover:opacity-100'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {isSaved ? 'Archived' : 'Save'}
                </button>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-serif italic font-bold tracking-tighter leading-none text-theme-charcoal uppercase italic">
                  {product.title}
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-[0.6em] text-theme-industrial">
                  {product.scentVibe || 'Archival Formulation'}
                </p>
              </div>

              <div className="pt-4">
                <span className="text-5xl font-mono tracking-tighter tabular-nums font-medium text-theme-charcoal">
                  {product.price}
                </span>
              </div>
            </header>

            {/* Calibration Instrument */}
            <div className="mt-12 border border-theme-charcoal/10 divide-y md:divide-y-0 md:divide-x divide-theme-charcoal/10 flex flex-col md:flex-row h-auto md:h-16 bg-white/30">
              <div className="flex-1 flex items-center justify-between px-6 py-4 md:py-0">
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Vol</span>
                <span className="font-mono text-[11px] tracking-widest uppercase">{product.volume || '9ml'}</span>
              </div>
              <div className="flex-1 flex items-center justify-between px-6 py-4 md:py-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg opacity-40 hover:opacity-100">-</button>
                <span className="font-mono text-xs tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-lg opacity-40 hover:opacity-100">+</button>
              </div>
            </div>

            {/* CTA Desktop */}
            <div className="mt-8 hidden lg:block">
              <button 
                onClick={handleAddToCart}
                className="w-full py-7 bg-theme-charcoal text-theme-alabaster font-mono text-[12px] uppercase tracking-[0.8em] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
              >
                Add to Satchel
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 opacity-20 font-mono text-[8px] uppercase tracking-[0.4em]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure Archival Hand-off
              </div>
            </div>

            {/* Detailed Metadata Accordions */}
            <div className="mt-16 border-t border-theme-charcoal/10">
              <Accordion 
                title="Extraction Notes" 
                isOpen={openSection === 'description'} 
                onClick={() => toggleSection('description')}
              >
                <div className="space-y-8">
                  <p className="font-serif text-lg italic leading-relaxed opacity-60">
                    {product.fieldJournalEntry || "A precise atmospheric capture of sun-bleached cedar and wet earth. The Tarife system stabilizes these high-altitude extractions in a persistent oil matrix."}
                  </p>
                  <div className="grid grid-cols-2 gap-8 font-mono text-[9px] uppercase tracking-widest opacity-40 pt-6 border-t border-theme-charcoal/5">
                    <div className="space-y-1">
                      <span className="block opacity-50">Sillage</span>
                      <span className="text-theme-charcoal opacity-100">Intimate / Medium</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block opacity-50">Persistence</span>
                      <span className="text-theme-charcoal opacity-100">12 - 14 Hours</span>
                    </div>
                  </div>
                </div>
              </Accordion>
              
              <Accordion 
                title="Geological Source" 
                isOpen={openSection === 'notes'} 
                onClick={() => toggleSection('notes')}
              >
                <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
                  <div className="flex justify-between border-b border-theme-charcoal/5 pb-2">
                    <span className="opacity-40">Primary Coordinate</span>
                    <span className="opacity-80 tabular-nums">{product.gpsCoordinates || "31.7917° N, 7.0926° W"}</span>
                  </div>
                  <div className="flex justify-between border-b border-theme-charcoal/5 pb-2">
                    <span className="opacity-40">Atmospheric Density</span>
                    <span className="opacity-80">Verified Stable</span>
                  </div>
                </div>
              </Accordion>

              <Accordion 
                title="Application Ritual" 
                isOpen={openSection === 'shipping'} 
                onClick={() => toggleSection('shipping')}
              >
                <p className="font-serif text-lg italic leading-relaxed opacity-60 italic">
                  Apply directly to pulse points. Allow 3-5 minutes for thermal activation. All specimens are vacuum-sealed in archival-grade vessels for transit.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-6 z-[200] bg-theme-alabaster/90 backdrop-blur-xl border-t border-theme-charcoal/10 flex flex-col gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center gap-2 opacity-30 font-mono text-[8px] uppercase tracking-[0.4em]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secure Archival Hand-off
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full py-5 bg-theme-charcoal text-theme-alabaster font-mono text-[11px] uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-transform"
        >
          Add to Satchel
        </button>
      </div>
    </motion.div>
  );
};

const Accordion: React.FC<{ title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }> = ({ title, isOpen, onClick, children }) => (
  <div className="border-b border-theme-charcoal/10">
    <button onClick={onClick} className="w-full py-7 flex justify-between items-center text-left group">
      <span className="font-mono text-[11px] uppercase tracking-[0.4em] transition-opacity group-hover:opacity-100 opacity-50">{title}</span>
      <div className="relative w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-theme-charcoal opacity-40" />
        <motion.div 
          animate={{ rotate: isOpen ? 0 : 90 }}
          className="absolute top-1/2 left-0 w-full h-[1px] bg-theme-charcoal opacity-40" 
        />
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: 'auto', opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }} 
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
          className="overflow-hidden"
        >
          <div className="pb-10">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
