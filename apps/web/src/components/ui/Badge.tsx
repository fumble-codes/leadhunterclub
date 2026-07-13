'use client'

import type { ReactNode } from 'react'

type BadgeColor = 'mint' | 'purple' | 'cyan' | 'orange' | 'pink'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  color?: BadgeColor
  size?: BadgeSize
  className?: string
  children: ReactNode
}

const colorStyles: Record<BadgeColor, string> = {
  mint: 'bg-accent-mint/10 border border-accent-mint/20 text-accent-mint',
  purple: 'bg-accent-purple/10 border border-accent-purple/20 text-accent-purple',
  cyan: 'bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan',
  orange: 'bg-accent-orange/10 border border-accent-orange/20 text-accent-orange',
  pink: 'bg-accent-pink/10 border border-accent-pink/20 text-accent-pink',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-9 rounded-md',
  md: 'px-3 py-1 text-11 rounded-lg',
}

export function Badge({
  color = 'mint',
  size = 'md',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider ${colorStyles[color]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}
