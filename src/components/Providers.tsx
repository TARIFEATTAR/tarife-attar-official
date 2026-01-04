"use client";

import { ReactNode } from "react";
import { ShopifyCartProvider, WishlistProvider } from "@/context";
import { CompassProvider } from "@/components/navigation/CompassProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ShopifyCartProvider>
      <WishlistProvider>
        <CompassProvider>
          {children}
        </CompassProvider>
      </WishlistProvider>
    </ShopifyCartProvider>
  );
}
