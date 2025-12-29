
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Product } from '../../types';

const ATLAS_SPECIMENS: Product[] = Array.from({ length: 24 }).map((_, i) => {
  const categories = ['Woody', 'Florals', 'Aquatic', 'Earthy'];
  const category = categories[i % 4];
  
  const imgIds = {
    'Woody': '1547483238-2cbf88bd1423',
    'Florals': '1582733075932-a56763625f91',
    'Aquatic': '1507525428034-b723cf961d3e',
    'Earthy': '1518531933037-91b2f5f229cc'
  };

  return {
    id: `atlas-${i}`,
    title: `${category} No. ${101 + i}`,
    price: `$${95 + (i * 3)}`,
    imageUrl: `https://images.unsplash.com/photo-${imgIds[category as keyof typeof imgIds]}?auto=format&fit=crop&q=80&w=800`,
    collectionType: 'atlas',
    productFormat: 'Perfume Oil',
    volume: '9ml',
    hardware: 'Roller',
    gpsCoordinates: `${(32 + i * 0.12).toFixed(4)}° N, ${(34 + i * 0.15).toFixed(4)}° E`,
    scentVibe: category
  };
});

interface Props {
  onProductClick?: (product: Product) => void;
}

export const AtlasGrid: React.FC<Props> = ({ onProductClick }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [curatorNote, setCuratorNote] = useState<string>('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const filters = ['All', 'Woody', 'Florals', 'Aquatic', 'Earthy'];

  const filtered = activeFilter === 'All' 
    ? ATLAS_SPECIMENS 
    : ATLAS_SPECIMENS.filter(s => s.scentVibe === activeFilter);

  useEffect(() => {
    const fetchCuratorDispatch = async () => {
      setIsGeneratingNote(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `As the Senior Alchemist, write a short technical, archival, and evocative "Curator's Note" for the ${activeFilter} series of specimens. Mention molecular stability or atmospheric pressure. Max 25 words.`,
          config: {
            systemInstruction: 'Your tone is scientific, archival, and luxury high-end.',
          },
        });
        setCuratorNote(response.text || "A refined collection of high-altitude extractions, verified stable.");
      } catch (e) {
        setCuratorNote("Atmospheric pressure verified stable for this series. Molecular integrity confirmed across all specimens.");
      } finally {
        setIsGeneratingNote(false);
      }
    };

    fetchCuratorDispatch();
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal pt-20 md:pt-24 pb-40 overflow-x-hidden w-full">
      {/* Sticky Filter Bar */}
      <nav className="sticky top-[80px] md:top-[96px] z-[140] w-full border-b border-theme-charcoal/5 bg-theme-alabaster/90 backdrop-blur-md px-6 md:px-12 py-4 md:py-6 overflow-x-auto no-scrollbar">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center gap-8">
          <div className="flex gap-8 md:gap-10 font-mono text-[9px] uppercase tracking-[0.4em] whitespace-nowrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`relative transition-all duration-300 ${activeFilter === f ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}
              >
                {f}
                {activeFilter === f && (
                  <motion.div layoutId="filter-indicator" className="absolute -bottom-2 left-0 w-full h-[1.5px] bg-theme-charcoal" />
                )}
              </button>
            ))}
          </div>
          <div className="font-mono text-[8px] opacity-10 uppercase tracking-[0.6em] hidden lg:block">
            Archive_Index // 24 SPECIMENS_STABLE
          </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Editorial Section */}
        <section className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-16 py-12 md:py-32 border-b border-theme-charcoal/5 mb-16 md:mb-32">
          <div className="lg:col-span-8 space-y-4 md:space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-8 md:w-12 h-px bg-theme-charcoal/20" />
              <span className="font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Journal_Vol_04</span>
            </div>
            
            <h1 className="font-serif italic leading-[0.8] tracking-tighter" style={{ fontSize: 'clamp(3.5rem, 14vw, 9rem)' }}>
              Field Journal
            </h1>
            
            <p className="font-serif text-xl md:text-4xl opacity-50 italic leading-relaxed max-w-2xl">
              Captured atmospheres stabilized as Perfume Oils for the high-altitude traveler.
            </p>
          </div>

          <div className="lg:col-span-4 lg:pt-24">
            <div className="p-6 md:p-10 border border-theme-charcoal/10 bg-white/40 rounded-sm space-y-6 md:space-y-8 shadow-sm">
              <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-theme-industrial block">Curator's_Dispatch</span>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={activeFilter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-serif italic text-lg md:text-xl leading-relaxed opacity-70"
                >
                  {isGeneratingNote ? "Synthesizing series analysis..." : curatorNote}
                </motion.p>
              </AnimatePresence>
              <div className="pt-6 border-t border-theme-charcoal/5 flex justify-between items-center font-mono text-[8px] uppercase tracking-widest opacity-20">
                <span>Ref: 74711A</span>
                <span>Alch_Sr_04</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-40">
          {filtered.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 3) * 0.1, duration: 1 }}
              className="group cursor-pointer flex flex-col"
              onClick={() => onProductClick?.(product)}
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6 md:mb-10 border border-theme-charcoal/5 bg-white p-3 md:p-4 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <div className="absolute top-6 right-6 z-10">
                   <span className="px-3 py-1 bg-theme-charcoal text-white font-mono text-[7px] md:text-[8px] uppercase tracking-widest">
                    {product.scentVibe}
                   </span>
                </div>
                
                <motion.img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover grayscale brightness-[1.02] contrast-[0.98] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2.5s] ease-liquid"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-theme-alabaster/10 backdrop-blur-[2px]">
                   <div className="px-8 py-4 border border-theme-charcoal bg-white/95 text-theme-charcoal font-mono text-[8px] uppercase tracking-[0.6em] shadow-2xl">
                      Access Specimen
                   </div>
                </div>
              </div>
              
              <div className="px-2 md:px-4 space-y-3 md:space-y-6">
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="font-serif text-2xl md:text-4xl italic tracking-tight leading-none group-hover:tracking-tighter transition-all duration-700">
                    {product.title}
                  </h3>
                  <span className="font-mono text-xs md:text-sm tabular-nums opacity-60">
                    {product.price}
                  </span>
                </div>
                
                <p className="font-serif italic text-base md:text-lg opacity-40 leading-snug">
                  Archival Perfume Oil stabilized for variable atmospheric pressure.
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-theme-charcoal/10 pt-4 md:pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[7px] md:text-[8px] opacity-20 uppercase tracking-[0.4em]">Coordinates</span>
                    <span className="font-mono text-[8px] md:text-[9px] text-theme-industrial uppercase tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap">
                      {product.gpsCoordinates}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="font-mono text-[7px] md:text-[8px] opacity-20 uppercase tracking-[0.4em]">Extraction</span>
                    <span className="font-mono text-[8px] md:text-[9px] text-[#c5a66a] uppercase tracking-tighter">
                      {product.scentVibe}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
