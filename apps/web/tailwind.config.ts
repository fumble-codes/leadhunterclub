import type { Config } from 'tailwindcss'

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
      colors: {
        'bg-main': '#0F1115',
        background: '#0F1115',
        surface: '#11150C',
        'surface-secondary': '#171A20',
        'surface-elevated': '#1E222B',
        'text-primary': '#F5F7FA',
        'text-secondary': '#9CA3AF',
        'accent-mint': '#B8F36B',
        'accent-purple': '#A78BFA',
        'accent-cyan': '#7DD3FC',
        'accent-orange': '#FFB86B',
        'accent-pink': '#F9A8D4',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
      },
      fontSize: {
        hero: ['64px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        section: ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
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
        glowMint: '0 0 12px rgba(184, 243, 107, 0.8)',
      }
    },
  },
  plugins: [],
}

export default config
