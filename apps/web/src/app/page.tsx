'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Activity, ShieldCheck, Zap, MessageCircle, Brain, Sparkles, ArrowRight, Eye } from 'lucide-react'
import Link from 'next/link'
import HeroSection from '@/app/components/HeroSection'
import TokenSystemSection from '@/app/components/TokenSystemSection';
import WhoItsForGrid from '@/app/components/WhoItsForGrid';
import FeaturesSection from '@/app/components/FeaturesSection';
const ease = [0.16, 1, 0.3, 1] as const

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.03] py-6">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left group focus:outline-none">
        <h4 className="font-display text-xl text-text-primary group-hover:text-accent-pink transition-colors duration-300">{q}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4, ease }}>
          <ChevronDown size={22} className="text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
            <p className="pt-5 text-text-secondary text-lg leading-relaxed max-w-3xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const OUTREACH_ANGLES = [
  {
    id: 'curiosity',
    name: 'Curiosity Loop',
    pitch: "Hey Alex, saw your tweet about DTC acquisition costs going up. We recently designed a visual checkout flow for a similar brand that lowered cart abandonment by 18% with zero extra ad spend. Built a quick interactive mockup of how this could look on your Shopify storefront. Mind if I drop a link over?",
    replyProbability: '96%',
    spamScore: 'Safe (0.01)',
    tone: 'Empathetic & Direct'
  },
  {
    id: 'audit',
    name: 'Technical Audit',
    pitch: "Hey Alex, spotted a minor layout shift on your checkout page that is currently causing some conversion leakage (around 4% estimated drop-offs based on standard mobile speed scores). Fixed it in a local sandbox copy to show your dev team. Happy to send over the screen recording and direct fix code if you want?",
    replyProbability: '98%',
    spamScore: 'Safe (0.00)',
    tone: 'Highly Valuable'
  },
  {
    id: 'case_study',
    name: 'Case Study Offer',
    pitch: "Hey Alex, saw you're pushing hard on organic DTC growth this quarter. Our team just published a tactical breakdown of how we scaled an e-commerce brand to $80k/mo using high-intent buyer signals without spending a single dollar on Google/FB ads. Can I send you the direct case study link?",
    replyProbability: '93%',
    spamScore: 'Safe (0.02)',
    tone: 'Professional & Contextual'
  }
]

const ACCENT_COLORS: Record<string, {
  text: string
  bg: string
  border: string
  glow: string
  dot: string
}> = {
  curiosity: {
    text: 'text-[#A78BFA]',
    bg: 'bg-white/5',
    border: 'border-white/[0.08]',
    glow: 'bg-accent-purple/[0.005]',
    dot: 'bg-[#A78BFA]'
  },
  audit: {
    text: 'text-[#22D3EE]',
    bg: 'bg-white/5',
    border: 'border-white/[0.08]',
    glow: 'bg-accent-cyan/[0.005]',
    dot: 'bg-[#22D3EE]'
  },
  case_study: {
    text: 'text-[#F472B6]',
    bg: 'bg-white/5',
    border: 'border-white/[0.08]',
    glow: 'bg-accent-pink/[0.005]',
    dot: 'bg-[#F472B6]'
  }
}

function OutreachPreviewUI() {
  const [selected, setSelected] = useState(OUTREACH_ANGLES[0])
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const activeColor = ACCENT_COLORS[selected.id] || ACCENT_COLORS.curiosity

  useEffect(() => {
    setIsTyping(true)
    setDisplayedText('')
    
    let index = 0
    const fullText = selected.pitch
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 2))
        index += 2
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [selected])

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full rounded-[28px] bg-[#171A20]/80 border border-white/[0.08] p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden text-left backdrop-blur-2xl transition-all duration-500 hover:border-white/15 hover:shadow-[0_40px_100px_rgba(0,0,0,0.7)] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
    >
      {/* Decorative top window bar for macOS chrome */}
      <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/[0.04] bg-white/[0.01] flex items-center px-6">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#FF5F56]' : 'bg-white/10'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#FFBD2E]' : 'bg-white/10'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#27C93F]' : 'bg-white/10'}`} />
        </div>
        <div className="mx-auto text-[11px] font-medium tracking-tight text-text-secondary/50">
          Outreach Editor
        </div>
      </div>

      {/* Subtle Dynamic Ambient Background Glow (only active on hover) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-[80px] rounded-full pointer-events-none transition-all duration-1000 ${isHovered ? activeColor.glow : 'bg-white/[0.002] opacity-0'}`} />
      
      {/* Editor Column */}
      <div className="flex-1 flex flex-col justify-between relative z-10 pt-6">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xs font-bold text-text-primary">
                LH
              </div>
              <div>
                <h4 className="font-semibold text-xs tracking-tight text-text-primary">Alex • Founder</h4>
                <p className="text-[10px] text-text-secondary/60">Source: Twitter/X signal</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all duration-500 ${isHovered ? 'bg-accent-mint/5 border-accent-mint/20 text-accent-mint' : 'bg-white/5 border-white/10 text-text-secondary'}`}>
              Verified Signal
            </div>
          </div>

          {/* Angle Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {OUTREACH_ANGLES.map(angle => {
              const isSelected = selected.id === angle.id
              const tabAccent = ACCENT_COLORS[angle.id] || ACCENT_COLORS.curiosity
              
              // Dynamic border styling on interaction
              let activeTabClass = 'bg-white/10 border-white/20 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              if (isSelected && isHovered) {
                if (angle.id === 'curiosity') {
                  activeTabClass = 'bg-accent-purple/5 border-accent-purple/30 text-[#A78BFA]'
                } else if (angle.id === 'audit') {
                  activeTabClass = 'bg-accent-cyan/5 border-accent-cyan/30 text-[#22D3EE]'
                } else if (angle.id === 'case_study') {
                  activeTabClass = 'bg-accent-pink/5 border-accent-pink/30 text-[#F472B6]'
                }
              }

              return (
                <button
                  key={angle.id}
                  onClick={() => setSelected(angle)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-300 ${isSelected ? activeTabClass : 'bg-white/[0.02] border-white/[0.04] text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                  {angle.name}
                </button>
              )
            })}
          </div>

          {/* Email Body Area */}
          <div className="min-h-[160px] p-5 rounded-2xl bg-black/30 border border-white/[0.04] text-xs text-text-primary leading-relaxed relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-colors duration-500">
            {isTyping && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-text-secondary/40 font-bold uppercase tracking-wider">
                <Sparkles size={10} className="animate-spin" /> writing...
              </div>
            )}
            <div className="text-[11px] text-text-secondary flex items-center gap-2">
              <span className="text-text-secondary/50 font-medium">Subject:</span>
              <span className="text-text-primary/90 font-medium">Quick question about mobile checkout flow</span>
            </div>
            <div className="h-px bg-white/[0.04] my-2.5" />
            <p className="whitespace-pre-line text-text-primary/95 leading-relaxed font-light font-sans">
              {displayedText}
              {isTyping && <span className={`inline-block w-1.5 h-3.5 ml-0.5 animate-pulse align-middle transition-colors duration-500 ${isHovered ? activeColor.dot : 'bg-white/40'}`} />}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[10px] text-text-secondary/40 font-medium tracking-tight">
            Draft Sandbox
          </span>
          
          <button className="px-5 py-2.5 rounded-xl bg-white hover:bg-white/95 text-black font-semibold text-xs shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all duration-300">
            Generate Pitch
          </button>
        </div>
      </div>

      {/* AI Scorecard Column (HUD Style divider) */}
      <div className="w-full md:w-[180px] border-t md:border-t-0 md:border-l border-white/[0.04] pt-6 md:pt-0 md:pl-6 flex flex-col justify-between relative z-10 text-left">
        <div>
          <h5 className="text-[11px] font-semibold text-text-secondary/60 tracking-tight mb-4 flex items-center gap-1.5">
            <Brain size={13} className="text-text-secondary/80" /> Analysis Metrics
          </h5>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1 text-text-secondary/70">
                <span>Reply Probability</span>
                <span className="text-text-primary font-semibold">{selected.replyProbability}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: selected.replyProbability }}
                  transition={{ duration: 0.6, ease }}
                  className="h-full bg-white/60 rounded-full" 
                />
                <motion.span
                  className={`absolute top-0 bottom-0 w-1.5 rounded-full transition-colors duration-500 ${isHovered ? activeColor.dot : 'bg-white/40'}`}
                  animate={{ left: selected.replyProbability }}
                  transition={{ duration: 0.6, ease }}
                />
              </div>
            </div>

            <div className="h-px bg-white/[0.04]" />

            <div>
              <div className="text-[10px] text-text-secondary/50 mb-0.5">Spam Score</div>
              <div className="text-xs font-medium text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${isHovered ? 'bg-accent-mint' : 'bg-white/20'}`} /> {selected.spamScore}
              </div>
            </div>

            <div className="h-px bg-white/[0.04]" />

            <div>
              <div className="text-[10px] text-text-secondary/50 mb-0.5">Tone Analysis</div>
              <div className="text-xs font-medium text-text-primary tracking-wide">
                {selected.tone}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/[0.03] text-[10px] text-text-secondary/50 leading-relaxed">
          <div className="font-semibold text-text-secondary/60 mb-1">AI Insights:</div>
          &quot;Angle utilizes specific friction context to minimize sales resistance.&quot;
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-main text-text-primary font-sans overflow-x-hidden">
      <HeroSection />

      {/* Trust marquee */}
      <section className="py-10 bg-white/[0.01] overflow-hidden mt-0">
        <div className="animate-marquee whitespace-nowrap text-text-secondary/30">
          {[1, 2, 3, 4].map(g => (
            <span key={g} className="inline-flex items-center gap-24 mx-12 shrink-0">
              <span className="font-display font-semibold text-xl tracking-widest inline-flex items-center gap-3"><Zap size={20} /> NEXUS</span>
              <span className="font-display font-semibold text-xl tracking-widest inline-flex items-center gap-3"><Activity size={20} /> VANGUARD</span>
              <span className="font-display font-semibold text-xl tracking-widest inline-flex items-center gap-3"><ShieldCheck size={20} /> STELLAR LABS</span>
              <span className="font-mono text-sm tracking-[0.3em]">PRISM</span>
            </span>
          ))}
        </div>
      </section>

      {/* Problem & How It Works (Bento Grid) */}
      <section id="funnel" className="py-40 px-6 max-w-[1200px] mx-auto relative">
        {/* Ambient section glows */}
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-accent-purple/[0.015] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] bg-accent-mint/[0.015] blur-[150px] rounded-full pointer-events-none" />

        <div className="text-center mb-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[10px] font-bold tracking-widest uppercase mb-6">
              How It Works
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="font-display text-[48px] md:text-[64px] font-semibold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto"
          >
            From Raw Signal<br />
            <span className="text-text-secondary/70">To Closed Client.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed"
          >
            Here's exactly how Lead Hunter Club turns unindexed buyer signals into high-value client conversations — before your competitors even know they exist.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* CARD 1: Fresh Buyer Intent (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[380px] flex flex-col justify-between"
          >
            {/* Visual Radar Container */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 overflow-hidden pointer-events-none flex items-center justify-center">
              {/* Concentric circles */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-white/[0.04] flex items-center justify-center">
                <div className="w-[180px] h-[180px] rounded-full border border-dashed border-white/[0.04] flex items-center justify-center">
                  <div className="w-[80px] h-[80px] rounded-full border border-dashed border-white/[0.04]" />
                </div>
              </div>
              
              {/* Sweeping line */}
              <div className="absolute w-[300px] h-[300px] animate-[spin_6s_linear_infinite]">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-accent-mint/40 via-accent-mint/10 to-transparent origin-left -translate-y-1/2" />
              </div>

              {/* Glowing cinematic intercept logos */}
              <motion.div 
                className="absolute top-[20%] left-[20%] w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#1DA1F2] backdrop-blur-md shadow-[0_0_20px_rgba(29,161,242,0.2)] group-hover:scale-110 group-hover:border-[#1DA1F2]/30 transition-all duration-500"
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Official Twitter / X SVG */}
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-[25%] right-[15%] w-12 h-12 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/30 flex items-center justify-center text-[#0A66C2] backdrop-blur-md shadow-[0_0_20px_rgba(10,102,194,0.3)] group-hover:scale-110 group-hover:border-[#0A66C2]/50 transition-all duration-500"
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
              >
                {/* Official LinkedIn SVG */}
                <svg className="w-5 h-5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                </svg>
              </motion.div>
              
              <motion.div 
                className="absolute top-[40%] right-[30%] w-8 h-8 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500] backdrop-blur-md shadow-[0_0_15px_rgba(255,69,0,0.3)] group-hover:scale-110 group-hover:border-[#FF4500]/50 transition-all duration-500"
                animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
              >
                <MessageCircle size={14} />
              </motion.div>
            </div>

            <div className="relative z-10 pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center text-accent-mint mb-6">
                <Zap size={18} />
              </div>
              <span className="text-xs font-mono text-accent-mint uppercase tracking-widest mb-3 block">Step 01</span>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">We Intercept Fresh Signals</h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                Our engine continuously scans obscure forums, niche communities, social feeds, and intent networks to capture the exact moment someone asks for help with a service you offer. These are real people, posting right now.
              </p>
            </div>
          </motion.div>

          {/* CARD 2: Qualified Leads (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            whileHover={{ y: -4 }}
            className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[380px] flex flex-col justify-between"
          >
            {/* AI Filter Funnel Visual */}
            <div className="relative h-[140px] mb-4">
              {/* Incoming signals (top - raw/unfiltered) */}
              <div className="space-y-2 mb-3">
                {[
                  { label: 'Reddit: Need logo designer', status: 'pass' },
                  { label: 'Spam bot: Buy followers now', status: 'reject' },
                  { label: 'LinkedIn: Looking for dev agency', status: 'pass' },
                  { label: 'Old post: Closed 3 months ago', status: 'reject' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[10px] transition-all duration-500 ${
                      item.status === 'pass'
                        ? 'bg-accent-purple/5 border border-accent-purple/15 group-hover:border-accent-purple/30 group-hover:bg-accent-purple/10'
                        : 'bg-white/[0.01] border border-white/[0.04] group-hover:opacity-30 group-hover:line-through'
                    }`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black transition-all duration-500 ${
                      item.status === 'pass'
                        ? 'bg-accent-purple/20 text-accent-purple group-hover:bg-accent-purple/40'
                        : 'bg-white/5 text-text-secondary/30 group-hover:bg-red-500/20 group-hover:text-red-400'
                    }`}>
                      {item.status === 'pass' ? '✓' : '✕'}
                    </div>
                    <span className={`truncate ${
                      item.status === 'pass' ? 'text-text-primary font-medium' : 'text-text-secondary/50'
                    }`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-6">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-mono text-accent-purple uppercase tracking-widest mb-3 block">Step 02</span>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">AI Filters Out the Noise</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Not every signal is worth your time. Our AI automatically filters dead leads, spam, low-intent posts, and irrelevant requests — so only genuine, high-probability opportunities make it through.
              </p>
            </div>
          </motion.div>

          {/* CARD 3: AI Outreach Writer (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease }}
            whileHover={{ y: -4 }}
            className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[380px] flex flex-col justify-between"
          >
            {/* Intelligence Dossier Builder */}
            <div className="relative h-[140px] mb-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden group-hover:border-accent-pink/20 transition-colors duration-500">
              {/* Ambient node glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent-pink/10 blur-[30px] rounded-full group-hover:bg-accent-pink/30 transition-colors duration-500" />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 text-accent-pink font-bold text-[10px] uppercase tracking-widest mb-3">
                  <Brain size={12} /> Compiling Intel...
                </div>
                
                {/* Data fields building up */}
                <div className="space-y-2 flex-1">
                  {[
                    { field: 'Pain Point', value: 'High CAC on Shopify store', delay: 0 },
                    { field: 'Budget', value: '$5k-$10k range', delay: 80 },
                    { field: 'Urgency', value: 'Critical — Q2 deadline', delay: 160 },
                    { field: 'Context', value: 'Posted on Twitter 2h ago', delay: 240 },
                  ].map((item) => (
                    <div key={item.field}
                      className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-all duration-500"
                      style={{ transitionDelay: `${item.delay}ms` }}
                    >
                      <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-widest w-[70px] shrink-0">{item.field}</span>
                      <span className="text-[10px] text-text-primary font-medium truncate">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Score reveal */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '350ms' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse" />
                  <span className="text-[9px] text-accent-pink font-bold uppercase tracking-widest">Intent Score: 94%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center text-accent-pink mb-6">
                <Activity size={18} />
              </div>
              <span className="text-xs font-mono text-accent-pink uppercase tracking-widest mb-3 block">Step 03</span>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">We Build Lead Intelligence</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Every surviving lead gets deep-analyzed. We compile buyer context, company details, urgency level, budget indicators, and the exact pain point they expressed — giving you a complete intelligence brief before you even reach out.
              </p>
            </div>
          </motion.div>

          {/* CARD 4: Automated Follow-Ups (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[380px] flex flex-col justify-between"
          >
            {/* Dashboard Lead Drop Visual */}
            <div className="absolute right-10 top-10 bottom-10 w-[240px] hidden md:flex flex-col justify-center space-y-3">
              {/* Incoming leads dropping into feed */}
              {[
                { name: 'Sarah K.', signal: 'Needs Shopify dev', score: '96%', accent: 'mint', delay: 0 },
                { name: 'James T.', signal: 'Conversion audit', score: '91%', accent: 'cyan', delay: 120 },
                { name: 'Priya M.', signal: 'Brand redesign', score: '88%', accent: 'purple', delay: 240 },
              ].map((lead) => (
                <div 
                  key={lead.name} 
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 transform transition-all duration-500 group-hover:border-accent-cyan/20 group-hover:bg-[#171A20]/90 group-hover:shadow-[0_0_20px_rgba(103,232,249,0.1)] group-hover:translate-x-2 backdrop-blur-xl"
                  style={{ transitionDelay: `${lead.delay}ms` }}
                >
                  <div className={`w-8 h-8 rounded-lg bg-accent-${lead.accent}/10 border border-accent-${lead.accent}/20 flex items-center justify-center shrink-0`}>
                    <span className={`text-[9px] font-bold text-accent-${lead.accent}`}>{lead.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-text-primary truncate">{lead.name}</div>
                    <div className="text-[9px] text-text-secondary/50 truncate">{lead.signal}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold text-accent-${lead.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ transitionDelay: `${lead.delay + 200}ms` }}>{lead.score}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: `${lead.delay + 300}ms` }} />
                  </div>
                </div>
              ))}

              {/* Ready badge */}
              <div className="flex items-center justify-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '400ms' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
                <span className="text-[9px] text-accent-mint font-bold uppercase tracking-widest">Ready to Hunt</span>
              </div>
            </div>

            <div className="relative z-10 pointer-events-none md:w-[60%]">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
                <ChevronDown size={18} className="-rotate-90" />
              </div>
              <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest mb-3 block">Step 04</span>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Released to the Hunters</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Qualified, intelligence-loaded leads land directly in your dashboard — ready to act on. Use our AI outreach writer to craft the perfect first touch, or engage with your own strategy. Either way, you're reaching warm buyers while the opportunity is still fresh.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
      
      {/* Conversational Intelligence Section */}
      <section id="conversational" className="py-40 px-6 max-w-[1200px] mx-auto relative border-t border-white/[0.03]">
        {/* Fine background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-accent-mint/[0.015] blur-[150px] rounded-full pointer-events-none" />
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column - Copy Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-5 text-left relative z-10"
          >
            <span className="text-[10px] uppercase tracking-widest mb-4 block font-semibold text-text-secondary/40">
              02 / Philosophy
            </span>
            <h2 className="font-display text-[42px] md:text-[48px] font-bold tracking-tight mb-6 leading-[1.1] text-text-primary">
              Most outreach tools optimize volume.<br />
              <span className="text-text-secondary font-light">We optimize replies.</span>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-10 max-w-sm font-light">
              Anyone can blast 1,000 cold emails. But when they sound robotic and desperate, you&apos;re just burning your domain reputation. We prioritize quality conversation over bulk noise.
            </p>

            {/* Noise vs Signal Minimal Matrix */}
            <div className="space-y-8 mb-10">
              {/* The Noise (Spam) */}
              <div className="border-l border-white/[0.04] pl-6 relative">
                <span className="text-[10px] uppercase tracking-wider block mb-3 text-text-secondary/30 font-semibold">
                  The Noise
                </span>
                <ul className="space-y-2.5">
                  {[
                    'Robotic, dry templates that get ignored',
                    'Desperate multi-platform follow-up sequences',
                    'Copy-pasted messaging lacking buyer context',
                    'Forgettable angles that land in spam folders'
                  ].map(item => (
                    <li key={item} className="text-xs text-text-secondary/50 flex items-center gap-3">
                      <span className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
                      <span className="font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The Signal (LHC) */}
              <div className="border-l border-white/[0.08] pl-6 relative">
                <span className="text-[10px] uppercase tracking-wider block mb-3 text-text-secondary/50 font-semibold">
                  The Signal
                </span>
                <ul className="space-y-2.5">
                  {[
                    'High-value, direct conversations',
                    'Hyper-targeted buyer context personalization',
                    'Ultra-low resistance outreach framing',
                    'Strong, psychologically sound messaging angles',
                    'Significantly higher actual reply probability'
                  ].map(item => (
                    <li key={item} className="text-xs text-text-primary flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-mint shrink-0" />
                      <span className="font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-text-secondary/60 leading-normal border-l border-white/10 pl-4 py-0.5 tracking-tight font-medium">
              &quot;Because getting more replies matters more than sending more messages.&quot;
            </p>
          </motion.div>

          {/* Right Column - Real-time Interactive UI Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="lg:col-span-7"
          >
            <OutreachPreviewUI />
          </motion.div>
        </div>
      </section>
{/* Product Capabilities */}
<FeaturesSection />

{/* Token System */}
<TokenSystemSection />

{/* Who It's For */}
<WhoItsForGrid />

      {/* Pricing */}
      <section id="pricing" className="py-40 px-6 max-w-[1200px] mx-auto relative overflow-hidden border-t border-white/[0.03]">
        {/* Ambient glows */}
        <div className="absolute top-[-10%] left-1/3 w-[500px] h-[500px] bg-accent-pink/[0.015] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[5%] right-1/4 w-[500px] h-[500px] bg-accent-purple/[0.015] blur-[150px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[10px] font-bold tracking-widest uppercase mb-6">
              Pricing
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="font-display text-[48px] md:text-[64px] font-semibold tracking-tight mb-6 leading-[1.1]"
          >
            Acquisition Fuel.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed"
          >
            Pay for intelligence, not access. Tokens reveal lead identities and generate custom outreach paths.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {[
            {
              name: 'Recon',
              tokens: '200',
              price: '₹150',
              desc: 'Perfect for testing the waters and closing your first high-value client.',
              accent: 'mint',
              featured: false,
              features: [
                '200 Intelligence Tokens',
                '~66 Lead Reveals',
                'AI Outreach Writer',
                'Basic Lead Intelligence',
                'Email Integration',
              ]
            },
            {
              name: 'Hunter',
              tokens: '1,000',
              price: '₹999',
              desc: 'For serious operators building a consistent, high-quality client pipeline.',
              accent: 'pink',
              featured: true,
              features: [
                '1,000 Intelligence Tokens',
                '~333 Lead Reveals',
                'AI Outreach Writer',
                'Full Lead Intelligence',
                'Automated Follow-Ups',
                'Priority Signal Access',
                'Token Rollover',
              ]
            },
            {
              name: 'Syndicate',
              tokens: '2,000',
              price: '₹1,600',
              desc: 'Scale teams requiring massive deal flow and deep market intelligence.',
              accent: 'purple',
              featured: false,
              features: [
                '2,000 Intelligence Tokens',
                '~666 Lead Reveals',
                'AI Outreach Writer',
                'Full Lead Intelligence',
                'Automated Follow-Ups',
                'Priority Signal Access',
                'Token Rollover',
                'Team Seats (up to 5)',
              ]
            },
          ].map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease }}
              whileHover={{ y: -6 }}
              className={`group relative rounded-[32px] flex flex-col transition-all duration-500 overflow-hidden ${
                p.featured
                  ? 'bg-surface-secondary/40 shadow-[0_0_60px_rgba(249,168,212,0.06)]'
                  : 'bg-surface-secondary/20'
              }`}
            >
              {/* Gradient border glow for featured */}
              {p.featured && (
                <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-b from-accent-pink/30 via-accent-purple/15 to-transparent pointer-events-none z-0" />
              )}

              {/* Card inner */}
              <div className={`relative z-10 p-8 md:p-10 flex flex-col flex-1 rounded-[32px] border transition-all duration-500 ${
                p.featured
                  ? 'border-transparent bg-[#171A20]/90 backdrop-blur-xl'
                  : 'border-white/[0.04] hover:border-white/10 bg-transparent'
              }`}>

                {/* Popular badge */}
                {p.featured && (
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[9px] font-bold tracking-widest uppercase">
                    Most Popular
                  </div>
                )}

                {/* Plan name & description */}
                <div className="mb-8">
                  <div className={`w-10 h-10 rounded-xl bg-accent-${p.accent}/10 border border-accent-${p.accent}/20 flex items-center justify-center text-accent-${p.accent} mb-5`}>
                    <Sparkles size={18} />
                  </div>
                  <h4 className="font-display text-2xl font-bold tracking-tight mb-2">{p.name}</h4>
                  <p className="text-sm text-text-secondary font-light leading-relaxed">{p.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-white/[0.04]">
                  <div className="flex items-end gap-2 mb-3">
                    <span className="font-display text-[56px] font-semibold leading-none tracking-tight text-text-primary">{p.price}</span>
                    <span className="text-text-secondary/60 mb-2 text-sm font-medium">/ month</span>
                  </div>

                  {/* Token meter bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-secondary/60">{p.tokens} Tokens</span>
                      <span className={`font-bold text-accent-${p.accent}`}>{p.tokens} / mo</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: p.featured ? '100%' : i === 0 ? '30%' : '85%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.15, ease }}
                        className={`h-full bg-accent-${p.accent}/50 rounded-full`}
                      />
                    </div>
                  </div>
                </div>

                {/* Feature list */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-3">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-text-secondary/80">
                        <span className={`w-1.5 h-1.5 rounded-full bg-accent-${p.accent} shrink-0`} />
                        <span className="font-light">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button className={`w-full py-4 rounded-2xl font-bold text-sm tracking-tight transition-all duration-500 ${
                  p.featured
                    ? `bg-accent-${p.accent} text-[#11150C] shadow-[0_0_30px_rgba(249,168,212,0.2)] hover:shadow-[0_0_40px_rgba(249,168,212,0.35)]`
                    : 'bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] text-text-primary hover:bg-white/[0.07]'
                }`}>
                  Get Started with {p.name}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust note */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="text-center mt-16 relative z-10"
        >
          <p className="text-xs text-text-secondary/40 font-mono uppercase tracking-[0.2em]">
            No contracts · Cancel anytime · Unused tokens roll over
          </p>
        </motion.div>
      </section>


      {/* FAQ */}
      <section id="faq" className="py-40 px-8 max-w-[860px] mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}
          className="font-display text-[44px] font-semibold tracking-tight mb-16 text-center">
          Operational Clarifications.
        </motion.h2>
        <div className="border-t border-white/[0.03]">
          <FAQItem q="Do you book clients for me?" a="NO. We provide warm fresh leads actively looking for your service, plus personalized AI-powered outreach angles for the best closing opportunity. You own the relationship." />
          <FAQItem q="Are these leads scraped from LinkedIn?" a="No. Standard scraping is noise. We monitor intent signals across obscure forums, job boards, and community threads where real pain is expressed." />
          <FAQItem q="How do tokens work?" a="Tokens fuel the intelligence engine. Revealing a lead identity costs 3 tokens. Generating a custom AI outreach strategy costs 1 token. Unused tokens roll over monthly." />
          <FAQItem q="Can I plug this into my cold email tool?" a="We explicitly discourage bulk cold email. This platform is designed for sniper-level 1-on-1 outreach. Quality conversation is the ultimate leverage." />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 max-w-[1100px] mx-auto text-center relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-pink/[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease }}
          className="relative z-10 p-16 md:p-24 rounded-[48px] border border-white/[0.06] bg-gradient-to-b from-white/[0.01] to-transparent overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent-pink" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-text-secondary uppercase">
              Exclusive Syndicate Access
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-text-primary mb-6 leading-tight">
            Stop Wasting Time <br />Looking For Clients.
          </h2>

          <p className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Lead Hunter Club brings fresh opportunities directly to you — while AI helps you start smarter conversations that actually get replies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 font-mono text-sm text-text-secondary/70">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
              Spend less time scraping.
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
              Spend more time closing.
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-text-primary text-bg-main font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] transition-all duration-500 group"
              >
                Start Finding Leads
                <ArrowRight className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <Link
                href="/sneak-peek"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer border border-white/[0.06] hover:border-accent-purple/20 hover:bg-accent-purple/[0.03] text-sm"
              >
                <Eye size={16} className="text-accent-purple" /> Sneak Peek
              </Link>
            </motion.div>
          </div>

          {/* Supporting Text from copy.md */}
          <div className="mt-8 font-mono text-[11px] tracking-[0.2em] uppercase text-text-secondary/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>Fresh buyer-intent leads</span>
            <span className="text-accent-pink/40">•</span>
            <span>Smarter outreach</span>
            <span className="text-accent-pink/40">•</span>
            <span>Less wasted time</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.03] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-purple/[0.02] blur-[180px] rounded-full pointer-events-none" />

        {/* Main footer content */}
        <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">

            {/* Brand Column */}
            <div className="md:col-span-4">
              <div className="font-display text-2xl font-bold tracking-tight mb-4 text-text-primary">
                Lead Hunter Club
              </div>
              <p className="text-sm text-text-secondary/70 font-light leading-relaxed mb-6 max-w-xs">
                Premium client acquisition intelligence for freelancers, agencies, and growth consultants who refuse to chase cold leads.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'X', icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )},
                  { label: 'LinkedIn', icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                    </svg>
                  )},
                  { label: 'Instagram', icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  )},
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label} className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-secondary/50 hover:text-text-primary hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product Column */}
            <div className="md:col-span-2">
              <h5 className="text-[11px] font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">Product</h5>
              <ul className="space-y-3">
                {['Features', 'How It Works', 'Pricing', 'Token System'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-text-secondary/70 hover:text-text-primary transition-colors duration-300 font-light">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2">
              <h5 className="text-[11px] font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">Company</h5>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-text-secondary/70 hover:text-text-primary transition-colors duration-300 font-light">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Updated Column */}
            <div className="md:col-span-4">
              <h5 className="text-[11px] font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">Stay Updated</h5>
              <p className="text-sm text-text-secondary/60 font-light leading-relaxed mb-4">
                Get notified about new features, outreach tactics, and platform updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-pink/30 focus:bg-white/[0.05] transition-all duration-300 font-light"
                />
                <button className="px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-bold text-text-primary hover:bg-white/[0.1] hover:border-white/15 transition-all duration-300 shrink-0">
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-text-secondary/30 uppercase tracking-[0.15em]">
              © 2026 Lead Hunter Club · All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="text-[11px] font-mono text-text-secondary/30 uppercase tracking-[0.12em] hover:text-text-secondary/60 transition-colors duration-300">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
