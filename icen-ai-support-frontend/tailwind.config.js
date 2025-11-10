/***** Tailwind Config *****/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        accent: '#66BB6A',
        background: '#F5F9F6',
      },
    },
  },
  plugins: [],
}
