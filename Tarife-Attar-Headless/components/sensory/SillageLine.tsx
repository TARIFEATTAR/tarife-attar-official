
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  projection: number; // 0 to 100 (Reach)
  duration: number;   // 0 to 100 (Longevity/Persistence)
}

export const SillageLine: React.FC<Props> = ({ projection = 75, duration = 14 }) => {
  // Persistence mapping: How long the line stays visible before dissolving
  const fadeDuration = 3 + (duration * 0.1); 

  return (
    <div className="w-full py-6 space-y-8">
      {/* Instrumentation Header */}
      <div className="flex justify-between items-end border-b border-current/10 pb-6">
        <div className="space-y-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.5em] opacity-40">Spatial Profile</span>
          <h6 className="font-serif italic text-3xl leading-none tracking-tighter">Sillage Visualizer</h6>
        </div>
        <div className="text-right space-y-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.5em] opacity-40">Persistent Decay</span>
          <p className="font-mono text-2xl tabular-nums leading-none tracking-tighter">{duration}h Est.</p>
        </div>
      </div>

      {/* The Parchment Field */}
      <div className="relative h-40 w-full flex items-center bg-current/[0.02] border border-current/5 rounded-sm px-10 overflow-hidden backdrop-blur-[1px]">
        {/* Baseline Trace */}
        <div className="absolute left-0 w-full h-[1px] bg-current opacity-5 border-t border-dashed" />
        
        {/* The Animated Sillage Pulse (Fading Ink) */}
        <div className="relative w-full h-20 flex items-center">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${projection}%` }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className="h-[1.5px] bg-gradient-to-r from-transparent via-current to-transparent relative"
          >
            {/* The Active Molecule Pulse */}
            <motion.div
              animate={{ 
                opacity: [1, 0.3, 1],
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 0px currentColor",
                  "0 0 15px currentColor",
                  "0 0 0px currentColor"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current"
            />
            
            {/* The Dissolving Trail (Fading Ink) */}
            <motion.div
              animate={{ 
                opacity: [0.8, 0],
                filter: ["blur(0px)", "blur(12px)"],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: fadeDuration, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-current pointer-events-none origin-left"
            />
          </motion.div>

          {/* Environmental Echoes */}
          {[0.1, 0.05, 0.02].map((op, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${projection - (i * 20)}%`, opacity: op }}
              transition={{ duration: 2 + i, ease: "circOut" }}
              className="absolute h-[1px] bg-current top-1/2 -translate-y-1/2 blur-[1px]"
            />
          ))}
        </div>

        {/* Real-time Status Data */}
        <div className="absolute bottom-4 left-10 flex gap-10 font-mono text-[8px] uppercase tracking-[0.3em] opacity-20 italic">
          <span>Ref_Delta: {(projection * 0.42).toFixed(2)}</span>
          <span>Atm_Decay: Stable</span>
        </div>
      </div>
      
      <p className="font-serif italic text-sm opacity-30 text-center max-w-sm mx-auto">
        Visualizing the aromatic envelope as it transitions from high-energy projection to deep archival skin-scent.
      </p>
    </div>
  );
};
