"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { useDeviceTier } from '@/Hooks/useDeviceTier';

/**
 * "Oil & Stone" Motion Physics
 * Heavy friction, slow stop - like thick oil settling on stone
 */
const OIL_STONE_PHYSICS = {
  ease: [0.19, 1, 0.22, 1] as const,
  duration: 0.6,
};

const OIL_STONE_SPRING = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 1.2,
};

/**
 * Pulsing Coordinate - "Thinking" state animation
 * Shows coordinates cycling to imply searching the Atlas
 */
const COORDINATES = [
  "34.0522° N, 118.2437° W",
  "41.8902° N, 12.4922° E",
  "35.6762° N, 139.6503° E",
  "48.8566° N, 2.3522° E",
  "31.7683° N, 35.2137° E",
];

const ThinkingIndicator: React.FC = () => {
  const [coordIndex, setCoordIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordIndex(prev => (prev + 1) % COORDINATES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 py-3"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-2 h-2 rounded-full bg-theme-gold"
      />
      <span className="font-mono text-[10px] tracking-wider text-theme-charcoal/50">
        {COORDINATES[coordIndex]}
      </span>
    </motion.div>
  );
};

/**
 * Chat Message Component
 * User: EB Garamond Italic (Traveler's Voice)
 * AI: JetBrains Mono (Curator's Data)
 */
const ChatMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Extract text content from parts
  const textContent = message.parts
    ?.filter(part => part.type === 'text')
    .map(part => 'text' in part ? part.text : '')
    .join('') || '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OIL_STONE_PHYSICS}
      className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}
    >
      {/* Role Label */}
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-theme-charcoal/40 mb-1 block">
        {isUser ? 'You' : 'Tori'}
      </span>
      
      {/* Message Content */}
      <p className={`
        leading-relaxed
        ${isUser 
          ? 'font-serif italic text-theme-charcoal/80 text-right' 
          : 'font-mono text-xs text-theme-charcoal/90 text-left'
        }
      `}>
        {textContent}
      </p>
    </motion.div>
  );
};

interface CompassCuratorProps {
  isOpen: boolean;
  onClose: () => void;
  compassPosition: { x: number; y: number };
}

/**
 * CompassCurator - "The Field Log"
 * 
 * AI Chat interface that morphs out of the Compass.
 * Mobile: Sheet sliding up 85vh
 * Desktop: Floating glass slide, 350px width
 */
export const CompassCurator: React.FC<CompassCuratorProps> = ({
  isOpen,
  onClose,
}) => {
  const { isLowPower, tier } = useDeviceTier();
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Initialize chat with Vercel AI SDK v3
  const { messages, sendMessage, status, setMessages } = useChat({
    id: 'curator-chat',
  });
  
  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Welcome, traveler. I am Tori, curator of this archive. Describe the atmosphere you seek, and I shall guide you to the appropriate territory.' }],
      }]);
    }
  }, [messages.length, setMessages]);
  
  const isLoading = status === 'streaming' || status === 'submitted';
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);
  
  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  // Glass material - degrades on low power devices
  const glassMaterial = isLowPower || tier === 'low'
    ? 'bg-theme-alabaster' // Solid fallback
    : 'bg-theme-alabaster/90 backdrop-blur-xl';
  
  // Container variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: isMobile ? 100 : 20,
      transformOrigin: isMobile ? 'bottom center' : 'bottom right',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        ...OIL_STONE_SPRING,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: isMobile ? 50 : 10,
      transition: { duration: 0.3, ease: OIL_STONE_PHYSICS.ease },
    },
  };
  
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim();
      setInputValue('');
      
      try {
        await sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: userMessage }],
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, [inputValue, isLoading, sendMessage]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-theme-charcoal/20 z-[3000]"
            onClick={onClose}
          />
          
          {/* Chat Container */}
          <motion.div
            layoutId="compass-curator-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              fixed z-[3001] overflow-hidden
              ${glassMaterial}
              shadow-2xl shadow-theme-charcoal/10
              ${isMobile 
                ? 'inset-x-0 bottom-0 h-[85vh] rounded-t-3xl' 
                : 'bottom-24 right-6 w-[380px] h-[500px] rounded-2xl'
              }
            `}
            style={{
              // Ensure 16px+ font size to prevent iOS zoom
              fontSize: '16px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-charcoal/10">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-theme-charcoal/60">
                  The Curator
                </h2>
                <p className="font-serif italic text-sm text-theme-charcoal/40 mt-0.5">
                  Tori
                </p>
              </div>
              
              {/* Close Button - Compass rotates to X */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-theme-charcoal/5 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 45 }}
                  transition={OIL_STONE_PHYSICS}
                  className="relative w-5 h-5"
                >
                  <span className="absolute top-1/2 left-0 w-full h-0.5 bg-theme-charcoal/60 -translate-y-1/2" />
                  <span className="absolute top-0 left-1/2 w-0.5 h-full bg-theme-charcoal/60 -translate-x-1/2" />
                </motion.div>
              </motion.button>
            </div>
            
            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-6 py-4"
              style={{ 
                height: isMobile ? 'calc(85vh - 140px)' : 'calc(500px - 140px)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(26,26,26,0.2) transparent',
              }}
            >
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Thinking Indicator */}
              <AnimatePresence>
                {isLoading && <ThinkingIndicator />}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <form 
              onSubmit={handleFormSubmit}
              className="px-6 py-4 border-t border-theme-charcoal/10"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Describe your atmosphere (e.g., 'Rain on stone')..."
                  className={`
                    w-full bg-transparent border-0 outline-none
                    font-serif italic text-theme-charcoal/80
                    placeholder:text-theme-charcoal/30 placeholder:not-italic
                    pb-2 text-base
                  `}
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                
                {/* Animated Underline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-theme-charcoal/10">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: inputFocused ? '100%' : '0%' }}
                    transition={OIL_STONE_PHYSICS}
                    className="h-full bg-theme-gold"
                  />
                </div>
              </div>
              
              {/* Submit Hint */}
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-theme-charcoal/30">
                  Press Enter to ask Tori
                </span>
                
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full
                    transition-all duration-300
                    ${inputValue.trim() && !isLoading
                      ? 'bg-theme-charcoal text-theme-alabaster'
                      : 'bg-theme-charcoal/10 text-theme-charcoal/30 cursor-not-allowed'
                    }
                  `}
                >
                  Send
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompassCurator;
