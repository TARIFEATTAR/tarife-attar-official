/**
 * HeroPanel Component
 *
 * A reusable panel component for the Two Roads landing page.
 * Supports textured backgrounds with color overlays for both Atlas (light) and Relic (dark) sides.
 *
 * Usage:
 *   <HeroPanel
 *     variant="atlas"
 *     backgroundUrl={data.atlasBackground}
 *     overlayOpacity={data.atlasOverlayOpacity}
 *     hotspot={data.atlasHotspot}
 *   >
 *     {children}
 *   </HeroPanel>
 */

import React from 'react'

interface HeroPanelProps {
    variant: 'atlas' | 'relic'
    backgroundUrl?: string
    overlayOpacity?: number // 0-100
    hotspot?: { x: number; y: number }
    children: React.ReactNode
    className?: string
}

export function HeroPanel({
    variant,
    backgroundUrl,
    overlayOpacity,
    hotspot,
    children,
    className = '',
}: HeroPanelProps) {
    // Design tokens - Two Roads color palette
    const colors = {
        atlas: '#F2F0E9', // Alabaster
        relic: '#1A1A1A', // Charcoal
    }

    // Default opacities if not set in Sanity
    const defaultOpacity = variant === 'atlas' ? 88 : 85
    const opacity = (overlayOpacity ?? defaultOpacity) / 100

    // Hotspot → object-position conversion for image focus
    const objectPosition = hotspot
        ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
        : 'center center'

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: colors[variant] }}
        >
            {/* Layer 1: Background Texture */}
            {backgroundUrl && (
                <img
                    src={backgroundUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    style={{ objectPosition }}
                    loading="eager"
                />
            )}

            {/* Layer 2: Color Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: colors[variant],
                    opacity: opacity,
                }}
            />

            {/* Layer 3: Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

// Type exports for use with Sanity queries
export interface HeroBackgrounds {
    atlasBackground?: string
    atlasHotspot?: { x: number; y: number }
    atlasOverlayOpacity?: number
    relicBackground?: string
    relicHotspot?: { x: number; y: number }
    relicOverlayOpacity?: number
}
