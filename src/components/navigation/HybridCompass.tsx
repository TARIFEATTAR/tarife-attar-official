"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * HybridCompass Navigation Component
 * 
 * PLACEHOLDER: Replace this with your generated HybridCompass code from Google AI Studio.
 * 
 * This component should:
 * - Display the compass-body.png asset
 * - Use Framer Motion for physics-based animations
 * - Provide navigation between The Atlas and The Relic sections
 */

interface HybridCompassProps {
  onNavigate?: (section: "atlas" | "relic") => void;
  currentSection?: "atlas" | "relic";
}

export function HybridCompass({ onNavigate, currentSection = "atlas" }: HybridCompassProps) {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="relative w-20 h-20 cursor-pointer">
        {/* 
          TODO: Place your compass-body.png in public/assets/compass-body.png
          and uncomment the Image component below:
          
          <Image
            src="/assets/compass-body.png"
            alt="Navigation Compass"
            fill
            className="object-contain"
          />
        */}
        
        {/* Placeholder compass visual */}
        <div className="w-full h-full rounded-full bg-theme-charcoal border-2 border-theme-industrial flex items-center justify-center">
          <span className="font-mono text-xs text-theme-alabaster">
            {currentSection === "atlas" ? "A" : "R"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
