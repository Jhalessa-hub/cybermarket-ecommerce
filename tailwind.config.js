export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#111318',
        surface: '#1c2029',
        brand: { yellow: '#ffe600', orange: '#ff6327', red: '#ff4455' },
        ink: { primary: '#f5f6fa', muted: '#aeb7c8' },
      },
      boxShadow: { glow: '0 0 40px rgb(255 99 39 / 12%)' },
    },
  },
  plugins: [],
};
