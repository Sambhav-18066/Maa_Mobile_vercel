module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7e22ce',
          light: '#a855f7',
          dark: '#5b21b6',
        },
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(to right, #7e22ce, #4f46e5)',
      },
    },
  },
  plugins: [],
}