/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#3B47F0',
          d: '#2832C8',
          l: '#EEF0FE',
          m: '#6B74F5',
        },
        navy: {
          DEFAULT: '#0D0F2B',
          m: '#1A1D3D',
        },
        g: {
          50: '#F7F8FC',
          100: '#ECEEF5',
          200: '#D8DBE8',
          300: '#B8BCCE',
          500: '#737899',
          700: '#3D4063',
        },
        green: {
          DEFAULT: '#00C48C',
          l: '#E6FAF4',
        },
        orange: {
          DEFAULT: '#FF6B35',
          l: '#FFF0EB',
        },
        red: {
          DEFAULT: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'grid-overlay': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
