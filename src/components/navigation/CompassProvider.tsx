"use client";

import { usePathname, useRouter } from 'next/navigation';
import { LayoutGroup } from 'framer-motion';
import { RealisticCompass } from './RealisticCompass';
import { ReactNode } from 'react';

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
 * The layoutId="compass-root" ensures smooth morphing between positions.
 */
export function CompassProvider({ children }: CompassProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't render compass in layout if we're on split entry page
  // (SplitEntry renders its own centered compass)
  const isSplitEntryPage = pathname === '/';
  
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

  return (
    <LayoutGroup>
      {children}
      
      {/* Only render corner compass on non-entry pages */}
      {!isSplitEntryPage && (
        <RealisticCompass
          onNavigate={handleNavigate}
          position="corner"
          size="md"
        />
      )}
    </LayoutGroup>
  );
}
