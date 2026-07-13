type GlowColor = 'mint' | 'purple' | 'cyan' | 'orange' | 'pink'
type GlowIntensity = 'very-faint' | 'soft' | 'medium' | 'strong' | 'intense'

interface GlowProps {
  color?: GlowColor
  intensity?: GlowIntensity
  className?: string
}

const glowClassMap: Record<GlowColor, Record<GlowIntensity, string>> = {
  mint: {
    'very-faint': 'glow-mint-very-faint',
    soft: 'glow-mint-soft',
    medium: 'glow-mint-soft',
    strong: 'glow-mint-strong',
    intense: 'glow-mint-strong',
  },
  purple: {
    'very-faint': 'glow-purple-very-faint',
    soft: 'glow-purple-soft',
    medium: 'glow-purple-medium',
    strong: 'glow-purple-strong',
    intense: 'glow-purple-intense',
  },
  cyan: {
    'very-faint': 'glow-cyan-soft',
    soft: 'glow-cyan-soft',
    medium: 'glow-cyan-strong',
    strong: 'glow-cyan-strong',
    intense: 'glow-cyan-strong',
  },
  orange: {
    'very-faint': 'glow-orange-very-faint',
    soft: 'glow-orange-soft',
    medium: 'glow-orange-strong',
    strong: 'glow-orange-strong',
    intense: 'glow-orange-strong',
  },
  pink: {
    'very-faint': 'glow-pink-very-faint',
    soft: 'glow-pink-soft',
    medium: 'glow-pink-strong',
    strong: 'glow-pink-strong',
    intense: 'glow-pink-strong',
  },
}

export function Glow({
  color = 'mint',
  intensity = 'soft',
  className = '',
}: GlowProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${glowClassMap[color][intensity]} ${className}`}
    />
  )
}
