export default function Loading() {
    return (
        <div className="min-h-screen bg-theme-alabaster flex items-center justify-center">
            <div className="text-center space-y-6">
                {/* Animated Logo Mark */}
                <div className="relative">
                    <span className="text-8xl font-serif font-bold text-theme-gold animate-pulse">
                        A
                    </span>
                </div>

                {/* Loading indicator */}
                <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-theme-charcoal/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-theme-charcoal/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-theme-charcoal/30 rounded-full animate-bounce" />
                </div>

                {/* Status text */}
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-industrial">
                    Entering Atlas...
                </p>
            </div>
        </div>
    );
}
