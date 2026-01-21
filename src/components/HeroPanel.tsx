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
    hotspot?: { _type?: string; x: number; y: number; width?: number; height?: number }
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
    // TEMPORARY: Set overlayOpacity to 0 to test if images are loading
    // Remove this after confirming images work
    const testMode = process.env.NEXT_PUBLIC_HERO_TEST_MODE === 'true'
    const effectiveOpacity = testMode ? 0 : (overlayOpacity ?? defaultOpacity)
    const opacity = effectiveOpacity / 100

    // Hotspot → object-position conversion for image focus
    // Sanity hotspot format: { _type: "sanity.imageHotspot", x: 0-1, y: 0-1, width: 0-1, height: 0-1 }
    // We use x and y for object-position (CSS percentages)
    const objectPosition = hotspot && typeof hotspot === 'object' && 'x' in hotspot && 'y' in hotspot
        ? `${(hotspot.x ?? 0.5) * 100}% ${(hotspot.y ?? 0.5) * 100}%`
        : 'center center'

    // Debug logging (remove in production if needed)
    if (process.env.NODE_ENV === 'development' && backgroundUrl) {
        console.log(`[HeroPanel ${variant}] Background URL:`, backgroundUrl);
        console.log(`[HeroPanel ${variant}] Overlay Opacity:`, effectiveOpacity, '%', testMode ? '(TEST MODE - overlay disabled)' : '');
        console.log(`[HeroPanel ${variant}] Hotspot:`, hotspot);
        console.log(`[HeroPanel ${variant}] Image should be visible at:`, (100 - effectiveOpacity), '% opacity');
    }

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: colors[variant] }}
        >
            {/* Layer 1: Background Texture */}
            {backgroundUrl ? (
                <img
                    src={backgroundUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    style={{ 
                        objectPosition,
                        zIndex: 0,
                    }}
                    loading="eager"
                    onError={(e) => {
                        console.error(`[HeroPanel ${variant}] Failed to load image:`, backgroundUrl);
                        console.error('Error:', e);
                    }}
                    onLoad={(e) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`[HeroPanel ${variant}] Image loaded successfully`);
                            console.log(`[HeroPanel ${variant}] Image dimensions:`, {
                                naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                                naturalHeight: (e.target as HTMLImageElement).naturalHeight,
                            });
                        }
                    }}
                />
            ) : process.env.NODE_ENV === 'development' ? (
                <div className="absolute inset-0 bg-red-500/10 border-2 border-dashed border-red-500/30 flex items-center justify-center z-0">
                    <span className="text-xs text-red-500/50">No background image</span>
                </div>
            ) : null}

            {/* Layer 2: Color Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: colors[variant],
                    opacity: opacity,
                    zIndex: 1,
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
