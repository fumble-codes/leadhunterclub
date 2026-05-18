---
name: Lead Hunter Club — Arc Light
colors:
  background: '#F4F5F7'
  surface: '#FFFFFF'
  surface-secondary: '#FFFFFF'
  surface-elevated: '#FFFFFF'
  on-background: '#11150C'
  text-primary: '#11150C'
  text-secondary: '#6B7280'
  border-subtle: 'rgba(0, 0, 0, 0.05)'
  accent-mint: '#B8F36B'
  accent-purple: '#A78BFA'
  accent-orange: '#FFB86B'
  accent-cyan: '#7DD3FC'
  accent-pink: '#F9A8D4'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  section-heading:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-large:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  metadata:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    opacity: 0.6
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  container-max: 1200px
  section-gap: 160px
  content-gap: 24px
---

# Lead Hunter Club — Design Philosophy (Light Arc/Notion Inspired)

## 1. Core Vision
Lead Hunter Club is a **Sophisticated Discovery Engine**. We have pivoted from a dark tactical HUD to a **Bright, Fluid Workspace** inspired by the airy interfaces of Arc Browser, Linear (Light Mode), and Notion.

The goal is to make the act of finding leads feel like using a high-end, calm workspace. It should be:
- **Calm**: Through bright, soft backgrounds and airy layouts.
- **Usable**: High contrast typography (Dark Charcoal on Off-White), zero clutter.
- **Aesthetic**: Frosted glass (`backdrop-blur`), subtle inner shadows, and solid pastel color blocking.

## 2. Visual Personality
- **Airy**: Massive whitespace, allowing the intelligence data to breathe.
- **Frosted**: Heavy use of `bg-white/70 backdrop-blur-xl` to create depth without harsh borders.
- **Solid Block Colors**: Instead of neon glow FX, we use our vibrant accent colors at low opacities (e.g., `bg-accent-mint/20`) to create solid, flat, pastel-like blocks inside the clean white UI.

## 3. Typography (The "Geist" Standard)
We use **Geist** as the primary font system for ultimate legibility.
- **Headlines**: Semi-bold to Bold Geist with tight tracking (-0.04em).
- **Body**: Regular Geist.
- **Text Color**: `#11150C` for primary readability, `#6B7280` for secondary metadata.

## 4. Color & Light
- **Background**: Soft off-white (`#F4F5F7`) to reduce eye strain.
- **Surfaces**: Pure white (`#FFFFFF`) for cards and elevated components to pop off the background.
- **Accents**: We strictly use the original 5 accent colors (Mint, Purple, Cyan, Orange, Pink). To achieve pastel looks, we use tailwind opacity modifiers (`/10`, `/20`, `/30`) against white surfaces. **No inventing new hex codes.**
- **Borders**: Extremely subtle (`border-black/5`) purely for structure, no harsh lines.

## 5. Shape & Structure
- **Soft Geometry**: Move from sharp corners to a **24px-28px radius** for large cards, and **12px-16px** for internal elements.
- **Nested Layouts**: The "Card within a Card" approach. A neutral white outer wrapper containing a soft, solid-color inner block.

## 6. Interaction Language
- **Soft Physics**: Hover states should feel magnetic or feature slight vertical nudges (`y: -2`), completely avoiding bouncy spring animations.
- **Command-Palette UX**: Floating, frosted search bars that feel OS-native.