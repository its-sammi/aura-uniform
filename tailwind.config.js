/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        panel: '#f7f5f1',
        stone: '#d6d3d1',
        gold: '#d4af37',
        brand: '#16a34a',
        brandDark: '#0f766e',
      },
      boxShadow: {
        soft: '0 20px 45px -18px rgba(15, 23, 42, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
