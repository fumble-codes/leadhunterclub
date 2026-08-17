'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  LockClosedIcon,
  BanknotesIcon,
} from '@heroicons/react/24/solid'
import {
  PaperClipIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/Toast'
import { AppLead } from '@/types/lead'
import { getFirebaseToken } from '@/lib/firebase'

type BannerConfig = {
  bg: string
  text: string
  label: string
}

const bannerTheme: Record<AppLead['urgency'], BannerConfig> = {
  critical: {
    bg: 'bg-[#c53030]', // red
    text: 'text-white',
    label: 'EMERGENCY',
  },
  high: {
    bg: 'bg-[#c53030]', // red
    text: 'text-white',
    label: 'EMERGENCY',
  },
  medium: {
    bg: 'bg-[#dd6b20]', // orange
    text: 'text-white',
    label: 'MODERATE PRIORITY',
  },
  low: {
    bg: 'bg-[#38a169]', // green
    text: 'text-white',
    label: 'LOW PRIORITY',
  },
}

const AGENTS = {
  AR: { initials: 'AR', name: 'AI Researcher Agent' },
  LA: { initials: 'LA', name: 'Lead Analyzer Agent' },
  CS: { initials: 'CS', name: 'Contact Scraper Agent' },
}

function getAgentsForLead(lead: AppLead) {
  const list = [AGENTS.AR, AGENTS.LA]
  if (lead.isRevealed) {
    list.push(AGENTS.CS)
  }
  return list
}

export default function PipelineLeadCard({
  lead,
  isSelected,
  onClick,
  onSaveToggle,
  onReveal,
}: {
  lead: AppLead
  isSelected?: boolean
  onClick?: () => void
  onSaveToggle?: (isSaved: boolean) => void
  onReveal?: (leadId: string, name: string, email: string, phone?: string | null) => void
}) {
  const { addToast } = useToast()
  const [isSaved, setIsSaved] = useState(lead.status === 'saved')
  const [isRevealed, setIsRevealed] = useState(lead.isRevealed)

  useEffect(() => {
    setIsSaved(lead.status === 'saved')
  }, [lead.status])

  useEffect(() => {
    setIsRevealed(lead.isRevealed)
  }, [lead.isRevealed])

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = !isSaved
    setIsSaved(newState)
    addToast({
      type: 'success',
      message: newState ? '✓ Saved to pipeline' : 'Removed from pipeline',
    })
    if (onSaveToggle) {
      onSaveToggle(newState)
    }
  }

  const handleReveal = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lead.isClaimable) {
      addToast({ type: 'error', message: 'This lead is not yet approved. Intelligence is still being generated.' })
      return
    }
    const token = await getFirebaseToken()
    try {
      const res = await fetch('/api/leads/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ leadId: lead.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        addToast({ type: 'error', message: json.message || json.code || 'Failed to unlock lead' })
        return
      }
      setIsRevealed(true)
      if (onReveal) {
        onReveal(lead.id, json.name, json.email, json.phone)
      }
      addToast({ type: 'success', message: '✓ Contact unlocked' })
    } catch {
      addToast({ type: 'error', message: 'Network error' })
    }
  }

  // Choose banner theme based on urgency
  const banner = bannerTheme[lead.urgency] || bannerTheme.medium

  // Format clean title: Replace "For —" with details if present
  const displayTitle = lead.title
    ? lead.title.replace('For —', `For ${lead.company || lead.name}`)
    : lead.company || 'Lead Signals'

  // Pick active AI Agents based on lead processing status
  const selectedAgents = getAgentsForLead(lead)

  // Compute functional stats based on actual lead data:
  // 1. Channels Detected: LinkedIn, Twitter, Email, Phone, Website
  const channelsCount = (lead.email ? 1 : 0) + (lead.phone ? 1 : 0) + (lead.niches ? lead.niches.length : 0) + 1
  // 2. AI Signals Intercepted: triggers, requirements, pain points parsed
  const signalsCount = (lead.taskScope ? 1 : 0) + (lead.mustHave ? 1 : 0) + (lead.nicheBonus ? 1 : 0) + 2

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative text-left flex flex-col overflow-hidden h-full w-full transition-all duration-300 rounded-[20px] bg-[#141415] border border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
        isSelected
          ? 'ring-1 ring-primary/60 shadow-[0_8px_30px_rgba(var(--rgb-primary),0.12)] bg-[#171719]'
          : 'hover:border-white/10 hover:bg-[#181819]'
      }`}
    >
      {/* Top Banner */}
      <div className={`w-full py-2 px-4 text-center ${banner.bg} ${banner.text} select-none`}>
        <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase">
          {banner.label}
        </span>
      </div>

      {/* Body Area */}
      <div className="pt-2 px-2 pb-2.5 flex-1 flex flex-col w-full justify-between">
        
        {/* Dashed Border Box */}
        <div className="flex-1 border border-dashed border-white/[0.08] rounded-xl p-4 flex flex-col justify-between bg-transparent">
          
          {/* Header Row: Title & Bookmark */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-[15px] font-semibold text-white tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
                {displayTitle}
              </h3>
              <button
                onClick={handleSave}
                type="button"
                className={`p-1 rounded-md border transition-all shrink-0 ${
                  isSaved
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-white/5 border-transparent text-text-secondary/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BookmarkIcon className={`w-3.5 h-3.5 ${isSaved ? 'text-current' : 'text-text-secondary/35'}`} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[12px] text-text-secondary/60 line-clamp-2 leading-relaxed mt-1.5 font-normal">
              {lead.signalContext}
            </p>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-1.5 mt-3 select-none">
              {lead.replyProbability > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-badge-amber/40 bg-transparent text-badge-amber font-bold text-[9px] uppercase tracking-wider">
                  {lead.replyProbability}% Reply Match
                </span>
              )}
              {lead.niches &&
                lead.niches.map((niche) => (
                  <span
                    key={niche}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-text-secondary text-[9px] font-medium"
                  >
                    {niche}
                  </span>
                ))}
              {lead.nicheTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-text-secondary/50 text-[9px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Middle Row: AI Agents Avatars & Action Badge */}
          <div className="flex items-center justify-between mt-5">
            {/* Overlapping AI Agents Stack */}
            <div className="flex -space-x-1.5 overflow-hidden">
              {selectedAgents.map((member, idx) => (
                <div
                  key={idx}
                  title={member.name}
                  className={`w-7 h-7 rounded-full bg-[#222324] border border-[#141415] flex items-center justify-center text-[9px] font-semibold text-[#a1a1aa] shadow-sm select-none`}
                >
                  {member.initials}
                </div>
              ))}
            </div>

            {/* Action / Status Button */}
            <div className="shrink-0">
              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  type="button"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold text-[#11150C] bg-[#43ed9e] hover:bg-[#43ed9e]/90 transition-all border border-transparent shadow-[0_2px_8px_rgba(67,237,158,0.25)] hover:shadow-[0_2px_12px_rgba(67,237,158,0.4)] cursor-pointer uppercase tracking-wider"
                >
                  REVEAL -{lead.revealCost ?? 10}CR
                </button>
              ) : (
                <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold text-white bg-white/5 border border-white/10 uppercase tracking-wider">
                  DETAILS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row (Outside Dashed Box) */}
        <div className="flex items-center justify-between mt-2.5 px-2 text-[#88888b] text-[11px] font-medium w-full select-none">
          {/* Stats count */}
          <div className="flex items-center gap-4">
            {/* Social channels count */}
            <div className="flex items-center gap-1.5 cursor-help" title={`${channelsCount} communication channels detected`}>
              <PaperClipIcon className="w-3.5 h-3.5 text-[#88888b]/80 rotate-45" />
              <span>{channelsCount}</span>
            </div>
            {/* AI intelligence signals count */}
            <div className="flex items-center gap-1.5 cursor-help" title={`${signalsCount} AI trigger signals parsed`}>
              <FolderIcon className="w-3.5 h-3.5 text-[#88888b]/80" />
              <span>{signalsCount}</span>
            </div>
          </div>

          {/* Date / Timestamp */}
          <div className="text-[#88888b]/75">{lead.timestamp || '17/09/2024'}</div>
        </div>

      </div>
    </motion.button>
  )
}
