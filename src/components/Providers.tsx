"use client";

import { ReactNode } from "react";
import { ShopifyCartProvider, WishlistProvider } from "@/context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ShopifyCartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </ShopifyCartProvider>
  );
}
