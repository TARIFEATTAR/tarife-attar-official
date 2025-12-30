/**
 * Sanity Studio Route
 * 
 * Embeds Sanity Studio in the Next.js app at /studio
 * 
 * This uses Next.js catch-all routing [[...index]] to handle
 * all Studio sub-routes (e.g., /studio, /studio/desk, etc.)
 */

import { StudioComponent } from './Studio';

// Force dynamic rendering - Studio needs to be client-side
export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return <StudioComponent />;
}
