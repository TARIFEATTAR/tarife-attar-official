/**
 * Studio Layout
 * 
 * Separate layout for Sanity Studio to avoid conflicts with site styling.
 * Studio needs a clean, full-screen layout without site-specific styles.
 * 
 * Note: We use a route group approach - Studio gets minimal styling
 * to allow Sanity's own styles to take over.
 */

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {children}
    </div>
  );
}
