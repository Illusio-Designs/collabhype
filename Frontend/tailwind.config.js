/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Medicare-style violet brand palette (replaces previous blue)
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Soft pastel pink/peach accent
        accent: {
          50: '#fef2f4',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fda4b3',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
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
