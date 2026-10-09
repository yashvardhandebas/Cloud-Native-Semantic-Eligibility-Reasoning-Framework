/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0b',
          surface1: 'rgba(255, 255, 255, 0.04)',
          surface2: 'rgba(255, 255, 255, 0.07)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          cyan: '#a5f3fc',
          magenta: '#be185d',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#f87171',
          blue: '#60a5fa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #a5f3fc 0%, #be185d 100%)',
        'glow-radial': 'radial-gradient(circle at center, rgba(165, 243, 252, 0.12) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
