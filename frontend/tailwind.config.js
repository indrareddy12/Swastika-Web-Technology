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
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#85a4ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 15px rgba(59, 130, 246, 0.35)',
        'glow-success': '0 0 15px rgba(34, 197, 94, 0.35)',
        'glow-warning': '0 0 15px rgba(234, 179, 8, 0.35)',
        'glow-danger': '0 0 15px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
