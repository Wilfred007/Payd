/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        dark: '#0b1220',
      }
    },
  },
  plugins: [],
}
