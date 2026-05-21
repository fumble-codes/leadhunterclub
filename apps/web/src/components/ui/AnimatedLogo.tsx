'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import React from 'react'

export default function AnimatedLogo({ className = "w-8 h-8" }: { className?: string }) {
  // 3D Tilt Logic
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  
  const springConfig = { damping: 20, stiffness: 200 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  // Tilt ranges from -25deg to +25deg based on mouse position
  const rotateX = useTransform(springY, [0, 1], [25, -25])
  const rotateY = useTransform(springX, [0, 1], [-25, 25])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / rect.width)
    y.set(mouseY / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  // The CSS mask object we apply to containers that need to be shaped like the logo
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url(/logo.png)`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskImage: `url(/logo.png)`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  }

  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className} group cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
    >
      {/* 1. Ambient Background Glow (Using Accent Palette) */}
      <motion.div 
        className="absolute inset-[-50%] rounded-full blur-[15px] opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
          background: 'conic-gradient(from 0deg, #B8F36B, #A388EE, #7DD3FC, #FF9F43, #FF6B9E, #B8F36B)',
          transform: 'translateZ(-15px)' // Pushed deep backwards
        }}
      />

      {/* 2. Logo Shape Container (Creates the 3D volume inside the mask) */}
      <div className="absolute inset-0 overflow-hidden" style={{ ...maskStyle, transform: 'translateZ(0px)' }}>
        
        {/* Base Layer: Dark with slight transparency */}
        <div className="absolute inset-0 bg-[#0F1115]/90 backdrop-blur-sm" />
        
        {/* Iridescent Rotating Layer (Holographic foil effect inside the wolf) */}
        <motion.div 
          className="absolute inset-[-100%] opacity-50 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            background: 'conic-gradient(from 90deg, transparent 0%, #B8F36B 25%, #A388EE 50%, #7DD3FC 75%, transparent 100%)',
          }}
        />
        
        {/* Specular White Laser Sweep */}
        <motion.div 
          className="absolute inset-0"
          animate={{ backgroundPosition: ['200% center', '-200% center'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
          style={{
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.95) 60%, transparent 80%)',
            backgroundSize: '200% auto',
          }}
        />
      </div>

      {/* 3. Top Bevel Highlight (Pushed slightly forward to create 3D extrusion) */}
      <div 
        className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none mix-blend-screen"
        style={{
          ...maskStyle,
          transform: 'translateZ(5px)',
          background: 'linear-gradient(to bottom right, rgba(255,255,255,1), transparent 60%)'
        }}
      />
    </motion.div>
  )
}
