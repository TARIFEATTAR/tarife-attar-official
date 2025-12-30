"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  direction: 'N' | 'E' | 'S' | 'W';
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Threshold', path: 'home', direction: 'N', description: 'Return to origin' },
  { label: 'The Relic', path: 'relic', direction: 'E', description: 'Pure resins & rare materials' },
  { label: 'Satchel', path: 'cart', direction: 'S', description: 'Your collection' },
  { label: 'The Atlas', path: 'atlas', direction: 'W', description: 'Perfume oil territories' },
];

interface Props {
  onNavigate: (path: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RealisticCompass: React.FC<Props> = ({ onNavigate, size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Scroll-based needle rotation
  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Physics-based spring for smooth needle movement
  const needleRotation = useSpring(rawRotation, {
    stiffness: 80,
    damping: 20,
    mass: 1.2,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sizeConfig = {
    sm: 80,
    md: 100,
    lg: 140,
  };

  const compassSize = sizeConfig[size];
  const needleBaseOffset = 45; // The needle image is at 45° by default

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2998] bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            {/* Navigation Grid */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[90vw] max-w-lg aspect-square flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compass in Center */}
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/assets/compass-body.png"
                  alt="Compass"
                  fill
                  className="object-contain"
                  priority
                />
                <motion.div
                  className="absolute inset-0"
                  style={{ rotate: needleRotation }}
                >
                  <div 
                    className="relative w-full h-full"
                    style={{ transform: `rotate(-${needleBaseOffset}deg)` }}
                  >
                    <Image
                      src="/assets/compass-needle.png"
                      alt="Needle"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </motion.div>
              </div>

              {/* North - Threshold */}
              <button
                onClick={() => handleNavClick(NAV_ITEMS[0])}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-center group"
              >
                <span className="block font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 group-hover:text-theme-gold transition-colors">
                  {NAV_ITEMS[0].label}
                </span>
                <span className="block font-serif italic text-[10px] text-white/40 mt-1">
                  {NAV_ITEMS[0].description}
                </span>
              </button>

              {/* East - Relic */}
              <button
                onClick={() => handleNavClick(NAV_ITEMS[1])}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-center group"
              >
                <span className="block font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 group-hover:text-theme-gold transition-colors">
                  {NAV_ITEMS[1].label}
                </span>
                <span className="block font-serif italic text-[10px] text-white/40 mt-1">
                  {NAV_ITEMS[1].description}
                </span>
              </button>

              {/* South - Satchel */}
              <button
                onClick={() => handleNavClick(NAV_ITEMS[2])}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center group"
              >
                <span className="block font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 group-hover:text-theme-gold transition-colors">
                  {NAV_ITEMS[2].label}
                </span>
                <span className="block font-serif italic text-[10px] text-white/40 mt-1">
                  {NAV_ITEMS[2].description}
                </span>
              </button>

              {/* West - Atlas */}
              <button
                onClick={() => handleNavClick(NAV_ITEMS[3])}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-center group"
              >
                <span className="block font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 group-hover:text-theme-gold transition-colors">
                  {NAV_ITEMS[3].label}
                </span>
                <span className="block font-serif italic text-[10px] text-white/40 mt-1">
                  {NAV_ITEMS[3].description}
                </span>
              </button>

              {/* Close hint */}
              <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-white/30">
                Click anywhere to close
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Compass Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-[3000] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: compassSize, height: compassSize }}
      >
        {/* Compass Body */}
        <motion.div
          animate={{ 
            rotate: isHovered && !isOpen ? [0, 5, -5, 0] : 0,
          }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Image
            src="/assets/compass-body.png"
            alt="Navigation Compass"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </motion.div>

        {/* Animated Needle */}
        <motion.div
          className="absolute inset-0"
          style={{ rotate: needleRotation }}
        >
          <motion.div 
            className="relative w-full h-full"
            style={{ transform: `rotate(-${needleBaseOffset}deg)` }}
            animate={{
              rotate: isHovered && !isOpen 
                ? [0, 15, -15, 0] 
                : 0,
            }}
            transition={
              isHovered && !isOpen 
                ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' }
                : { type: 'spring', stiffness: 80, damping: 20 }
            }
          >
            <Image
              src="/assets/compass-needle.png"
              alt="Compass Needle"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: isHovered 
              ? '0 0 30px rgba(197, 166, 106, 0.4)' 
              : '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        />
      </motion.button>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed bottom-6 z-[2999] pointer-events-none"
            style={{ right: compassSize + 40 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/60 bg-white px-3 py-2 rounded-sm shadow-lg">
              Navigate
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
