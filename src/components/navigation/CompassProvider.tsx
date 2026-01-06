"use client";

import { usePathname, useRouter } from 'next/navigation';
import { RealisticCompass } from './RealisticCompass';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GhostLabels } from '@/components/ui/GhostLabels';
import { Satchel } from '@/components/cart/Satchel';
import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CompassProviderProps {
  children: ReactNode;
}

/**
 * CompassProvider - Global Navigation Manager
 * 
 * Manages the compass position across pages and integrates:
 * - RealisticCompass (bottom-right navigation)
 * - Satchel (bottom-left cart)
 * - GhostLabels (first-visit hints)
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
 */
export function CompassProvider({ children }: CompassProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showCornerCompass, setShowCornerCompass] = useState(false);
  const [showGhostLabels, setShowGhostLabels] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'atlas' | 'relic'>('atlas');

  // Page detection
  const isSplitEntryPage = pathname === '/';
  const isAtlasPage = pathname?.startsWith('/atlas') || pathname?.startsWith('/product');
  const isRelicPage = pathname?.startsWith('/relic');
  const isCartPage = pathname === '/cart';

  // Check for Studio routes
  const isStudioPage =
    typeof window !== 'undefined' && (
      pathname?.startsWith('/studio') ||
      pathname?.includes('/studio') ||
      window.location.pathname?.startsWith('/studio') ||
      window.location.pathname?.includes('/studio') ||
      document.querySelector('[data-sanity]') !== null
    );

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

  const handleNavigate = (path: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'atlas': '/atlas',
      'relic': '/relic',
      'cart': '/cart',
      'threshold': '/',
    };
    router.push(routes[path] || `/${path}`);
  };

  // Early return for Studio pages
  if (isStudioPage) {
    return <>{children}</>;
  }

  return (
    <>
      <CustomCursor />
      {children}

      {/* Ghost Labels (First-visit navigation hints) */}
      <GhostLabels 
        show={showGhostLabels} 
        compassPosition="corner"
        showSatchelLabel={!isCartPage}
        onDismiss={() => setShowGhostLabels(false)}
      />

      {/* Satchel (Bottom-left cart icon) */}
      {!isCartPage && (
        <Satchel theme={currentTheme} />
      )}

      {/* Corner Compass with fade transition */}
      <AnimatePresence>
        {showCornerCompass && (
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
    </>
  );
}

export default CompassProvider;
