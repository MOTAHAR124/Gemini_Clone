import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10201f',
        mist: '#eef4f2',
        tide: '#1f6f78',
        coral: '#f06f52',
        slate: '#385160',
      },
      boxShadow: {
        panel: '0 16px 42px rgba(16, 32, 31, 0.12)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 420ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;