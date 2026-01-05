"use client";

import { usePathname, useRouter } from 'next/navigation';
import { RealisticCompass } from './RealisticCompass';
import { CustomCursor } from '@/components/ui/CustomCursor';
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

  // Check for Studio routes - be very aggressive about this
  const isStudioPage =
    typeof window !== 'undefined' && (
      pathname?.startsWith('/studio') ||
      pathname?.includes('/studio') ||
      window.location.pathname?.startsWith('/studio') ||
      window.location.pathname?.includes('/studio') ||
      document.querySelector('[data-sanity]') !== null
    );

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

      {/* Only render corner compass on non-entry pages */}
      {!isSplitEntryPage && (
        <RealisticCompass
          onNavigate={handleNavigate}
          position="corner"
          size="md"
        />
      )}
    </>
  );
}
