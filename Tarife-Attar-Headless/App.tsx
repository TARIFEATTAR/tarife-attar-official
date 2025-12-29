
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from './pages/Home';
import { EntryLoader } from './components/intro/EntryLoader';
import { AtlasGrid } from './components/catalog/AtlasGrid';
import { RelicGallery } from './components/catalog/RelicGallery';
import { AtlasLogLayout } from './components/product/AtlasLogLayout';
import { RelicLabLayout } from './components/product/RelicLabLayout';
import { ApothecaryAssistant } from './components/assistant/ApothecaryAssistant';
import { SmartCompass } from './components/nav/SmartCompass';
import { SatchelDrawer } from './components/cart/SatchelDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { QuizController } from './components/quiz/QuizController';
import { EducationalOnboarding } from './components/intro/EducationalOnboarding';
import { GlobalFooter } from './components/nav/GlobalFooter';
import { CartProvider, useSatchel } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { Product } from './types';

const MOCK_CATALOG: Product[] = [
  { id: 'atlas-cedar', title: 'Atlas Cedar & Clay', price: '$95', imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf88bd1423?auto=format&fit=crop&q=80&w=800', collectionType: 'atlas', productFormat: 'Perfume Oil', volume: '9ml', gpsCoordinates: '31.7917° N, 7.0926° W', scentVibe: 'Woody, earthy, mineral' },
  { id: 'relic-hojari', title: 'Royal Green Hojari', price: '$320', imageUrl: 'https://images.unsplash.com/photo-1605335122530-9b5b96792663?auto=format&fit=crop&q=80&w=800', collectionType: 'relic', productFormat: 'Traditional Attar', volume: '3ml', distillationYear: 'Harvest 2023', origin: 'Dhofar, Oman', materialType: 'Resin' }
];

function AppContent() {
  const [view, setView] = useState<'home' | 'atlas' | 'relic' | 'pdp' | 'quiz' | 'onboarding'>('home');
  const [onboardingPath, setOnboardingPath] = useState<'atlas' | 'relic' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [locationStr, setLocationStr] = useState<string | undefined>();
  
  const { setIsOpen: setSatchelOpen, itemCount } = useSatchel();
  const { setIsOpen: setWishlistOpen, wishlist } = useWishlist();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocationStr(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
      });
    }
  }, []);

  const handleGlobalNavigate = (path: string) => {
    setView(path as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPDP = (product: Product) => {
    setSelectedProduct(product);
    setView('pdp');
  };

  const handleGuidedEntry = (path: 'atlas' | 'relic') => {
    setOnboardingPath(path);
    setView('onboarding');
  };

  const finishOnboarding = () => {
    if (onboardingPath) {
      setView(onboardingPath);
      setOnboardingPath(null);
    }
  };

  const isLightTheme = (view === 'atlas' || view === 'home' || view === 'quiz' || view === 'onboarding') || (view === 'pdp' && selectedProduct?.collectionType === 'atlas');

  return (
    <main className={`w-full min-h-screen font-serif transition-colors duration-1000 overflow-x-hidden ${isLightTheme ? 'bg-theme-alabaster' : 'bg-theme-obsidian'}`}>
      <AnimatePresence mode="wait">
        {showIntro ? (
          <EntryLoader key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <motion.div 
            key="main-content" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full flex flex-col"
          >
            <header className={`sticky top-0 left-0 w-full z-[150] transition-all duration-700 ${isLightTheme ? 'bg-theme-alabaster/95 text-theme-charcoal border-theme-charcoal/10' : 'bg-theme-obsidian/95 text-theme-alabaster border-white/10'} backdrop-blur-xl border-b`}>
              <div className="max-w-[1800px] mx-auto px-4 md:px-12 h-16 md:h-24 flex items-center justify-between">
                
                {/* Brand Logo - Responsive Scaling */}
                <div className="flex-1 lg:flex-none lg:w-1/3 flex flex-col cursor-pointer" onClick={() => handleGlobalNavigate('home')}>
                  <h1 className="text-base sm:text-lg md:text-xl tracking-[0.3em] sm:tracking-[0.4em] uppercase font-semibold leading-none flex items-center">
                    <span className="mr-[0.2em] md:mr-[0.4em]">TARIFE</span>
                    <motion.span layoutId="insignia-atlas" className="inline-block" transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>A</motion.span>
                    <span>TTÄ</span>
                    <motion.span layoutId="insignia-relic" className="inline-block" transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>R</motion.span>
                  </h1>
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden lg:flex flex-1 justify-center items-center gap-12 text-[10px] font-mono tracking-[0.4em] uppercase">
                  <button onClick={() => handleGlobalNavigate('home')} className={`transition-opacity opacity-${view === 'home' ? '100' : '40'} hover:opacity-100`}>Threshold</button>
                  <button onClick={() => handleGlobalNavigate('atlas')} className={`transition-opacity opacity-${view === 'atlas' ? '100' : '40'} hover:opacity-100`}>Atlas</button>
                  <button onClick={() => handleGlobalNavigate('relic')} className={`transition-opacity opacity-${view === 'relic' ? '100' : '40'} hover:opacity-100`}>Relic</button>
                </nav>

                {/* Mobile & Desktop Actions */}
                <div className="flex-1 lg:flex-none lg:w-1/3 flex items-center justify-end gap-1 sm:gap-4">
                    <button onClick={() => setWishlistOpen(true)} className="flex items-center p-2 opacity-40 hover:opacity-100 transition-opacity">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                      <span className="font-mono text-[9px] hidden sm:inline ml-2">({wishlist.length})</span>
                    </button>
                    <button onClick={() => setSatchelOpen(true)} className="flex items-center gap-2 px-3 sm:px-6 py-2 border border-current/10 rounded-full font-mono text-[9px] uppercase tracking-widest hover:bg-current hover:text-current transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      <span className="hidden sm:inline">Satchel</span> <span className="sm:opacity-60">({itemCount})</span>
                    </button>
                </div>
              </div>
            </header>

            <div className="flex-1 w-full relative">
              <AnimatePresence mode="wait">
                {view === 'onboarding' && onboardingPath && (
                  <EducationalOnboarding 
                    path={onboardingPath} 
                    onComplete={finishOnboarding} 
                    onExit={() => finishOnboarding()} 
                  />
                )}
                {view === 'home' && (
                  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                    <Home onNavigate={handleGlobalNavigate} onProductClick={openPDP} onGuidedEntry={handleGuidedEntry} />
                  </motion.div>
                )}
                {view === 'quiz' && (
                  <motion.div key="quiz" className="pt-20">
                    <QuizController products={MOCK_CATALOG} onComplete={openPDP} />
                  </motion.div>
                )}
                {view === 'atlas' && (
                  <motion.div key="atlas" className="pt-0">
                    <AtlasGrid onProductClick={openPDP} />
                  </motion.div>
                )}
                {view === 'relic' && (
                  <motion.div key="relic" className="pt-8">
                    <RelicGallery onProductClick={openPDP} />
                  </motion.div>
                )}
                {view === 'pdp' && selectedProduct && (
                  <motion.div key="pdp">
                    {selectedProduct.collectionType === 'atlas' ? (
                      <AtlasLogLayout product={selectedProduct} onBack={() => setView('atlas')} />
                    ) : (
                      <RelicLabLayout product={selectedProduct} onBack={() => setView('relic')} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <GlobalFooter />
            
            <SmartCompass 
              view={view} 
              theme={isLightTheme ? 'light' : 'dark'} 
              gpsCoordinates={locationStr}
              onNavigate={handleGlobalNavigate}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
            
            <SatchelDrawer />
            <WishlistDrawer />
            <ApothecaryAssistant 
              theme={isLightTheme ? 'light' : 'dark'} 
              isControlledOpen={assistantOpen}
              onCloseControlled={() => setAssistantOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </WishlistProvider>
  );
}
