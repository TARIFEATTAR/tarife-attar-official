"use client";

import { usePathname, useRouter } from 'next/navigation';
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
 */
export function CompassProvider({ children }: CompassProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't render compass in layout if we're on split entry page or Studio
  // (SplitEntry renders its own centered compass)
  const isSplitEntryPage = pathname === '/';
  const isStudioPage = pathname?.startsWith('/studio');
  
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
    <>
      {children}
      
      {/* Only render corner compass on non-entry and non-studio pages */}
      {!isSplitEntryPage && !isStudioPage && (
        <RealisticCompass
          onNavigate={handleNavigate}
          position="corner"
          size="md"
        />
      )}
    </>
  );
}
