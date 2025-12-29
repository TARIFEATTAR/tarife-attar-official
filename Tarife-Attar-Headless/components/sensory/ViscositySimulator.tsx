
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Props {
  initialViscosity?: number; // 1-10
}

export const ViscositySimulator: React.FC<Props> = ({ initialViscosity = 5 }) => {
  const [viscosity, setViscosity] = useState(initialViscosity);
  const controls = useAnimation();
  const isComponentMounted = useRef(true);

  // Strictly map 1-10 to 0.5s - 4.0s
  const calculateDuration = (v: number) => {
    // Linear mapping: t = 0.5 + (v-1) * (3.5/9)
    return 0.5 + (v - 1) * 0.388;
  };

  const triggerDrop = async () => {
    if (!isComponentMounted.current) return;

    const duration = calculateDuration(viscosity);

    await controls.start({
      y: 0,
      opacity: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0 }
    });

    await controls.start({
      opacity: 1,
      transition: { duration: 0.2 }
    });

    // The Fall with dynamic physics
    await controls.start({
      y: 320,
      scaleY: 1 + (11 - viscosity) * 0.05, // Lower viscosity = more stretch
      scaleX: 1 - (11 - viscosity) * 0.03, // Lower viscosity = thinner profile
      opacity: [1, 1, 0.5, 0],
      transition: { 
        duration: duration,
        ease: [0.45, 0.05, 0.55, 0.95],
      }
    });

    if (isComponentMounted.current) {
      setTimeout(triggerDrop, 600);
    }
  };

  useEffect(() => {
    isComponentMounted.current = true;
    triggerDrop();
    return () => {
      isComponentMounted.current = false;
      controls.stop();
    };
  }, [viscosity]);

  const getLabel = (v: number) => {
    if (v <= 3) return 'Aqueous / Mist';
    if (v <= 6) return 'Fluid / Serum';
    if (v <= 9) return 'Dense / Resin';
    return 'Concrete / Ointment';
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-10 bg-theme-obsidian/90 border border-white/5 text-theme-alabaster rounded-lg overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Control Dial */}
      <div className="flex flex-col items-center gap-6 min-w-[140px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Calibration</span>
        
        <div className="relative h-48 w-px bg-white/10">
          <motion.div 
            animate={{ y: (10 - viscosity) * 19 }}
            className="absolute -left-3 w-6 h-[2px] bg-theme-industrial shadow-[0_0_15px_rgba(179,179,179,0.5)]"
          />
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={viscosity}
            onChange={(e) => setViscosity(parseInt(e.target.value))}
            className="absolute h-48 w-12 opacity-0 cursor-pointer z-20 left-1/2 -translate-x-1/2"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
        </div>

        <div className="text-center">
          <span className="font-mono text-3xl tabular-nums tracking-tighter">{viscosity.toString().padStart(2, '0')}</span>
          <p className="font-serif italic text-[11px] opacity-40 mt-1">{getLabel(viscosity)}</p>
        </div>
      </div>

      {/* Glass Container Visualization */}
      <div className="relative w-48 h-[380px] border-x border-white/5 flex justify-center overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent rounded-sm">
        <div className="absolute top-0 w-full h-px bg-white/20" />
        
        {/* The Material Drop */}
        <motion.div
          animate={controls}
          className="absolute top-0 w-4 h-7 bg-gradient-to-b from-theme-industrial/20 via-theme-alabaster to-theme-industrial/20 rounded-full"
          style={{ 
            filter: 'blur(0.5px)',
            transformOrigin: 'top center'
          }}
        />

        <div className="absolute bottom-8 flex flex-col items-center opacity-10">
          <div className="w-8 h-[1px] bg-current mb-2" />
          <span className="font-mono text-[7px] uppercase tracking-[0.5em]">Base_Point</span>
        </div>
      </div>

      {/* Metadata Readout */}
      <div className="max-w-[180px] space-y-4">
        <h5 className="font-serif italic text-xl border-b border-white/10 pb-3">The Physics</h5>
        <p className="font-serif text-xs leading-relaxed opacity-50 italic">
          Calibrating the carrier substance density to optimize epidermal absorption and volatile stability.
        </p>
        <div className="font-mono text-[8px] uppercase tracking-tighter opacity-20 space-y-1">
          <p>Index: VIS-{viscosity * 7}</p>
          <p>Drag: {(viscosity * 0.12).toFixed(2)} N</p>
          <p>Rate: Stable</p>
        </div>
      </div>
    </div>
  );
};
