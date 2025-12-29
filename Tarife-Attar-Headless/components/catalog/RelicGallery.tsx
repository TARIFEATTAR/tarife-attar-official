
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';

const RELIC_SPECIMENS: Product[] = [
  {
    id: 'relic-hojari',
    title: 'Royal Green Hojari',
    price: '$320',
    imageUrl: 'https://images.unsplash.com/photo-1605335122530-9b5b96792663?auto=format&fit=crop&q=80&w=1200',
    collectionType: 'relic',
    productFormat: 'Traditional Attar',
    volume: '3ml',
    hardware: 'Dip Stick',
    distillationYear: 'Harvest 2023',
    origin: 'Dhofar, Oman',
    materialType: 'Resin',
    scentVibe: 'Resinous'
  },
  {
    id: 'relic-oud',
    title: 'Trat Wild Agarwood',
    price: '$450',
    imageUrl: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=1200',
    collectionType: 'relic',
    productFormat: 'Traditional Attar',
    volume: '3ml',
    hardware: 'Dip Stick',
    distillationYear: 'Vintage 2018',
    origin: 'Trat Province, Thailand',
    materialType: 'Oleoresin',
    scentVibe: 'Oleoresin'
  },
  {
    id: 'relic-vetiver',
    title: 'Ruh Khus Vetiver',
    price: '$180',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=1200',
    collectionType: 'relic',
    productFormat: 'Traditional Attar',
    volume: '3ml',
    hardware: 'Dip Stick',
    distillationYear: 'Summer 2024',
    origin: 'Kannauj, India',
    materialType: 'Hydro-Distillate',
    scentVibe: 'Hydro-Distillate'
  },
  {
    id: 'relic-amber',
    title: 'Fossilized Amber',
    price: '$280',
    imageUrl: 'https://images.unsplash.com/photo-1512207128881-1b30740216b3?auto=format&fit=crop&q=80&w=1200',
    collectionType: 'relic',
    productFormat: 'Traditional Attar',
    volume: '3ml',
    hardware: 'Dip Stick',
    distillationYear: 'Ancient',
    origin: 'Baltic Sea',
    materialType: 'Resin',
    scentVibe: 'Resinous'
  }
];

interface Props {
  onProductClick?: (product: Product) => void;
}

export const RelicGallery: React.FC<Props> = ({ onProductClick }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Resin', 'Hydro-Distillate', 'Oleoresin'];

  const filtered = activeFilter === 'All' 
    ? RELIC_SPECIMENS 
    : RELIC_SPECIMENS.filter(s => s.materialType === activeFilter);

  return (
    <div className="min-h-screen bg-theme-obsidian text-theme-alabaster pt-24 pb-40">
      {/* Sticky Filter Navigation */}
      <nav className="sticky top-[80px] md:top-[96px] z-[140] w-full border-b border-white/5 bg-theme-obsidian/90 backdrop-blur-md px-6 md:px-12 py-4 md:py-6 overflow-x-auto no-scrollbar">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center gap-8">
          <div className="flex gap-8 md:gap-10 font-mono text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] whitespace-nowrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`relative transition-all duration-300 ${activeFilter === f ? 'text-white' : 'opacity-20 hover:opacity-100'}`}
              >
                {f}
                {activeFilter === f && (
                  <motion.div layoutId="relic-filter-indicator" className="absolute -bottom-2 left-0 w-full h-[1.5px] bg-white" />
                )}
              </button>
            ))}
          </div>
          <div className="font-mono text-[8px] opacity-10 uppercase tracking-[0.6em] hidden lg:block">
            Vault_Index // {filtered.length} SPECIMENS_VERIFIED
          </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Editorial Title Section */}
        <section className="py-16 md:py-32 border-b border-white/5 mb-24 md:mb-32">
          <div className="max-w-4xl space-y-8 md:space-y-12">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-8 md:w-12 h-px bg-white/20" />
              <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.6em] md:tracking-[0.8em] opacity-40 text-theme-industrial">Relic_Vault // Archival_Record</span>
            </div>
            <h1 className="text-[14vw] lg:text-[10vw] font-serif italic leading-[0.85] tracking-tighter text-white">
              The Vault
            </h1>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl opacity-50 italic leading-relaxed">
              Traditional Attars and singular distillations. A study in geological time and the weight of material history.
            </p>
          </div>
        </section>

        {/* Product Specimen Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-24 md:gap-y-40">
          {filtered.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: (idx % 3) * 0.1, duration: 1 }}
              className="group cursor-pointer flex flex-col"
              onClick={() => onProductClick?.(product)}
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6 md:mb-10 border border-white/5 bg-black p-3 md:p-4 shadow-2xl group-hover:shadow-3xl transition-all duration-700">
                <div className="absolute top-6 md:top-8 right-6 md:right-8 z-10">
                   <span className="px-2 md:px-3 py-1 bg-white text-black font-mono text-[7px] md:text-[8px] uppercase tracking-widest shadow-xl">
                    {product.materialType}
                   </span>
                </div>

                <div className="absolute top-6 md:top-8 left-6 md:left-8 z-10 font-mono text-[7px] md:text-[8px] uppercase tracking-widest opacity-20 group-hover:opacity-60 transition-opacity">
                  VAULT_{product.id.split('-')[1].toUpperCase()}
                </div>
                
                <motion.img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover grayscale brightness-90 contrast-[1.05] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2.5s] ease-liquid"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-black/20 backdrop-blur-[2px]">
                   <div className="px-8 md:px-10 py-3 md:py-4 border border-white bg-black text-white font-mono text-[8px] md:text-[9px] uppercase tracking-[0.6em] shadow-2xl">
                      Examine Specimen
                   </div>
                </div>
              </div>
              
              <div className="px-2 md:px-4 space-y-4 md:space-y-6">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif text-2xl md:text-4xl italic tracking-tight leading-none text-white group-hover:tracking-tighter transition-all duration-700">
                    {product.title}
                  </h3>
                  <span className="font-mono text-xs md:text-sm tabular-nums opacity-60 tracking-tighter text-theme-industrial">
                    {product.price}
                  </span>
                </div>
                
                <p className="font-serif italic text-base md:text-lg opacity-40 leading-snug">
                  Archival Attar applied via dip-stick. A high-viscosity distillation.
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 md:pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[7px] md:text-[8px] opacity-20 uppercase tracking-[0.4em]">Origin</span>
                    <span className="font-mono text-[8px] md:text-[9px] text-theme-industrial uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis">
                      {product.origin || 'Ancient Path'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="font-mono text-[7px] md:text-[8px] opacity-20 uppercase tracking-[0.4em]">Vintage</span>
                    <span className="font-mono text-[8px] md:text-[9px] text-[#c5a66a] uppercase tracking-tighter">
                      {product.distillationYear || 'Current'}
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
