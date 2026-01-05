import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-theme-alabaster flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-8">
        {/* 404 Display */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-theme-industrial">
            Protocol_404
          </span>
          <h1 className="text-[8rem] md:text-[12rem] font-serif font-bold leading-none text-theme-charcoal/10">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-serif italic text-theme-charcoal">
            Specimen Not Found
          </h2>
          <p className="text-theme-charcoal/60 font-serif text-lg max-w-sm mx-auto">
            The archival record you seek has been relocated, misfiled, or never existed within our collection.
          </p>
        </div>

        {/* Navigation */}
        <div className="pt-8 space-y-4">
          <Link
            href="/"
            className="inline-block px-12 py-4 bg-theme-charcoal text-theme-alabaster font-mono text-[11px] uppercase tracking-[0.4em] hover:bg-theme-obsidian transition-colors"
          >
            Return to Archive
          </Link>
          
          <div className="flex justify-center gap-8 pt-4">
            <Link 
              href="/atlas" 
              className="font-mono text-[10px] uppercase tracking-widest text-theme-industrial hover:text-theme-charcoal transition-colors"
            >
              Atlas
            </Link>
            <Link 
              href="/relic" 
              className="font-mono text-[10px] uppercase tracking-widest text-theme-industrial hover:text-theme-charcoal transition-colors"
            >
              Relic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
