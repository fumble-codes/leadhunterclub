import type { Config } from 'tailwindcss'
import { palette, cssVars, core } from './src/lib/colors'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      colors: palette,
      fontSize: {
        hero: ['48px', { lineHeight: '1.1', letterSpacing: '-0.05em', fontWeight: '600' }],
        section: ['32px', { lineHeight: '1.2', letterSpacing: '-0.04em', fontWeight: '600' }],
      },
      borderRadius: {
        '12px': '12px',
        '24px': '24px',
      },
      maxWidth: {
        container: '1200px',
      },
      spacing: {
        section: '160px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        glowMint: `0 0 12px ${core.crimson}cc`,
        glowCyan: `0 0 12px ${core.cyan}cc`,
      }
    },
  },
  plugins: [
    function({ addBase }: { addBase: (styles: Record<string, Record<string, string>>) => void }) {
      addBase({
        ':root': cssVars,
      })
    },
  ],
}

export default config
