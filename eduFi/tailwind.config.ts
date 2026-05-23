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
        // Lighter dark theme with purple/lavender tint for better visibility (inspired by SpookySwap aesthetic)
        blackish: '#1a1625', // Purple-tinted dark background
        surface: '#252030', // Lighter surface with purple tint
        lime: '#a7ff1f', // Neon lime accent
        dark: {
          DEFAULT: '#1a1625', // Main dark background (purple-tinted)
          lighter: '#252030', // Lighter cards/surfaces
          lightest: '#2d2838', // Lightest surfaces
        },
        // Purple accent colors for harmony with dark theme
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
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
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #a7ff1f, 0 0 10px #a7ff1f, 0 0 15px #a7ff1f' },
          '100%': { boxShadow: '0 0 10px #a7ff1f, 0 0 20px #a7ff1f, 0 0 30px #a7ff1f' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;