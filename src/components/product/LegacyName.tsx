'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LegacyNameProps {
    legacyName: string | null | undefined;
    showLegacyName?: boolean;
    /** Display variant: 'inline' for product cards, 'block' for detail pages */
    variant?: 'inline' | 'block';
    /** Optional className override */
    className?: string;
}

export const LegacyName: React.FC<LegacyNameProps> = ({
    legacyName,
    showLegacyName = true,
    variant = 'inline',
    className = '',
}) => {
    // Don't render if no legacy name or if toggle is off
    if (!legacyName || !showLegacyName) {
        return null;
    }

    // Base styles matching the brand's design system
    const baseStyles = `
    font-mono 
    text-theme-industrial 
    tracking-wider 
    uppercase
  `;

    // Variant-specific styles
    const variantStyles = {
        inline: 'text-[10px] leading-tight',
        block: 'text-[11px] leading-relaxed',
    };

    return (
        <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `.trim()}
            aria-label={`Previously named ${legacyName}`}
        >
            {legacyName}
        </motion.span>
    );
};

/**
 * Product Title with Legacy Name
 * 
 * A compound component that displays the product title with legacy name below
 * Use this for consistent title + legacy name formatting across the site
 */
interface ProductTitleWithLegacyProps {
    title: string;
    legacyName?: string | null;
    showLegacyName?: boolean;
    /** Title size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const ProductTitleWithLegacy: React.FC<ProductTitleWithLegacyProps> = ({
    title,
    legacyName,
    showLegacyName = true,
    size = 'md',
    className = '',
}) => {
    const titleSizes = {
        sm: 'text-sm font-medium',
        md: 'text-base font-medium',
        lg: 'text-xl font-medium',
        xl: 'text-2xl md:text-3xl font-light',
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <h3 className={`${titleSizes[size]} text-theme-charcoal tracking-wide`}>
                {title}
            </h3>
            {legacyName && showLegacyName && (
                <LegacyName
                    legacyName={legacyName}
                    showLegacyName={showLegacyName}
                    variant={size === 'xl' || size === 'lg' ? 'block' : 'inline'}
                    className="mt-1"
                />
            )}
        </div>
    );
};

export default LegacyName;
