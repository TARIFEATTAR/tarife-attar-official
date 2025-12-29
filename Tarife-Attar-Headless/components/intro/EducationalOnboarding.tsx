
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  path: 'atlas' | 'relic';
  onComplete: (category?: string) => void;
  onExit: () => void;
}

export const EducationalOnboarding: React.FC<Props> = ({ path, onComplete, onExit }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "The Medium",
      desc: "Unlike alcohol-based sprays which flash off rapidly, our perfume oils are stabilized in organic carriers for a slow-release, intimate projection.",
      label: "Molecular Stability"
    },
    {
      title: "The Ritual",
      desc: "Apply to pulse points. Allow the heat of the body to activate the scent molecules. This creates a personal atmosphere that evolves over 12 hours.",
      label: "Tarife Attär System"
    },
    {
      title: "Calibration",
      desc: "To guide your entry into the archive, select a sensory direction that resonates with your current state.",
      label: "Initial Vector"
    }
  ];

  const categories = ['Woody', 'Floral', 'Aquatic', 'Earthy'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-theme-alabaster flex flex-col items-center justify-center p-12 text-theme-charcoal"
    >
      <div className="absolute top-12 left-12">
         <span className="font-mono text-[10px] uppercase tracking-[0.8em] opacity-40">System_Onboarding // {path.toUpperCase()}</span>
      </div>
      
      <button onClick={onExit} className="absolute top-12 right-12 font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">
        Skip [x]
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-3xl w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-[#c5a66a]">{steps[step].label}</span>
            <h2 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none">{steps[step].title}</h2>
          </div>
          
          <p className="font-serif text-2xl md:text-3xl opacity-60 italic leading-relaxed max-w-2xl mx-auto">
            {steps[step].desc}
          </p>

          {step < 2 ? (
            <div className="pt-12">
              <button 
                onClick={() => setStep(step + 1)}
                className="px-16 py-6 border border-theme-charcoal font-mono text-[11px] uppercase tracking-[0.6em] hover:bg-theme-charcoal hover:text-white transition-all duration-500"
              >
                Continue Protocol
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => onComplete(cat)}
                  className="px-6 py-8 border border-theme-charcoal/20 hover:border-theme-charcoal hover:bg-theme-charcoal hover:text-white transition-all font-serif italic text-xl"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 w-full max-w-xs flex justify-between font-mono text-[9px] uppercase tracking-widest opacity-20">
        <span>Step 0{step + 1}</span>
        <div className="flex-1 mx-6 h-[1px] bg-current mt-1">
          <motion.div 
            initial={{ scaleX: 0 }} 
            animate={{ scaleX: (step + 1) / 3 }} 
            className="h-full bg-theme-charcoal origin-left" 
          />
        </div>
        <span>03</span>
      </div>
    </motion.div>
  );
};
