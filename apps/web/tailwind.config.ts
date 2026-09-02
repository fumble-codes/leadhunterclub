import type { Config } from 'tailwindcss'
import { palette, cssVars, accent, primary, secondary, tertiary } from './src/lib/colors'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  safelist: [
    {
      pattern: /(bg|text|border|ring|from|via|to)-accent-(mint|purple|cyan|orange|pink)(\/(10|15|20|25|30|40|50|60|70|80|90))?/,
    },
    {
      pattern:
        /(bg|text|border|ring|from|via|to|divide)-(primary|secondary|tertiary|error|surface|outline|background)(-container)?(-(low|lowest|high|highest|variant|dim|bright|tint))?(\/(10|15|20|25|30|40|50|60|70|80|90))?/,
    },
    {
      pattern: /text-(on|inverse)-[a-z-]+/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: palette,
      fontSize: {
        hero: ['54px', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '600' }],
        section: ['38px', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-label': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
        metadata: ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        xxs: ['10px', { lineHeight: '1.2' }],
        9: ['9px', { lineHeight: '1.2' }],
        11: ['11px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '32px',
        full: '9999px',
      },
      maxWidth: {
        container: '1240px',
        page: '1400px',
      },
      spacing: {
        section: '96px',
        'content-gap': '24px',
      },
      blur: {
        sm: '2px',
        md: '6px',
        lg: '20px',
        xl: '60px',
        '2xl': '80px',
      },
      letterSpacing: {
        ultra: '0.3em',
        super: '0.2em',
      },
      scale: {
        98: '0.98',
        102: '1.02',
        103: '1.03',
        104: '1.04',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        glowMint: `0 0 12px ${accent.mint}cc`,
        glowPurple: `0 0 12px ${accent.purple}cc`,
        glowSecondary: `0 0 12px ${secondary.DEFAULT}cc`,
        glowPrimary: `0 0 12px ${primary.container}cc`,
        glowTertiary: `0 0 12px ${tertiary.DEFAULT}cc`,
        'elevation-1': '0 1px 2px rgba(var(--rgb-black), 0.3)',
        'elevation-2': '0 4px 8px rgba(var(--rgb-black), 0.4)',
        'elevation-3': '0 8px 24px rgba(var(--rgb-black), 0.5)',
        'elevation-4': '0 12px 48px rgba(var(--rgb-black), 0.6)',
      },
    },
  },
  plugins: [
    function ({ addBase }: { addBase: (styles: Record<string, Record<string, string>>) => void }) {
      addBase({
        ':root': cssVars,
      })
    },
  ],
}

export default config
