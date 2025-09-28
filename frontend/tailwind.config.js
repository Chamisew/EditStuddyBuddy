/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fcf6',
          100: '#def7ea',
          200: '#c6f0db',
          300: '#9fe0bf',
          400: '#6fd0a0',
          500: '#39b57a',
          600: '#2f9b67',
          700: '#267a50',
          800: '#1e5b3b',
          900: '#153b26'
        }
      },
      borderRadius: {
        xl2: '1rem'
      }
    },
  },
  plugins: [],
};
