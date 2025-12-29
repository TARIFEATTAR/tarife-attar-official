
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          alabaster: '#F2F0E9', // Warm, archival paper
          charcoal: '#1A1A1A',  // Soft ink for text
          obsidian: '#121212',  // Deep background
          industrial: '#B3B3B3', // Technical metadata
        },
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'liquid': 'cubic-bezier(0.85, 0, 0.15, 1)',
      }
    },
  },
  plugins: [],
};

export default config;
