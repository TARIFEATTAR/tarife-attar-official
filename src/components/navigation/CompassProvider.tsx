"use client";

import { usePathname, useRouter } from 'next/navigation';
import { RealisticCompass } from './RealisticCompass';
import { CompassCurator } from './CompassCurator';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GhostLabels } from '@/components/ui/GhostLabels';
import { Satchel } from '@/components/cart/Satchel';
import { ReactNode, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CompassProviderProps {
  children: ReactNode;
}

/**
 * CompassProvider - Global Navigation Manager
 * 
 * Manages the compass position across pages and integrates:
 * - RealisticCompass (bottom-right navigation)
 * - CompassCurator (AI chat interface)
 * - Satchel (bottom-left cart)
 * - GhostLabels (first-visit hints including "Ask the Curator")
 * - CustomCursor (branded cursor)
 * 
 * Architecture:
 * - SplitEntry page: Compass rendered BY SplitEntry component (position="center")
 * - All other pages: Compass rendered HERE in layout (position="corner")
 * 
 * UX Flow:
 * - On Homepage: Centered compass scrolls away. Global corner compass FADES IN when scrolling.
 * - On Other Pages: Corner compass always visible
 * - Ghost labels appear on first visit, fade after 5s or on scroll
 * - Long-press or dedicated button opens The Curator (AI chat)
 */
export function CompassProvider({ children }: CompassProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showCornerCompass, setShowCornerCompass] = useState(false);
  const [showGhostLabels, setShowGhostLabels] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'atlas' | 'relic'>('atlas');
  const [curatorOpen, setCuratorOpen] = useState(false);
  const [compassPosition, setCompassPosition] = useState({ x: 0, y: 0 });

  // Page detection
  const isSplitEntryPage = pathname === '/';
  const isRelicPage = pathname?.startsWith('/relic');
  const isCartPage = pathname === '/cart';
  const isProductPage = pathname?.startsWith('/product');

  // Proactive "Need guidance?" state
  const [showGuidanceHint, setShowGuidanceHint] = useState(false);

  // Check for Studio routes - must be done carefully to avoid SSR issues
  const [isStudioPage, setIsStudioPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStudio =
        pathname?.startsWith('/studio') ||
        pathname?.includes('/studio') ||
        window.location.pathname?.startsWith('/studio') ||
        window.location.pathname?.includes('/studio') ||
        document.querySelector('[data-sanity]') !== null;
      setIsStudioPage(isStudio);
    }
  }, [pathname]);

  // Update theme based on current page
  useEffect(() => {
    if (isRelicPage) {
      setCurrentTheme('relic');
    } else {
      setCurrentTheme('atlas');
    }
  }, [isRelicPage]);

  // Scroll handler for compass visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!isSplitEntryPage) {
        setShowCornerCompass(true);
        return;
      }

      // On homepage, only show after scrolling past hero (80% of viewport)
      if (typeof window !== 'undefined') {
        const heroHeight = window.innerHeight * 0.8;
        setShowCornerCompass(window.scrollY > heroHeight);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isSplitEntryPage, pathname]);

  // Ghost labels visibility (only on first scroll into corner compass territory)
  useEffect(() => {
    if (showCornerCompass && !isSplitEntryPage) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setShowGhostLabels(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowGhostLabels(false);
    }
  }, [showCornerCompass, isSplitEntryPage]);

  // Track compass position for Curator morphing
  useEffect(() => {
    const updateCompassPosition = () => {
      if (typeof window !== 'undefined') {
        // Bottom-right corner position
        const x = window.innerWidth - 80;
        const y = window.innerHeight - 80;
        setCompassPosition({ x, y });
      }
    };

    updateCompassPosition();
    window.addEventListener('resize', updateCompassPosition);
    return () => window.removeEventListener('resize', updateCompassPosition);
  }, []);

  // Proactive "Need guidance?" prompt on product pages after 30 seconds
  useEffect(() => {
    if (!isProductPage || curatorOpen) {
      setShowGuidanceHint(false);
      return;
    }

    // Check if user has already interacted with Atlas
    const hasUsedAtlas = typeof window !== 'undefined' && localStorage.getItem('atlas-used');
    if (hasUsedAtlas) return;

    const timer = setTimeout(() => {
      setShowGuidanceHint(true);
      // Auto-hide after 10 seconds if not clicked
      setTimeout(() => setShowGuidanceHint(false), 10000);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isProductPage, curatorOpen, pathname]);

  const handleNavigate = useCallback((path: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'atlas': '/atlas',
      'relic': '/relic',
      'cart': '/cart',
      'threshold': '/',
    };
    router.push(routes[path] || `/${path}`);
  }, [router]);

  const handleOpenCurator = useCallback(() => {
    setCuratorOpen(true);
    setShowGuidanceHint(false);
    // Mark that user has interacted with Atlas
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas-used', 'true');
    }
  }, []);

  const handleCloseCurator = useCallback(() => {
    setCuratorOpen(false);
  }, []);

  // Early return for Studio pages
  if (isStudioPage) {
    return <>{children}</>;
  }

  return (
    <>
      <CustomCursor />
      {children}

      {/* Ghost Labels (First-visit navigation hints + "Ask Atlas") */}
      <GhostLabels
        show={showGhostLabels}
        compassPosition="corner"
        showSatchelLabel={!isCartPage}
        showCuratorLabel={true}
        onDismiss={() => setShowGhostLabels(false)}
      />

      {/* Satchel (Bottom-left cart icon) */}
      {!isCartPage && (
        <Satchel theme={currentTheme} />
      )}

      {/* Corner Compass with fade transition */}
      <AnimatePresence>
        {showCornerCompass && !curatorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed z-[2999] pointer-events-none"
          >
            <RealisticCompass
              onNavigate={handleNavigate}
              position="corner"
              size="md"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curator Trigger Button - Subtle pill to the LEFT of the compass */}
      <AnimatePresence>
        {showCornerCompass && !curatorOpen && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              // Pulse animation when guidance hint is active
              scale: showGuidanceHint ? [1, 1.05, 1] : 1,
              boxShadow: showGuidanceHint 
                ? ['0 4px 15px rgba(0,0,0,0.1)', '0 6px 25px rgba(197,166,106,0.4)', '0 4px 15px rgba(0,0,0,0.1)']
                : '0 4px 15px rgba(0,0,0,0.1)',
            }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.5,
              scale: showGuidanceHint ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {},
              boxShadow: showGuidanceHint ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {},
            }}
            onClick={handleOpenCurator}
            className={`fixed bottom-6 right-20 md:right-28 z-[2998]
                       bg-theme-alabaster/95 backdrop-blur-sm
                       px-3 md:px-4 py-2 rounded-full
                       shadow-lg shadow-theme-charcoal/10
                       border transition-all duration-300
                       group cursor-pointer
                       ${showGuidanceHint 
                         ? 'border-theme-gold/60' 
                         : 'border-theme-charcoal/10 hover:bg-theme-alabaster hover:border-theme-gold/40 hover:shadow-xl'
                       }`}
            aria-label="Ask Atlas"
          >
            <span className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] transition-colors
              ${showGuidanceHint ? 'text-theme-gold' : 'text-theme-charcoal/60 group-hover:text-theme-gold'}`}>
              {showGuidanceHint ? 'Need guidance?' : 'Ask Atlas'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* The Curator - AI Chat Interface */}
      <CompassCurator
        isOpen={curatorOpen}
        onClose={handleCloseCurator}
        compassPosition={compassPosition}
      />
    </>
  );
}

export default CompassProvider;
