'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap, Filter, Send, Brain, MessageSquare, Clock, Coins, Target,
  Sparkles, Mail, Palette, Code2, BarChart3
} from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

// ─── Card 1: Fresh Daily Leads (wide) — Live notification feed ──────────────
function FreshLeadsVisual() {
  const notifications = [
    { name: 'Sarah K.', signal: 'Looking for a Shopify developer', time: '2m ago', platform: 'Reddit' },
    { name: 'James T.', signal: 'Need help with conversion rates', time: '5m ago', platform: 'Twitter/X' },
    { name: 'Priya M.', signal: 'Searching for brand designer', time: '8m ago', platform: 'LinkedIn' },
    { name: 'David L.', signal: 'Website redesign needed ASAP', time: '12m ago', platform: 'Threads' },
  ]

  return (
    <div className="absolute right-6 top-10 bottom-[180px] w-full md:w-[55%] overflow-hidden pointer-events-none flex flex-col justify-center gap-3">
      {notifications.map((notif, i) => (
        <motion.div
          key={notif.name}
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease }}
          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl flex items-center gap-3 group-hover:border-accent-mint/15 group-hover:bg-[#171A20]/80 transition-all duration-500"
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-accent-mint">{notif.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-text-primary truncate">{notif.name}</span>
              <span className="text-[9px] text-text-secondary/40 font-mono shrink-0">{notif.time}</span>
            </div>
            <p className="text-[10px] text-text-secondary/70 truncate">{notif.signal}</p>
          </div>
          <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06] text-[8px] font-bold text-text-secondary/50 uppercase tracking-widest shrink-0">
            {notif.platform}
          </div>
        </motion.div>
      ))}
      {/* Live pulse indicator */}
      <div className="flex items-center gap-2 mt-1 ml-4">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
        <span className="text-[9px] text-accent-mint/60 font-bold uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
  )
}

// ─── Card 2: Multi-Platform Sourcing — Orbiting platform network ────────────
function PlatformNetworkVisual() {
  const platforms = [
    { name: 'X', color: '#F5F7FA', x: '50%', y: '15%', size: 36, delay: 0, icon: (
      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )},
    { name: 'Li', color: '#0A66C2', x: '15%', y: '55%', size: 40, delay: 0.8, icon: (
      <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
      </svg>
    )},
    { name: 'R', color: '#FF4500', x: '80%', y: '50%', size: 34, delay: 1.2, icon: (
      <svg className="w-3.5 h-3.5 fill-current text-[#FF4500]" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.203-.094z"/>
      </svg>
    )},
    { name: 'Th', color: '#000000', x: '55%', y: '80%', size: 32, delay: 1.8, icon: (
      <span className="text-[10px] font-black text-white">@</span>
    )},
  ]

  return (
    <div className="relative h-[180px] mb-6">
      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center z-20">
        <Filter size={16} className="text-accent-cyan" />
      </div>

      {/* Connection lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 200 160">
        {[
          { x1: 100, y1: 80, x2: 100, y2: 24 },
          { x1: 100, y1: 80, x2: 30, y2: 88 },
          { x1: 100, y1: 80, x2: 160, y2: 80 },
          { x1: 100, y1: 80, x2: 110, y2: 128 },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="rgba(125,211,252,0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
          />
        ))}
      </svg>

      {/* Platform nodes */}
      {platforms.map((p) => (
        <motion.div
          key={p.name}
          className="absolute z-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-500"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          {p.icon}
        </motion.div>
      ))}

      {/* Data pulse traveling along lines */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(125,211,252,0.6)] z-30"
        animate={{
          x: [0, 30, -40, 10, 0],
          y: [0, -50, 10, 50, 0],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ left: '50%', top: '50%' }}
      />
    </div>
  )
}

// ─── Card 3: AI Outreach Writer — AI text generation ────────────────────────
function AIWriterVisual() {
  return (
    <div className="relative h-[160px] mb-6 p-4 rounded-2xl bg-black/30 border border-white/[0.04] overflow-hidden group-hover:border-accent-purple/20 transition-colors duration-500">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent-purple/10 blur-[30px] rounded-full group-hover:bg-accent-purple/25 transition-colors duration-500" />

      <div className="relative z-10 font-mono text-[11px] leading-relaxed h-full flex flex-col">
        <div className="flex items-center gap-2 text-accent-purple font-bold mb-3">
          <Sparkles size={12} className="animate-[spin_4s_linear_infinite]" /> Generating pitch...
        </div>

        <div className="relative flex-1">
          {/* Idle state */}
          <p className="opacity-40 group-hover:opacity-0 transition-opacity duration-300 absolute inset-0 text-text-secondary text-[10px]">
            Awaiting lead context...
          </p>

          {/* Reveal on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden text-text-primary text-[11px] leading-relaxed">
            <span className="text-accent-purple font-bold">Hey Sarah,</span> noticed you&apos;re scaling your Shopify store. We just helped a similar DTC brand cut CAC by 30%...
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent-purple animate-pulse align-middle" />
          </div>
        </div>

        {/* Score badges */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/20 text-[8px] font-bold text-accent-purple uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '200ms' }}>
            96% Reply
          </span>
          <span className="px-2 py-0.5 rounded bg-accent-mint/10 border border-accent-mint/20 text-[8px] font-bold text-accent-mint uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '350ms' }}>
            Spam Safe
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Card 4: Lead Intelligence (wide) — Animated HUD gauges ────────────────
function LeadIntelVisual() {
  const metrics = [
    { label: 'Intent Score', value: '94%', width: '94%', color: 'accent-mint' },
    { label: 'Budget Signal', value: 'High', width: '82%', color: 'accent-purple' },
    { label: 'Urgency Level', value: 'Critical', width: '97%', color: 'accent-pink' },
  ]

  return (
    <div className="absolute right-6 top-10 bottom-[180px] w-full md:w-[48%] overflow-hidden pointer-events-none flex flex-col justify-center gap-5">
      {/* Lead profile card */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl group-hover:border-accent-mint/15 transition-all duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent-mint">AK</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-primary">Alex K.</div>
            <div className="text-[9px] text-text-secondary/50">Founder · E-commerce · $2M ARR</div>
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-lg bg-accent-mint/10 border border-accent-mint/20 text-[8px] font-bold text-accent-mint uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Verified
          </div>
        </div>

        {/* Metric bars */}
        <div className="space-y-3">
          {metrics.map((m, i) => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-secondary/60">{m.label}</span>
                <span className="text-text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: `${i * 100}ms` }}>{m.value}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '10%' }}
                  whileInView={{ width: m.width }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.2, ease }}
                  className={`h-full bg-${m.color}/50 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI context insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1 }}
        className="p-3 rounded-xl bg-accent-mint/5 border border-accent-mint/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ transitionDelay: '300ms' }}
      >
        <div className="text-[9px] text-accent-mint font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Brain size={10} /> AI Context
        </div>
        <p className="text-[10px] text-text-secondary/70 leading-snug">
          &quot;Posted about high CAC on Twitter 2h ago. Actively seeking conversion help.&quot;
        </p>
      </motion.div>
    </div>
  )
}

// ─── Card 5: Email Integration (wide) — Email compose mockup ────────────────
function EmailComposeVisual() {
  return (
    <div className="absolute right-6 top-10 bottom-[180px] w-full md:w-[52%] overflow-hidden pointer-events-none">
      <div className="h-full rounded-2xl bg-[#171A20]/60 border border-white/[0.05] backdrop-blur-xl overflow-hidden group-hover:border-accent-orange/15 transition-all duration-500 flex flex-col">
        {/* Email header bar */}
        <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56] opacity-60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E] opacity-60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F] opacity-60" />
          </div>
          <span className="text-[10px] text-text-secondary/40 font-mono">New Message</span>
          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="px-2 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/20 text-[8px] font-bold text-accent-orange uppercase tracking-widest">
              Connected
            </span>
          </div>
        </div>

        {/* Email fields */}
        <div className="px-4 py-2 border-b border-white/[0.03]">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-text-secondary/40 font-medium w-8">To:</span>
            <span className="text-text-primary/80 group-hover:text-accent-orange transition-colors duration-500">alex.k@shopifybrand.com</span>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-white/[0.03]">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-text-secondary/40 font-medium w-8">Subj:</span>
            <span className="text-text-primary/80">Quick question about your checkout flow</span>
          </div>
        </div>

        {/* Email body */}
        <div className="flex-1 px-4 py-3 text-[10px] text-text-secondary/60 leading-relaxed">
          <div className="opacity-30 group-hover:opacity-0 transition-opacity duration-300 absolute">
            Compose your outreach...
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-text-primary/80 text-[10px] leading-relaxed">
            Hey Alex, saw your tweet about DTC acquisition costs going up. We recently designed a visual checkout flow for a similar brand that lowered cart abandonment by 18%...
            <span className="inline-block w-1 h-3 ml-0.5 bg-accent-orange animate-pulse align-middle" />
          </div>
        </div>

        {/* Send bar */}
        <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-text-secondary/30" />
            <span className="text-[9px] text-text-secondary/30 font-mono">Draft</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-accent-orange/80 text-[9px] font-bold text-[#11150C] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1.5">
            <Send size={10} /> Send
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 6: Automated Follow-Ups — Vertical timeline ───────────────────────
function FollowUpTimelineVisual() {
  const steps = [
    { day: 'Day 1', action: 'Value Hook', status: 'sent' },
    { day: 'Day 3', action: 'Case Study', status: 'sent' },
    { day: 'Day 5', action: 'Direct Ask', status: 'pending' },
    { day: 'Day 7', action: 'Final Nudge', status: 'scheduled' },
  ]

  return (
    <div className="relative h-[190px] mb-6">
      {/* Vertical connecting line */}
      <div className="absolute left-[18px] top-[12px] bottom-[12px] w-px bg-white/[0.06] overflow-hidden">
        <motion.div
          className="w-full h-1/3 bg-gradient-to-b from-transparent via-accent-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{ y: ['-100%', '300%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="space-y-3 relative z-10">
        {steps.map((step, i) => (
          <div
            key={step.day}
            className="flex items-center gap-3 pl-1 group-hover:translate-x-1 transition-transform duration-500"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className={`w-[10px] h-[10px] rounded-full border shrink-0 flex items-center justify-center transition-all duration-500 ${
              step.status === 'sent'
                ? 'border-accent-cyan bg-accent-cyan/20 group-hover:shadow-[0_0_8px_rgba(125,211,252,0.4)]'
                : step.status === 'pending'
                  ? 'border-accent-orange/40 bg-accent-orange/10'
                  : 'border-white/10 bg-white/5'
            }`}>
              {step.status === 'sent' && (
                <div className="w-1 h-1 rounded-full bg-accent-cyan" />
              )}
            </div>
            <div className="flex-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:border-accent-cyan/15 group-hover:bg-[#171A20]/80 transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{step.day}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${
                  step.status === 'sent' ? 'text-accent-cyan' : step.status === 'pending' ? 'text-accent-orange' : 'text-text-secondary/40'
                }`}>
                  {step.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card 7: Token-Based Usage — Token meter animation ──────────────────────
function TokenMeterVisual() {
  return (
    <div className="relative h-[180px] mb-6 flex flex-col items-center justify-center">
      {/* Circular meter */}
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          {/* Progress ring */}
          <motion.circle
            cx="60" cy="60" r="50" fill="none"
            stroke="url(#tokenGradient)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 50}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            whileInView={{ strokeDashoffset: 2 * Math.PI * 50 * 0.25 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease }}
          />
          <defs>
            <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9A8D4" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-text-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            750
          </motion.span>
          <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-widest">tokens</span>
        </div>
      </div>

      {/* Token breakdown pills */}
      <div className="flex items-center gap-2 mt-3">
        {[
          { label: 'Reveal', cost: '3', color: 'accent-pink' },
          { label: 'Outreach', cost: '1', color: 'accent-purple' },
        ].map((t, i) => (
          <div key={t.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ transitionDelay: `${i * 100 + 200}ms` }}
          >
            <Coins size={9} className={`text-${t.color}`} />
            <span className="text-[8px] font-bold text-text-secondary/60 uppercase tracking-widest">{t.label}: {t.cost}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card 8: Built For Freelancers (wide) — Persona cards ───────────────────
function PersonaCardsVisual() {
  const personas = [
    { role: 'Freelance Developer', icon: Code2, accent: 'accent-mint', desc: 'Ship high-value Shopify & SaaS projects' },
    { role: 'Design Agency', icon: Palette, accent: 'accent-purple', desc: 'Land brand identity & UI/UX contracts' },
    { role: 'Growth Consultant', icon: BarChart3, accent: 'accent-cyan', desc: 'Close retainer deals with warm leads' },
  ]

  return (
    <div className="absolute right-6 top-10 bottom-[180px] w-full md:w-[55%] overflow-hidden pointer-events-none flex items-center justify-center">
      <div className="flex gap-3 w-full">
        {personas.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={p.role}
              initial={{ opacity: 0, y: 20, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.15, ease }}
              className={`flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl group-hover:border-${p.accent}/20 group-hover:bg-[#171A20]/80 transition-all duration-500 flex flex-col items-center text-center`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-${p.accent}/10 border border-${p.accent}/20 flex items-center justify-center text-${p.accent} mb-3 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={18} />
              </div>
              <h5 className="text-[11px] font-bold text-text-primary tracking-tight mb-1">{p.role}</h5>
              <p className="text-[9px] text-text-secondary/50 leading-snug">{p.desc}</p>

              {/* Activity indicator */}
              <div className={`mt-3 flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border-l-2 border-${p.accent} bg-gradient-to-r from-${p.accent}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                style={{ transitionDelay: `${i * 100 + 300}ms` }}
              >
                <span className={`w-1 h-1 bg-${p.accent} animate-pulse shadow-[0_0_8px_currentColor]`} />
                <span className={`text-[7px] font-bold text-${p.accent} uppercase tracking-widest`}>Active</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function FeaturesSection() {
  return (
    <section id="features" className="py-40 px-6 max-w-[1200px] mx-auto relative overflow-hidden border-t border-white/[0.03]">
      {/* Ambient backdrop glows */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-accent-purple/[0.015] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] bg-accent-mint/[0.015] blur-[150px] rounded-full pointer-events-none" />

      {/* Headline */}
      <div className="text-center mb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border-l-2 border-accent-cyan bg-gradient-to-r from-accent-cyan/10 to-transparent text-accent-cyan text-[10px] font-bold tracking-widest uppercase mb-6">
            Product Capabilities
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="font-display text-[48px] md:text-[64px] font-semibold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto"
        >
          Everything You Need.<br />
          <span className="text-text-secondary/70">Nothing You Don&apos;t.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed"
        >
          A complete intelligence stack for finding, qualifying, and converting high-value clients — all in one platform.
        </motion.p>
      </div>

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

        {/* ── ROW 1 ── */}

        {/* CARD 1: Fresh Daily Leads (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[420px] flex flex-col justify-end"
        >
          <FreshLeadsVisual />

          <div className="relative z-10 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center text-accent-mint mb-6">
              <Zap size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Fresh Daily Leads</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              Opportunities surface in real-time from obscure forums, communities, and intent networks — the exact moment buyers ask for help.
            </p>
          </div>
        </motion.div>

        {/* CARD 2: Multi-Platform Sourcing (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          whileHover={{ y: -4 }}
          className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[480px] flex flex-col justify-end"
        >
          <PlatformNetworkVisual />

          <div>
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
              <Filter size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Multi-Platform Sourcing</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Leads sourced from Reddit, LinkedIn, Twitter/X, Threads, and more — all funneled into one unified feed.
            </p>
          </div>
        </motion.div>

        {/* ── ROW 2 ── */}

        {/* CARD 3: AI Outreach Writer (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          whileHover={{ y: -4 }}
          className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[480px] flex flex-col justify-end"
        >
          <AIWriterVisual />

          <div>
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-6">
              <Send size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">AI Outreach Writer</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Generate personalized emails and DMs centered around buyer psychology and conversion angles.
            </p>
          </div>
        </motion.div>

        {/* CARD 4: Lead Intelligence (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[420px] flex flex-col justify-end"
        >
          <LeadIntelVisual />

          <div className="relative z-10 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center text-accent-mint mb-6">
              <Brain size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Lead Intelligence</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              See urgency, context, budget signals, and buyer intent — all AI-analyzed and scored before you even make contact.
            </p>
          </div>
        </motion.div>

        {/* ── ROW 3 ── */}

        {/* CARD 5: Email Integration (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[420px] flex flex-col justify-end"
        >
          <EmailComposeVisual />

          <div className="relative z-10 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange mb-6">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Email Integration</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              Send outreach directly from the platform. No app-switching, no copy-pasting — just seamless conversations.
            </p>
          </div>
        </motion.div>

        {/* CARD 6: Automated Follow-Ups (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          whileHover={{ y: -4 }}
          className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[480px] flex flex-col justify-end"
        >
          <FollowUpTimelineVisual />

          <div>
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
              <Clock size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Automated Follow-Ups</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Stay consistent with contextual follow-ups that adjust tone automatically. Zero manual chase.
            </p>
          </div>
        </motion.div>

        {/* ── ROW 4 ── */}

        {/* CARD 7: Token-Based Usage (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          whileHover={{ y: -4 }}
          className="group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[480px] flex flex-col justify-end"
        >
          <TokenMeterVisual />

          <div>
            <div className="w-10 h-10 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center text-accent-pink mb-6">
              <Coins size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Token-Based Usage</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Spend tokens on leads, outreach, or AI generations. Pay for intelligence, not access.
            </p>
          </div>
        </motion.div>

        {/* CARD 8: Built For Freelancers & Agencies (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative p-8 md:p-10 rounded-[32px] bg-surface-secondary/20 border border-white/[0.04] hover:bg-surface-secondary/40 hover:border-white/10 transition-all duration-500 overflow-hidden min-h-[420px] flex flex-col justify-end"
        >
          <PersonaCardsVisual />

          <div className="relative z-10 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-6">
              <Target size={18} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">Built For Freelancers & Agencies</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              Whether you&apos;re a solo developer, a design studio, or a growth consultancy — the platform adapts to your acquisition workflow.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
