/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: include both jsx + tsx since some screens are js, some ts.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Deep-navy brand palette — matches the web (Frontend/tailwind.config.js).
        brand: {
          50:  '#e5eaf7',
          100: '#c7d1eb',
          200: '#9aabd9',
          300: '#6c83c5',
          400: '#3f5bb1',
          500: '#1f3d9a',
          600: '#0e2f86',
          700: '#0a2472',
          800: '#051650',
          900: '#020a30',
        },
        accent: {
          50:  '#fff4ed',
          100: '#ffe5d0',
          200: '#ffc8a3',
          300: '#ffa170',
          400: '#ff7a3c',
          500: '#f1571a',
          600: '#d83f0c',
          700: '#b22e08',
        },
      },
    },
  },
  plugins: [],
};
