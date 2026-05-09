// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        primary:  { DEFAULT: '#7C3AED', light: '#EDE9FE', dark: '#5B21B6' },
        success:  { DEFAULT: '#059669', light: '#ECFDF5' },
        danger:   { DEFAULT: '#DC2626', light: '#FEF2F2' },
        warning:  { DEFAULT: '#D97706', light: '#FFFBEB' },
        info:     { DEFAULT: '#2563EB', light: '#EFF6FF' },
      },
    },
  },
  plugins: [],
};
