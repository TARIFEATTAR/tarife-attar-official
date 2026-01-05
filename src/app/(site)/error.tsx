"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-theme-obsidian flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-8">
        {/* Error Icon */}
        <div className="text-theme-gold text-6xl font-serif">⚗️</div>
        
        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-serif italic text-theme-alabaster">
            Distillation Error
          </h1>
          <p className="text-theme-industrial font-serif text-lg">
            An unexpected reaction occurred in our archive system.
          </p>
        </div>

        {/* Technical Details */}
        <div className="bg-theme-charcoal/50 border border-theme-industrial/20 p-4 rounded-sm">
          <p className="font-mono text-[10px] text-theme-industrial uppercase tracking-wider">
            Error Reference: {error.digest || "UNKNOWN"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-theme-alabaster text-theme-charcoal font-mono text-[11px] uppercase tracking-[0.3em] hover:bg-theme-gold transition-colors"
          >
            Retry Protocol
          </button>
          <a
            href="/"
            className="px-8 py-3 border border-theme-industrial/30 text-theme-alabaster font-mono text-[11px] uppercase tracking-[0.3em] hover:border-theme-alabaster transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
