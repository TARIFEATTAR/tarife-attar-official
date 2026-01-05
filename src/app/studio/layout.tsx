/**
 * Studio Layout
 * 
 * Separate layout for Sanity Studio to avoid conflicts with site styling.
 * Studio needs a clean, full-screen layout without site-specific styles.
 * 
 * IMPORTANT: This layout bypasses Providers to prevent compass and other
 * site components from appearing in Studio.
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
        bottom: 0,
        zIndex: 9999,
        isolation: 'isolate'
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        html, body, #__next, [data-sanity], button, a, input, [role="button"] { 
          cursor: auto !important; 
        }
      `}} />
      {children}
    </div>
  );
}
