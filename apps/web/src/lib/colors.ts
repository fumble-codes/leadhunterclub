/**
 * Lead Hunter Club — Design Tokens
 *
 * Brand system is intentionally minimal:
 *  - mint  = primary brand accent (CTAs, active states, signals)
 *  - purple = secondary brand accent (highlights, secondary CTAs)
 *  - cyan / orange / pink are SEMANTIC ONLY (persona identity, status, warnings)
 *
 * One neutral scale (`canvas`) powers all surfaces. `code-*` are editor
 * surfaces. `dot-*` / `social-*` are semantic UI chrome.
 */

// Neutral surface scale — single source of truth for all surfaces
export const canvas = {
  DEFAULT: '#0F1115',
  deeper: '#0A0C10',
  dim: '#111317',
  surface: '#11150C',
  secondary: '#171A20',
  elevated: '#1E222B',
  bright: '#37393E',
} as const

// Code-editor surfaces
export const code = {
  bg: '#11151A',
  'bg-dark': '#0A0C10',
  header: '#13171C',
} as const

export const border = {
  subtle: 'rgba(255, 255, 255, 0.06)',
} as const

// Brand + semantic accents
export const accent = {
  mint: '#B8F36B', // primary brand
  purple: '#A78BFA', // secondary brand
  cyan: '#7DD3FC', // semantic: persona-blue / status
  orange: '#FFB86B', // semantic: warning
  pink: '#F9A8D4', // semantic: status
} as const

// Persona identity colors (used to differentiate leads, never decorative)
export const persona = {
  green: accent.mint,
  blue: accent.cyan,
  pink: accent.pink,
  orange: '#FB923C',
  purple: accent.purple,
} as const

export const status = {
  amber: '#FFBD2E',
  'orange-deep': '#F97316',
} as const

export const dot = {
  red: '#FF5F57',
  yellow: '#FEBC2E',
  green: '#28C840',
} as const

export const social = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  reddit: '#FF4500',
} as const

export const text = {
  primary: '#F5F7FA',
  secondary: '#9CA3AF',
  muted: '#6B7280',
  'on-accent': '#11150C',
  'on-surface': '#e2e2e8',
  'on-surface-variant': '#c2c9b3',
} as const

// RGB triplets for rgba() usage in inline styles / glows
export const rgb = {
  white: '255, 255, 255',
  black: '0, 0, 0',
  'accent-mint': '184, 243, 107',
  'accent-purple': '167, 139, 250',
  'accent-cyan': '125, 211, 252',
  'accent-orange': '255, 184, 107',
  'accent-pink': '249, 168, 212',
  'persona-green': '184, 243, 107',
  'persona-blue': '125, 211, 252',
  'persona-pink': '249, 168, 212',
  'persona-orange': '251, 146, 60',
  'tab-purple': '167, 139, 250',
  'badge-amber': '255, 189, 46',
  'orange-deep': '249, 115, 22',
  'social-twitter': '29, 161, 242',
} as const

// Tailwind color palette (exposed as bg-/text-/border- utilities)
export const palette = {
  'bg-main': canvas.DEFAULT,
  'page-bg': canvas.DEFAULT,
  background: canvas.DEFAULT,
  'on-background': text.primary,
  surface: canvas.surface,
  'surface-secondary': canvas.secondary,
  'surface-elevated': canvas.elevated,
  'surface-dim': canvas.dim,
  'surface-bright': canvas.bright,
  'canvas-deeper': canvas.deeper,
  'code-bg': code.bg,
  'code-bg-dark': code['bg-dark'],
  'code-header': code.header,
  'border-subtle': border.subtle,
  'accent-mint': accent.mint,
  'accent-purple': accent.purple,
  'accent-cyan': accent.cyan,
  'accent-orange': accent.orange,
  'accent-pink': accent.pink,
  'persona-green': persona.green,
  'persona-blue': persona.blue,
  'persona-pink': persona.pink,
  'persona-orange': persona.orange,
  'tab-purple': accent.purple,
  'tab-cyan': accent.cyan,
  'tab-pink': accent.pink,
  'badge-amber': status.amber,
  'orange-deep': status['orange-deep'],
  'dot-red': dot.red,
  'dot-yellow': dot.yellow,
  'dot-green': dot.green,
  'social-twitter': social.twitter,
  'social-linkedin': social.linkedin,
  'social-reddit': social.reddit,
  'text-primary': text.primary,
  'text-secondary': text.secondary,
  'text-muted': text.muted,
  'text-on-accent': text['on-accent'],
  'text-on-surface': text['on-surface'],
  'text-on-surface-variant': text['on-surface-variant'],
  white: '#FFFFFF',
  black: '#000000',
} as const

export const personaColorMap: Record<string, string> = {
  green: persona.green,
  blue: persona.blue,
  pink: persona.pink,
  purple: persona.purple,
  orange: persona.orange,
} as const

export const accentColorMap: Record<string, string> = {
  mint: accent.mint,
  purple: accent.purple,
  cyan: accent.cyan,
  orange: accent.orange,
  pink: accent.pink,
} as const

export const accentRgbMap: Record<string, string> = {
  mint: rgb['accent-mint'],
  purple: rgb['accent-purple'],
  cyan: rgb['accent-cyan'],
  orange: rgb['accent-orange'],
  pink: rgb['accent-pink'],
} as const

export const cssVars: Record<string, string> = {
  '--accent-mint': accent.mint,
  '--accent-purple': accent.purple,
  '--accent-cyan': accent.cyan,
  '--accent-orange': accent.orange,
  '--accent-pink': accent.pink,
  '--rgb-accent-mint': rgb['accent-mint'],
  '--rgb-accent-purple': rgb['accent-purple'],
  '--rgb-accent-cyan': rgb['accent-cyan'],
  '--rgb-accent-orange': rgb['accent-orange'],
  '--rgb-accent-pink': rgb['accent-pink'],
  '--rgb-white': rgb.white,
  '--rgb-black': rgb.black,
  '--rgb-persona-green': rgb['persona-green'],
  '--rgb-persona-blue': rgb['persona-blue'],
  '--rgb-persona-pink': rgb['persona-pink'],
  '--rgb-persona-orange': rgb['persona-orange'],
  '--rgb-tab-purple': rgb['tab-purple'],
  '--rgb-badge-amber': rgb['badge-amber'],
  '--rgb-orange-deep': rgb['orange-deep'],
  '--rgb-social-twitter': rgb['social-twitter'],
  '--color-page-bg': canvas.DEFAULT,
  '--color-surface': canvas.surface,
  '--color-surface-secondary': canvas.secondary,
  '--color-surface-elevated': canvas.elevated,
  '--color-border-subtle': border.subtle,
  '--color-text-primary': text.primary,
  '--color-text-secondary': text.secondary,
  '--color-text-muted': text.muted,
  '--color-text-on-accent': text['on-accent'],
  '--color-persona-green': persona.green,
  '--color-persona-blue': persona.blue,
  '--color-persona-pink': persona.pink,
  '--color-persona-orange': persona.orange,
  '--color-tab-purple': accent.purple,
  '--color-badge-amber': status.amber,
  '--color-orange-deep': status['orange-deep'],
  '--color-white': '#FFFFFF',
  '--color-black': '#000000',
  '--color-metallic-start': '#121214',
  '--color-metallic-mid': '#0F0F11',
  '--color-metallic-end': '#0C0C0E',
  '--color-metallic-start-hover': '#17171A',
  '--color-metallic-mid-hover': '#111114',
} as const

export type PaletteKey = keyof typeof palette
