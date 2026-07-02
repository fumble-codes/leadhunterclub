'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChartBarSquareIcon, LockClosedIcon, BanknotesIcon, BookmarkIcon } from '@heroicons/react/24/solid'

import { AppLead } from '@/types/lead'

// ─── Color System ────────────────────────────────────────────────────────────
//
// The palette has exactly two real accent colors:
//   • Crimson (accent-mint / accent-orange / accent-pink) → used for HIGH URGENCY
//   • Cyan    (accent-purple / accent-cyan)               → used for LOW-MED URGENCY
//
// Rule: Card accent color is derived from `lead.urgency`, NOT from an arbitrary
// field on the data. This gives every color a clear semantic meaning at a glance.
//
//   critical → crimson (high alert, act now)
//   high     → crimson (strong signal, move fast)
//   medium   → cyan    (opportunity, worth exploring)
//   low      → cyan    (on the radar, not urgent)
//
// nicheTags (descriptive labels like "React", "Shopify") are always styled in a
// neutral muted white — they are informational, not semantic.
//
// niches (service category pills like "Web Dev") are always styled in cyan at
// low opacity — they represent the category layer consistently across all cards.
// ─────────────────────────────────────────────────────────────────────────────

type UrgencyTheme = {
  textAccent: string
  dotColor: string
  glow: string
  selected: string
  tagBg: string
  bookmarkActive: string
  topLine: string
}

const urgencyTheme: Record<AppLead['urgency'], UrgencyTheme> = {
  critical: {
    textAccent: 'text-accent-mint',
    dotColor: 'bg-accent-mint',
    glow: 'hover:shadow-[0_8px_30px_rgba(255,51,102,0.10)] hover:border-accent-mint/25',
    selected: 'ring-1 ring-accent-mint shadow-[0_8px_30px_rgba(255,51,102,0.18)] bg-accent-mint/[0.03]',
    tagBg: 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
    bookmarkActive: 'bg-accent-mint/15 border-accent-mint/30 text-accent-mint',
    topLine: 'from-transparent via-accent-mint to-transparent',
  },
  high: {
    textAccent: 'text-accent-mint',
    dotColor: 'bg-accent-mint',
    glow: 'hover:shadow-[0_8px_30px_rgba(255,51,102,0.07)] hover:border-accent-mint/20',
    selected: 'ring-1 ring-accent-mint shadow-[0_8px_30px_rgba(255,51,102,0.12)] bg-accent-mint/[0.02]',
    tagBg: 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
    bookmarkActive: 'bg-accent-mint/15 border-accent-mint/30 text-accent-mint',
    topLine: 'from-transparent via-accent-mint to-transparent',
  },
  medium: {
    textAccent: 'text-accent-purple',
    dotColor: 'bg-accent-purple',
    glow: 'hover:shadow-[0_8px_30px_rgba(0,242,254,0.07)] hover:border-accent-purple/20',
    selected: 'ring-1 ring-accent-purple shadow-[0_8px_30px_rgba(0,242,254,0.12)] bg-accent-purple/[0.02]',
    tagBg: 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
    bookmarkActive: 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple',
    topLine: 'from-transparent via-accent-purple to-transparent',
  },
  low: {
    textAccent: 'text-accent-purple',
    dotColor: 'bg-accent-purple',
    glow: 'hover:shadow-[0_8px_30px_rgba(0,242,254,0.05)] hover:border-accent-purple/15',
    selected: 'ring-1 ring-accent-purple shadow-[0_8px_30px_rgba(0,242,254,0.08)] bg-accent-purple/[0.02]',
    tagBg: 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
    bookmarkActive: 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple',
    topLine: 'from-transparent via-accent-purple to-transparent',
  },
}

const urgencyLabel: Record<AppLead['urgency'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export default function LeadCard({
  lead,
  isSelected,
  onClick,
  onSaveToggle,
}: {
  lead: AppLead
  isSelected?: boolean
  onClick?: () => void
  onSaveToggle?: (isSaved: boolean) => void
}) {
  const theme = urgencyTheme[lead.urgency]
  const [isSaved, setIsSaved] = useState(lead.status === 'saved')

  useEffect(() => {
    setIsSaved(lead.status === 'saved')
  }, [lead.status])

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = !isSaved
    setIsSaved(newState)
    lead.status = newState ? 'saved' : 'new'
    if (onSaveToggle) {
      onSaveToggle(newState)
    }
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative text-left flex flex-col p-6 rounded-2xl overflow-hidden h-full col-span-1 shadow-md border transition-all duration-300 ${
        isSelected
          ? `${theme.selected} border-transparent`
          : `bg-surface-elevated border-border-subtle hover:border-white/10 ${theme.glow}`
      }`}
    >
      {/* Top edge highlight — color signals urgency */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] opacity-25 transition-opacity bg-gradient-to-r ${theme.topLine} ${
          isSelected ? 'opacity-60' : 'group-hover:opacity-60'
        }`}
      />

      {/* Header: Source dot + Urgency badge + Bookmark */}
      <div className="flex items-center justify-between mb-5 w-full shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* Color dot — urgency color gives instant at-a-glance signal */}
          <div className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
          <span className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">
            {lead.source}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Urgency label — same color as dot, fully intentional */}
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${theme.textAccent}`}>
            <ChartBarSquareIcon className="w-[13px] h-[13px]" />
            {urgencyLabel[lead.urgency]}
          </div>
          {/* Bookmark — neutral until saved, then matches urgency accent */}
          <div
            onClick={handleSave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSave(e as unknown as React.MouseEvent)
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isSaved
                ? theme.bookmarkActive
                : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white hover:border-border-subtle'
            }`}
          >
            <BookmarkIcon className={`w-[14px] h-[14px] ${isSaved ? 'text-current' : 'text-text-secondary/30'}`} />
          </div>
        </div>
      </div>

      {/* Category label — neutral, purely informational */}
      <h4 className="text-[11px] font-semibold tracking-[0.18em] text-text-secondary/60 uppercase mb-3 shrink-0">
        {lead.category}
      </h4>

      {/* Signal quote — primary content */}
      <h3 className="text-[17px] font-normal tracking-tight leading-[1.55] text-text-primary mb-6 flex-grow">
        &quot;{lead.signalContext}&quot;
      </h3>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mb-2 shrink-0">

        {/* Service niche pills — neutral default, subtle color on hover */}
        {lead.niches && lead.niches.map((niche) => (
          <span
            key={niche}
            className="px-2.5 py-1 text-[10px] font-semibold tracking-wide rounded-md border bg-white/[0.04] text-text-secondary/70 border-white/[0.06] hover:bg-accent-purple/10 hover:text-accent-purple hover:border-accent-purple/20 transition-all duration-200 cursor-default"
          >
            {niche}
          </span>
        ))}

        {/* Descriptive tags — neutral default, faint accent on hover */}
        {lead.nicheTags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-[10px] font-medium rounded-md border bg-white/[0.03] text-text-secondary/50 border-white/[0.05] hover:bg-white/[0.07] hover:text-text-secondary hover:border-white/10 transition-all duration-200 cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="w-full pt-5 flex items-center justify-between shrink-0 border-t border-border-subtle mt-auto gap-3">

        {/* Locked identity or Revealed identity */}
        <div className="flex items-center gap-3 select-none min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 overflow-hidden shrink-0">
            {lead.isRevealed ? (
              <span className="text-[11px] font-bold text-text-primary uppercase">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </span>
            ) : (
              <LockClosedIcon className="w-[14px] h-[14px] text-text-secondary" />
            )}
          </div>
          <div className="flex flex-col gap-1.5 pointer-events-none min-w-0">
            {lead.isRevealed ? (
              <>
                <div className="text-sm font-bold text-text-primary truncate">{lead.name}</div>
                <div className="text-[10px] text-text-secondary truncate">
                  {lead.email} {lead.phone && <span className="ml-1 opacity-70">• {lead.phone}</span>}
                </div>
              </>
            ) : (
              <>
                <div className="h-2 w-24 rounded-[4px] bg-white/10 blur-[1px]" />
                <div className="h-2 w-32 rounded-[4px] bg-white/5 blur-[1px]" />
              </>
            )}
          </div>
        </div>

        {/* Reveal / View CTA */}
        <div
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[12px] transition-all ${
            isSelected
              ? 'bg-white/10 text-white border border-border-subtle'
              : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-border-subtle text-text-primary/90'
          }`}
        >
          {lead.isRevealed ? 'View Details' : 'Reveal'}
          {!lead.isRevealed && (
            <span className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-widest ml-1">
              <BanknotesIcon className="w-3 h-3" /> -{lead.hasPhone ? '5' : '3'}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
