import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Neon lime + deep black palette inspired by provided image
        primary: {
          50: '#f4ffe1',
          100: '#e8ffc2',
          200: '#d5ff8f',
          300: '#c6ff52',
          400: '#b6ff3b',
          500: '#a7ff1f',
          600: '#8dd91a',
          700: '#6eaa14',
          800: '#4d770e',
          900: '#2c4608',
        },
        secondary: {
          50: '#f6f7f9',
          100: '#e9ebef',
          200: '#c8ccd3',
          300: '#a7adb8',
          400: '#8a90a0',
          500: '#6e7486',
          600: '#555b6a',
          700: '#3e4350',
          800: '#262a35',
          900: '#141720',
        },
        blackish: '#0a0a0a',
        surface: '#0f1113',
        lime: '#b6ff3b',
      },
	  borderRadius: {
		lg: 'var(--radius)',
		md: 'calc(var(--radius) - 2px)',
		sm: 'calc(var(--radius) - 4px)'
	  },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Reduce gradients; keep subtle brand accent if needed
        'brand-gradient': 'linear-gradient(135deg, #b6ff3b 0%, #e9ebef 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #a7ff1f 0%, #c8ccd3 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;