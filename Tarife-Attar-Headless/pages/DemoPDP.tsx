
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FieldReport } from '../components/sensory/FieldReport';
import { ViscositySimulator } from '../components/sensory/ViscositySimulator';
import { SillageLine } from '../components/sensory/SillageLine';
import { Hotspot } from '../types';

interface Props {
  onNavigate?: (path: string) => void;
}

export const DemoPDP: React.FC<Props> = ({ onNavigate }) => {
  const [theme, setTheme] = useState<'atlas' | 'relic'>('atlas');

  const hotspots: Hotspot[] = [
    { x: 25, y: 35, label: "Atlas Cedarwood", link: "#" },
    { x: 72, y: 28, label: "Wild Bergamot", link: "#" },
    { x: 50, y: 75, label: "Aged Resin", link: "#" }
  ];

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${theme === 'atlas' ? 'bg-[#F2F0E9] text-[#1A1A1A]' : 'bg-[#121212] text-[#F2F0E9]'}`}>
      {/* Instrument Selection Header */}
      <header className="p-12 border-b border-current/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-transparent relative z-20 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <span className={`font-mono text-[10px] uppercase tracking-[0.6em] px-3 py-1 border rounded-full ${theme === 'atlas' ? 'border-[#1A1A1A]/20' : 'border-white/20'}`}>Phase 02</span>
             <span className={`font-mono text-[10px] uppercase tracking-[0.5em] opacity-40`}>Instrument_Calibration_v04</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic leading-none">R&D Field Laboratory</h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setTheme('atlas')}
            className={`px-8 py-3 font-mono text-[10px] uppercase tracking-[0.4em] border transition-all ${theme === 'atlas' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-current opacity-40 hover:opacity-100'}`}
          >
            Atlas Protocol
          </button>
          <button 
            onClick={() => setTheme('relic')}
            className={`px-8 py-3 font-mono text-[10px] uppercase tracking-[0.4em] border transition-all ${theme === 'relic' ? 'bg-[#F2F0E9] text-[#121212] border-[#F2F0E9]' : 'border-current opacity-40 hover:opacity-100'}`}
          >
            Relic Protocol
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 p-12 pb-40">
        {/* Visual Archive & Sillage */}
        <section className="space-y-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-baseline gap-4 mb-8">
               <span className="font-mono text-[11px] opacity-30">[01]</span>
               <h2 className="font-mono text-[10px] uppercase tracking-[0.4em]">Atmospheric Field Study</h2>
            </div>
            <div className="opacity-80 scale-95 origin-left">
              <FieldReport 
                imageUrl="https://images.unsplash.com/photo-1547483238-2cbf88bd1423?auto=format&fit=crop&q=80&w=1200"
                hotspots={hotspots}
              />
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="max-w-xl"
          >
             <div className="flex items-baseline gap-4 mb-8">
               <span className="font-mono text-[11px] opacity-30">[02]</span>
               <h2 className="font-mono text-[10px] uppercase tracking-[0.4em]">Projection Trajectory</h2>
            </div>
            <SillageLine projection={75} duration={14} />
          </motion.div>
        </section>

        {/* Physical Material & Technical Specs */}
        <section className="space-y-32">
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <div className="flex items-baseline gap-4 mb-8">
               <span className="font-mono text-[11px] opacity-30">[03]</span>
               <h2 className="font-mono text-[10px] uppercase tracking-[0.4em]">Viscosity Calibration</h2>
            </div>
            <div className="scale-95 origin-right">
              <ViscositySimulator />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`p-12 border border-current/10 ${theme === 'atlas' ? 'bg-[#1A1A1A]/5' : 'bg-[#F2F0E9]/5'}`}
          >
            <h3 className="font-serif text-3xl italic mb-8">Laboratory Dispatch</h3>
            <div className="space-y-6 font-mono text-[11px] tracking-tighter uppercase opacity-60">
              <div className="flex justify-between border-b border-current/10 pb-2">
                <span>Calibration_State</span>
                <span className="text-emerald-500 font-bold">● ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-current/10 pb-2">
                <span>Optical_Density</span>
                <span>1.458 nD</span>
              </div>
              <div className="flex justify-between border-b border-current/10 pb-2">
                <span>Vibration_Rate</span>
                <span>440Hz / 8.2</span>
              </div>
            </div>
            <p className="mt-12 font-serif text-lg italic leading-relaxed opacity-60">
              This environment serves as the technical testing ground for all sensory components. Adjust the instruments to observe real-time molecular shifts and stability thresholds.
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="p-12 text-center">
        <div className="w-12 h-px bg-current/20 mx-auto mb-8" />
        <span className="font-mono text-[8px] uppercase tracking-[0.8em] opacity-20">Secure Laboratory Session v4.02 / Built for Archival Verification</span>
      </footer>
    </div>
  );
};
