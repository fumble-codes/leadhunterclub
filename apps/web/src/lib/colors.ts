export const core = {
  crimson: '#FF3366',
  cyan: '#00F2FE',
} as const

export const rgb = {
  crimson: '255, 51, 102',
  cyan: '0, 242, 254',
  white: '255, 255, 255',
  black: '0, 0, 0',
  'persona-green': '184, 243, 107',
  'persona-blue': '125, 211, 252',
  'persona-pink': '249, 168, 212',
  'persona-orange': '251, 146, 60',
  'tab-purple': '167, 139, 250',
  'badge-amber': '255, 189, 46',
  'orange-deep': '249, 115, 22',
  'social-twitter': '29, 161, 242',
  'social-linkedin': '10, 102, 194',
} as const

export const canvas = {
  DEFAULT: '#07070A',
  surface: '#0F1015',
  popover: '#14161E',
} as const

export const border = {
  muted: '#16171E',
  active: '#242633',
} as const

export const hyper = {
  pink: core.crimson,
  cyan: core.cyan,
} as const

export const text = {
  primary: '#F5F5F7',
  secondary: '#949A9E',
  muted: '#4E5357',
} as const

export const palette = {
  canvas,
  border,
  hyper,
  text: {
    primary: text.primary,
    secondary: text.secondary,
    muted: text.muted,
  } as const,

  'bg-main': canvas.DEFAULT,
  'background': canvas.DEFAULT,
  'page-bg': canvas.DEFAULT,
  'surface': canvas.surface,
  'surface-secondary': canvas.surface,
  'surface-elevated': canvas.popover,
  'text-primary': text.primary,
  'text-secondary': text.secondary,
  'muted': text.muted,
  'border-subtle': border.muted,
  'crimson': hyper.pink,
  'cyan': hyper.cyan,
  'accent-mint': hyper.pink,
  'accent-purple': hyper.cyan,
  'accent-cyan': hyper.cyan,
  'accent-orange': hyper.pink,
  'accent-pink': hyper.pink,
  'text-on-accent': '#11150C',
  'code-bg': '#171A20',
  'code-bg-dark': '#12141A',
  'code-header': '#121316',
  'metallic-start': '#121214',
  'metallic-mid': '#0F0F11',
  'metallic-end': '#0C0C0E',
  'metallic-start-hover': '#17171A',
  'metallic-mid-hover': '#111114',
  'dot-red': '#FF5F57',
  'dot-yellow': '#FEBC2E',
  'dot-green': '#28C840',
  'social-twitter': '#1DA1F2',
  'social-linkedin': '#0A66C2',
  'social-reddit': '#FF4500',
  'tab-purple': '#A78BFA',
  'tab-cyan': '#22D3EE',
  'tab-pink': '#F472B6',
  'persona-green': '#B8F36B',
  'persona-blue': '#7DD3FC',
  'persona-pink': '#F9A8D4',
  'persona-orange': '#FB923C',
  'badge-amber': '#FFBD2E',
  'orange-deep': '#F97316',
  'canvas-deeper': '#06080B',
  'platform-x': '#F5F7FA',
  'white': '#FFFFFF',
  'black': '#000000',
} as const

export const personaColorMap: Record<string, string> = {
  green: palette['persona-green'],
  blue: palette['persona-blue'],
  pink: palette['persona-pink'],
  purple: palette['tab-purple'],
  orange: palette['persona-orange'],
} as const

export const accentColorMap: Record<string, string> = {
  mint: hyper.pink,
  purple: hyper.cyan,
  cyan: hyper.cyan,
  orange: hyper.pink,
  pink: hyper.pink,
} as const

export const accentRgbMap: Record<string, string> = {
  mint: rgb.crimson,
  purple: rgb.cyan,
  cyan: rgb.cyan,
  orange: rgb.crimson,
  pink: rgb.crimson,
} as const

export const cssVars: Record<string, string> = {
  '--accent-mint': hyper.pink,
  '--accent-purple': hyper.cyan,
  '--accent-cyan': hyper.cyan,
  '--accent-orange': hyper.pink,
  '--accent-pink': hyper.pink,
  '--color-crimson': hyper.pink,
  '--color-cyan': hyper.cyan,
  '--rgb-crimson': rgb.crimson,
  '--rgb-cyan': rgb.cyan,
  '--rgb-white': rgb.white,
  '--rgb-black': rgb.black,
  '--color-text-on-accent': '#11150C',
  '--color-page-bg': canvas.DEFAULT,
  '--color-code-bg': '#171A20',
  '--color-code-bg-dark': '#12141A',
  '--color-code-header': '#121316',
  '--color-dot-red': '#FF5F57',
  '--color-dot-yellow': '#FEBC2E',
  '--color-dot-green': '#28C840',
  '--color-border-subtle': border.muted,
  '--color-metallic-start': '#121214',
  '--color-metallic-mid': '#0F0F11',
  '--color-metallic-end': '#0C0C0E',
  '--color-metallic-start-hover': '#17171A',
  '--color-metallic-mid-hover': '#111114',
  '--color-tab-purple': '#A78BFA',
  '--color-tab-cyan': '#22D3EE',
  '--color-tab-pink': '#F472B6',
  '--color-persona-green': '#B8F36B',
  '--color-persona-blue': '#7DD3FC',
  '--color-persona-pink': '#F9A8D4',
  '--color-persona-orange': '#FB923C',
  '--color-badge-amber': '#FFBD2E',
  '--color-orange-deep': '#F97316',
  '--color-canvas-deeper': '#06080B',
  '--color-platform-x': '#F5F7FA',
  '--rgb-persona-green': rgb['persona-green'],
  '--rgb-persona-blue': rgb['persona-blue'],
  '--rgb-persona-pink': rgb['persona-pink'],
  '--rgb-persona-orange': rgb['persona-orange'],
  '--rgb-tab-purple': rgb['tab-purple'],
  '--rgb-badge-amber': rgb['badge-amber'],
  '--rgb-orange-deep': rgb['orange-deep'],
  '--rgb-social-twitter': rgb['social-twitter'],
  '--rgb-social-linkedin': rgb['social-linkedin'],
  '--color-white': palette.white,
  '--color-black': palette.black,
} as const

export type PaletteKey = keyof typeof palette
