import { frostedThemePlugin } from "@whop/react/tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Robinhood-inspired color palette
        'robinhood': {
          'black': '#000000',
          'dark-gray': '#1C1C1E',
          'card-bg': '#1C1C1E',
          'green': '#00C805',
          'red': '#FF5000',
          'text-primary': '#FFFFFF',
          'text-secondary': '#9D9D9D',
          'accent': '#5AC53B',
          'border': '#2C2C2E',
          'input-bg': '#2C2C2E',
          'hover': '#252525',
        },
        'prestige': {
          'platinum': '#E5E4E2',
          'gold': '#FFD700',
          'silver': '#C0C0C0',
          'bronze': '#CD7F32',
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
        'sf-pro-rounded': ['SF Pro Rounded', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'robinhood-h1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '700' }],
        'robinhood-h2': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'robinhood-body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'robinhood-caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'robinhood-number': ['18px', { lineHeight: '1.2', fontWeight: '500' }],
      },
      borderRadius: {
        'robinhood': '12px',
        'robinhood-lg': '24px',
      },
      boxShadow: {
        'robinhood': '0 4px 12px rgba(0,0,0,0.15)',
        'robinhood-glow': '0 0 40px rgba(229,228,226,0.3)',
      },
      animation: {
        'ticker-scroll': 'ticker-scroll 60s linear infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [frostedThemePlugin()],
};

export default config;
