'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'

const navLinks = [
  { name: 'How It Works', href: '#funnel' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const scrolledRef = useRef(false)

  // Use direct DOM manipulation instead of React state to avoid re-renders on scroll
  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 50
        if (shouldBeScrolled !== scrolledRef.current) {
          scrolledRef.current = shouldBeScrolled
          if (navRef.current) {
            navRef.current.style.paddingTop = shouldBeScrolled ? '0.75rem' : '1.25rem'
            navRef.current.style.paddingBottom = shouldBeScrolled ? '0.75rem' : '1.25rem'
          }
          if (innerRef.current) {
            if (shouldBeScrolled) {
              innerRef.current.classList.add('nav-scrolled')
              innerRef.current.classList.remove('nav-top')
            } else {
              innerRef.current.classList.remove('nav-scrolled')
              innerRef.current.classList.add('nav-top')
            }
          }
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6"
        style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', transition: 'padding 0.5s ease' }}
      >
        <div
          ref={innerRef}
          className="nav-top flex items-center justify-between w-full max-w-[1200px] rounded-2xl px-5 md:px-6 py-3"
        >

          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="Lead Hunter Club" className="w-8 h-8 rounded-xl" />
            <span className="font-display text-[16px] font-semibold tracking-tight text-text-primary group-hover:opacity-80 transition-opacity duration-300">
              Lead Hunter Club
            </span>
          </Link>

          {/* Center: Links (Desktop) */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-[13px] font-medium text-text-secondary/70 hover:text-text-primary transition-colors duration-300 tracking-wide rounded-lg hover:bg-white/[0.04]"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="hidden md:block text-[13px] font-medium text-text-secondary/70 hover:text-text-primary transition-colors duration-300 tracking-wide px-4 py-2"
            >
              Log in
            </a>
            <a
              href="/sneak-peek"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-accent-purple/20 hover:bg-accent-purple/[0.03] text-text-secondary hover:text-text-primary text-[13px] font-medium transition-all duration-300"
            >
              <span>Sneak Peek</span>
            </a>
            <a
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-text-primary text-bg-main text-[13px] font-bold overflow-hidden accent-glow-mint hover:accent-glow-mint transition-all duration-500 hover:scale-[1.03] active:scale-95 group"
            >
              <span>Start Hunting</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0F1115]/95" onClick={() => setMobileOpen(false)} />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="relative z-10 mt-24 mx-4 p-6 rounded-2xl bg-[#171A20] border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-1 mb-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium text-text-secondary/80 hover:text-text-primary hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={14} className="text-text-secondary/30" />
                  </motion.a>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-5 space-y-3">
                <a
                  href="/sneak-peek"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text-primary border border-white/[0.06] hover:border-accent-purple/20 hover:bg-accent-purple/[0.03] transition-all duration-300"
                >
                  Sneak Peek
                </a>
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-5 py-3 rounded-xl text-[14px] font-medium text-text-secondary/70 hover:text-text-primary border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300"
                >
                  Log in
                </a>
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-text-primary text-bg-main text-[14px] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500"
                >
                  Start Hunting
                  <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
