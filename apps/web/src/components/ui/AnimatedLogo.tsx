'use client'

import { motion } from 'framer-motion'

export default function AnimatedLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} group`}>
      {/* Ambient Glow behind the logo that pulses */}
      <motion.div 
        animate={{ 
          scale: [0.9, 1.3, 0.9],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 bg-white blur-[12px] rounded-full pointer-events-none"
      />

      {/* Base Logo Mask (Static white with low opacity, turns fully opaque on hover) */}
      <div 
        className="absolute inset-0 bg-white/40 transition-all duration-500 group-hover:bg-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
        style={{
          WebkitMaskImage: `url(/logo.png)`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(/logo.png)`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />

      {/* Sweeping Shine Effect (Continuous laser sweep like Raycast) */}
      <motion.div 
        animate={{ 
          backgroundPosition: ['200% center', '-200% center']
        }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.5
        }}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 60%, transparent 80%)',
          backgroundSize: '200% auto',
          WebkitMaskImage: `url(/logo.png)`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(/logo.png)`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
    </div>
  )
}
