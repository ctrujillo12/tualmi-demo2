import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#000000',
        },
      },

      /* 🖤 EDITORIAL TYPOGRAPHY SYSTEM */
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },

      fontSize: {
        xs: ['0.7rem', { lineHeight: '1.05rem' }],
        sm: ['0.8rem', { lineHeight: '1.35rem' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.6rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.6rem', { lineHeight: '2rem' }],
      },

      letterSpacing: {
        tight: '-0.01em',
        wide: '0.12em',
        wider: '0.22em',
        widest: '0.3em',
      },
    },
  },
  plugins: [],
}

export default config
