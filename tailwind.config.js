/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0B0F1A',
        primary: '#7C3AED',
        accent: '#22D3EE',
        surface: '#151A2C',
        text: '#E5E7EB',
        muted: '#94A3B8',
        secondary: '#00C2FF', // Keeping for safety
        light : {
          100: '#F5F5F5',
          200: '#E0E0E0',
          300: '#C2C2C2',
        },
        dark : {
          100: '#1A1A1A',
          200: '#333333',
          300: '#4D4D4D',
        },
      },
    },
  },
  plugins: [],
}

