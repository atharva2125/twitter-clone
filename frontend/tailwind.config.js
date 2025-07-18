/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1da1f2',
          'blue-dark': '#1991db',
          'blue-light': '#e8f5fd',
        },
        dark: {
          bg: '#000000',
          surface: '#000000',
          'surface-secondary': '#0a0a0a',
          border: '#2f3336',
          text: '#ffffff',
          'text-secondary': '#8b949e',
          'text-muted': '#6e7681',
          hover: '#0d1117',
          accent: '#1da1f2',
        },
        'twitter-blue': '#1da1f2',
      },
      fontFamily: {
        'twitter': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}
