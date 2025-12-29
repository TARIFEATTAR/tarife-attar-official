
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { handleReplenishToken, ReplenishResult } from '../lib/wholesale/replenishLogic';
import { calculateVectorMatch, QuizResponses } from '../lib/curator/vectorMatcher';

const MOCK_DB: Product[] = [
  {
    id: 'atlas-cedar',
    title: 'Atlas Cedar & Clay',
    price: '$95',
    imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf88bd1423?auto=format&fit=crop&q=80&w=800',
    collectionType: 'atlas',
    // Fix: Added productFormat and volume
    productFormat: 'Perfume Oil',
    volume: '9ml',
    gpsCoordinates: '31.7917° N, 7.0926° W',
    scentVibe: 'Woody, Grounded',
    kioskBlurb: 'A grounding, earthen scent inspired by the Moroccan high plains. Perfect for workspace clarity.',
    wholesalePrice: '$684 (Case)',
    caseQuantity: 12,
    leadTime: '3 Days',
    replenishToken: 'ST-CEDAR-001'
  },
  {
    id: 'relic-oud',
    title: 'Vintage Trat Agarwood',
    price: '$450',
    imageUrl: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800',
    collectionType: 'relic',
    // Fix: Added productFormat and volume
    productFormat: 'Traditional Attar',
    volume: '3ml',
    distillationYear: '2018',
    origin: 'Thailand',
    materialType: 'Oleoresin',
    scentVibe: 'Smoky, Deep Forest',
    kioskBlurb: 'Rare, aged oud resin with deep honey and smoke undertones. A collector-grade specimen.',
    wholesalePrice: '$2,160 (Case)',
    caseQuantity: 6,
    leadTime: 'Ready to Ship',
    replenishToken: 'ST-OUD-2018'
  }
];

export const OmnichannelPrototype: React.FC = () => {
  const [mode, setMode] = useState<'dtc' | 'b2b' | 'kiosk'>('dtc');
  const [replenishAlert, setReplenishAlert] = useState<ReplenishResult | null>(null);

  // Simulation: Check for ?token in URL (Engine B)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      const result = handleReplenishToken(token, MOCK_DB);
      setReplenishAlert(result);
      if (result.success) setMode('b2b');
      // Clear URL for clean UX
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setReplenishAlert(null), 5000);
    }
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ${mode === 'b2b' ? 'bg-[#0A0A0A]' : mode === 'kiosk' ? 'bg-[#F9F9F9]' : 'bg-theme-alabaster'}`}>
      {/* Mode Switcher */}
      <nav className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 flex gap-1 shadow-2xl">
        {(['dtc', 'b2b', 'kiosk'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-8 py-2 rounded-full font-mono text-[9px] uppercase tracking-[0.4em] transition-all ${mode === m ? 'bg-theme-industrial text-theme-obsidian' : 'text-white opacity-40 hover:opacity-100'}`}
          >
            {m === 'dtc' ? 'Consumer' : m === 'b2b' ? 'Wholesale' : 'Kiosk'}
          </button>
        ))}
      </nav>

      {/* Replenish Alert Toast (Engine B) */}
      <AnimatePresence>
        {replenishAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-36 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-8 py-4 rounded-lg font-mono text-[10px] uppercase tracking-widest shadow-2xl"
          >
            {replenishAlert.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-48 px-12 pb-32 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'dtc' && <DTCView key="dtc" />}
          {mode === 'b2b' && <B2BView key="b2b" />}
          {mode === 'kiosk' && <KioskView key="kiosk" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DTCView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-20"
  >
    <header className="text-theme-charcoal">
      <span className="font-mono text-[10px] uppercase tracking-[0.6em] opacity-40">Direct to Sensory Consumer</span>
      <h2 className="text-7xl font-serif italic mt-4">The Journal</h2>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {MOCK_DB.map(product => (
        <div key={product.id} className="group cursor-pointer">
          <div className="relative aspect-[16/9] overflow-hidden mb-6 bg-white shadow-sm">
            <img src={product.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 font-mono text-[9px] tracking-widest uppercase">
              {product.gpsCoordinates || product.origin}
            </div>
          </div>
          <div className="flex justify-between items-end border-b border-theme-charcoal/10 pb-4">
             <div>
               <h3 className="text-3xl font-serif italic">{product.title}</h3>
               <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">{product.scentVibe || 'Rare Material'}</span>
             </div>
             <span className="text-2xl font-mono italic">{product.price}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const B2BView = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    className="text-theme-industrial font-mono"
  >
    <header className="mb-16 border-l-4 border-theme-industrial pl-8">
      <span className="text-[10px] uppercase tracking-[0.8em] opacity-40">Official Stockist Manifest v1.0</span>
      <h2 className="text-5xl uppercase tracking-tighter mt-2">The Supply Ledger</h2>
    </header>
    
    <div className="w-full border border-theme-industrial/20 bg-white/[0.02] shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-theme-industrial/20 text-[10px] uppercase tracking-widest opacity-40">
            <th className="p-6">ID / SKU</th>
            <th className="p-6">Specimen Name</th>
            <th className="p-6">Case Qty</th>
            <th className="p-6">Wholesale Price</th>
            <th className="p-6">Actions</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {MOCK_DB.map(product => (
            <tr key={product.id} className="border-b border-theme-industrial/10 hover:bg-white/[0.03] transition-colors group">
              <td className="p-6 opacity-60 font-mono">{product.id.toUpperCase()}</td>
              <td className="p-6 font-bold tracking-widest">{product.title}</td>
              <td className="p-6 opacity-60">x{product.caseQuantity}</td>
              <td className="p-6 font-bold">{product.wholesalePrice}</td>
              <td className="p-6">
                 <button 
                  onClick={() => window.location.search = `?token=${product.replenishToken}`}
                  className="px-6 py-2 border border-theme-industrial/30 hover:border-theme-industrial hover:bg-theme-industrial hover:text-black transition-all text-[9px]"
                 >
                   SIMULATE SCAN
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const KioskView = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Partial<QuizResponses>>({});
  const [bestMatch, setBestMatch] = useState<Product | null>(null);

  const steps = [
    { key: 'mood', q: "How do you want to feel?", options: ["Grounded", "Uplifted"] },
    { key: 'landscape', q: "Preferred Landscape?", options: ["Deep Forest", "High Desert"] }
  ];

  const handleOption = (key: string, val: string) => {
    const next = { ...responses, [key]: val };
    setResponses(next);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate Vector Match (Engine C)
      const match = calculateVectorMatch(next as QuizResponses, MOCK_DB);
      setBestMatch(match);
      setStep(step + 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto text-center space-y-16 py-20"
    >
      <header className="space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-industrial">Sensory Sommelier</span>
        <h2 className="text-6xl font-serif italic text-theme-charcoal">The Perfect Path</h2>
      </header>

      <div className="bg-white p-20 shadow-2xl border border-black/5 rounded-2xl relative overflow-hidden">
        {step < steps.length ? (
          <div className="space-y-12">
            <p className="text-3xl font-serif italic">{steps[step].q}</p>
            <div className="flex gap-4 justify-center">
              {steps[step].options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => handleOption(steps[step].key, opt)}
                  className="px-12 py-6 border border-theme-charcoal/10 rounded-xl hover:bg-theme-charcoal hover:text-white transition-all text-xl font-serif italic"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-theme-industrial">Vector Analysis Complete</span>
            {bestMatch && (
              <div className="flex gap-12 items-center text-left">
                <img src={bestMatch.imageUrl} className="w-48 aspect-[3/4] object-cover rounded-lg shadow-xl" />
                <div className="flex-1">
                  <h3 className="text-4xl font-serif italic mb-4">{bestMatch.title}</h3>
                  <p className="text-xl font-serif leading-relaxed text-theme-charcoal/70 mb-8">
                    {bestMatch.kioskBlurb}
                  </p>
                  <button className="w-full py-6 bg-theme-charcoal text-white rounded-xl font-mono text-[11px] uppercase tracking-[0.6em]">
                    Experience this Extraction
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => { setStep(0); setBestMatch(null); }} className="text-[9px] font-mono uppercase tracking-widest opacity-20 underline">Reset Calibration</button>
          </motion.div>
        )}
      </div>

      <p className="font-mono text-[9px] opacity-20 uppercase tracking-[0.4em]">Optimized for Retail Concierge Display / Session v2.4</p>
    </motion.div>
  );
};
