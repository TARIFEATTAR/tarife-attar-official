
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

const SPECIMEN_MAPPING = [
  { min: 0, max: 25, label: 'Ethereal / Mist', matches: 'Aqueous Series (No. 01-04)' },
  { min: 25, max: 50, label: 'Fluid / Serum', matches: 'Oleic Infusions (No. 08-12)' },
  { min: 50, max: 75, label: 'Dense / Balm', matches: 'Macerated Resins (No. 14-16)' },
  { min: 75, max: 101, label: 'Concrete / Ointment', matches: 'Solid Archetypes (No. 22-25)' },
];

export const ViscosityTuner: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [viscosity, setViscosity] = useState(45);

  const activeSpecimen = useMemo(() => {
    return SPECIMEN_MAPPING.find(s => viscosity >= s.min && viscosity < s.max) || SPECIMEN_MAPPING[0];
  }, [viscosity]);

  return (
    <div className="w-full h-full flex flex-col max-w-5xl mx-auto">
      <header className="flex justify-between items-end mb-24">
        <div className="z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="group flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-4 opacity-60 hover:opacity-100 transition-opacity text-theme-alabaster pointer-events-auto"
          >
            <span className="text-lg leading-none transform group-hover:-translate-x-1 transition-transform">←</span> Return to Bifurcation
          </button>
          <h3 className="text-4xl font-light">Material Calibration</h3>
        </div>
        <div className="text-right hidden md:block">
          <span className="font-mono text-[10px] text-theme-industrial uppercase">Step 01: Physical Base Selection</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-20 items-center">
          
          {/* Left: Technical Readout */}
          <div className="hidden lg:flex flex-col gap-8 text-left">
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase opacity-30 tracking-[0.3em]">Molecular Weight</span>
              <div className="h-[1px] w-full bg-theme-alabaster/10" />
              <p className="font-mono text-xs opacity-60">Calculated: {(viscosity * 1.22).toFixed(2)} Da</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase opacity-30 tracking-[0.3em]">Stability Index</span>
              <div className="h-[1px] w-full bg-theme-alabaster/10" />
              <p className="font-mono text-xs opacity-60">Verified Stable @ 22.4°C</p>
            </div>
          </div>

          {/* Center: Interactive Dial */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <span className="font-mono text-[11px] tracking-[0.5em] uppercase opacity-30 mb-4 block">Current Calibration</span>
            <div className="text-8xl font-light tracking-tighter tabular-nums mb-4 text-theme-alabaster">
              {viscosity.toString().padStart(3, '0')}<span className="text-2xl opacity-20 ml-2">μPa·s</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={activeSpecimen.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl italic font-serif text-theme-industrial h-8"
              >
                {activeSpecimen.label}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Right: Real-time Matches */}
          <div className="text-right hidden lg:block">
            <span className="font-mono text-[9px] uppercase opacity-30 tracking-[0.3em] mb-4 block">Proposed Specimen</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-sm font-serif italic text-theme-industrial opacity-80"
            >
              {activeSpecimen.matches}
            </motion.div>
            <p className="mt-4 font-mono text-[8px] uppercase tracking-tighter opacity-20 max-w-[180px] ml-auto">
              Our lab adjusts base viscosity to match your archival preference.
            </p>
          </div>
        </div>

        {/* The Slider Instrument */}
        <div className="w-full relative px-10 mt-20">
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={viscosity}
            onChange={(e) => setViscosity(parseInt(e.target.value))}
            className="w-full h-[1px] bg-theme-alabaster/10 appearance-none cursor-crosshair accent-theme-alabaster hover:accent-white transition-all outline-none z-50 relative"
            style={{ 
              WebkitAppearance: 'none',
              background: `linear-gradient(to right, #B3B3B3 ${viscosity}%, rgba(179, 179, 179, 0.05) ${viscosity}%)`
            }}
          />
          
          <div className="flex justify-between mt-8 font-mono text-[9px] uppercase tracking-[0.3em] opacity-30">
            <span>Aqueous / 001</span>
            <span>Saturation Threshold</span>
            <span>Anhydrous / 100</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate?.('relic')}
          className="mt-24 px-16 py-5 border border-theme-alabaster/10 hover:border-theme-alabaster hover:bg-theme-alabaster hover:text-theme-obsidian transition-all duration-700 font-mono text-[11px] tracking-[0.4em] uppercase z-50 relative pointer-events-auto"
        >
          Access Specified Vault
        </motion.button>
      </div>

      {/* Aesthetic Technical Footer Overlay */}
      <div className="mt-auto pt-10 border-t border-theme-alabaster/5 grid grid-cols-4 gap-4 font-mono text-[9px] opacity-20 uppercase tracking-widest">
        <div>Ref_Index: 1.458 nD</div>
        <div>Yield: 99.4% Extraction</div>
        <div>Archival_Grade: A-01</div>
        <div className="text-right">ID: RX-771-RELIC</div>
      </div>
    </div>
  );
};
