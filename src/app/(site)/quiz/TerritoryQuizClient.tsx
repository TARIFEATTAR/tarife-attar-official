"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Compass, MapPin, Sparkles } from 'lucide-react';
import { GlobalFooter } from '@/components/navigation';

/**
 * Territory Quiz - "Discover Your Territory"
 * 
 * A 5-question scent profile quiz that assigns users to one of four territories:
 * - EMBER: Spice. Warmth. The intimacy of ancient routes.
 * - PETAL: Bloom. Herb. The exhale of living gardens.
 * - TIDAL: Salt. Mist. The pull of open water.
 * - TERRA: Wood. Oud. The gravity of deep forests.
 * 
 * Email capture at completion with "Save Your Territory Profile"
 */

interface Territory {
  id: 'EMBER' | 'PETAL' | 'TIDAL' | 'TERRA';
  name: string;
  tagline: string;
  description: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const TERRITORIES: Territory[] = [
  {
    id: 'EMBER',
    name: 'Ember',
    tagline: 'Spice. Warmth. The intimacy of ancient routes.',
    description: 'Your soul gravitates toward warmth and depth. You find comfort in spice markets, candlelit evenings, and the memory of distant travels. Amber, saffron, and smoky woods speak your language.',
    color: '#B45309',
    gradientFrom: '#78350F',
    gradientTo: '#B45309',
  },
  {
    id: 'PETAL',
    name: 'Petal',
    tagline: 'Bloom. Herb. The exhale of living gardens.',
    description: 'You are drawn to the living world — gardens at dawn, herbs crushed between fingers, the intoxicating sweetness of night-blooming flowers. Jasmine, rose, and green herbs resonate with your spirit.',
    color: '#DB2777',
    gradientFrom: '#831843',
    gradientTo: '#DB2777',
  },
  {
    id: 'TIDAL',
    name: 'Tidal',
    tagline: 'Salt. Mist. The pull of open water.',
    description: 'The ocean calls to you. You seek the crispness of sea air, the mineral tang of wet stone, the freedom of endless horizons. Aquatic notes, citrus, and ozonic freshness are your compass.',
    color: '#0891B2',
    gradientFrom: '#164E63',
    gradientTo: '#0891B2',
  },
  {
    id: 'TERRA',
    name: 'Terra',
    tagline: 'Wood. Oud. The gravity of deep forests.',
    description: 'Ancient woods and sacred resins ground your soul. You are drawn to the profound — sandalwood temples, oud-infused meditation, the earthy depth of moss and vetiver. Depth over brightness.',
    color: '#059669',
    gradientFrom: '#064E3B',
    gradientTo: '#059669',
  },
];

interface Question {
  id: number;
  question: string;
  subtext: string;
  options: {
    text: string;
    territories: ('EMBER' | 'PETAL' | 'TIDAL' | 'TERRA')[];
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "When you close your eyes and imagine peace, where do you find yourself?",
    subtext: "Let your mind wander freely.",
    options: [
      { text: "A candlelit room with incense smoke curling toward the ceiling", territories: ['EMBER'] },
      { text: "A garden at dawn, dew still on the petals", territories: ['PETAL'] },
      { text: "Standing on a cliff, salt wind in your hair", territories: ['TIDAL'] },
      { text: "Deep in an ancient forest, surrounded by towering trees", territories: ['TERRA'] },
    ],
  },
  {
    id: 2,
    question: "What draws you to a scent?",
    subtext: "First instinct, don't overthink.",
    options: [
      { text: "Warmth — like being wrapped in something comforting", territories: ['EMBER'] },
      { text: "Life — the vibrancy of something fresh and alive", territories: ['PETAL'] },
      { text: "Clarity — clean, bright, almost transparent", territories: ['TIDAL'] },
      { text: "Depth — layers that reveal themselves slowly", territories: ['TERRA'] },
    ],
  },
  {
    id: 3,
    question: "Your ideal evening involves...",
    subtext: "Choose the atmosphere, not the activity.",
    options: [
      { text: "Intimate conversation over spiced tea or mulled wine", territories: ['EMBER'] },
      { text: "Dinner al fresco surrounded by blooming jasmine", territories: ['PETAL'] },
      { text: "Sunset by the water, barefoot and unburdened", territories: ['TIDAL'] },
      { text: "A quiet cabin, wood fire crackling, rain outside", territories: ['TERRA'] },
    ],
  },
  {
    id: 4,
    question: "Which texture speaks to you?",
    subtext: "Feel it in your imagination.",
    options: [
      { text: "Velvet — rich, warm, enveloping", territories: ['EMBER'] },
      { text: "Silk — smooth, delicate, alive with color", territories: ['PETAL'] },
      { text: "Linen — light, airy, uncomplicated", territories: ['TIDAL'] },
      { text: "Leather — substantial, aged, with character", territories: ['TERRA'] },
    ],
  },
  {
    id: 5,
    question: "The scent that stops you in your tracks would be...",
    subtext: "The one you'd follow.",
    options: [
      { text: "Saffron and amber drifting from an open doorway", territories: ['EMBER'] },
      { text: "Night-blooming jasmine on a summer evening", territories: ['PETAL'] },
      { text: "Sea spray and driftwood on a quiet beach", territories: ['TIDAL'] },
      { text: "Aged sandalwood and smoky oud in a temple", territories: ['TERRA'] },
    ],
  },
];

export function TerritoryQuizClient() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ('EMBER' | 'PETAL' | 'TIDAL' | 'TERRA')[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [resultTerritory, setResultTerritory] = useState<Territory | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Calculate result when quiz is complete
  const calculateResult = () => {
    const scores: Record<string, number> = {
      EMBER: 0,
      PETAL: 0,
      TIDAL: 0,
      TERRA: 0,
    };

    Object.values(answers).forEach((territories) => {
      territories.forEach((territory) => {
        scores[territory]++;
      });
    });

    const winningTerritory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as 'EMBER' | 'PETAL' | 'TIDAL' | 'TERRA';
    return TERRITORIES.find((t) => t.id === winningTerritory)!;
  };

  const handleAnswer = (territories: ('EMBER' | 'PETAL' | 'TIDAL' | 'TERRA')[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: territories,
    }));

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 300);
    } else {
      // Quiz complete
      setTimeout(() => {
        const result = calculateResult();
        setResultTerritory(result);
        setShowResult(true);
      }, 500);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resultTerritory) return;

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
          source: 'quiz',
          territory: resultTerritory.id.toLowerCase(),
        }),
      });

      if (response.ok) {
        // Also store locally for redundancy
        const profiles = JSON.parse(localStorage.getItem('territory-profiles') || '[]');
        profiles.push({
          email,
          territory: resultTerritory.id,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('territory-profiles', JSON.stringify(profiles));
        
        setEmailSubmitted(true);
      } else {
        console.error('Subscription failed');
        // Still show success to user - email captured server-side
        setEmailSubmitted(true);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still show success - don't block UX
      setEmailSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-theme-alabaster">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Site</span>
          </button>
          
          {!showIntro && !showResult && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50">
                {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <div className="w-20 h-1 bg-theme-charcoal/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-theme-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 pb-20 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {showIntro && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center px-4"
            >
              <div className="max-w-xl text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-20 h-20 mx-auto mb-8 rounded-full bg-theme-charcoal/5 flex items-center justify-center"
                >
                  <Compass className="w-10 h-10 text-theme-gold" strokeWidth={1} />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4"
                >
                  The Territory Quiz
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-serif tracking-tighter leading-tight mb-6"
                >
                  Discover Your<br />Territory
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-serif italic text-lg md:text-xl text-theme-charcoal/70 mb-4"
                >
                  Four territories. Four olfactory worlds.<br />
                  Which one speaks to your soul?
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-charcoal/50 mb-10"
                >
                  5 questions · 2 minutes
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowIntro(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-theme-charcoal text-theme-alabaster px-8 py-4 rounded-full font-mono text-sm uppercase tracking-[0.2em] hover:bg-theme-charcoal/90 transition-colors"
                >
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Questions */}
          {!showIntro && !showResult && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex items-center justify-center px-4 py-8"
            >
              <div className="max-w-2xl w-full">
                <div className="text-center mb-10 md:mb-14">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-theme-charcoal/40 block mb-4">
                    {currentQ.subtext}
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight leading-tight text-theme-charcoal">
                    {currentQ.question}
                  </h2>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {currentQ.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(option.territories)}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full text-left p-5 md:p-6 rounded-xl border border-theme-charcoal/10 bg-white/50 hover:bg-white hover:border-theme-gold/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      <p className="font-serif text-base md:text-lg text-theme-charcoal/80 group-hover:text-theme-charcoal transition-colors">
                        {option.text}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Result Screen */}
          {showResult && resultTerritory && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              {/* Territory Hero */}
              <div
                className="relative py-16 md:py-24 px-4 text-white"
                style={{
                  background: `linear-gradient(135deg, ${resultTerritory.gradientFrom} 0%, ${resultTerritory.gradientTo} 100%)`,
                }}
              >
                <div className="max-w-2xl mx-auto text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <MapPin className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/70 block mb-3"
                  >
                    Your Territory
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl md:text-7xl font-serif tracking-tighter mb-4"
                  >
                    {resultTerritory.name}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="font-serif italic text-xl md:text-2xl text-white/90"
                  >
                    {resultTerritory.tagline}
                  </motion.p>
                </div>
              </div>

              {/* Result Content */}
              <div className="flex-1 bg-theme-alabaster px-4 py-12 md:py-16">
                <div className="max-w-xl mx-auto">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg md:text-xl font-serif leading-relaxed text-theme-charcoal/80 text-center mb-10"
                  >
                    {resultTerritory.description}
                  </motion.p>

                  {/* Email Capture */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-theme-charcoal/5"
                  >
                    {!emailSubmitted ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-theme-gold" />
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-gold">
                            Save Your Profile
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-serif text-center mb-2">
                          Receive your territory guide
                        </h3>
                        <p className="font-serif italic text-theme-charcoal/60 text-center mb-6">
                          Plus personalized scent recommendations based on your profile.
                        </p>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your@email.com"
                              required
                              className="w-full px-5 py-4 rounded-xl border border-theme-charcoal/10 bg-theme-alabaster/50 font-serif text-base focus:outline-none focus:border-theme-gold/50 focus:ring-2 focus:ring-theme-gold/20 transition-all"
                              style={{ fontSize: '16px' }}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-theme-charcoal text-theme-alabaster py-4 rounded-xl font-mono text-sm uppercase tracking-[0.2em] hover:bg-theme-charcoal/90 transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? 'Saving...' : 'Save My Territory'}
                          </button>
                        </form>

                        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-theme-charcoal/30 text-center mt-4">
                          No spam. Unsubscribe anytime.
                        </p>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-serif mb-2">Profile Saved!</h3>
                        <p className="font-serif italic text-theme-charcoal/60">
                          Check your inbox for your territory guide.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex flex-col sm:flex-row gap-3 mt-8 justify-center"
                  >
                    <button
                      onClick={() => router.push(`/atlas?territory=${resultTerritory.id.toLowerCase()}`)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-theme-charcoal/20 font-mono text-sm uppercase tracking-[0.15em] hover:bg-theme-charcoal hover:text-theme-alabaster transition-colors"
                    >
                      Explore {resultTerritory.name}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setShowIntro(true);
                        setCurrentQuestion(0);
                        setAnswers({});
                        setEmailSubmitted(false);
                        setEmail('');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-mono text-sm uppercase tracking-[0.15em] text-theme-charcoal/60 hover:text-theme-charcoal transition-colors"
                    >
                      Retake Quiz
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showResult && <GlobalFooter />}
    </div>
  );
}
