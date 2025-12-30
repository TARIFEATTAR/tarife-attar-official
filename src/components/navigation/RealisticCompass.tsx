"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  direction: 'N' | 'E' | 'S' | 'W';
  angle: number;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Threshold', path: 'home', direction: 'N', angle: 0, description: 'Return to origin' },
  { label: 'The Relic', path: 'relic', direction: 'E', angle: 90, description: 'Pure resins & rare materials' },
  { label: 'Satchel', path: 'cart', direction: 'S', angle: 180, description: 'Your collection' },
  { label: 'The Atlas', path: 'atlas', direction: 'W', angle: -90, description: 'Perfume oil territories' },
];

interface Props {
  onNavigate: (path: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RealisticCompass: React.FC<Props> = ({ onNavigate, size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
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

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: { compass: 80, expanded: 280 },
    md: { compass: 100, expanded: 360 },
    lg: { compass: 140, expanded: 440 },
  };

  const config = sizeConfig[size];

  // The needle image is at ~45° by default, so we offset
  const needleBaseOffset = 45;

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
            className="fixed inset-0 z-[2998] bg-theme-obsidian/90 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            {/* Expanded Navigation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute bottom-8 right-8 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Ring */}
              <div 
                className="relative flex items-center justify-center"
                style={{ width: config.expanded, height: config.expanded }}
              >
                {/* Compass Body - Enlarged */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: isHovered ? [0, 5, -5, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                    style={{ width: config.expanded * 0.7, height: config.expanded * 0.7 }}
                  >
                    <Image
                      src="/assets/compass-body.png"
                      alt="Compass"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                    
                    {/* Animated Needle */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ 
                        rotate: activeDirection 
                          ? NAV_ITEMS.find(i => i.direction === activeDirection)?.angle || 0 
                          : needleRotation.get() 
                      }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      style={{ rotate: -needleBaseOffset }}
                    >
                      <div className="relative w-[85%] h-[85%]">
                        <Image
                          src="/assets/compass-needle.png"
                          alt="Needle"
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Navigation Labels */}
                {NAV_ITEMS.map((item) => {
                  const radius = config.expanded / 2 + 20;
                  const rad = ((item.angle - 90) * Math.PI) / 180;
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;

                  return (
                    <motion.button
                      key={item.direction}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => handleNavClick(item)}
                      onMouseEnter={() => setActiveDirection(item.direction)}
                      onMouseLeave={() => setActiveDirection(null)}
                      className="absolute flex flex-col items-center group"
                      style={{ 
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      <span className={`font-mono text-[10px] uppercase tracking-[0.4em] transition-all duration-300 ${
                        activeDirection === item.direction 
                          ? 'text-theme-gold scale-110' 
                          : 'text-theme-alabaster/60 hover:text-theme-alabaster'
                      }`}>
                        {item.label}
                      </span>
                      <AnimatePresence>
                        {activeDirection === item.direction && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="font-serif italic text-[9px] text-theme-alabaster/40 mt-1 whitespace-nowrap"
                          >
                            {item.description}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {/* Close hint */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-theme-alabaster/30"
              >
                Click anywhere to close
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Compass Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[3000] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div 
          className="relative"
          style={{ width: config.compass, height: config.compass }}
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
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              rotate: -needleBaseOffset,
            }}
            animate={{
              rotate: isHovered && !isOpen 
                ? [-needleBaseOffset + 15, -needleBaseOffset - 15, -needleBaseOffset] 
                : -needleBaseOffset,
            }}
            transition={
              isHovered && !isOpen 
                ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' }
                : { type: 'spring', stiffness: 80, damping: 20 }
            }
          >
            <motion.div 
              className="relative w-[85%] h-[85%]"
              style={{ rotate: needleRotation }}
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
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: isHovered 
                ? '0 0 30px rgba(197, 166, 106, 0.3)' 
                : '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>

        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/60 bg-theme-alabaster px-3 py-2 rounded-sm shadow-lg">
                Navigate
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
