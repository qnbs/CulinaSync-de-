/** @type {import('tailwindcss').Config} */
const uiPreset = require('@domain/ui/tailwind-preset');

module.exports = {
  presets: [uiPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
