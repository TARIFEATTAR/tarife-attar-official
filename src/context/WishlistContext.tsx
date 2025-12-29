"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  items: Product[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from persistence after hydration
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('tarife_wishlist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist archive", e);
      }
    }
  }, []);

  // Save to persistence
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('tarife_wishlist', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(i => i.id === id);
  };

  const itemCount = items.length;

  return (
    <WishlistContext.Provider value={{ 
      items, 
      isOpen, 
      setIsOpen, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      itemCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
