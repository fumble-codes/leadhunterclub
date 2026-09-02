'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDownIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowRightIcon,
  LockClosedIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  BookmarkIcon,
  BoltIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid'
import Link from 'next/link'
import HeroSection from '@/app/components/HeroSection'
import TokenSystemSection from '@/app/components/TokenSystemSection'
import WhoItsForGrid from '@/app/components/WhoItsForGrid'
import FeaturesSection from '@/app/components/FeaturesSection'
import TestimonialsSection from '@/app/components/TestimonialsSection'
import { NewsletterSignup } from '@/app/components/NewsletterSignup'
const ease = [0.16, 1, 0.3, 1] as const

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.03] py-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group focus:outline-none"
      >
        <h4 className="font-display text-xl text-text-primary group-hover:text-accent-orange transition-colors duration-300">
          {q}
        </h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4, ease }}>
          <ChevronDownIcon className="w-[22px] h-[22px] text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden"
          >
            <p className="pt-5 text-text-secondary text-lg leading-relaxed max-w-3xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SIGNAL_LEADS = [
  {
    id: 'checkout',
    name: 'Alex K.',
    company: 'DTC Brands',
    source: 'Twitter',
    signal:
      '"Our current checkout page is ugly and conversions are dropping drastically. Need help fast."',
    urgency: 'Critical',
    tags: ['E-Commerce', 'UI/UX', 'Conversion'],
    email: 'alex.k@dtcbrands.co',
    phone: '+1 (555) 012-3456',
    replyProbability: '97%',
  },
  {
    id: 'shopify',
    name: 'Andy S.',
    company: 'Nexus AI',
    source: 'Reddit',
    signal:
      '"Struggling with slow load times and high bounce rates on our Shopify store — losing sales."',
    urgency: 'High',
    tags: ['Shopify', 'Web Dev'],
    email: 'a.shepard@nexus.ai',
    phone: '+1 (555) 017-8892',
    replyProbability: '92%',
  },
  {
    id: 'rebrand',
    name: 'Michael C.',
    company: 'Stellar Co',
    source: 'LinkedIn',
    signal:
      '"Just raised a seed round and need a full rebrand before our product launch in 6 weeks."',
    urgency: 'High',
    tags: ['SaaS', 'Branding'],
    email: 'm.carter@stellar.co',
    phone: '+1 (555) 019-2045',
    replyProbability: '88%',
  },
]

// ─── Signal Reveal UI — the right-hand visual for the Philosophy section ──
function SignalPreviewUI() {
  const [selectedId, setSelectedId] = useState(SIGNAL_LEADS[0].id)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const selected = SIGNAL_LEADS.find((l) => l.id === selectedId)!

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full rounded-2xl bg-surface border border-white/[0.06] shadow-[0_30px_90px_rgba(var(--rgb-black),0.5)] overflow-hidden">
        {/* Window chrome */}
        <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-dot-red opacity-70" />
            <span className="w-2 h-2 rounded-full bg-dot-yellow opacity-70" />
            <span className="w-2 h-2 rounded-full bg-dot-green opacity-70" />
          </div>
          <span className="text-[9.5px] font-mono text-text-secondary/40 tracking-wider">
            live-signal-feed
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-[8.5px] font-bold uppercase tracking-widest text-text-secondary">
              Intent Monitor
            </span>
          </div>
        </div>

        {/* Lead selector pills */}
        <div className="flex items-center gap-1.5 px-4 pt-3">
          {SIGNAL_LEADS.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedId(lead.id)}
              className={`px-2.5 py-1 rounded-lg text-[8.5px] font-bold uppercase tracking-widest transition-all ${
                selectedId === lead.id
                  ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/25'
                  : 'bg-white/[0.03] text-text-secondary/60 border border-white/[0.06] hover:text-text-primary'
              }`}
            >
              {lead.company}
            </button>
          ))}
        </div>

        {/* Signal body */}
        <div className="p-4 pt-3">
          {/* Lead identity */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-[11px] font-bold text-accent-purple shrink-0">
              {selected.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-text-primary truncate">
                {selected.name}
              </div>
              <div className="text-[9.5px] text-text-secondary/70 truncate">
                {selected.company} · {selected.source}
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-[8.5px] font-bold uppercase tracking-widest text-orange-400 shrink-0">
              {selected.urgency}
            </span>
          </div>

          {/* Buyer signal quote */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5 mb-3">
            <div className="text-[8.5px] font-bold uppercase tracking-widest text-text-secondary/50 mb-1 flex items-center gap-1.5">
              <GlobeAltIcon className="w-[10px] h-[10px] text-accent-purple" /> Buyer Signal
            </div>
            <p className="text-[10.5px] text-text-primary/85 leading-relaxed font-light">
              {selected.signal}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {selected.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[8px] font-bold uppercase tracking-widest text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Reveal / Contact section */}
          <div className="rounded-xl bg-surface-secondary/50 border border-white/[0.05] p-3">
            {revealed[selected.id] ? (
              <>
                <div className="text-[8.5px] font-bold uppercase tracking-widest text-text-secondary/50 mb-2 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-[10px] h-[10px] text-accent-purple" /> Contact
                  Unlocked
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-[10px]">
                    <EnvelopeIcon className="w-3 h-3 text-accent-purple shrink-0" />
                    <span className="text-text-primary truncate">{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <PhoneIcon className="w-3 h-3 text-accent-purple shrink-0" />
                    <span className="text-text-primary">{selected.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-purple text-text-on-accent font-bold text-[8.5px] uppercase tracking-widest flex-1 justify-center">
                    <BookmarkIcon className="w-[9px] h-[9px]" /> Save to Pipeline
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-text-secondary font-bold text-[8.5px] uppercase tracking-widest">
                    <ArrowDownTrayIcon className="w-[9px] h-[9px]" /> Export
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-bold text-text-primary">Contact Locked</div>
                  <div className="text-[8.5px] text-text-secondary/60">
                    Reveal email, phone & profile link
                  </div>
                </div>
                <button
                  onClick={() => setRevealed((prev) => ({ ...prev, [selected.id]: true }))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-purple text-text-on-accent font-bold text-[8.5px] uppercase tracking-widest hover:bg-accent-purple/90 transition-all"
                >
                  <EyeIcon className="w-[10px] h-[10px]" /> Reveal · 3 Credits
                </button>
              </div>
            )}
          </div>

          {/* Reply probability meter */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[8px] text-text-secondary/60 mb-1">
                <span>Reply Probability</span>
                <span className="text-accent-purple font-bold">{selected.replyProbability}</span>
              </div>
              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  key={selected.id}
                  initial={{ width: 0 }}
                  animate={{ width: selected.replyProbability }}
                  transition={{ duration: 0.6, ease }}
                  className="h-full bg-accent-purple/70 rounded-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] shrink-0">
              <BoltIcon className="w-[10px] h-[10px] text-accent-purple" />
              <span className="text-[8px] font-bold text-text-secondary">High Intent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-main text-text-primary font-sans overflow-x-hidden">
      <HeroSection />

      {/* Problem & How It Works (Bento Grid) */}
      <section id="funnel" className="py-24 md:py-28 px-6 max-w-[1240px] mx-auto relative">
        {/* Ambient section glows */}
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] glow-purple-very-faint pointer-events-none" />
        <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] glow-purple-very-faint pointer-events-none" />

        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="text-[13px] font-semibold tracking-wider uppercase mb-3 block text-primary">
              How It Works
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="font-sans text-3xl md:text-[42px] font-semibold tracking-tight mb-4 leading-[1.12] max-w-3xl mx-auto"
          >
            From Raw Signal <span className="text-text-secondary/70">To Closed Client.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="text-base text-text-secondary/80 font-normal max-w-xl mx-auto leading-relaxed"
          >
            Here&apos;s exactly how Lead Hunter Club turns unindexed buyer signals into high-value
            client conversations — before your competitors even know they exist.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {/* CARD 1: Fresh Buyer Intent (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease }}
            whileHover={{ y: -3 }}
            className="md:col-span-2 group relative p-6 md:p-8 metallic-card transition-all duration-300 min-h-[340px] flex flex-col justify-between"
          >
            {/* Visual Radar Container */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 overflow-hidden pointer-events-none flex items-center justify-center">
              {/* Concentric circles - slightly more visible */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-accent-purple/[0.15] flex items-center justify-center shadow-[inset_0_0_40px_rgba(var(--rgb-accent-purple),0.05)]">
                <div className="w-[180px] h-[180px] rounded-full border border-dashed border-accent-purple/[0.2] flex items-center justify-center shadow-[inset_0_0_20px_rgba(var(--rgb-accent-purple),0.05)]">
                  <div className="w-[80px] h-[80px] rounded-full border border-dashed border-accent-purple/[0.3]" />
                </div>
              </div>

              {/* Eye-catching Hero Radar Sweep */}
              <div className="absolute w-[300px] h-[300px] animate-[spin_4s_linear_infinite] rounded-full overflow-hidden">
                {/* Radar sweep cone */}
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[conic-gradient(from_180deg_at_0_100%,rgba(var(--rgb-accent-purple),0)_0deg,rgba(var(--rgb-accent-purple),0.25)_90deg)]" />
                {/* Leading edge line */}
                <div className="absolute top-1/2 left-1/2 w-[150px] h-[2px] bg-accent-orange origin-left -translate-y-1/2 shadow-[0_0_12px_rgba(var(--rgb-accent-orange),0.6)]" />
              </div>

              {/* Glowing cinematic intercept logos */}
              {/* X / Twitter */}
              <motion.div
                className="absolute top-[20%] left-[20%] w-10 h-10 rounded-full bg-social-twitter/10 border border-social-twitter/30 flex items-center justify-center text-social-twitter group-hover:scale-110 group-hover: group-hover:border-social-twitter/50 group-hover:bg-social-twitter/20 transition-all duration-500 backdrop-blur-md"
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-4 h-4 fill-current text-social-twitter" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.div>

              {/* LinkedIn */}
              <motion.div
                className="absolute bottom-[25%] right-[15%] w-8 h-8 rounded-md bg-social-linkedin/10 border border-social-linkedin/30 flex items-center justify-center text-social-linkedin group-hover:scale-110 group-hover: group-hover:border-social-linkedin/50 group-hover:bg-social-linkedin/20 transition-all duration-500 backdrop-blur-md shadow-[0_0_15px_rgba(var(--rgb-social-twitter),0.3)]"
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1.5, ease: 'easeInOut' }}
              >
                <svg className="w-5 h-5 fill-current text-social-linkedin" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                </svg>
              </motion.div>

              {/* Reddit */}
              <motion.div
                className="absolute top-[35%] right-[25%] w-11 h-11 rounded-full bg-social-reddit/10 border border-social-reddit/30 flex items-center justify-center text-social-reddit group-hover:scale-110 group-hover: group-hover:border-social-reddit/50 group-hover:bg-social-reddit/20 transition-all duration-500 backdrop-blur-md shadow-[0_0_15px_rgba(var(--rgb-social-twitter),0.3)]"
                animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              >
                <svg className="w-5 h-5 fill-current text-social-reddit" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.203-.094z" />
                </svg>
              </motion.div>

              {/* Threads */}
              <motion.div
                className="absolute bottom-[20%] left-[25%] w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover: group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-500 backdrop-blur-md shadow-[0_0_15px_rgba(10,102,194,0.3)]"
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
              >
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 192 192">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 148.902 38.8168C156.035 47.8225 160.852 59.2065 163.093 72.8468L179.882 70.0932C177.108 53.6491 170.932 39.8146 162.062 28.627C148.067 10.9231 126.069 1.70613 97.0094 1.5H96.9458C67.9224 1.70613 46.0629 10.9254 32.228 28.5303C19.7891 44.3644 13.1118 67.246 12.9062 95.8943V96.1057C13.1118 124.754 19.7891 147.636 32.228 163.47C46.0629 181.075 67.9224 190.294 96.9458 190.5H97.0094C126.115 190.294 145.457 182.261 159.277 168.455C175.291 152.457 175.143 131.258 166.726 111.666C161.42 99.3093 153.256 92.4287 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
              </motion.div>
            </div>

            <div className="relative z-10 pointer-events-none">
              <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block">
                Step 01
              </span>
              <h3 className="font-sans text-xl md:text-[22px] font-semibold mb-2.5 tracking-tight">
                We Intercept Fresh Signals
              </h3>
              <p className="text-text-secondary/80 text-sm leading-relaxed max-w-sm">
                Our engine continuously scans obscure forums, niche communities, social feeds, and
                intent networks to capture the exact moment someone asks for help with a service you
                offer. These are real people, posting right now.
              </p>
            </div>
          </motion.div>

          {/* CARD 2: Qualified Leads (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            whileHover={{ y: -3 }}
            className="group relative p-6 md:p-8 metallic-card transition-all duration-300 min-h-[340px] flex flex-col justify-between"
          >
            {/* AI Filter Funnel Visual */}
            <div className="relative h-[130px] mb-3">
              {/* Incoming signals (top - raw/unfiltered) */}
              <div className="space-y-1.5 mb-2">
                {[
                  { label: 'Reddit: Need logo designer', status: 'pass' },
                  { label: 'Spam bot: Buy followers now', status: 'reject' },
                  { label: 'LinkedIn: Looking for dev agency', status: 'pass' },
                  { label: 'Old post: Closed 3 months ago', status: 'reject' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-all duration-500 ${
                      item.status === 'pass'
                        ? 'bg-surface border border-white/[0.08]'
                        : 'bg-white/[0.01] border border-white/[0.03] opacity-40 line-through'
                    }`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold ${
                        item.status === 'pass'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.status === 'pass' ? '✓' : '✕'}
                    </div>
                    <span
                      className={`truncate ${
                        item.status === 'pass'
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary/50'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block">
                Step 02
              </span>
              <h3 className="font-sans text-xl md:text-[22px] font-semibold mb-2.5 tracking-tight">
                AI Filters Out the Noise
              </h3>
              <p className="text-text-secondary/80 text-sm leading-relaxed">
                Not every signal is worth your time. Our AI automatically filters dead leads, spam,
                low-intent posts, and irrelevant requests — so only genuine, high-probability
                opportunities make it through.
              </p>
            </div>
          </motion.div>

          {/* CARD 3: Lead Intelligence Builder (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease }}
            whileHover={{ y: -3 }}
            className="group relative p-6 md:p-8 metallic-card transition-all duration-300 min-h-[340px] flex flex-col justify-between"
          >
            {/* Intelligence Dossier Builder */}
            <div className="relative h-[130px] mb-3 p-3 rounded-xl bg-canvas-deeper/60 border border-white/[0.04] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-[10px] uppercase tracking-wider mb-2">
                  <GlobeAltIcon className="w-3 h-3" /> Compiling Intel...
                </div>

                {/* Data fields building up */}
                <div className="space-y-1.5 flex-1">
                  {[
                    { field: 'Pain Point', value: 'High CAC on Shopify store', delay: 0 },
                    { field: 'Budget', value: '$5k-$10k range', delay: 80 },
                    { field: 'Urgency', value: 'Critical — Q2 deadline', delay: 160 },
                    { field: 'Context', value: 'Posted on Twitter 2h ago', delay: 240 },
                  ].map((item) => (
                    <div
                      key={item.field}
                      className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all duration-300"
                      style={{ transitionDelay: `${item.delay}ms` }}
                    >
                      <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-wider w-[65px] shrink-0">
                        {item.field}
                      </span>
                      <span className="text-[10px] text-text-primary font-medium truncate">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Score reveal */}
                <div
                  className="flex items-center gap-2 mt-auto pt-1.5 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ transitionDelay: '350ms' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
                    Intent Score: 94%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block">
                Step 03
              </span>
              <h3 className="font-sans text-xl md:text-[22px] font-semibold mb-2.5 tracking-tight">
                We Build Lead Intelligence
              </h3>
              <p className="text-text-secondary/80 text-sm leading-relaxed">
                Every surviving lead gets deep-analyzed. We compile buyer context, company details,
                urgency level, budget indicators, and the exact pain point they expressed — giving
                you a complete intelligence brief before you even reach out.
              </p>
            </div>
          </motion.div>

          {/* CARD 4: Released to the Hunters (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            whileHover={{ y: -3 }}
            className="md:col-span-2 group relative p-6 md:p-8 metallic-card transition-all duration-300 min-h-[340px] flex flex-col justify-between"
          >
            {/* Dashboard Lead Drop Visual */}
            <div className="absolute right-8 top-8 bottom-8 w-[230px] hidden md:flex flex-col justify-center space-y-2">
              {/* Incoming leads dropping into feed */}
              {[
                {
                  name: 'Sarah K.',
                  signal: 'Needs Shopify dev',
                  score: '96%',
                  delay: 0,
                },
                {
                  name: 'James T.',
                  signal: 'Conversion audit',
                  score: '91%',
                  delay: 120,
                },
                {
                  name: 'Priya M.',
                  signal: 'Brand redesign',
                  score: '88%',
                  delay: 240,
                },
              ].map((lead) => (
                <div
                  key={lead.name}
                  className="p-2.5 rounded-xl bg-surface border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center gap-2.5 transform transition-all duration-300 group-hover:translate-x-1.5"
                  style={{ transitionDelay: `${lead.delay}ms` }}
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-primary">
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-text-primary truncate">{lead.name}</div>
                    <div className="text-[9px] text-text-secondary/60 truncate">{lead.signal}</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[9px] font-semibold text-primary">
                      {lead.score}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              ))}

              {/* Ready badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
                  Ready to Hunt
                </span>
              </div>
            </div>

            <div className="relative z-10 pointer-events-none md:w-[60%]">
              <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block">
                Step 04
              </span>
              <h3 className="font-sans text-xl md:text-[22px] font-semibold mb-2.5 tracking-tight">
                Released to the Hunters
              </h3>
              <p className="text-text-secondary/80 text-sm leading-relaxed">
                Qualified, intelligence-loaded leads land directly in your dashboard — ready to act
                on. Craft the perfect first touch or engage with your own strategy. Either way,
                you&apos;re reaching warm buyers while the opportunity is still fresh.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conversational Intelligence Section */}
      <section
        id="features"
        className="py-24 md:py-28 px-6 max-w-[1240px] mx-auto relative border-t border-white/[0.04]"
      >
        {/* Fine background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-accent-purple/[0.015] blur-2xl rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column - Copy Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-5 text-left relative z-10"
          >
            <span className="text-[13px] uppercase tracking-wider mb-3 block font-semibold text-primary">
              02 / Philosophy
            </span>
            <h2 className="font-sans text-3xl md:text-[40px] font-semibold tracking-tight mb-4 leading-[1.12] text-text-primary">
              Most lead tools chase volume.
              <br />
              <span className="text-text-secondary/70 font-normal">We deliver intent.</span>
            </h2>
            <p className="text-text-secondary/80 text-sm leading-relaxed mb-8 max-w-sm">
              Anyone can chase thousands of raw contacts. But without context, most get ignored.
              We prioritize high-intent signals over bulk noise.
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
                    'Forgettable angles that land in spam folders',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-xs text-text-secondary/50 flex items-center gap-3"
                    >
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
                    'Ultra-low resistance messaging angles',
                    'Strong, psychologically sound messaging angles',
                    'Significantly higher actual reply probability',
                  ].map((item) => (
                    <li key={item} className="text-xs text-text-primary flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-purple shrink-0" />
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

          {/* Right Column - Live Signal Reveal Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="lg:col-span-7"
          >
            <SignalPreviewUI />
          </motion.div>
        </div>
      </section>
      {/* Product Capabilities */}
      <FeaturesSection />

      {/* Token System */}
      <TokenSystemSection />

      {/* Who It's For */}
      <WhoItsForGrid />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <section
        id="pricing"
        className="py-24 md:py-28 px-6 max-w-[1240px] mx-auto relative overflow-hidden border-t border-white/[0.04]"
      >
        {/* Ambient glows */}
        <div className="absolute top-[-10%] left-1/3 w-[500px] h-[500px] glow-purple-very-faint pointer-events-none" />
        <div className="absolute bottom-[5%] right-1/4 w-[500px] h-[500px] glow-purple-very-faint pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="text-[13px] font-semibold tracking-wider uppercase mb-3 block text-primary">
              Pricing Plans
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="font-sans text-3xl md:text-[42px] font-semibold tracking-tight mb-4 leading-[1.12]"
          >
            Acquisition Fuel.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="text-base text-text-secondary/80 font-normal max-w-xl mx-auto leading-relaxed"
          >
            Start free, upgrade when you&apos;re ready. Credits reveal lead identities so you can build
            your pipeline.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 relative z-10">
          {[
            {
              name: 'Free',
              tokens: '50',
              price: 'Free',
              desc: 'Experience the platform and start closing your first high-value client.',
              accent: 'purple',
              featured: false,
              features: [
                '50 Intelligence Credits',
                '~16 Lead Reveals',
                'Basic Lead Intelligence',
              ],
            },
            {
              name: 'Freelancer',
              tokens: '500',
              price: 'Free',
              desc: 'For serious operators building a consistent, high-quality client pipeline.',
              accent: 'purple',
              featured: true,
              features: [
                '500 Intelligence Credits',
                '~166 Lead Reveals',
                'Full Lead Intelligence',
                'CSV/Excel Exports',
                'Priority Signal Access',
                'Credit Rollover',
              ],
            },
            {
              name: 'Agency',
              tokens: '1,000',
              price: 'Free',
              desc: 'Scale teams requiring massive deal flow and deep market intelligence.',
              accent: 'purple',
              featured: false,
              features: [
                '1,000 Intelligence Credits',
                '~333 Lead Reveals',
                'Full Lead Intelligence',
                'CSV/Excel Exports',
                'Priority Signal Access',
                'Credit Rollover',
                'Team Seats (up to 5)',
              ],
            },
          ].map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease }}
              whileHover={{ y: -4 }}
              className={`group relative flex flex-col transition-all duration-300 metallic-card rounded-2xl ${
                p.featured ? 'border-primary/30 shadow-[0_0_24px_rgba(var(--rgb-primary),0.1)]' : ''
              }`}
            >
              {/* Featured ambient glow underneath */}
              {p.featured && (
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
              )}

              {/* Card inner */}
              <div className="relative z-10 p-6 md:p-8 flex flex-col flex-1">
                {/* Popular badge */}
                {p.featured && (
                  <span className="absolute top-5 right-5 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    Most Popular
                  </span>
                )}

                {/* Plan name & description */}
                <div className="mb-6">
                  <div
                    className={`w-7 h-7 rounded-lg ${p.featured ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-white/5 border border-white/5 text-text-secondary/60'} flex items-center justify-center mb-4`}
                  >
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-sans text-xl font-semibold tracking-tight mb-1">{p.name}</h4>
                  <p className="text-xs text-text-secondary/80 leading-relaxed">{p.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/[0.04]">
                  <div className="flex items-end gap-2.5 mb-2.5">
                    <span className="font-sans text-4xl md:text-5xl font-semibold leading-none tracking-tight text-text-primary">
                      {p.price}
                    </span>
                    <span className="text-text-secondary/60 mb-1 text-[10px] font-bold uppercase tracking-wider">during early access</span>
                  </div>

                  {/* Token meter bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary/60">{p.tokens} Credits</span>
                      <span className={`font-semibold ${p.featured ? 'text-primary' : 'text-text-secondary/60'}`}>{p.tokens} / mo</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: p.featured ? '100%' : i === 0 ? '30%' : '85%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.15, ease }}
                        className={`h-full ${p.featured ? 'bg-primary' : 'bg-white/30'} rounded-full`}
                      />
                    </div>
                  </div>
                </div>

                {/* Feature list */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-2.5">
                    {p.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2.5 text-xs text-text-secondary/80"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${p.featured ? 'bg-primary' : 'bg-text-secondary/40'} shrink-0`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  href="/register"
                  className={`block w-full py-3 rounded-xl font-semibold text-xs tracking-wide text-center transition-all duration-300 ${
                    p.featured
                      ? 'bg-primary text-black hover:brightness-110 shadow-[0_2px_14px_rgba(var(--rgb-primary),0.25)]'
                      : 'bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.08]'
                  }`}
                >
                  Get Started with {p.name}
                </Link>
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
          <p className="text-xs text-text-secondary/40 font-mono uppercase tracking-super">
            Free during early access · Credits roll over each month
          </p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-24 px-6 max-w-[860px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="font-sans text-3xl md:text-[38px] font-semibold tracking-tight mb-12 text-center"
        >
          Operational Clarifications.
        </motion.h2>
        <div className="border-t border-white/[0.04]">
          <FAQItem
            q="Do you book clients for me?"
            a="NO. We provide warm, fresh leads actively looking for your service, with AI-scored buyer context so you know exactly how to approach them. You own the relationship."
          />
          <FAQItem
            q="Are these leads scraped from LinkedIn?"
            a="No. Standard scraping is noise. We monitor intent signals across obscure forums, job boards, and community threads where real pain is expressed."
          />
          <FAQItem
            q="How do credits work?"
            a="Credits fuel the intelligence engine. Revealing a lead identity costs between 2 and 10 credits depending on the contact data available (phone, email, or profile link). Unused credits roll over monthly."
          />
          <FAQItem
            q="Can I contact these leads myself?"
            a="Yes. You get the verified contact info and intelligence, and you reach out however you prefer — from your own email, LinkedIn, or phone. We focus on high-intent, quality conversations."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-24 px-6 max-w-[1100px] mx-auto text-center relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-purple/[0.03] blur-2xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 p-10 md:p-14 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-surface to-page-bg overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--rgb-white),0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <span className="text-[13px] font-semibold tracking-wider uppercase text-primary mb-3 block">
            Exclusive Syndicate Access
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-text-primary mb-4 leading-tight">
            Stop Wasting Time <br />
            Looking For Clients.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary/80 font-normal max-w-xl mx-auto mb-8 leading-relaxed">
            Lead Hunter Club brings fresh opportunities directly to you — while AI helps you start
            smarter conversations that actually get replies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8 font-mono text-xs text-text-secondary/70">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Spend less time scraping.
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Spend more time closing.
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-semibold text-sm shadow-[0_2px_18px_rgba(var(--rgb-primary),0.3)] hover:brightness-110 transition-all duration-300 group"
              >
                Start Finding Leads
                <ArrowRightIcon className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} className="inline-block">
              <Link
                href="/sneak-peek"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] shadow-[inset_0_1px_0_rgba(var(--rgb-white),0.06)] font-medium text-text-secondary hover:text-text-primary transition-all cursor-pointer border border-white/[0.08] hover:border-white/15 hover:bg-white/[0.06] text-sm"
              >
                Sneak Peek
              </Link>
            </motion.div>
          </div>

          {/* Supporting Text */}
          <div className="mt-8 font-mono text-[11px] tracking-wider uppercase text-text-secondary/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>Fresh buyer-intent leads</span>
            <span className="text-primary/40">•</span>
            <span>Smarter targeting</span>
            <span className="text-primary/40">•</span>
            <span>Less wasted time</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.04] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-purple/[0.02] blur-2xl rounded-full pointer-events-none" />

        {/* Main footer content */}
        <div className="max-w-[1240px] mx-auto px-6 pt-16 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
            {/* Brand Column */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Lead Hunter Club"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg"
                />
                <span className="font-display text-2xl font-bold tracking-tight text-text-primary">
                  Lead Hunter Club
                </span>
              </div>
              <p className="text-sm text-text-secondary/70 font-light leading-relaxed mb-6 max-w-xs">
                Premium client acquisition intelligence for freelancers, agencies, and growth
                consultants who refuse to chase cold leads.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  {
                    label: 'X',
                    icon: (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'LinkedIn',
                    icon: (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Instagram',
                    icon: (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    ),
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-secondary/50 hover:text-text-primary hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product Column */}
            <div className="md:col-span-2">
              <h5 className="text-11 font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">
                Product
              </h5>
              <ul className="space-y-3">
                {['Features', 'How It Works', 'Pricing', 'Token System'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-text-secondary/70 hover:text-text-primary transition-colors duration-300 font-light"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2">
              <h5 className="text-11 font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">
                Company
              </h5>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-text-secondary/70 hover:text-text-primary transition-colors duration-300 font-light"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Updated Column */}
            <div className="md:col-span-4">
              <h5 className="text-11 font-bold text-text-secondary/40 uppercase tracking-[0.15em] mb-5">
                Stay Updated
              </h5>
              <p className="text-sm text-text-secondary/60 font-light leading-relaxed mb-4">
                Get notified about new features, lead-hunting tactics, and platform updates.
              </p>
              <NewsletterSignup />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-11 font-mono text-text-secondary/30 uppercase tracking-[0.15em]">
              © 2026 Lead Hunter Club · All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-11 font-mono text-text-secondary/30 uppercase tracking-[0.12em] hover:text-text-secondary/60 transition-colors duration-300"
                >
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
