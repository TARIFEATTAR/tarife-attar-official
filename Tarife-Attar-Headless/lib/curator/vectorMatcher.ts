
import { Product } from '../../types';

export interface QuizResponses {
  mood: 'Grounded' | 'Uplifted';
  landscape: 'Deep Forest' | 'High Desert';
}

/**
 * Calculates the best sensory match based on vector proximity to product tags.
 */
export const calculateVectorMatch = (responses: QuizResponses, products: Product[]): Product => {
  // Define vector weights for our products based on their scentVibe/materialType
  const scoreProduct = (product: Product) => {
    let score = 0;
    const description = (product.title + (product.scentVibe || '') + (product.kioskBlurb || '')).toLowerCase();

    // Mood Proximity
    if (responses.mood === 'Grounded') {
      if (description.includes('cedar') || description.includes('earth') || description.includes('clay')) score += 5;
    } else {
      if (description.includes('solar') || description.includes('sun') || description.includes('floral')) score += 5;
    }

    // Landscape Proximity
    if (responses.landscape === 'Deep Forest') {
      if (description.includes('moss') || description.includes('wood') || description.includes('rain')) score += 5;
    } else {
      if (description.includes('mineral') || description.includes('dry') || description.includes('sand')) score += 5;
    }

    return score;
  };

  const scored = products.map(p => ({ product: p, score: scoreProduct(p) }));
  return scored.sort((a, b) => b.score - a.score)[0].product;
};
