/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'chakra-purple': '#1a0b2e', // Deep Space Purple
        'chakra-gold': '#d4af37',   // Classic Gold
        'chakra-bronze': '#9c7c33', // Darker Gold for hover
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}