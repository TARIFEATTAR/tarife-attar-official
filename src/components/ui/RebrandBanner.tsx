'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RebrandBannerProps {
    /** Banner variant: 'global' for site-wide, 'product' for product pages */
    variant?: 'global' | 'product';
    /** Override the default message */
    message?: string;
    /** LocalStorage key for dismissal persistence */
    storageKey?: string;
}

const DEFAULT_MESSAGES = {
    global: 'Navigating the Atlas: Familiar fragrances have found their territorial coordinates. Your favorites remain unchanged—only the map has evolved.',
    product: 'This fragrance has found its coordinates in the Atlas. Same formulation, new destination.',
};

export const RebrandBanner: React.FC<RebrandBannerProps> = ({
    variant = 'global',
    message,
    storageKey = 'tarife-rebrand-banner-dismissed',
}) => {
    const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
    const [isLoaded, setIsLoaded] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const dismissed = localStorage.getItem(storageKey);
        setIsDismissed(dismissed === 'true');
        setIsLoaded(true);
    }, [storageKey]);

    // Handle dismiss
    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem(storageKey, 'true');
    };

    // Don't render until we've checked localStorage
    if (!isLoaded || isDismissed) {
        return null;
    }

    const displayMessage = message || DEFAULT_MESSAGES[variant];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`
          relative
          ${variant === 'global'
                        ? 'bg-theme-charcoal text-theme-alabaster'
                        : 'bg-theme-alabaster border border-theme-charcoal/10'
                    }
        `}
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <svg
                            className={`w-4 h-4 ${variant === 'global' ? 'text-theme-gold' : 'text-theme-charcoal/40'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                    </div>

                    {/* Message */}
                    <p className={`
            flex-1 
            font-serif italic 
            text-sm
            ${variant === 'global' ? 'text-theme-alabaster/90' : 'text-theme-charcoal/70'}
          `}>
                        {displayMessage}
                    </p>

                    {/* Dismiss Button */}
                    <button
                        onClick={handleDismiss}
                        className={`
              flex-shrink-0
              font-mono text-[10px] uppercase tracking-widest
              transition-opacity duration-300
              ${variant === 'global'
                                ? 'text-theme-alabaster/50 hover:text-theme-alabaster'
                                : 'text-theme-charcoal/40 hover:text-theme-charcoal'
                            }
            `}
                        aria-label="Dismiss banner"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Hook to programmatically control rebrand banner visibility
 */
export function useRebrandBanner(storageKey = 'tarife-rebrand-banner-dismissed') {
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        setIsDismissed(localStorage.getItem(storageKey) === 'true');
    }, [storageKey]);

    const dismiss = () => {
        setIsDismissed(true);
        localStorage.setItem(storageKey, 'true');
    };

    const reset = () => {
        setIsDismissed(false);
        localStorage.removeItem(storageKey);
    };

    return { isDismissed, dismiss, reset };
}

export default RebrandBanner;
