'use client'

import { useState, useEffect } from 'react'
import {
  BookmarkIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { AppLead } from '@/types/lead'
import { getFirebaseToken } from '@/lib/firebase'
import { Badge } from '@/components/ui'

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
  const router = useRouter()
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

  const handleEngage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lead.isClaimable) {
      addToast({ type: 'error', message: 'This lead is not yet approved. Intelligence is still being generated.' })
      return
    }
    const token = await getFirebaseToken()
    if (!isRevealed) {
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
      } catch {
        addToast({ type: 'error', message: 'Network error' })
        return
      }
    }
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ isSaved: true, status: 'drafting' }),
    })
    router.push(`/outreach?leadId=${lead.id}&autoGenerate=true`)
  }

  // Resolve accent color matching sneak peek page
  const leadAccent =
    lead.urgency === 'critical'
      ? 'pink'
      : lead.urgency === 'high'
        ? 'mint'
        : lead.urgency === 'medium'
          ? 'purple'
          : 'cyan'

  // Format clean title: Replace "For —" with details if present, and handle fallback for "--" or "-"
  const displayTitle = lead.title && lead.title !== '--' && lead.title !== '-'
    ? lead.title.replace('For —', `For ${lead.company || lead.name}`)
    : lead.company || 'Lead Signals'

  return (
    <div
      onClick={onClick}
      className={`group relative p-6 rounded-3xl transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-0.5 ${
        isSelected
          ? 'bg-surface-secondary border border-primary/50 shadow-[0_8px_30px_rgba(var(--rgb-primary),0.12)]'
          : 'bg-surface-secondary/50 border border-white/[0.04] hover:border-white/10 hover:bg-surface-secondary/70 shadow-lg'
      }`}
    >
      {/* Top row: Bookmark & Live Indicator */}
      <div className="flex items-center justify-between mb-5 w-full select-none">
        <button
          onClick={handleSave}
          type="button"
          className={`p-1 rounded-md border transition-all shrink-0 ${
            isSaved
              ? 'bg-primary/20 border-primary/30 text-primary'
              : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookmarkIcon className={`w-3.5 h-3.5 ${isSaved ? 'text-current' : 'text-text-secondary/35'}`} />
        </button>
        <div className="flex items-center gap-1.5 text-xxs text-text-secondary/40 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse shadow-[0_0_8px_currentColor]" />
          Live
        </div>
      </div>

      {/* Lead Title */}
      <h3 className="text-[15px] font-bold text-text-primary mb-1 tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-snug">
        {displayTitle}
      </h3>

      {/* Signal Context Quote -> Core Scope (Intel) */}
      {lead.taskScope && lead.taskScope.trim() !== '' ? (
        <p className="text-sm text-text-secondary/70 leading-relaxed mb-5 flex-1 font-light line-clamp-2">
          &quot;{lead.taskScope}&quot;
        </p>
      ) : (
        <div className="flex-1 mb-5" />
      )}

      {/* Intent Score Bar */}
      <div className="mb-5 w-full select-none">
        <div className="flex justify-between text-xxs mb-1.5">
          <span className="text-text-secondary/50 font-bold uppercase tracking-widest">
            Intent Score
          </span>
          <span className={`font-bold text-accent-${leadAccent}`}>{lead.replyProbability}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            style={{ width: `${lead.replyProbability}%`, transition: 'width 400ms ease' }}
            className={`h-full bg-accent-${leadAccent}/50 rounded-full`}
          />
        </div>
      </div>

      {/* Urgency */}
      <div className="flex items-center justify-between mb-5 w-full select-none">
        <span className="text-xxs text-text-secondary/40 font-bold uppercase tracking-widest">
          Urgency
        </span>
        <span className="text-xxs font-bold uppercase tracking-widest text-text-secondary">
          {lead.urgency}
        </span>
      </div>
      {/* Tags row */}
      {((lead.niches && lead.niches.length > 0) || (lead.nicheTags && lead.nicheTags.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 mb-5 shrink-0 select-none">
          {lead.niches &&
            lead.niches.map((niche) => (
              <Badge key={niche} size="sm" color={leadAccent}>
                {niche}
              </Badge>
            ))}
          {lead.nicheTags &&
            lead.nicheTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] font-medium rounded-md border bg-white/[0.02] text-text-secondary/60 border-white/[0.05]"
              >
                {tag}
              </span>
            ))}
        </div>
      )}

      {/* Locked / Revealed Identity Box */}
      {!isRevealed ? (
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 overflow-hidden w-full">
          {/* Blurred Content Underneath */}
          <div className="blur-[6px] select-none pointer-events-none">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-xl bg-accent-${leadAccent}/10 border border-accent-${leadAccent}/20 flex items-center justify-center`}
              >
                <span className={`text-xxs font-bold text-accent-${leadAccent}`}>??</span>
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">Contact Locked</div>
                <div className="text-xxs text-text-secondary/50">Founder · E-commerce</div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-surface-secondary text-9 font-bold text-text-secondary">
                View Profile
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-secondary text-9 font-bold text-text-secondary">
                View Context
              </div>
            </div>
          </div>

          {/* Lock Overlay trigger handleReveal */}
          <button
            onClick={handleReveal}
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl cursor-pointer hover:bg-background/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-2">
              <LockClosedIcon className="w-[14px] h-[14px] text-text-secondary/50" />
            </div>
            <span className="text-xxs font-bold text-text-secondary/60 uppercase tracking-widest">
              {lead.revealCost ?? 3} Tokens to Reveal
            </span>
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 overflow-hidden w-full select-none">
          {/* Row 1: Avatar, Name, and Save button */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl bg-accent-${leadAccent}/10 border border-accent-${leadAccent}/20 flex items-center justify-center shrink-0`}
              >
                <span className={`text-xs font-bold text-accent-${leadAccent} uppercase`}>
                  {lead.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">{lead.name}</div>
              </div>
            </div>
            {/* Save / Saved Toggle Button */}
            <button
              onClick={handleSave}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-all shrink-0 cursor-pointer border ${
                isSaved
                  ? 'bg-primary/15 border-primary/30 text-primary shadow-[0_0_12px_rgba(var(--rgb-primary),0.06)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
              }`}
            >
              {isSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>

          {/* Divider line */}
          <div className="h-px bg-white/[0.04] my-2.5" />

          {/* Row 2 & 3: Email and Phone spanning the full width */}
          <div className="flex flex-col gap-2 mt-1">
            {lead.email && (
              <div className="flex items-center gap-2 text-[11px] text-text-secondary hover:text-text-primary transition-colors select-all">
                <EnvelopeIcon className="w-3.5 h-3.5 text-accent-purple/60 shrink-0" />
                <span className="truncate" title={lead.email}>{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-[11px] text-text-secondary hover:text-text-primary transition-colors select-all">
                <PhoneIcon className="w-3.5 h-3.5 text-accent-mint/60 shrink-0" />
                <span className="truncate" title={lead.phone}>{lead.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
