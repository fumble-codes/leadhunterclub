'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid'

const ease = [0.16, 1, 0.3, 1] as const

// ─── Data ────────────────────────────────────────────────────────────────────

interface Highlight {
  label: string
  tag: string
  tagColor: string
  detail: string
}

interface Testimonial {
  id: string
  name: string
  handle: string
  role: string
  accentToken: string
  initials: string
  quote: string
  result: string
  highlights: Highlight[]
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'alex',
    name: 'Alex Moreno',
    handle: '@alexmoreno_dev',
    role: 'Freelance Developer',
    accentToken: 'persona-green',
    initials: 'AM',
    result: '$4,200 contract in week 1',
    quote:
      'Found a $4k Shopify contract within my first week. The intent signals are insanely accurate — it honestly felt like cheating.',
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: 'Manually browsing Reddit',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Spent 2–3 hours a day manually scrolling forums hoping to stumble across someone asking for dev help.',
      },
      {
        label: 'What changed',
        tag: 'AI Outreach Writer',
        tagColor: 'bg-persona-green/10 border-persona-green/20 text-persona-green',
        detail:
          'LeadHunter surfaces the exact posts with buyer intent and drafts a personalized pitch in seconds — no guesswork.',
      },
      {
        label: 'Their result',
        tag: '+28% Reply Rate',
        tagColor: 'bg-persona-blue/10 border-persona-blue/20 text-persona-blue',
        detail:
          'Went from 4% cold email replies to 28% in under a month. First paid contract landed in week one.',
      },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    handle: '@priyaux',
    role: 'UI/UX Designer',
    accentToken: 'persona-pink',
    initials: 'PS',
    result: '3 retainers closed in 30 days',
    quote:
      "LeadHunter surfaces clients I'd never find cold emailing. Every lead already wants design help — it's that good.",
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: 'Cold job board applications',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Sending 30+ cold applications a week on Contra and Upwork with a 2% callback rate at best.',
      },
      {
        label: 'What changed',
        tag: 'Intent Scoring',
        tagColor: 'bg-persona-pink/10 border-persona-pink/20 text-persona-pink',
        detail:
          "Every lead is ranked by urgency and budget signal — she pitches only when there's a real buying signal.",
      },
      {
        label: 'Their result',
        tag: '3 Retainers / 30 Days',
        tagColor: 'bg-persona-green/10 border-persona-green/20 text-persona-green',
        detail:
          'Closed three ongoing monthly design retainers by week four. Zero cold applications sent since.',
      },
    ],
  },
  {
    id: 'koen',
    name: 'Koen Voss',
    handle: '@koenvoss',
    role: 'Brand Designer',
    accentToken: 'tab-purple',
    initials: 'KV',
    result: 'Replaced job boards entirely',
    quote:
      'I stopped wasting time on job boards. Warm intent leads close 3x faster — the quality difference is night and day.',
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: 'Waiting on referrals',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Revenue was entirely dependent on word-of-mouth. Dry months with no predictable pipeline whatsoever.',
      },
      {
        label: 'What changed',
        tag: 'Automated Follow-Ups',
        tagColor: 'bg-tab-purple/10 border-tab-purple/20 text-tab-purple',
        detail:
          "Multi-stage sequences now run in the background. Deals move forward even when he's heads-down on client work.",
      },
      {
        label: 'Their result',
        tag: '3× Faster Closes',
        tagColor: 'bg-persona-pink/10 border-persona-pink/20 text-persona-pink',
        detail:
          'Warm intent leads close three times faster than cold applications. Fully replaced job boards within 6 weeks.',
      },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Tse',
    handle: '@marcustse',
    role: 'Full-Stack Developer',
    accentToken: 'persona-blue',
    initials: 'MT',
    result: 'Response rate: 4% → 28%',
    quote:
      'The AI drafts outreach that actually sounds like me. Response rates went from 4% to 28% without touching my email setup.',
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: 'Generic cold templates',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Using the same copy-paste cold email template for every prospect. Felt spammy and landed in inboxes maybe half the time.',
      },
      {
        label: 'What changed',
        tag: 'AI Context Insight',
        tagColor: 'bg-persona-blue/10 border-persona-blue/20 text-persona-blue',
        detail:
          'Every outreach is written around the specific signal that triggered the lead — founders respond because it feels personal.',
      },
      {
        label: 'Their result',
        tag: '7× More Pipeline',
        tagColor: 'bg-tab-purple/10 border-tab-purple/20 text-tab-purple',
        detail:
          'Pipeline grew 7x in 45 days. Now closes 2–3 new contracts monthly without any additional marketing spend.',
      },
    ],
  },
  {
    id: 'jade',
    name: 'Jade Williams',
    handle: '@jadegrowth',
    role: 'SMMA Owner',
    accentToken: 'persona-orange',
    initials: 'JW',
    result: '2 → 8 retainers in 60 days',
    quote:
      'Scaled from 2 to 8 retainer clients in 60 days. This is the unfair advantage agencies need. Nothing else comes close.',
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: 'Burned out on cold DMs',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Sending 50+ cold DMs daily across Instagram and LinkedIn with almost no response. Team was exhausted.',
      },
      {
        label: 'What changed',
        tag: 'Multi-Platform Feed',
        tagColor: 'bg-persona-orange/10 border-persona-orange/20 text-persona-orange',
        detail:
          'One feed now aggregates high-intent signals from 5 platforms. The team pitches only when a real buying signal exists.',
      },
      {
        label: 'Their result',
        tag: '4× Revenue in 60 Days',
        tagColor: 'bg-persona-green/10 border-persona-green/20 text-persona-green',
        detail:
          'Grew from $6k/mo to $24k/mo MRR in two months. Cold outreach budget reduced to zero.',
      },
    ],
  },
  {
    id: 'david',
    name: 'David Kaur',
    handle: '@davidkaur',
    role: 'Agency Owner',
    accentToken: 'tab-purple',
    initials: 'DK',
    result: 'Replaced entire SDR stack',
    quote:
      'We replaced our entire outbound SDR stack with LeadHunter. Same pipeline at 20% of the cost. I wish I found it sooner.',
    highlights: [
      {
        label: 'Before LeadHunter',
        tag: '3 full-time SDRs',
        tagColor: 'bg-white/5 border-white/10 text-text-secondary/60',
        detail:
          'Running a 3-person outbound team at $15k/mo in salaries. Results were inconsistent and hard to scale.',
      },
      {
        label: 'What changed',
        tag: 'Email Integration',
        tagColor: 'bg-persona-blue/10 border-persona-blue/20 text-persona-blue',
        detail:
          'LeadHunter now handles lead discovery, enrichment, and outreach sequencing — fully automated with no seat cost.',
      },
      {
        label: 'Their result',
        tag: '80% Cost Reduction',
        tagColor: 'bg-persona-green/10 border-persona-green/20 text-persona-green',
        detail:
          'Eliminated 3 SDR salaries while hitting the same pipeline targets. Reinvested savings into product and growth.',
      },
    ],
  },
]

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  isActive,
  onClick,
}: {
  testimonial: Testimonial
  isActive: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        relative flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-pointer
        transition-colors duration-300 select-none min-w-[240px] max-w-[280px] shrink-0
        ${
          isActive
            ? 'bg-surface border-white/10 shadow-[0_20px_60px_rgba(var(--rgb-black),0.7)]'
            : 'bg-surface/60 border-white/[0.04] hover:bg-surface-secondary/80'
        }
      `}
      animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0.45 }}
      whileHover={isActive ? {} : { opacity: 0.72 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border"
        style={{
          background: `rgba(var(--rgb-${testimonial.accentToken}), 0.07)`,
          borderColor: `rgba(var(--rgb-${testimonial.accentToken}), 0.12)`,
          color: `var(--color-${testimonial.accentToken})`,
        }}
      >
        {testimonial.initials}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary truncate">{testimonial.name}</span>
          <span className="text-[10px] text-text-secondary/40 font-mono shrink-0">
            {testimonial.handle}
          </span>
        </div>
        <span className="text-[11px] text-text-secondary/60">{testimonial.role}</span>
      </div>

      {/* Active glow ring */}
      {isActive && (
        <motion.div
          layoutId="active-testimonial-ring"
          className="absolute inset-0 rounded-2xl border pointer-events-none"
          style={{ borderColor: `rgba(var(--rgb-${testimonial.accentToken}), 0.14)` }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </motion.div>
  )
}

// ─── Highlight Row ─────────────────────────────────────────────────────────────

function HighlightRow({ highlight, index }: { highlight: Highlight; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease }}
      className="flex flex-col sm:flex-row sm:items-start gap-3 py-5 border-b border-white/[0.04] last:border-0"
    >
      <div className="sm:w-[140px] shrink-0">
        <span className="text-[10px] font-mono text-text-secondary/40 uppercase tracking-widest">
          {highlight.label}:
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 flex-1">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest shrink-0 ${highlight.tagColor}`}
        >
          {highlight.tag}
        </span>
        <p className="text-[12px] text-text-secondary/65 leading-relaxed">{highlight.detail}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = TESTIMONIALS.length
  const active = TESTIMONIALS[activeIndex]

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % total) + total) % total)
    },
    [total],
  )

  // Auto-advance
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total)
    }, 3800)
    return () => clearInterval(interval)
  }, [isPaused, total])

  // Only show prev, active, next cards
  const getPosition = (index: number): 'left' | 'center' | 'right' | 'hidden' => {
    const prev = (activeIndex - 1 + total) % total
    const next = (activeIndex + 1) % total
    if (index === activeIndex) return 'center'
    if (index === prev) return 'left'
    if (index === next) return 'right'
    return 'hidden'
  }

  return (
    <section
      id="testimonials"
      className="py-36 px-6 max-w-[1100px] mx-auto relative overflow-hidden border-t border-white/[0.03]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] glow-purple-medium pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="text-[10px] font-bold tracking-ultra uppercase mb-6 block text-text-secondary/40">
            Customer Reviews
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="font-display text-[38px] md:text-[52px] font-semibold tracking-tight text-text-primary leading-[1.1] mb-5 max-w-3xl mx-auto"
        >
          Real results from real people.
          <br />
          <span className="text-text-secondary/60">No fluff, just outcomes.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="text-base text-text-secondary/60 max-w-lg mx-auto leading-relaxed"
        >
          Freelancers, designers, and agency owners share exactly what changed after switching to
          LeadHunterClub.
        </motion.p>
      </div>

      {/* ── Persona Carousel ── */}
      <div className="relative z-10 mb-14">
        <div className="relative flex items-center justify-center h-[96px] overflow-visible">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-main to-transparent z-30 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-main to-transparent z-30 pointer-events-none" />

          <div className="flex items-center justify-center gap-4 relative">
            {TESTIMONIALS.map((t, index) => {
              const pos = getPosition(index)
              if (pos === 'hidden') return null
              return (
                <TestimonialCard
                  key={t.id}
                  testimonial={t}
                  isActive={pos === 'center'}
                  onClick={() => {
                    goTo(index)
                    setIsPaused(true)
                    setTimeout(() => setIsPaused(false), 6000)
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Nav dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i)
                setIsPaused(true)
                setTimeout(() => setIsPaused(false), 6000)
              }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-5 h-1.5 bg-white/60'
                  : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Dynamic Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 max-w-[820px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Left: Highlight rows */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + '-rows'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {active.highlights.map((h, i) => (
                  <HighlightRow key={h.tag} highlight={h} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Quote card */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + '-quote'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4, ease }}
                className="p-6 rounded-2xl bg-surface border border-white/[0.05] relative overflow-hidden"
              >
                {/* Accent glow */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 blur-xl rounded-full pointer-events-none opacity-25"
                  style={{ background: `var(--color-${active.accentToken})` }}
                />

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-[11px] h-[11px]"
                      style={{ color: `var(--color-${active.accentToken})`, opacity: 0.8 }}
                    />
                  ))}
                </div>

                {/* Big quote mark */}
                <span
                  className="text-[56px] font-serif leading-none block mb-1 -mt-2 opacity-20"
                  style={{ color: `var(--color-${active.accentToken})` }}
                >
                  &quot;
                </span>

                <p className="text-[13px] text-text-primary/90 leading-relaxed font-light relative z-10 -mt-3">
                  {active.quote}
                </p>

                {/* Result badge */}
                <div
                  className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider relative z-10"
                  style={{
                    background: `rgba(var(--rgb-${active.accentToken}), 0.05)`,
                    borderColor: `rgba(var(--rgb-${active.accentToken}), 0.10)`,
                    color: `var(--color-${active.accentToken})`,
                  }}
                >
                  {active.result}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.04] relative z-10">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0"
                    style={{
                      background: `rgba(var(--rgb-${active.accentToken}), 0.07)`,
                      borderColor: `rgba(var(--rgb-${active.accentToken}), 0.12)`,
                      color: `var(--color-${active.accentToken})`,
                    }}
                  >
                    {active.initials}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-text-primary">{active.name}</div>
                    <div className="text-[10px] text-text-secondary/50">{active.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* CTA strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="flex items-center justify-center mt-16 relative z-10"
      >
        <button className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/15 text-sm text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer">
          See all reviews
          <ArrowRightIcon className="w-[14px] h-[14px] group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </motion.div>
    </section>
  )
}
