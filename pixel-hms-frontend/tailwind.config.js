/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    '#147C8A',
          dark:       '#0F6672',
          accent:     '#E8B347',
          bg:         '#F8FBFB',
          surface:    '#FFFFFF',
          section:    '#EAF7F8',
          border:     '#D7E8EA',
          textPrimary:'#1E293B',
          textSecondary: '#64748B',
        },
        teal: {
          50:  '#EAF7F8',
          100: '#D0EFF2',
          200: '#A1DFE5',
          300: '#72CFD8',
          400: '#43BFCB',
          500: '#147C8A',
          600: '#0F6672',
          700: '#0B4F59',
          800: '#083940',
          900: '#042227',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
        '4xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(20,124,138,0.06), 0 1px 2px 0 rgba(20,124,138,0.04)',
        'card-md': '0 4px 6px -1px rgba(20,124,138,0.08), 0 2px 4px -1px rgba(20,124,138,0.04)',
        'focus-ring': '0 0 0 4px rgba(20,124,138,0.15)',
      },
    },
  },
  plugins: [],
}
