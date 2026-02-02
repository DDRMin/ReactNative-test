/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        accent: '#FF6B00',
        secondary: '#00C2FF',
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

