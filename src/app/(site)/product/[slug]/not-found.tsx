import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter">
          Product Not Found
        </h1>
        <p className="font-serif italic text-lg opacity-60">
          This specimen has been archived or does not exist.
        </p>
        <Link
          href="/atlas"
          className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Collections
        </Link>
      </div>
    </div>
  );
}
