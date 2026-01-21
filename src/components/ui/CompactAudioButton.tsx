// CompactAudioButton.tsx - Mobile-only audio play button
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface CompactAudioButtonProps {
    isPlaying: boolean;
    onToggle: () => void;
    className?: string;
}

export const CompactAudioButton = ({
    isPlaying,
    onToggle,
    className = ""
}: CompactAudioButtonProps) => {
    return (
        <motion.button
            onClick={onToggle}
            className={`
        relative w-10 h-10 rounded-full 
        bg-theme-charcoal text-theme-alabaster
        flex items-center justify-center
        shadow-lg hover:bg-theme-obsidian
        transition-colors
        ${className}
      `}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
            {/* Animated ring when playing */}
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-theme-gold"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 0, 0.8]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Play/Pause Icon */}
            <AnimatePresence mode="wait">
                {isPlaying ? (
                    <motion.div
                        key="pause"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Pause className="w-4 h-4" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="play"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Play className="w-4 h-4 ml-0.5" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
