"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FieldReport } from '@/types';

const FIELD_REPORTS: FieldReport[] = [
  {
    id: 'rain',
    name: 'Petrichor & Rain',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    description: 'The scent of earth after rain. Cool, damp, and revitalizing.',
    coordinates: '57.0488° N, 22.1372° E'
  },
  {
    id: 'sun',
    name: 'Solar Stillness',
    imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf88bd1423?auto=format&fit=crop&q=80&w=800',
    description: 'Warm linen, amber resins, and the weight of a summer afternoon.',
    coordinates: '36.7783° N, 119.4179° W'
  },
  {
    id: 'earth',
    name: 'Mineral Ground',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
    description: 'Crushed stone, dry moss, and the architectural silence of caves.',
    coordinates: '25.2744° N, 133.7751° E'
  }
];

interface Props {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export const AtmosphereTuner: React.FC<Props> = ({ onBack, onNavigate }) => {
  return (
    <div className="w-full h-full flex flex-col max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-16">
        <div className="z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="group flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-4 opacity-60 hover:opacity-100 transition-opacity pointer-events-auto"
          >
            <span className="text-lg leading-none transform group-hover:-translate-x-1 transition-transform">←</span> Return to Bifurcation
          </button>
          <h3 className="text-4xl font-light italic">Atmosphere Tuner</h3>
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-30 mt-2">Select a sensory coordinate to enter the archive</p>
        </div>
        <div className="text-right hidden md:block">
          <span className="font-mono text-[10px] text-theme-industrial uppercase">Step 01: Environmental Context</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 flex-1">
        {FIELD_REPORTS.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.('atlas');
            }}
            className="group relative flex flex-col h-full cursor-pointer pointer-events-auto z-40"
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-theme-charcoal/5 border border-transparent group-hover:border-theme-charcoal/20 transition-colors">
              <Image 
                src={report.imageUrl} 
                alt={report.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 ease-out"
              />
              <div className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-sm">
                <span className="font-mono text-[9px] tracking-tighter text-white uppercase">{report.coordinates}</span>
              </div>
              
              {/* Hover Portal Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-theme-alabaster/10 backdrop-blur-[2px]">
                <div className="px-6 py-3 border border-theme-charcoal bg-theme-alabaster text-theme-charcoal font-mono text-[9px] uppercase tracking-[0.3em]">
                  Enter Archive
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-xl italic mb-2 group-hover:translate-x-2 transition-transform duration-500">{report.name}</h4>
              <p className="text-sm opacity-60 leading-relaxed font-serif max-w-[280px]">
                {report.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-theme-charcoal/10 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
              <span className="font-mono text-[9px] uppercase tracking-widest">Protocol: ATLAS_0{idx + 1}</span>
              <span className="text-xl">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center opacity-20 z-50">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('atlas');
          }}
          className="font-mono text-[10px] uppercase tracking-[0.8em] hover:opacity-100 transition-opacity pointer-events-auto"
        >
          Skip to Full Index
        </button>
      </div>
    </div>
  );
};
