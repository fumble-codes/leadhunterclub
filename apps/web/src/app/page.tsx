'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  MessageSquare, 
  Zap, 
  Coins, 
  TrendingUp, 
  Play, 
  Check, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  LockKeyhole, 
  Globe, 
  Layers 
} from 'lucide-react'

// Mock Data for Interactive Platform Tour
const tourSteps = [
  {
    id: 'intercept',
    label: '01. Intercept Signals',
    accent: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    accentColor: '#7DD3FC',
    title: 'Precision Intent Capturing',
    desc: 'Our engine monitors unindexed social triggers, active hiring boards, and tech stack migrations to find founders with immediate buying pressure.',
    metric: '6 Signals Today',
    codeSnippet: {
      source: 'Twitter/X Signal',
      urgency: 'CRITICAL',
      content: 'Emily Thompson (Founder, Vanguard): "Need a fresh SaaS aesthetic that highlights our core analytics engine. Our current interface feels clunky and legacy. Any elite designer free?"',
      meta: 'Budget Indicator: $12k+  •  Urgency: Immediate'
    }
  },
  {
    id: 'intel',
    label: '02. Contextual Intel',
    accent: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
    accentColor: '#FFB86B',
    title: 'AI Psychology Breakdown',
    desc: 'Instead of cold scraped stats, LHC extracts the raw stress points, budget constraints, and hiring motivation, calculating an Avg. Reply Probability.',
    metric: '95% Match Rate',
    codeSnippet: {
      source: 'AI Psychology Engine',
      urgency: 'HIGH MATCH',
      content: 'STRESSOR: User churn at onboarding due to legacy visuals.\nMOTIVATION: Just raised seed, looking to rebrand before launching marketing.\nSOPIHISTICATION: High. Prefers technical, no-BS direct conversation.',
      meta: 'Persuasion Angle: Curiosity Loop + Authority Play'
    }
  },
  {
    id: 'outreach',
    label: '03. Conversational Outreach',
    accent: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
    accentColor: '#A78BFA',
    title: 'The AI Angles Engine',
    desc: 'LHC automatically drafts outreach options utilizing advanced conversational frameworks—Curiosity Loops, Authority Plays, and Subtle Humor.',
    metric: 'Active Drafting',
    codeSnippet: {
      source: 'Outreach Copilot',
      urgency: 'DRAFT GENERATED',
      content: 'Hey Emily, saw your post. Churn during SaaS onboarding is usually a sign the UI isn\'t matching the product\'s actual value. Just helped Nexus shave 24% off signup churn with a UX overhaul. Any interest in a quick 2-min breakdown of what we did?',
      meta: 'Framework: Curiosity Loop  •  Tone: Direct'
    }
  }
]

export default function Home() {
  const [activeStep, setActiveStep] = useState(tourSteps[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Auto-rotate steps when not interacting
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const currentIndex = tourSteps.findIndex(s => s.id === activeStep.id)
        const nextIndex = (currentIndex + 1) % tourSteps.length
        setActiveStep(tourSteps[nextIndex])
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, activeStep])

  return (
    <main className="min-h-screen relative overflow-hidden bg-bg-main text-text-primary selection:bg-accent-mint/30 selection:text-text-primary">
      {/* Dynamic Background Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Soft color pools */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-mint/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-purple/[0.03] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[50%] rounded-full bg-accent-cyan/[0.03] blur-[150px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-44 pb-24 px-4 z-10">
        <div className="max-w-container mx-auto text-center">
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle mb-6 shadow-2xl"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
            <span className="text-[11px] font-bold text-text-secondary tracking-widest uppercase flex items-center gap-1.5 font-mono">
              CONVERSION INTELLIGENCE ENGINE V3.0
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-hero text-text-primary tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05]"
          >
            Turn raw buyer signals into <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-accent-mint via-accent-cyan to-accent-purple bg-clip-text text-transparent">
              high-value conversations.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            Stop scraping dead databases and competing on volume. Lead Hunter Club captures high-intent social triggers, parses psychological pain, and drafts outreach that actually gets responses.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-accent-mint text-[#11150C] font-black rounded-full shadow-[0_0_40px_-5px_rgba(184,243,107,0.3)] hover:shadow-[0_0_50px_rgba(184,243,107,0.5)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 group text-sm uppercase tracking-wider"
            >
              Enter Platform
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById('demo')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full sm:w-auto px-8 py-4 bg-surface-secondary text-text-primary font-bold rounded-full border border-border-subtle hover:bg-surface-elevated hover:border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Play size={14} className="fill-current" />
              Watch Live Demo
            </button>
          </motion.div>

          {/* INTERACTIVE PLATFORM TOUR */}
          <motion.div
            id="demo"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="w-full rounded-[32px] bg-surface-secondary/40 border border-white/[0.06] shadow-2xl p-4 md:p-6 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              {/* Window Controls */}
              <div className="flex items-center gap-6 justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                  <div className="w-3 h-3 rounded-full bg-green-500/30" />
                </div>
                <div className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-text-secondary tracking-widest uppercase">
                  OPERATIONAL CONTROL HUB
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="flex flex-wrap gap-1 bg-[#0F1115]/80 p-1.5 rounded-2xl border border-white/[0.04]">
                {tourSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStep(step)
                      setIsPlaying(false)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                      activeStep.id === step.id
                        ? 'text-bg-main shadow-lg'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {activeStep.id === step.id && (
                      <motion.div
                        layoutId="activeTourTab"
                        className="absolute inset-0 bg-accent-mint rounded-xl"
                        style={{ backgroundColor: activeStep.accentColor }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Layout Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-6">
              {/* Explainer Block */}
              <div className="lg:col-span-2 text-left space-y-6 flex flex-col justify-center">
                <div className="space-y-3">
                  <div className={`inline-flex px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${activeStep.accent}`}>
                    {activeStep.title}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                    How it works
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-light">
                    {activeStep.desc}
                  </p>
                </div>

                {/* Key Metric Display */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-mint/10 text-accent-mint flex items-center justify-center font-mono font-bold text-xs">
                      %
                    </div>
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Engine Metric</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{activeStep.metric}</span>
                </div>
              </div>

              {/* Code/Terminal Mockup */}
              <div className="lg:col-span-3 text-left">
                <div className="rounded-2xl bg-[#0F1115]/90 border border-white/[0.06] p-6 font-mono text-xs relative overflow-hidden h-[280px] flex flex-col justify-between shadow-inner">
                  {/* Subtle terminal lines */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1115]/80 pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] border-b border-white/[0.04] pb-3 text-text-secondary">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
                        {activeStep.codeSnippet.source}
                      </span>
                      <span className="font-bold text-accent-mint uppercase" style={{ color: activeStep.accentColor }}>
                        {activeStep.codeSnippet.urgency}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="text-text-primary leading-relaxed whitespace-pre-line text-[13px] md:text-sm font-light select-none italic text-opacity-95"
                      >
                        {activeStep.codeSnippet.content}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="text-[11px] text-text-secondary border-t border-white/[0.04] pt-3 flex justify-between items-center">
                    <span>{activeStep.codeSnippet.meta}</span>
                    <Link href="/dashboard" className="text-accent-mint hover:underline flex items-center gap-1">
                      Platform Access <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MANIFESTO / STORY SECTION */}
      <section className="py-24 px-4 relative z-10 border-t border-white/[0.02] bg-white/[0.01]">
        <div className="max-w-container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-bold text-accent-purple tracking-[0.25em] uppercase font-mono">
              THE CONVERSATION MANIFESTO
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-none">
              Mindless volume is dead. <br />
              Conversations are the moat.
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed font-light">
              High-value buyers are fully immune to robot-generated automated spam. To close top-tier clients, your outreach must sound handcrafted, emotionally intelligent, and deeply relevant.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-[32px] bg-[#171A20]/20 border border-red-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-mono font-bold text-sm">
                    ✕
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-tight">The Spam Method</h4>
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Volume Play</span>
                  </div>
                </div>
                
                <blockquote className="text-xs font-mono text-text-secondary/70 bg-[#0F1115]/50 p-4 rounded-xl border border-white/[0.02] leading-relaxed mb-6 italic">
                  "Dear Founder, hope this email finds you well. We are an award winning digital growth agency specializing in ROI optimized design. I would love to pitch our portfolio on a 30-min call..."
                </blockquote>

                <ul className="space-y-3 mb-8">
                  {['Sounds like every other AI bot', 'Ignored, reported, or marked as spam', 'Zero context on buying pressure', 'Ruins premium brand reputation'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-xs text-text-secondary/80">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/[0.04] flex justify-between items-center text-xs font-mono">
                <span className="text-text-secondary">Average Reply Rate:</span>
                <span className="text-red-400 font-bold">0.2%</span>
              </div>
            </motion.div>

            {/* The LHC Way */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-[32px] bg-gradient-to-br from-accent-mint/[0.03] to-transparent border border-accent-mint/15 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-mint/[0.02] rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent-mint/10 text-accent-mint flex items-center justify-center font-mono font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-tight">The Lead Hunter Club Method</h4>
                    <span className="text-[10px] text-accent-mint uppercase tracking-widest font-mono">Socially Intelligent</span>
                  </div>
                </div>

                <blockquote className="text-xs font-mono text-text-primary bg-accent-mint/[0.02] p-4 rounded-xl border border-accent-mint/10 leading-relaxed mb-6 italic">
                  "Saw you just hired 3 SDRs. That\'s usually a sign outbound infrastructure is scaling but tools might be lagging. We built a token-optimization flow that shaves 20% off SaaS SDR friction. Worth looking?"
                </blockquote>

                <ul className="space-y-3 mb-8">
                  {['Triggers direct interest immediately', 'Low-pressure, conversation first', 'Hyper-personalized around stressors', 'Builds massive authority in one sentence'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-xs text-text-primary/95">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/[0.04] flex justify-between items-center text-xs font-mono">
                <span className="text-text-secondary">Average Reply Rate:</span>
                <span className="text-accent-mint font-bold">18.5%</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STORY-DRIVEN JOURNEY (SCROLL REVEAL PILLARS) */}
      <section className="py-24 px-4 relative z-10 border-t border-white/[0.02]">
        <div className="max-w-container mx-auto space-y-32">
          {/* Section Title */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-accent-cyan tracking-[0.3em] uppercase font-mono">
              THE CONVERSION PIPELINE
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
              Three Steps. Infinite Lever.
            </h2>
          </div>

          {/* Phase 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold font-mono text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  PHASE 01 // DISCOVERY
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                Signal Interception over database extraction.
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed font-light">
                Public tools scrape and sell stale lists. LHC monitors real-time triggers: technical stress comments on obscure boards, stack migration errors, seed rounds, and key executive additions.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Trigger Coverage</h5>
                  <p className="text-lg font-bold text-accent-cyan">42 Platforms</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Signal Processing</h5>
                  <p className="text-lg font-bold text-accent-cyan">Sub-5min Latency</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-[24px] bg-[#171A20]/40 border border-white/[0.06] p-6 overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/[0.03] rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                <span className="text-[10px] font-mono text-accent-cyan font-bold tracking-widest uppercase">
                  LIVE PIPELINE STREAM
                </span>
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              </div>

              <div className="space-y-3 flex-grow justify-center flex flex-col">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-accent-cyan" />
                    <span className="text-xs font-mono font-medium">Twitter: Founder raising seed round</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Active</span>
                </div>
                <div className="p-3 bg-[#0F1115]/60 border border-white/5 rounded-xl flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-text-secondary" />
                    <span className="text-xs font-mono font-medium">Reddit: Shopify merchant slow loadtimes</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Processed</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-text-secondary text-right pt-4 border-t border-white/[0.04]">
                FEED: LIVE_DISCOVERY_ENGINE
              </div>
            </motion.div>
          </div>

          {/* Phase 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-[24px] bg-[#171A20]/40 border border-white/[0.06] p-6 overflow-hidden flex flex-col justify-between shadow-2xl lg:order-last backdrop-blur-md"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-accent-orange/[0.03] rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                <span className="text-[10px] font-mono text-accent-orange font-bold tracking-widest uppercase">
                  PSYCHOLOGY ENGINE SYNTHESIS
                </span>
                <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              </div>

              <div className="space-y-3 flex-grow justify-center flex flex-col font-mono text-xs">
                <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-secondary">TARGET BUDGET</span>
                    <span className="text-accent-orange font-bold">$15,000 / month</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-orange h-full w-[85%]" />
                  </div>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-secondary">URGENCY RATING</span>
                    <span className="text-accent-orange font-bold">IMMEDIATE</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-orange h-full w-[95%]" />
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-text-secondary text-right pt-4 border-t border-white/[0.04]">
                MATCH SCOPING PROBABILITY: 94%
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold font-mono text-accent-orange bg-accent-orange/10 border border-accent-orange/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  PHASE 02 // COGNITION
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                Context Enrichment over name extraction.
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed font-light">
                We pull data regarding target background, tech constraints, business size, and decision sophistication. When you draft, you aren't throwing darts; you know exactly where the pain lives.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Enrichment Depth</h5>
                  <p className="text-lg font-bold text-accent-orange">40+ Touchpoints</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Deduplication</h5>
                  <p className="text-lg font-bold text-accent-orange">100% Guaranteed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Phase 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold font-mono text-accent-purple bg-accent-purple/10 border border-accent-purple/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  PHASE 03 // CONVERSION
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                Psychological angles over template drop-ins.
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed font-light">
                Our outreach engine generates variations focused on different psychological mechanisms: Curiosity Loops that tease solutions, Authority Plays establishing pedigree, or Subtle Humor.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Strategy Modes</h5>
                  <p className="text-lg font-bold text-accent-purple">3 Cognitive Modes</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Human Pass</h5>
                  <p className="text-lg font-bold text-accent-purple">99.4% Synthesized</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-[24px] bg-[#171A20]/40 border border-white/[0.06] p-6 overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/[0.03] rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                <span className="text-[10px] font-mono text-accent-purple font-bold tracking-widest uppercase">
                  CONVERSION COCKPIT PREVIEW
                </span>
                <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              </div>

              <div className="space-y-2 flex-grow justify-center flex flex-col font-mono text-xs">
                <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-lg text-[10px] font-bold uppercase tracking-widest text-center">
                  Active Framework: Curiosity Loop
                </div>
                <p className="text-xs text-text-secondary p-3 rounded-xl bg-white/[0.01] border border-white/5 leading-relaxed font-light italic">
                  "Saw you just scaled outbound teams but tech remains standard. Shaved 20% off friction for stellar growth teams. Open to looking?"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                <span className="text-[9px] font-mono text-text-secondary">MODEL: Persuasion-GPT-4</span>
                <button className="px-3 py-1.5 bg-accent-purple text-bg-main font-bold rounded-lg text-[10px] uppercase tracking-widest hover:bg-opacity-95 transition-all">
                  Engage Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENTO GRID OF DEEP PLATFORM FEATURES */}
      <section className="py-24 px-4 relative z-10 border-t border-white/[0.02] bg-white/[0.005]">
        <div className="max-w-container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-bold text-accent-mint tracking-[0.3em] uppercase font-mono">
              ENGINE FEATURES
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
              Hardened for serious agency scaling.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item 1 */}
            <div className="p-8 rounded-[32px] bg-[#171A20]/25 border border-white/[0.04] md:col-span-2 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.08] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-mint/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-mint/10 text-accent-mint flex items-center justify-center">
                  <Coins size={20} />
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">Token-Optimized Credit Economy</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  No monthly overhead wastes or massive licensing fees. LHC utilizes an on-demand token ecosystem. Only spend credits on highly validated, high-intent leads that perfectly align with your agency niche.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-white/[0.04] mt-8 text-xs font-mono text-text-secondary">
                <span>Credit Cost: ~3 tokens/lead</span>
                <span className="text-accent-mint">750 / 1k Active</span>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="p-8 rounded-[32px] bg-[#171A20]/25 border border-white/[0.04] flex flex-col justify-between hover:border-white/[0.08] transition-all">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">Lead Distribution Engine</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  Intelligent tagging categorizing signals instantly into SaaS, Fintech, Web3, or DTC niches. Filter pipeline and action signals seamlessly.
                </p>
              </div>

              <div className="pt-8 border-t border-white/[0.04] text-xs font-mono text-text-secondary flex justify-between">
                <span>Coverage</span>
                <span className="text-accent-purple font-bold">12 Niches</span>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="p-8 rounded-[32px] bg-[#171A20]/25 border border-white/[0.04] flex flex-col justify-between hover:border-white/[0.08] transition-all">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 text-accent-orange flex items-center justify-center">
                  <LockKeyhole size={20} />
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">Secure Context Hiding</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  We secure leads inside active client nodes. Details are only revealed when active tokens are spent, keeping high-budget opportunities secure.
                </p>
              </div>

              <div className="pt-8 border-t border-white/[0.04] text-xs font-mono text-text-secondary flex justify-between">
                <span>Status</span>
                <span className="text-accent-orange font-bold">Node Secured</span>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="p-8 rounded-[32px] bg-[#171A20]/25 border border-white/[0.04] md:col-span-2 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.08] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">The Proprietary Feedback Loop</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  Every positive reply, conversion milestone, and conversation momentum metric is analyzed locally to continually train the persuasion engine. Over time, your agency drafts become increasingly calibrated to conversion responses.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-white/[0.04] mt-8 text-xs font-mono text-text-secondary">
                <span>Model Calibration</span>
                <span className="text-accent-cyan font-bold">Local Loop Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-32 px-4 relative z-10 border-t border-white/[0.02] text-center">
        <div className="max-w-[800px] mx-auto relative p-12 md:p-20 rounded-[48px] bg-gradient-to-br from-surface-secondary to-transparent border border-white/[0.06] overflow-hidden">
          {/* Subtle glow circles */}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent-mint/[0.05] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent-purple/[0.04] blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <span className="text-xs font-bold text-accent-mint tracking-[0.3em] uppercase font-mono">
              APPLICATIONS NOW OPEN
            </span>
            
            <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-text-primary leading-none">
              Stop scraping. <br className="hidden md:inline" />
              Start conversing.
            </h2>
            
            <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-lg mx-auto font-light">
              Join elite growth teams using Lead Hunter Club to secure high-intent client conversations on complete autopilot.
            </p>

            <div className="max-w-md mx-auto relative group">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter work email..." 
                      className="flex-grow bg-[#0F1115] border border-white/10 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-accent-mint/50 transition-all font-light"
                      required
                    />
                    <button 
                      onClick={() => {
                        if (emailInput.includes('@')) {
                          setIsSubmitted(true)
                        }
                      }}
                      className="bg-accent-mint text-[#11150C] font-black rounded-full px-8 py-4 text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(184,243,107,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      Apply Access
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-accent-mint/5 border border-accent-mint/20 text-accent-mint text-sm font-bold flex items-center justify-center gap-2 font-mono"
                  >
                    <ShieldCheck size={18} />
                    APPLICATION RECEIVED. NODE RESERVED.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE AGENCY FOOTER */}
      <footer className="py-12 border-t border-white/[0.02] text-center text-xs text-text-secondary/50 font-mono relative z-10 bg-[#0F1115]">
        <div className="max-w-container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-accent-mint tracking-widest">LHC</span>
            <span>•</span>
            <span>© 2026 Lead Hunter Club. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-text-primary transition-colors">Operational App</Link>
            <Link href="/leads" className="hover:text-text-primary transition-colors">Lead Feed</Link>
            <Link href="/outreach" className="hover:text-text-primary transition-colors">Conversation Cockpit</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
