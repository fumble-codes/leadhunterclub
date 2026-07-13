'use client'

import type { ReactNode, ElementType } from 'react'

type TextVariant = 'hero' | 'section' | 'body-large' | 'ui-label' | 'metadata'
type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent-mint'
  | 'accent-purple'
  | 'accent-cyan'
  | 'accent-orange'
  | 'accent-pink'

interface TextProps {
  variant?: TextVariant
  as?: ElementType
  color?: TextColor
  className?: string
  children: ReactNode
}

const variantStyles: Record<TextVariant, string> = {
  hero: 'text-hero',
  section: 'text-section',
  'body-large': 'text-body-large',
  'ui-label': 'text-ui-label',
  metadata: 'text-metadata',
}

const colorStyles: Record<TextColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  'accent-mint': 'text-accent-mint',
  'accent-purple': 'text-accent-purple',
  'accent-cyan': 'text-accent-cyan',
  'accent-orange': 'text-accent-orange',
  'accent-pink': 'text-accent-pink',
}

export function Text({
  variant = 'body-large',
  as: Tag = 'p',
  color = 'primary',
  className = '',
  children,
}: TextProps) {
  return (
    <Tag className={`${variantStyles[variant]} ${colorStyles[color]} ${className}`}>{children}</Tag>
  )
}
