/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Liquid Glass Theme - Cyan/Teal Aesthetic
        background: '#050810',
        primary: '#0891b2',       // Cyan-600
        accent: '#22d3ee',        // Cyan-400
        surface: 'rgba(8, 145, 178, 0.1)', // Translucent cyan
        text: '#e0f2fe',          // Cyan-100
        muted: '#67e8f9',         // Cyan-300
        secondary: '#06b6d4',     // Cyan-500
        glass: {
          100: 'rgba(34, 211, 238, 0.05)',
          200: 'rgba(34, 211, 238, 0.1)',
          300: 'rgba(34, 211, 238, 0.15)',
          400: 'rgba(34, 211, 238, 0.2)',
          500: 'rgba(34, 211, 238, 0.3)',
        },
        light: {
          100: '#ecfeff',
          200: '#cffafe',
          300: '#a5f3fc',
        },
        dark: {
          100: '#083344',
          200: '#164e63',
          300: '#155e75',
        },
      },
    },
  },
  plugins: [],
}
