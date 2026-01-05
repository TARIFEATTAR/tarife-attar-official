"use client";

import { usePathname, useRouter } from 'next/navigation';
import { RealisticCompass } from './RealisticCompass';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CompassProviderProps {
  children: ReactNode;
}

/**
 * CompassProvider manages the compass position across pages.
 * 
 * Architecture:
 * - SplitEntry page: Compass rendered BY SplitEntry component (position="center")
 * - All other pages: Compass rendered HERE in layout (position="corner")
 * 
 * UX Update:
 * - On Homepage: Centered compass scrolls away. Global corner compass FADES IN when scrolling.
 */
export function CompassProvider({ children }: CompassProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showCornerCompass, setShowCornerCompass] = useState(false);

  // Don't render compass in layout if we're on split entry page or Studio
  // (SplitEntry renders its own centered compass)
  const isSplitEntryPage = pathname === '/';

  // Check for Studio routes - be very aggressive about this
  const isStudioPage =
    typeof window !== 'undefined' && (
      pathname?.startsWith('/studio') ||
      pathname?.includes('/studio') ||
      window.location.pathname?.startsWith('/studio') ||
      window.location.pathname?.includes('/studio') ||
      document.querySelector('[data-sanity]') !== null
    );

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

  // Early return for Studio pages - don't render compass at all
  if (isStudioPage) {
    return <>{children}</>;
  }

  return (
    <>
      <CustomCursor />
      {children}

      {/* Render corner compass with fade transition */}
      <AnimatePresence>
        {showCornerCompass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed z-[2999] pointer-events-none" // Container is pointer-events-none, compass button resets it
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
