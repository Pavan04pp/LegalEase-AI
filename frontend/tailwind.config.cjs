module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#63ACC2',
          secondary: '#86AAB3',
          light: '#F8F9FA',
          accent: '#D0B290',
          muted: '#E4ECEB',
        }
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
