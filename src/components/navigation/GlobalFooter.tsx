"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
  theme?: 'light' | 'dark';
}

export const GlobalFooter: React.FC<Props> = ({ theme = 'dark' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Send to Omnisend via API
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'newsletter',
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        // Still show success - don't block UX
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // Still show success
      setIsSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-theme-obsidian' : 'bg-theme-alabaster';
  const textClass = isDark ? 'text-theme-alabaster' : 'text-theme-charcoal';
  const borderClass = isDark ? 'border-white/5' : 'border-theme-charcoal/5';
  const hoverClass = isDark ? 'hover:opacity-100' : 'hover:opacity-100';

  const navigationLinks = [
    { label: 'Threshold', href: '/' },
    { label: 'Atlas Collection', href: '/atlas' },
    { label: 'Relic Vault', href: '/relic' },
    { label: 'Territory Quiz', href: '/quiz' },
  ];

  const utilityLinks = [
    { label: 'Journal', href: '/journal' },
    { label: 'Archive', href: '/archive' },
    { label: 'Stockists', href: '/stockists' },
    { label: 'Privacy', href: '/privacy' },
  ];

  return (
    <footer className={`w-full ${bgClass} ${textClass} pt-16 md:pt-24 pb-12 px-6 md:px-24 overflow-hidden border-t ${borderClass}`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-24 items-start">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] md:tracking-[0.4em] uppercase font-semibold leading-none mb-2">
                TARIFE ATTÄR
              </h2>
              <span className="text-[9px] md:text-[10px] font-mono tracking-[0.6em] uppercase opacity-40">
                Modern Apothecary
              </span>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif italic text-base sm:text-lg md:text-xl opacity-40 leading-relaxed max-w-sm"
            >
              Clean, skin-safe perfume oils for those who travel by scent.
            </motion.p>
            
            {/* Quiz CTA - Clear and prominent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Link 
                href="/quiz"
                className={`group inline-flex items-center gap-3 py-3 px-5 border ${isDark ? 'border-theme-gold/30 hover:border-theme-gold hover:bg-theme-gold/10' : 'border-theme-charcoal/20 hover:border-theme-charcoal hover:bg-theme-charcoal/5'} transition-all duration-300`}
              >
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100">
                  Not sure where to start?
                </span>
                <span className={`font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] ${isDark ? 'text-theme-gold' : 'text-theme-charcoal'} font-medium`}>
                  Take the Quiz →
                </span>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-x-8 gap-y-4 font-mono text-[9px] uppercase tracking-widest opacity-20"
            >
              {utilityLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`${hoverClass} transition-opacity duration-300`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Navigation Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 space-y-6 md:space-y-8 w-full"
          >
            <h3 className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-20">
              Navigation
            </h3>
            <ul className="space-y-4 font-serif italic text-base sm:text-lg opacity-60">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`${hoverClass} hover:tracking-tighter transition-all duration-300 inline-block`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter / Lab Notes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 space-y-6 md:space-y-8 w-full"
          >
            <h3 className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-20">
              Lab Notes
            </h3>
            <div className="space-y-6">
              <p className="font-serif italic text-sm sm:text-base opacity-40">
                Join the ledger for private distillation alerts.
              </p>
              
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-4 font-mono text-[10px] uppercase tracking-widest text-theme-gold"
                >
                  ✓ Specimen Logged — Welcome to the Archive
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative w-full">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ARCHIVIST_EMAIL"
                    required
                    className={`w-full bg-transparent border-b ${isDark ? 'border-white/20 focus:border-white' : 'border-theme-charcoal/20 focus:border-theme-charcoal'} py-4 font-mono text-[10px] uppercase tracking-widest outline-none transition-colors placeholder:opacity-30`}
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity disabled:opacity-20"
                  >
                    {isSubmitting ? 'Processing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Technical Metadata Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mt-16 md:mt-32 pt-12 border-t ${borderClass} flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10`}
        >
          {/* GPS & Technical Data */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 font-mono text-[8px] uppercase tracking-[0.3em] opacity-20 text-center">
            <span>Lat: 31.7917° N</span>
            <span>Lon: 7.0926° W</span>
            <span>Batch: ARCH_04_2025</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Status: Verified
            </span>
          </div>
          
          {/* Copyright */}
          <div className="font-mono text-[8px] uppercase tracking-[0.3em] opacity-10 text-center">
            © {new Date().getFullYear()} Tarife Attär — All Specimens Verified Archival Grade
          </div>
        </motion.div>

        {/* Decorative Element */}
        <div className="mt-12 flex justify-center">
          <svg 
            viewBox="0 0 100 20" 
            className="w-24 h-5 opacity-10"
            fill="currentColor"
          >
            <path d="M0 10 L40 10 M60 10 L100 10" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="10" r="3" />
          </svg>
        </div>
      </div>
    </footer>
  );
};
