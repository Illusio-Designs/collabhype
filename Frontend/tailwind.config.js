/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // AvantGarde-inspired geometric sans. Jost is the closest open-source
        // analogue and ships well via next/font/google.
        sans: [
          'var(--font-jost)',
          'Jost',
          'ITC Avant Garde Gothic',
          'Avant Garde',
          'Century Gothic',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // Brand: deep navy palette built from the Brand Asset board —
        //   Rich Black 00072d · Dark Green 051650 · Bangladesh Green 0a2472
        //   Caribbean Green 123499 · pale "White" e5eaf7
        brand: {
          50: '#e5eaf7',   // pale lavender-white (board's "White")
          100: '#cbd6ed',
          200: '#97acd9',
          300: '#6383c4',
          400: '#2f5ab0',
          500: '#123499',  // Caribbean Green
          600: '#0d2a85',
          700: '#0a2472',  // Bangladesh Green
          800: '#051650',  // Dark Green
          900: '#001137',
          950: '#00072d',  // Rich Black
        },
        // Accent: vivid cobalt taken from the board's secondary row. Used for
        // the "Most Popular" pack badge and other moments that need to pop
        // against the deep navy primary.
        accent: {
          50:  '#eef2ff',
          100: '#dce4ff',
          200: '#b5c4ff',
          300: '#849bff',
          400: '#4f6dff',
          500: '#2a4fff',
          600: '#1d3fe0',
        },
      },
      backgroundImage: {
        'dotted-pattern':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
