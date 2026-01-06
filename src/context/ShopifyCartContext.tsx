"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  shopifyFetch,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  ADD_LINES_MUTATION,
  UPDATE_LINES_MUTATION,
  REMOVE_LINES_MUTATION,
  formatVariantId
} from '@/lib/shopify';

interface CartItem {
  id: string; // Line item ID
  variantId: string;
  title: string;
  handle: string;
  quantity: number;
  price: string;
  currencyCode: string;
}

interface ShopifyCartContextType {
  items: CartItem[];
  itemCount: number;
  cartTotal: string;
  checkoutUrl: string;
  isLoading: boolean;
  error: string | null;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const ShopifyCartContext = createContext<ShopifyCartContextType | undefined>(undefined);

export function ShopifyCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const initCart = async () => {
      setIsLoading(true);
      try {
        const cartId = localStorage.getItem('shopify_cart_id');

        if (cartId) {
          const response = await shopifyFetch({
            query: GET_CART_QUERY,
            variables: { cartId }
          });

          if (response.data?.cart) {
            setCart(response.data.cart);
          } else {
            // Cart might be expired, clear it
            localStorage.removeItem('shopify_cart_id');
            await createNewCart();
          }
        } else {
          await createNewCart();
        }
      } catch (err) {
        setError('Failed to initialize cart');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  const createNewCart = async () => {
    try {
      const response = await shopifyFetch({
        query: CREATE_CART_MUTATION,
        variables: { input: {} }
      });

      const newCart = response.data?.cartCreate?.cart;
      if (newCart) {
        setCart(newCart);
        localStorage.setItem('shopify_cart_id', newCart.id);
        return newCart;
      }
    } catch (err) {
      console.error('Error creating cart:', err);
    }
    return null;
  };

  const addItem = async (variantId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);

    let currentCart = cart;
    if (!currentCart) {
      console.log('No cart available. Creating new cart...');
      // Await the creation and use the RETURNED value, not the state
      currentCart = await createNewCart();

      if (!currentCart) {
        const errorMsg = 'Failed to create cart. Please check your Shopify configuration.';
        setError(errorMsg);
        setIsLoading(false);
        throw new Error(errorMsg);
      }
    }

    try {
      const formattedVariantId = formatVariantId(variantId);
      console.log('Adding item to cart:', { variantId, formattedVariantId, quantity, cartId: currentCart.id });

      const response = await shopifyFetch({
        query: ADD_LINES_MUTATION,
        variables: {
          cartId: currentCart.id,
          lines: [{
            merchandiseId: formattedVariantId,
            quantity
          }]
        }
      });

      console.log('Shopify response:', response);

      if (response.errors) {
        console.error('Shopify GraphQL errors:', response.errors);
        throw new Error(response.errors[0]?.message || 'Failed to add item to cart');
      }

      if (response.data?.cartLinesAdd?.cart) {
        setCart(response.data.cartLinesAdd.cart);
        console.log('Successfully added item to cart');
      } else {
        throw new Error('Invalid response from Shopify');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      console.error('Error adding item to cart:', err);
      setError(errorMessage);
      throw err; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(lineId);
      return;
    }

    setIsLoading(true);
    try {
      const response = await shopifyFetch({
        query: UPDATE_LINES_MUTATION,
        variables: {
          cartId: cart.id,
          lines: [{ id: lineId, quantity }]
        }
      });

      if (response.data?.cartLinesUpdate?.cart) {
        setCart(response.data.cartLinesUpdate.cart);
      }
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (lineId: string) => {
    setIsLoading(true);
    try {
      const response = await shopifyFetch({
        query: REMOVE_LINES_MUTATION,
        variables: {
          cartId: cart.id,
          lineIds: [lineId]
        }
      });

      if (response.data?.cartLinesRemove?.cart) {
        setCart(response.data.cartLinesRemove.cart);
      }
    } catch (err) {
      setError('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('shopify_cart_id');
      await createNewCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Map Shopify response to clean state
  const items: CartItem[] = cart?.lines?.edges?.map(({ node }: any) => ({
    id: node.id,
    variantId: node.merchandise.id,
    title: node.merchandise.product.title,
    handle: node.merchandise.product.handle,
    quantity: node.quantity,
    price: String(node.merchandise.price?.amount || '0.00'),
    currencyCode: node.merchandise.price?.currencyCode || 'USD'
  })) || [];

  const itemCount = cart?.totalQuantity || 0;
  const cartTotal = String(cart?.cost?.totalAmount?.amount || '0.00');
  const checkoutUrl = cart?.checkoutUrl || '';

  return (
    <ShopifyCartContext.Provider
      value={{
        items,
        itemCount,
        cartTotal,
        checkoutUrl,
        isLoading,
        error,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </ShopifyCartContext.Provider>
  );
}

export function useShopifyCart() {
  const context = useContext(ShopifyCartContext);
  if (context === undefined) {
    throw new Error('useShopifyCart must be used within a ShopifyCartProvider');
  }
  return context;
}
