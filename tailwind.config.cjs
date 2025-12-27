/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'color1': '#3E2DEC',
        'color2': '#2D56EC',
        'color3': '#2D30EC',
        'color4': '#512DEC',
        'color5': '#772DEC',
      },
    },
  },
  plugins: [],
}