
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotspot } from '../../types';

interface Props {
  imageUrl: string;
  hotspots: Hotspot[];
}

export const FieldReport: React.FC<Props> = ({ imageUrl, hotspots }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-[#F2F0E9] p-4 border border-[#1A1A1A]/10 shadow-inner">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out cursor-crosshair">
        <img 
          src={imageUrl} 
          alt="Field Specimen" 
          className="w-full h-full object-cover opacity-90 contrast-110" 
        />
        
        {/* Overlay Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

        {/* Hotspots */}
        {hotspots.map((spot, idx) => (
          <div
            key={idx}
            className="absolute z-20"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            <motion.button
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative -translate-x-1/2 -translate-y-1/2 p-4 group"
            >
              {/* The Pin Circle */}
              <div className="w-4 h-4 rounded-full border border-[#1A1A1A] bg-[#F2F0E9]/40 backdrop-blur-[2px] group-hover:bg-[#1A1A1A] group-hover:scale-125 transition-all duration-500" />
              
              {/* Pulse effect */}
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 m-auto w-4 h-4 rounded-full border border-[#1A1A1A]/30 pointer-events-none"
              />
            </motion.button>

            {/* Label Line Logic */}
            <AnimatePresence>
              {hoveredIdx === idx && (
                <div className="absolute top-0 left-0 pointer-events-none">
                  <svg width="240" height="120" className="absolute -top-12 left-4 overflow-visible">
                    <motion.path
                      d="M 0 48 L 40 10 L 160 10"
                      fill="transparent"
                      stroke="#1A1A1A"
                      strokeWidth="0.75"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <motion.text
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 45 }}
                      exit={{ opacity: 0 }}
                      y="0"
                      className="font-mono text-[10px] uppercase tracking-[0.2em] fill-[#1A1A1A]"
                    >
                      {spot.label}
                    </motion.text>
                    <motion.text
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 45 }}
                      exit={{ opacity: 0 }}
                      y="24"
                      className="font-serif italic text-[12px] fill-[#1A1A1A]/60"
                    >
                      View Extraction details
                    </motion.text>
                  </svg>
                </div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Metadata Footer */}
      <div className="mt-4 flex justify-between items-end border-t border-[#1A1A1A]/10 pt-4">
        <div>
          <span className="block font-mono text-[9px] uppercase opacity-40 mb-1">Archival_Reference</span>
          <h4 className="font-serif italic text-lg leading-none">Specimen 04-B: Mediterranean Basin</h4>
        </div>
        <div className="text-right">
          <span className="font-mono text-[9px] uppercase opacity-40 mb-1">Status</span>
          <p className="font-mono text-[10px] tracking-widest text-[#1A1A1A]">VERIFIED AT SOURCE</p>
        </div>
      </div>
    </div>
  );
};
