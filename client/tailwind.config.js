/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pb: {
          emerald: '#087F5B',
          primary: '#059669',
          light: '#D1FAE5',
          deep: '#064E3B',
          bg: '#F8FAF9',
          white: '#FFFFFF',
          text: '#14241D',
          muted: '#64748B',
          gold: '#C69C42',
          goldDark: '#A67D28',
          paper: '#FFFFFF',
          line: '#E2E8F0',
          lineDark: '#CBD5E1',
          ink: '#14241D'
        }
      },
      fontFamily: {
        serif: ['"Newsreader"', '"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Newsreader"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        editorial: '0 20px 40px -15px rgba(6, 78, 59, 0.08), 0 0 1px 1px rgba(6, 78, 59, 0.04)',
        book: '0 25px 50px -12px rgba(20, 36, 29, 0.25), 0 0 0 1px rgba(20, 36, 29, 0.05)',
        gold: '0 10px 25px -5px rgba(198, 156, 66, 0.3)',
      }
    },
  },
  plugins: [],
}

