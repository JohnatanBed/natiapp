/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      spacing: {
        '15': '60px',
        '25': '100px',
        '30': '120px',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}

