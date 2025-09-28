/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
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
        },
        primary: '#39b57a',
        secondary: '#f2fcf6',
        swhite: '#FAFDFF',
        tertiary: '#EEEEEE',
      },
    },
  },
  plugins: [],
}

