import { tokens } from './src/styles/tokens.js';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      spacing: tokens.spacing,
      maxWidth: {
        dashboard: '1680px',
      },
    },
  },
  plugins: [],
};