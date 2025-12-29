
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

type Stage = 'void' | 'inscription' | 'manifest' | 'fission' | 'handoff';

export const EntryLoader: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('void');

  useEffect(() => {
    const sequence = async () => {
      // Total sequence reduced to ~2.5 seconds
      await new Promise(r => setTimeout(r, 200));
      setStage('inscription');
      await new Promise(r => setTimeout(r, 600));
      setStage('manifest');
      await new Promise(r => setTimeout(r, 700));
      setStage('fission');
      await new Promise(r => setTimeout(r, 400));
      setStage('handoff');
      await new Promise(r => setTimeout(r, 600));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  // Tightened transition durations
  const insigniaTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[500] bg-theme-alabaster flex items-center justify-center overflow-hidden"
    >
      <div className="relative flex items-center justify-center gap-[0.4em] text-4xl md:text-8xl tracking-[0.2em] font-serif font-light text-theme-charcoal">
        
        {/* The Brand Name Inscription */}
        <motion.span
          animate={{ 
            opacity: stage === 'void' ? 0 : (stage === 'fission' || stage === 'handoff' ? 0.2 : 1),
            filter: stage === 'fission' || stage === 'handoff' ? 'blur(10px)' : 'blur(0px)',
            y: stage === 'void' ? 15 : 0,
            scale: stage === 'void' ? 0.98 : 1
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="whitespace-nowrap"
        >
          TARIFE
        </motion.span>

        <div className="flex items-center">
          {/* Insignia: Atlas */}
          <motion.span
            layoutId="insignia-atlas"
            animate={{ 
              scale: stage === 'manifest' ? 1.2 : 1,
              // Bronze only flashes during manifest stage, otherwise settles to ink black
              color: stage === 'manifest' ? '#c5a66a' : '#1A1A1A',
              fontWeight: stage === 'manifest' ? 700 : 400,
              opacity: stage === 'void' ? 0 : 1
            }}
            transition={insigniaTransition}
            className="inline-block relative z-10"
          >
            A
          </motion.span>

          {/* Dissolving Characters */}
          <motion.span
            animate={{ 
              opacity: stage === 'void' ? 0 : (stage === 'fission' || stage === 'handoff' ? 0.05 : 1),
              filter: stage === 'fission' || stage === 'handoff' ? 'blur(15px)' : 'blur(0px)',
              scale: stage === 'fission' || stage === 'handoff' ? 0.8 : 1
            }}
            transition={{ duration: 0.8 }}
            className="inline-block"
          >
            TTÄ
          </motion.span>

          {/* Insignia: Relic */}
          <motion.span
            layoutId="insignia-relic"
            animate={{ 
              scale: stage === 'manifest' ? 1.2 : 1,
              color: stage === 'manifest' ? '#c5a66a' : '#1A1A1A',
              fontWeight: stage === 'manifest' ? 700 : 400,
              opacity: stage === 'void' ? 0 : 1
            }}
            transition={insigniaTransition}
            className="inline-block relative z-10"
          >
            R
          </motion.span>
        </div>
      </div>
      
      {/* Cinematic World Fission */}
      <AnimatePresence>
        {(stage === 'fission' || stage === 'handoff') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[-1] flex pointer-events-none"
          >
            <div className="w-1/2 h-full bg-theme-alabaster" />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
              className="w-1/2 h-full bg-theme-obsidian" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manifestation Atmosphere */}
      <AnimatePresence>
        {stage === 'manifest' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--theme-industrial)_0%,_transparent_70%)]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
