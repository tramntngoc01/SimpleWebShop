/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#d1f0df',
          200: '#a3e0bf',
          300: '#6dc99a',
          400: '#40b577',
          500: '#2d8a5e',
          600: '#2d6a4f',
          700: '#245a42',
          800: '#1c4a36',
          900: '#153a2b',
        },
        accent: {
          50: '#fef9eb',
          100: '#fcefc7',
          200: '#fae09a',
          300: '#f5c84d',
          400: '#e9a319',
          500: '#d4880d',
          600: '#b86a08',
          700: '#944f0a',
          800: '#7a3e10',
          900: '#653313',
        }
      }
    },
  },
  plugins: [],
}
