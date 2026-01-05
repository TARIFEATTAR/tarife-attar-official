'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type LegacyNameStyle = 'formerly' | 'once-known' | 'previously';

interface LegacyNameProps {
    legacyName: string | null | undefined;
    showLegacyName?: boolean;
    style?: LegacyNameStyle;
    /** Display variant: 'inline' for product cards, 'block' for detail pages */
    variant?: 'inline' | 'block';
    /** Optional className override */
    className?: string;
}

/**
 * Formats the legacy name with the appropriate prefix
 */
function formatLegacyName(name: string, style: LegacyNameStyle): string {
    switch (style) {
        case 'formerly':
            return `Formerly ${name}`;
        case 'once-known':
            return `Once known as ${name}`;
        case 'previously':
            return `Previously ${name}`;
        default:
            return `Formerly ${name}`;
    }
}

export const LegacyName: React.FC<LegacyNameProps> = ({
    legacyName,
    showLegacyName = true,
    style = 'formerly',
    variant = 'inline',
    className = '',
}) => {
    // Don't render if no legacy name or if toggle is off
    if (!legacyName || !showLegacyName) {
        return null;
    }

    const formattedName = formatLegacyName(legacyName, style);

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
            aria-label={`This product was previously named ${legacyName}`}
        >
            {formattedName}
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
    legacyNameStyle?: LegacyNameStyle;
    /** Title size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const ProductTitleWithLegacy: React.FC<ProductTitleWithLegacyProps> = ({
    title,
    legacyName,
    showLegacyName = true,
    legacyNameStyle = 'formerly',
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
                    style={legacyNameStyle}
                    variant={size === 'xl' || size === 'lg' ? 'block' : 'inline'}
                    className="mt-1"
                />
            )}
        </div>
    );
};

export default LegacyName;
