'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AdjustmentsHorizontalIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  BanknotesIcon,
  SparklesIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'

const ease = [0.16, 1, 0.3, 1] as const

// ─── Telemetry Chip Scatter Pattern for Collapsed Cards ────────────────────────
function TelemetryChipScatter({ index }: { index: number }) {
  const telemetryData = [
    [
      { label: 'X', val: '2m ago', active: true },
      { label: 'Li', val: '5m ago', active: true },
      { label: 'R', val: '8m ago', active: true },
      { label: 'Th', val: '12m ago', active: false },
    ],
    [
      { label: 'INTENT', val: '98%', active: true },
      { label: 'BUDGET', val: 'HIGH', active: true },
      { label: 'URGENCY', val: 'CRIT', active: true },
      { label: 'STATUS', val: 'VERIFIED', active: false },
    ],
    [
      { label: '01', val: 'REVEAL', active: true },
      { label: '02', val: 'SAVED', active: true },
      { label: '03', val: 'CONTACT', active: true },
      { label: '04', val: 'REPLIED', active: false },
    ],
    [
      { label: 'CRD', val: '500', active: true },
      { label: 'PLAN', val: 'PRO', active: true },
      { label: 'ROLL', val: '100%', active: true },
      { label: 'SEAT', val: '0 FEE', active: false },
    ],
  ]

  const items = telemetryData[index] || telemetryData[0]

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center py-4 relative select-none pointer-events-none">
      {/* Precision matrix dot grid background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <svg className="w-24 h-24" viewBox="0 0 96 96" fill="currentColor">
          <pattern id={`dotgrid-${index}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="text-white" />
          </pattern>
          <rect width="96" height="96" fill={`url(#dotgrid-${index})`} />
        </svg>
      </div>

      {/* Floating HUD chips */}
      <div className="w-full flex flex-col gap-1.5 z-10 px-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-[8.5px] font-mono group-hover:border-white/15 transition-colors"
          >
            <span className="font-bold text-white/50 group-hover:text-white/80 transition-colors">
              {item.label}
            </span>
            <span
              className={`font-semibold tracking-wider ${
                item.active ? 'text-accent-orange/80' : 'text-text-secondary/40'
              }`}
            >
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card 1 Visual: Live Multi-Platform Notifications ─────────────────────────
function FreshLeadsVisual({
  className = '',
  hoveredPlatform,
  maxItems = 3,
}: {
  className?: string
  hoveredPlatform: string | null
  maxItems?: number
}) {
  const [hoveredNotif, setHoveredNotif] = React.useState<number | null>(null)
  const notifications = [
    {
      name: 'Sarah K.',
      signal: 'Looking for Shopify dev',
      time: '2m ago',
      platform: 'Reddit',
      key: 'R',
    },
    {
      name: 'James T.',
      signal: 'Help with conversion rates',
      time: '5m ago',
      platform: 'Twitter/X',
      key: 'X',
    },
    {
      name: 'Priya M.',
      signal: 'Searching for brand designer',
      time: '8m ago',
      platform: 'LinkedIn',
      key: 'Li',
    },
    {
      name: 'David L.',
      signal: 'Website redesign ASAP',
      time: '12m ago',
      platform: 'Threads',
      key: 'Th',
    },
  ].slice(0, maxItems)

  return (
    <div className={`w-full flex flex-col justify-center gap-2 ${className}`}>
      {notifications.map((notif, i) => {
        const isPlatformHighlighted = hoveredPlatform === notif.key
        const isSelfHovered = hoveredNotif === i
        return (
          <motion.div
            key={notif.name}
            onMouseEnter={() => setHoveredNotif(i)}
            onMouseLeave={() => setHoveredNotif(null)}
            className={`p-2.5 rounded-xl bg-surface border transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
              isSelfHovered
                ? 'border-border-subtle bg-surface-secondary shadow-[0_8px_20px_rgba(0,0,0,0.5)] -translate-y-0.5'
                : isPlatformHighlighted
                  ? 'border-accent-orange/40 bg-surface shadow-[0_4px_16px_rgba(244,141,22,0.15)] scale-102'
                  : 'border-white/[0.05]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center shrink-0">
              <span className="text-[9.5px] font-bold text-accent-purple">
                {notif.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10.5px] font-bold text-text-primary truncate">
                  {notif.name}
                </span>
                <span className="text-[8.5px] text-text-secondary/40 font-mono shrink-0">
                  {notif.time}
                </span>
              </div>
              <p className="text-[9.5px] text-text-secondary/70 truncate">{notif.signal}</p>
            </div>
            <div
              className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider shrink-0 transition-colors duration-300 ${
                isPlatformHighlighted
                  ? 'bg-accent-orange text-text-on-accent'
                  : 'bg-white/5 border border-white/[0.06] text-text-secondary/60'
              }`}
            >
              {notif.platform}
            </div>

            {/* Slide-in qualify indicator on hover */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: isSelfHovered ? 0 : '100%' }}
              transition={{ duration: 0.2, ease }}
              className="absolute inset-y-0 right-0 w-[68px] bg-accent-orange flex items-center justify-center cursor-pointer font-bold text-[8px] text-text-on-accent uppercase tracking-wider"
            >
              Qualify →
            </motion.div>
          </motion.div>
        )
      })}
      <div className="flex items-center gap-1.5 mt-0.5 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
        <span className="text-[8.5px] text-accent-orange/80 font-bold uppercase tracking-widest font-mono">
          Live Signal Feed
        </span>
      </div>
    </div>
  )
}

// ─── Platform Radar Visual ───────────────────────────────────────────────────
function PlatformNetworkVisual({
  className = '',
  hoveredPlatform,
  onHoverPlatform,
}: {
  className?: string
  hoveredPlatform: string | null
  onHoverPlatform: (p: string | null) => void
}) {
  const platforms = [
    {
      name: 'X',
      x: '50%',
      y: '16%',
      size: 32,
      delay: 0,
      tooltip: 'Twitter/X feed active',
      icon: (
        <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Li',
      x: '16%',
      y: '56%',
      size: 34,
      delay: 0.8,
      tooltip: 'LinkedIn intent stream',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
        </svg>
      ),
    },
    {
      name: 'R',
      x: '84%',
      y: '52%',
      size: 32,
      delay: 1.2,
      tooltip: 'Reddit hiring threads',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-[#FF4500]" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.203-.094z" />
        </svg>
      ),
    },
    {
      name: 'Th',
      x: '54%',
      y: '82%',
      size: 30,
      delay: 1.8,
      tooltip: 'Threads query parser',
      icon: <span className="text-[10px] font-black text-white">@</span>,
    },
  ]

  return (
    <div className={`relative aspect-[190/160] w-full max-w-[190px] mx-auto ${className}`}>
      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-accent-orange/10 border border-accent-orange/25 flex items-center justify-center z-20 shadow-md">
        <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 text-accent-orange" />
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 190 160">
        {[
          { x1: 95, y1: 80, x2: 95, y2: 25 },
          { x1: 95, y1: 80, x2: 30, y2: 90 },
          { x1: 95, y1: 80, x2: 160, y2: 83 },
          { x1: 95, y1: 80, x2: 103, y2: 131 },
        ].map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ))}
      </svg>

      {/* Platform nodes */}
      {platforms.map((p) => {
        const isHovered = hoveredPlatform === p.name
        return (
          <div
            key={p.name}
            onMouseEnter={() => onHoverPlatform(p.name)}
            onMouseLeave={() => onHoverPlatform(null)}
            className="absolute z-20 cursor-pointer"
            style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? 'border-accent-orange bg-surface-secondary scale-110 shadow-[0_0_15px_rgba(244,141,22,0.3)]'
                  : 'bg-surface border border-white/10 hover:border-white/25'
              }`}
              style={{ width: p.size, height: p.size }}
            >
              {p.icon}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute bottom-[115%] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-surface border border-border-subtle text-[7.5px] text-text-primary font-bold tracking-wide uppercase whitespace-nowrap z-30 shadow-lg pointer-events-none"
                >
                  {p.tooltip}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ─── Card 2 Visual: Lead Intel Dossier & Revealed Contacts ────────────────────
function LeadIntelVisual({
  className = '',
  emailStatus,
}: {
  className?: string
  emailStatus: 'idle' | 'sending' | 'sent'
}) {
  const metrics = [
    {
      label: 'Intent Score',
      value: emailStatus === 'sent' ? '98%' : '94%',
      width: emailStatus === 'sent' ? '98%' : '94%',
      color: 'bg-accent-orange',
    },
    {
      label: 'Budget Signal',
      value: 'High',
      width: '85%',
      color: 'bg-accent-orange/80',
    },
    {
      label: 'Urgency Level',
      value: emailStatus === 'sent' ? 'Handled' : 'Critical',
      width: emailStatus === 'sent' ? '100%' : '92%',
      color: 'bg-accent-orange/70',
    },
  ]

  return (
    <div className={`w-full flex flex-col justify-center gap-2.5 ${className}`}>
      {/* Lead profile box */}
      <div className="p-3 rounded-xl bg-surface border border-white/[0.06] shadow-md">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center shrink-0">
            <span className="text-[9.5px] font-bold text-accent-orange">AK</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-bold text-text-primary truncate">Alex K.</span>
              <span className="px-1.5 py-0.2 rounded bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-[7.5px] font-bold tracking-wider uppercase">
                15 Signals
              </span>
            </div>
            <p className="text-[8.5px] text-text-secondary/60 truncate">Founder @ Direct Commerce Co.</p>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider ${
              emailStatus === 'sent'
                ? 'bg-accent-orange text-text-on-accent'
                : 'bg-white/5 border border-white/[0.06] text-text-secondary/60'
            }`}
          >
            {emailStatus === 'sent' ? 'Saved' : 'Verified'}
          </span>
        </div>

        {/* Metric bars */}
        <div className="space-y-1.5">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-0.5">
              <div className="flex justify-between text-[8.5px]">
                <span className="text-text-secondary/60">{m.label}</span>
                <span className="text-text-primary font-mono font-semibold">{m.value}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: m.width }}
                  transition={{ duration: 0.8, ease }}
                  className={`h-full ${m.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Context snippet */}
      <div className="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-subtle">
        <div className="text-[8px] text-accent-orange font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
          <GlobeAltIcon className="w-2.5 h-2.5" /> Context Analysis
        </div>
        <p className="text-[9px] text-text-secondary/75 leading-tight">
          {emailStatus === 'sent'
            ? 'Verified email and direct phone revealed. Pinned to your active pipeline.'
            : 'Posted about high checkout drop-offs 2h ago. Actively vetting conversion specialists.'}
        </p>
      </div>
    </div>
  )
}

function EmailComposeVisual({
  className = '',
  emailStatus,
  onSend,
}: {
  className?: string
  emailStatus: 'idle' | 'sending' | 'sent'
  onSend: () => void
}) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        className={`w-full rounded-xl bg-surface border transition-all duration-300 flex flex-col justify-between p-3 min-h-[190px] ${
          emailStatus === 'sent'
            ? 'border-accent-orange/40 shadow-[0_8px_24px_rgba(244,141,22,0.1)]'
            : 'border-white/[0.06]'
        }`}
      >
        <div>
          {/* Card header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
              <span className="text-[8.5px] text-text-secondary/50 font-mono ml-1">
                Contact Dossier
              </span>
            </div>
            <span className="text-[8px] font-bold text-accent-orange uppercase tracking-wider">
              Unlocked
            </span>
          </div>

          {/* Contact rows */}
          <div className="space-y-1 text-[9px] font-mono mb-2.5">
            <div className="flex items-center gap-1.5 p-1 rounded bg-white/[0.02] border border-white/[0.03]">
              <span className="text-text-secondary/50">Email:</span>
              <span className="text-text-primary font-medium truncate">alex.k@shopifybrand.com</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-white/[0.02] border border-white/[0.03]">
              <span className="text-text-secondary/50">Phone:</span>
              <span className="text-text-primary font-medium truncate">+1 (555) 012-3456</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[8px] text-text-secondary/40 font-mono">
            {emailStatus === 'sending' ? 'Saving...' : emailStatus === 'sent' ? 'In Pipeline' : 'Ready to save'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSend()
            }}
            disabled={emailStatus !== 'idle'}
            className={`px-3 py-1 rounded-lg text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
              emailStatus === 'sending'
                ? 'bg-white/10 text-white/50 cursor-wait'
                : emailStatus === 'sent'
                  ? 'bg-accent-orange text-text-on-accent cursor-default shadow-sm'
                  : 'bg-accent-orange hover:bg-accent-orange/90 text-text-on-accent cursor-pointer hover:scale-102 shadow-sm'
            }`}
          >
            {emailStatus === 'sending' ? (
              <span className="w-2.5 h-2.5 rounded-full border border-t-transparent border-white animate-spin" />
            ) : emailStatus === 'sent' ? (
              <>
                <CheckIcon className="w-2.5 h-2.5" /> Saved
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-2.5 h-2.5" /> Save to Pipeline
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card 3 Visual: Pipeline Touchpoint Timeline & Context ─────────────────────
function FollowUpTimelineVisual({
  className = '',
  selectedStep,
  onSelectStep,
}: {
  className?: string
  selectedStep: number
  onSelectStep: (idx: number) => void
}) {
  const steps = [
    { day: '01', stage: 'Revealed', action: 'Contact Unlocked', status: 'done' },
    { day: '02', stage: 'Saved', action: 'Added to Pipeline', status: 'done' },
    { day: '03', stage: 'Contacted', action: 'Direct Touchpoint', status: 'active' },
    { day: '04', stage: 'Replied', action: 'Conversation Open', status: 'pending' },
  ]

  return (
    <div className={`w-full flex flex-col justify-center ${className}`}>
      <div className="space-y-2 relative">
        {/* Connecting spine */}
        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-white/[0.08]" />

        {steps.map((step, i) => {
          const isSelected = selectedStep === i
          return (
            <div
              key={step.day}
              onClick={(e) => {
                e.stopPropagation()
                onSelectStep(i)
              }}
              className="flex items-center gap-2.5 cursor-pointer relative z-10 group"
            >
              <div
                className={`w-7 h-7 rounded-full border shrink-0 flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-orange bg-surface-secondary text-accent-orange scale-105 shadow-[0_0_12px_rgba(244,141,22,0.3)]'
                    : step.status === 'done'
                      ? 'border-white/20 bg-surface text-white/70 group-hover:border-white/40'
                      : 'border-white/10 bg-surface/50 text-white/30'
                }`}
              >
                {step.day}
              </div>

              <div
                className={`flex-1 px-3 py-2 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isSelected
                    ? 'border-accent-orange/40 bg-surface-secondary shadow-md'
                    : 'border-white/[0.05] bg-surface hover:bg-surface-secondary/80 hover:border-white/10'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-text-primary block leading-none mb-0.5">
                    {step.stage}
                  </span>
                  <span className="text-[8px] text-text-secondary/60 leading-none">
                    {step.action}
                  </span>
                </div>
                <span
                  className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'text-accent-orange'
                      : step.status === 'done'
                        ? 'text-emerald-400/80'
                        : 'text-text-secondary/40'
                  }`}
                >
                  {isSelected ? 'Active' : step.status === 'done' ? 'Logged' : 'Next'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StageDetailsPanel({ selectedStep }: { selectedStep: number }) {
  const details = [
    {
      badge: 'Step 01',
      title: 'Intercept & Unlock',
      metric: '100% Unlocked',
      desc: 'Buyer intent query intercepted live from Reddit/X. Direct contact details and social handle verified without manual digging.',
    },
    {
      badge: 'Step 02',
      title: 'Organize Pipeline',
      metric: 'Folder: High Intent',
      desc: 'Lead pinned into your active outreach sprint. Intent tags, budget cues, and company size saved for zero context loss.',
    },
    {
      badge: 'Step 03',
      title: 'Contextual First Touch',
      metric: 'Response in < 2h',
      desc: 'Reach out directly referencing their exact problem statement while their intent is at peak urgency.',
    },
    {
      badge: 'Step 04',
      title: 'Conversation & Close',
      metric: 'Active Deal',
      desc: 'Prospect responds favorably to your personalized hook. Deal moves immediately to active client negotiation.',
    },
  ]

  const current = details[selectedStep] || details[0]

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 rounded-xl bg-surface border border-white/[0.06]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-1.5 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/20 text-[7.5px] font-bold text-accent-orange uppercase tracking-wider">
            {current.badge}
          </span>
          <span className="text-[8.5px] font-mono text-emerald-400 font-bold">
            {current.metric}
          </span>
        </div>
        <h5 className="text-[11px] font-bold text-text-primary mb-1.5">
          {current.title}
        </h5>
        <p className="text-[9.5px] text-text-secondary/80 leading-relaxed">
          {current.desc}
        </p>
      </div>

      <div className="pt-2 border-t border-white/[0.04] flex items-center gap-1.5 text-[8px] text-text-secondary/50 font-mono">
        <SparklesIcon className="w-2.5 h-2.5 text-accent-orange" />
        <span>Click any stage step to inspect workflow</span>
      </div>
    </div>
  )
}

// ─── Card 4 Visual: Credit Token Meter & Persona Scaling ───────────────────────
function TokenMeterVisual({
  className = '',
  selectedPersona,
}: {
  className?: string
  selectedPersona: string | null
}) {
  const getValues = () => {
    switch (selectedPersona) {
      case 'free':
        return { count: 50, offset: 0.15, label: 'Reveal: 3', label2: 'Email: 2' }
      case 'agency':
        return { count: 1000, offset: 0.02, label: 'Reveal: 3', label2: 'Email: 2' }
      case 'freelancer':
      default:
        return { count: 500, offset: 0.05, label: 'Reveal: 3', label2: 'Email: 2' }
    }
  }

  const current = getValues()

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Circular meter */}
      <div className="relative w-[100px] h-[100px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="6"
          />
          <motion.circle
            key={selectedPersona || 'default'}
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#F48D16"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 48}
            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 48 * current.offset }}
            transition={{ duration: 0.8, ease }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={current.count}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-bold text-text-primary font-mono"
          >
            {current.count}
          </motion.span>
          <span className="text-[7.5px] text-text-secondary/50 font-bold uppercase tracking-widest">
            credits
          </span>
        </div>
      </div>

      {/* Credit breakdown pills */}
      <div className="flex items-center gap-1.5 mt-2.5">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
          <BanknotesIcon className="w-2.5 h-2.5 text-accent-orange" />
          <span className="text-[7.5px] font-mono font-bold text-text-secondary/70 uppercase">
            {current.label}
          </span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
          <BanknotesIcon className="w-2.5 h-2.5 text-accent-orange" />
          <span className="text-[7.5px] font-mono font-bold text-text-secondary/70 uppercase">
            {current.label2}
          </span>
        </div>
      </div>
    </div>
  )
}

function PersonaCardsVisual({
  className = '',
  selectedPersona,
  onSelectPersona,
}: {
  className?: string
  selectedPersona: string | null
  onSelectPersona: (p: string | null) => void
}) {
  const personas = [
    {
      id: 'free',
      role: 'Starter',
      icon: CodeBracketIcon,
      desc: '50 credits',
      sub: 'Try free',
    },
    {
      id: 'freelancer',
      role: 'Freelancer',
      icon: PaintBrushIcon,
      desc: '500 credits',
      sub: 'Solo growth',
    },
    {
      id: 'agency',
      role: 'Agency',
      icon: ChartBarIcon,
      desc: '1,000 credits',
      sub: 'Scale team',
    },
  ]

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div className="grid grid-cols-3 gap-2 w-full">
        {personas.map((p) => {
          const Icon = p.icon
          const isSelected = selectedPersona === p.id
          return (
            <motion.div
              key={p.role}
              onMouseEnter={() => onSelectPersona(p.id)}
              onClick={() => onSelectPersona(p.id)}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                isSelected
                  ? 'border-accent-orange/40 bg-surface-secondary shadow-md scale-102'
                  : 'bg-surface border-white/[0.05] hover:border-white/15'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected ? 'bg-accent-orange/20 text-accent-orange' : 'bg-white/5 text-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <h6 className="text-[9.5px] font-bold text-text-primary tracking-tight mb-0.5">
                {p.role}
              </h6>
              <p className="text-[8px] text-text-secondary/60 leading-tight mb-1 font-mono">
                {p.desc}
              </p>
              <span
                className={`text-[7px] font-bold uppercase tracking-wider mt-auto ${
                  isSelected ? 'text-accent-orange' : 'text-text-secondary/40'
                }`}
              >
                {isSelected ? 'Selected' : p.sub}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exported AI text helper (retained for backward compatibility) ────────────
export function AIWriterVisual({
  className = '',
  selectedStep,
}: {
  className?: string
  selectedStep: number
}) {
  const copies = [
    {
      title: 'Day 1: Personal Value Hook',
      text: "Hey Sarah, noticed you're scaling your Shopify store...",
      rate: '96% Reply',
      badge: 'Spam Safe',
    },
    {
      title: 'Day 3: Case Study & Proof',
      text: 'Hi Sarah, just wanted to share a quick metric...',
      rate: '89% Reply',
      badge: 'Social Proof',
    },
  ]
  const current = copies[selectedStep] || copies[0]
  return (
    <div className={`p-4 rounded-xl bg-surface border border-white/[0.04] ${className}`}>
      <div className="text-[10px] text-accent-orange font-bold mb-1">{current.title}</div>
      <p className="text-[10px] text-text-secondary">{current.text}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN CAPABILITIES SECTION ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function FeaturesSection() {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0)
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [selectedStep, setSelectedStep] = useState<number>(0)
  const [selectedPersona, setSelectedPersona] = useState<string | null>('freelancer')

  const handleSendEmail = () => {
    if (emailStatus !== 'idle') return
    setEmailStatus('sending')
    setTimeout(() => {
      setEmailStatus('sent')
    }, 1200)
  }

  const cards = [
    {
      id: 'interception',
      indexStr: '01.',
      shortLabel: 'Real-time leads',
      tag: 'Real-time interception',
      title: 'Fresh Daily Leads from Multiple Platforms',
      description:
        'Opportunities surface in real-time from obscure forums, social networks, and intent sites. Monitor high-intent queries across LinkedIn, Reddit, Twitter/X, and Threads the exact second buyers ask for help.',
    },
    {
      id: 'intelligence',
      indexStr: '02.',
      shortLabel: 'Deep intelligence',
      tag: 'Deep intelligence',
      title: 'Lead Intelligence & Verified Contacts',
      description:
        'Analyze and enrich prospect profiles instantly to understand who you are speaking to. See urgency levels, budget cues, and comprehensive buyer context with verified contact details ready to save.',
    },
    {
      id: 'momentum',
      indexStr: '03.',
      shortLabel: 'Pipeline tracking',
      tag: 'Pipeline momentum',
      title: 'Track Every Touch',
      description:
        'Keep your pipeline moving by logging every touchpoint. Move leads smoothly through stages from Revealed to Contacted and Replied so zero high-value opportunities slip through the cracks.',
    },
    {
      id: 'economics',
      indexStr: '04.',
      shortLabel: 'Credit economics',
      tag: 'Credit economics',
      title: 'Credits Based, Not Seat Based',
      description:
        'Pay only for the specific actions you perform. Solo builders, growth consultancies, and digital agencies scale usage smoothly without complex monthly seat commitments or locked tiers.',
    },
  ]

  return (
    <section
      id="features"
      className="py-20 md:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto relative overflow-hidden border-t border-white/[0.03]"
    >
      {/* ═══ ASYMMETRIC HEADER (Parley inspired) ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl"
        >
          <span className="text-sm font-semibold text-accent-orange mb-3 block">
            Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-tight text-white leading-[1.15]">
            Engineered for speed,
            <br />
            <span className="text-text-secondary/70">built for conversion.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="max-w-md"
        >
          <p className="text-sm md:text-base text-text-secondary font-light leading-relaxed">
            A complete, unified acquisition stack designed to qualify, analyze, and convert
            high-value clients effortlessly across multi-platform networks.
          </p>
        </motion.div>
      </div>

      {/* ═══ DESKTOP 4-CARD EXPANDABLE ACCORDION DECK (hidden < md) ═══ */}
      <div className="hidden md:flex flex-row gap-3.5 items-stretch min-h-[500px] h-[510px] w-full relative z-10">
        {cards.map((card, i) => {
          const isActive = activeCardIndex === i

          return (
            <motion.div
              key={card.id}
              layout
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onMouseEnter={() => setActiveCardIndex(i)}
              onClick={() => setActiveCardIndex(i)}
              className={`relative overflow-hidden transition-all duration-300 ${
                isActive
                  ? 'flex-[2.6] bg-surface-elevated border border-white/12 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] rounded-[22px] p-5 lg:p-6 flex flex-col justify-between cursor-default'
                  : 'flex-1 bg-surface/40 hover:bg-surface/75 border border-white/[0.06] hover:border-white/15 rounded-[20px] p-4 lg:p-5 flex flex-col justify-between cursor-pointer group'
              }`}
            >
              {isActive ? (
                /* ── Expanded Active Card ── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col justify-between"
                >
                  {/* Micro-UI Preview Panel */}
                  <div className="h-[270px] w-full rounded-xl bg-surface/50 border border-white/[0.04] p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {i === 0 && (
                      <div className="grid grid-cols-12 gap-4 items-center w-full h-full">
                        <div className="col-span-5 flex justify-center items-center">
                          <PlatformNetworkVisual
                            hoveredPlatform={hoveredPlatform}
                            onHoverPlatform={setHoveredPlatform}
                          />
                        </div>
                        <div className="col-span-7 flex flex-col justify-center">
                          <FreshLeadsVisual
                            hoveredPlatform={hoveredPlatform}
                            maxItems={3}
                          />
                        </div>
                      </div>
                    )}

                    {i === 1 && (
                      <div className="grid grid-cols-12 gap-4 items-center w-full h-full">
                        <div className="col-span-6 flex flex-col justify-center">
                          <LeadIntelVisual emailStatus={emailStatus} />
                        </div>
                        <div className="col-span-6 flex flex-col justify-center">
                          <EmailComposeVisual
                            emailStatus={emailStatus}
                            onSend={handleSendEmail}
                          />
                        </div>
                      </div>
                    )}

                    {i === 2 && (
                      <div className="grid grid-cols-12 gap-4 items-center w-full h-full">
                        <div className="col-span-6 flex flex-col justify-center">
                          <FollowUpTimelineVisual
                            selectedStep={selectedStep}
                            onSelectStep={setSelectedStep}
                          />
                        </div>
                        <div className="col-span-6 flex flex-col justify-center h-full">
                          <StageDetailsPanel selectedStep={selectedStep} />
                        </div>
                      </div>
                    )}

                    {i === 3 && (
                      <div className="grid grid-cols-12 gap-4 items-center w-full h-full">
                        <div className="col-span-5 flex justify-center items-center">
                          <TokenMeterVisual selectedPersona={selectedPersona} />
                        </div>
                        <div className="col-span-7 flex flex-col justify-center">
                          <PersonaCardsVisual
                            selectedPersona={selectedPersona}
                            onSelectPersona={setSelectedPersona}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Narrative Details Block */}
                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
                      <span className="text-[10px] font-bold text-accent-orange uppercase tracking-wider font-mono">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-xl lg:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-text-secondary text-xs lg:text-sm leading-relaxed font-light line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* ── Collapsed Inactive Card ── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="h-full flex flex-col justify-between items-start select-none"
                >
                  {/* Top Index Number */}
                  <span className="text-2xl lg:text-3xl font-display font-medium text-white/20 group-hover:text-white/40 transition-colors font-mono">
                    {card.indexStr}
                  </span>

                  {/* Center Telemetry Constellation */}
                  <TelemetryChipScatter index={i} />

                  {/* Bottom Title Label & Action Hint */}
                  <div className="w-full flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <span className="text-xs font-semibold text-text-secondary/70 group-hover:text-text-primary transition-colors tracking-tight truncate">
                      {card.shortLabel}
                    </span>
                    <ArrowRightIcon className="w-3 h-3 text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -translate-x-1 group-hover:translate-x-0 duration-200" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ═══ MOBILE TOUCH-FRIENDLY CONTROLS (< md) ═══ */}
      <div className="md:hidden flex flex-col gap-4 relative z-10">
        {/* Horizontal Segmented Pill Selector */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-surface/80 border border-white/[0.06]">
          {cards.map((card, i) => {
            const isActive = activeCardIndex === i
            return (
              <button
                key={card.id}
                onClick={() => setActiveCardIndex(i)}
                className={`py-2 px-1 rounded-xl text-center transition-all duration-200 flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'bg-surface-elevated text-accent-orange border border-white/10 shadow-sm'
                    : 'text-text-secondary/60 hover:text-text-primary'
                }`}
              >
                <span className="text-[10px] font-mono font-bold">{card.indexStr}</span>
                <span className="text-[8.5px] font-medium truncate max-w-full">
                  {card.shortLabel.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile Active Card Panel */}
        <motion.div
          key={activeCardIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="bg-surface-elevated border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl"
        >
          {/* Micro-UI container */}
          <div className="min-h-[250px] w-full rounded-xl bg-surface/50 border border-white/[0.04] p-3 flex items-center justify-center relative overflow-hidden">
            {activeCardIndex === 0 && (
              <div className="flex flex-col gap-3 w-full">
                <PlatformNetworkVisual
                  hoveredPlatform={hoveredPlatform}
                  onHoverPlatform={setHoveredPlatform}
                />
                <FreshLeadsVisual
                  hoveredPlatform={hoveredPlatform}
                  maxItems={2}
                />
              </div>
            )}

            {activeCardIndex === 1 && (
              <div className="flex flex-col gap-3 w-full">
                <LeadIntelVisual emailStatus={emailStatus} />
                <EmailComposeVisual
                  emailStatus={emailStatus}
                  onSend={handleSendEmail}
                />
              </div>
            )}

            {activeCardIndex === 2 && (
              <div className="flex flex-col gap-3 w-full">
                <FollowUpTimelineVisual
                  selectedStep={selectedStep}
                  onSelectStep={setSelectedStep}
                />
                <StageDetailsPanel selectedStep={selectedStep} />
              </div>
            )}

            {activeCardIndex === 3 && (
              <div className="flex flex-col gap-3 w-full items-center">
                <TokenMeterVisual selectedPersona={selectedPersona} />
                <PersonaCardsVisual
                  selectedPersona={selectedPersona}
                  onSelectPersona={setSelectedPersona}
                />
              </div>
            )}
          </div>

          {/* Text narrative */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
              <span className="text-[9.5px] font-bold text-accent-orange uppercase tracking-wider font-mono">
                {cards[activeCardIndex].tag}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-white mb-1.5 leading-snug">
              {cards[activeCardIndex].title}
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed font-light">
              {cards[activeCardIndex].description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
