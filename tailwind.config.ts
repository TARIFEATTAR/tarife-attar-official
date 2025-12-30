import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Amber & Parchment Design System
        theme: {
          alabaster: "#F2F0E9",    // The Atlas background - warm parchment
          charcoal: "#1A1A1A",     // The Relic background/text - deep ink
          obsidian: "#121212",     // The Relic dark mode - absolute depth
          industrial: "#B3B3B3",   // Metadata - understated technical
          gold: "#c5a66a",         // Accent gold - protocol markers
        },
      },
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      transitionTimingFunction: {
        'liquid': 'cubic-bezier(0.85, 0, 0.15, 1)', // Thick oil movement - heavy, deliberate, smooth
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
