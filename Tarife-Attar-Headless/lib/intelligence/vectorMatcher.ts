
import { Product } from '../../types';

export interface ScentVector {
  earthy: number;
  floral: number;
  spicy: number;
  resinous: number;
}

/**
 * Maps product metadata to a numerical vector for mathematical comparison.
 */
const getProductVector = (product: Product): ScentVector => {
  const desc = (product.title + (product.scentVibe || '') + (product.materialType || '')).toLowerCase();
  
  return {
    earthy: desc.includes('cedar') || desc.includes('clay') || desc.includes('earth') ? 8 : 2,
    floral: desc.includes('floral') || desc.includes('sun') || desc.includes('rose') ? 8 : 1,
    spicy: desc.includes('oud') || desc.includes('amber') || desc.includes('smoke') ? 7 : 2,
    resinous: desc.includes('resin') || desc.includes('agarwood') || desc.includes('hojari') ? 9 : 1
  };
};

/**
 * Calculates Euclidean distance between two vectors.
 * sqrt(sum((p_i - q_i)^2))
 */
const calculateDistance = (v1: ScentVector, v2: ScentVector): number => {
  return Math.sqrt(
    Math.pow(v1.earthy - v2.earthy, 2) +
    Math.pow(v1.floral - v2.floral, 2) +
    Math.pow(v1.spicy - v2.spicy, 2) +
    Math.pow(v1.resinous - v2.resinous, 2)
  );
};

export const findSensoryMatch = (userVector: ScentVector, products: Product[]): Product[] => {
  const scored = products.map(p => ({
    product: p,
    distance: calculateDistance(userVector, getProductVector(p))
  }));

  // Sort by closest distance (smallest value = best match)
  return scored
    .sort((a, b) => a.distance - b.distance)
    .map(s => s.product)
    .slice(0, 3);
};
