
import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

interface Props {
  view: string;
  theme: 'light' | 'dark';
  gpsCoordinates?: string;
  onNavigate: (path: string) => void;
  onOpenAssistant: () => void;
}

export const SmartCompass: React.FC<Props> = ({ view, theme, gpsCoordinates, onNavigate, onOpenAssistant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isLight = theme === 'light';

  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,
    damping: 24,
    mass: 0.8
  });

  const accentColor = isLight ? '#1A1A1A' : '#F2F0E9';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[2500] bg-theme-obsidian/90 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-8 md:p-12"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="w-full max-w-4xl overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8)] bg-white rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:grid md:grid-cols-2">
                <button 
                  onClick={() => { onNavigate('quiz'); setIsOpen(false); }}
                  className="relative group overflow-hidden bg-theme-alabaster text-theme-charcoal flex flex-col items-center justify-center p-8 sm:p-12 md:p-20 text-center border-b border-theme-charcoal/5 md:border-b-0 md:border-r"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03]" />
                  <div className="relative z-10 space-y-3 md:space-y-6">
                    <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.6em] text-[#c5a66a]">PROTOCOL_01</span>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif italic leading-none group-hover:tracking-tighter transition-all duration-[1s]">Sensory Curator</h2>
                    <p className="font-serif italic text-xs sm:text-sm md:text-lg opacity-60 max-w-[200px] md:max-w-xs mx-auto">Calibrate for your molecular match.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { onOpenAssistant(); setIsOpen(false); }}
                  className="relative group overflow-hidden bg-theme-obsidian text-theme-alabaster flex flex-col items-center justify-center p-8 sm:p-12 md:p-20 text-center"
                >
                  <div className="relative z-10 space-y-3 md:space-y-6">
                    <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.6em] opacity-40">PROTOCOL_02</span>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif italic leading-none group-hover:tracking-tighter transition-all duration-[1s]">The Alchemist</h2>
                    <p className="font-serif italic text-xs sm:text-sm md:text-lg opacity-60 max-w-[200px] md:max-w-xs mx-auto">Direct archival consultation.</p>
                  </div>
                </button>
              </div>
              
              <div className="bg-white p-6 sm:p-8 md:p-10 border-t border-theme-charcoal/5 flex flex-col gap-6">
                 <div className="flex justify-center gap-8 sm:gap-12 md:gap-14 font-mono text-[9px] uppercase tracking-[0.4em]">
                   {['Home', 'Atlas', 'Relic'].map(label => (
                     <button key={label} onClick={() => { onNavigate(label.toLowerCase() === 'home' ? 'home' : label.toLowerCase()); setIsOpen(false); }} className="opacity-40 hover:opacity-100 transition-opacity py-2">
                       {label}
                     </button>
                   ))}
                 </div>
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-theme-charcoal/5 pt-6">
                   <div className="font-mono text-[8px] opacity-20 uppercase tracking-[0.6em] italic text-center sm:text-left">
                      {gpsCoordinates || "LOCATING_SOURCE..."}
                   </div>
                   <button 
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                   >
                     [ Close Protocol ]
                   </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-0 right-0 z-[3000] cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 flex items-end justify-end p-4 sm:p-6 md:p-8">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-[#f4f2ec] border border-theme-charcoal/5 shadow-2xl overflow-hidden">
               <div className="absolute inset-0 border-[3px] sm:border-[4px] md:border-[6px] border-[#c5a66a]/10 rounded-full" />
               <svg viewBox="0 0 128 128" className="absolute inset-0 w-full h-full p-2 sm:p-3 md:p-4 overflow-visible pointer-events-none">
                {[{ deg: 0, l: 'N' }, { deg: 90, l: 'E' }, { deg: 180, l: 'S' }, { deg: 270, l: 'W' }].map(m => (
                  <g key={m.deg} transform={`rotate(${m.deg}, 64, 64)`}>
                    <text x="64" y="22" textAnchor="middle" className="font-serif italic font-bold select-none" fill="#1A1A1A" fillOpacity="0.4" fontSize="16px">{m.l}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Needle */}
            <motion.div 
              animate={{ rotate: isHovered ? [0, 360] : needleRotation.get() }}
              transition={isHovered ? { duration: 1.5, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 overflow-visible drop-shadow-md">
                <path d="M32 10 L35 32 L32 54 L29 32 Z" fill={accentColor} />
              </svg>
            </motion.div>

            {/* Pivot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div 
                animate={{ scale: isHovered || isOpen ? 1.2 : 1 }}
                className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-[#c5a66a] border border-white/40 shadow-xl" 
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
