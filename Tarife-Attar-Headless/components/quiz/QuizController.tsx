
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { findSensoryMatch, ScentVector } from '../../lib/intelligence/vectorMatcher';
import { Product } from '../../types';

interface Props {
  products: Product[];
  onComplete: (product: Product) => void;
}

const QUIZ_STEPS = [
  {
    id: 'foundation',
    question: 'Define your desired foundation.',
    options: [
      { label: 'Mineral / Cool Earth', vector: { earthy: 10, floral: 0, spicy: 2, resinous: 1 } },
      { label: 'Solar / Warm Petals', vector: { earthy: 1, floral: 10, spicy: 1, resinous: 2 } }
    ]
  },
  {
    id: 'density',
    question: 'Select the material density.',
    options: [
      { label: 'Ethereal / Mist', vector: { earthy: 2, floral: 5, spicy: 1, resinous: 2 } },
      { label: 'Dense / Ancient Resin', vector: { earthy: 4, floral: 1, spicy: 6, resinous: 10 } }
    ]
  },
  {
    id: 'vibration',
    question: 'The final atmospheric vibration.',
    options: [
      { label: 'Quiet / Architectural', vector: { earthy: 8, floral: 2, spicy: 2, resinous: 4 } },
      { label: 'Assertive / Smoked', vector: { earthy: 4, floral: 1, spicy: 10, resinous: 6 } }
    ]
  }
];

export const QuizController: React.FC<Props> = ({ products, onComplete }) => {
  const [step, setStep] = useState(0);
  const [accumulatedVector, setAccumulatedVector] = useState<ScentVector>({ earthy: 0, floral: 0, spicy: 0, resinous: 0 });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [recommendation, setRecommendation] = useState<{ product: Product, note: string } | null>(null);

  const handleSelect = async (vector: ScentVector) => {
    const nextVector = {
      earthy: accumulatedVector.earthy + vector.earthy,
      floral: accumulatedVector.floral + vector.floral,
      spicy: accumulatedVector.spicy + vector.spicy,
      resinous: accumulatedVector.resinous + vector.resinous,
    };
    
    setAccumulatedVector(nextVector);

    if (step < QUIZ_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setIsSynthesizing(true);
      
      try {
        const matches = findSensoryMatch(nextVector, products);
        const topMatch = matches[0];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Explain why a seeker who prefers ${JSON.stringify(nextVector)} would resonate with the product: ${topMatch.title}. 
          Keep the tone archival, scientific, and high-end. Max 30 words.`,
          config: {
            systemInstruction: 'You are the Senior Alchemist for Tarife Attär. Your voice is sophisticated and technical.',
          }
        });

        setRecommendation({
          product: topMatch,
          note: response.text || "A molecular alignment of significant stability."
        });
      } catch (e) {
        setRecommendation({
          product: products[0],
          note: "A curated alignment between your sensory foundation and our archival specimens."
        });
      } finally {
        setIsSynthesizing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col justify-center items-center px-6 relative z-10">
      <AnimatePresence mode="wait">
        {!recommendation ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-center space-y-20"
          >
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-charcoal/40">Calibration_Phase_0{step + 1}</span>
              <h2 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-theme-charcoal leading-tight">
                {QUIZ_STEPS[step].question}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
              {QUIZ_STEPS[step].options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.vector)}
                  disabled={isSynthesizing}
                  className="flex-1 px-12 py-10 border border-theme-charcoal/30 bg-white/40 backdrop-blur-sm rounded-sm hover:border-theme-charcoal hover:bg-theme-charcoal hover:text-white transition-all duration-700 text-2xl md:text-3xl font-serif italic group relative overflow-hidden text-theme-charcoal"
                >
                  <span className="relative z-10 transition-opacity group-hover:opacity-100">{opt.label}</span>
                  <div className="absolute inset-0 bg-theme-charcoal/5 group-hover:bg-transparent" />
                </button>
              ))}
            </div>

            {/* Subliminal Progress */}
            <div className="max-w-xs mx-auto w-full h-[1px] bg-theme-charcoal/10 relative overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: `${((step + 1) / QUIZ_STEPS.length) * 100 - 100}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="absolute inset-0 bg-theme-charcoal h-full"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
          >
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(20px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 2 }}
              className="relative aspect-[3/4] bg-white shadow-2xl p-6 group"
            >
              <img 
                src={recommendation.product.imageUrl} 
                className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 transition-all duration-[3s]" 
                alt={recommendation.product.title}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
            </motion.div>

            <div className="space-y-12">
              <div className="space-y-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-theme-charcoal/40">Molecular_Synthesis_Verified</span>
                <h3 className="text-6xl md:text-7xl font-serif italic leading-[0.9] text-theme-charcoal">{recommendation.product.title}</h3>
              </div>

              <div className="space-y-6 border-l border-theme-charcoal/10 pl-8">
                <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-theme-charcoal/30 block">Sommelier's Note</span>
                <p className="font-serif italic text-2xl leading-relaxed text-theme-charcoal/80">
                  "{recommendation.note}"
                </p>
              </div>

              <div className="pt-8 space-y-4">
                <button 
                  onClick={() => onComplete(recommendation.product)}
                  className="w-full py-8 bg-theme-charcoal text-white font-mono text-[11px] uppercase tracking-[0.8em] shadow-xl hover:bg-black transition-colors"
                >
                  View Full Extraction
                </button>
                <button 
                  onClick={() => {
                    setRecommendation(null);
                    setStep(0);
                    setAccumulatedVector({ earthy: 0, floral: 0, spicy: 0, resinous: 0 });
                  }}
                  className="w-full py-4 font-mono text-[9px] uppercase tracking-[0.5em] text-theme-charcoal/30 hover:text-theme-charcoal transition-colors"
                >
                  Reset Calibration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSynthesizing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[5000] bg-theme-alabaster/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8 text-theme-charcoal"
        >
          <div className="w-16 h-16 border-t-2 border-theme-charcoal rounded-full animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-[1.5em] animate-pulse">Processing_Extraction</span>
        </motion.div>
      )}
    </div>
  );
};
