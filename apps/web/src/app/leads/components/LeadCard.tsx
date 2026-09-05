'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Lock, Coins, ShieldCheck, Mail, Phone } from 'lucide-react'
import { AppLead } from '@/types/lead'
import { useToast } from '@/components/ui/Toast'
import { getFirebaseToken } from '@/lib/firebase'
import { sanitizePublicText, sanitizeHeadline } from '@/lib/claim-reveal'

const themeMap = {
  mint: {
    cardBg: 'bg-[#B8F36B]',
    text: 'text-[#11150C]',
    textMuted: 'text-[#11150C]/65',
    tagBg: 'bg-[#11150C]/10 border-[#11150C]/10 text-[#11150C]',
    matchTag: 'bg-[#11150C] text-[#B8F36B]',
    button: 'bg-[#11150C] hover:bg-black text-[#B8F36B]',
    blurBg: 'bg-[#11150C]/10',
    blurLine: 'bg-[#11150C]/15',
    savedButton: 'bg-[#11150C]/20 text-[#11150C] border-[#11150C]/30',
    saveButton: 'bg-[#11150C] hover:bg-black text-white',
  },
  purple: {
    cardBg: 'bg-[#A78BFA]',
    text: 'text-white',
    textMuted: 'text-white/75',
    tagBg: 'bg-white/15 border-white/20 text-white',
    matchTag: 'bg-white text-[#11150C]',
    button: 'bg-white hover:bg-white/90 text-[#11150C]',
    blurBg: 'bg-white/15',
    blurLine: 'bg-white/25',
    savedButton: 'bg-white/25 text-white border-white/35',
    saveButton: 'bg-white hover:bg-white/90 text-[#11150C]',
  },
  cyan: {
    cardBg: 'bg-[#7DD3FC]',
    text: 'text-[#11150C]',
    textMuted: 'text-[#11150C]/65',
    tagBg: 'bg-[#11150C]/10 border-[#11150C]/10 text-[#11150C]',
    matchTag: 'bg-[#11150C] text-[#7DD3FC]',
    button: 'bg-[#11150C] hover:bg-black text-[#7DD3FC]',
    blurBg: 'bg-[#11150C]/10',
    blurLine: 'bg-[#11150C]/15',
    savedButton: 'bg-[#11150C]/20 text-[#11150C] border-[#11150C]/30',
    saveButton: 'bg-[#11150C] hover:bg-black text-white',
  },
  orange: {
    cardBg: 'bg-[#FFB86B]',
    text: 'text-[#11150C]',
    textMuted: 'text-[#11150C]/65',
    tagBg: 'bg-[#11150C]/10 border-[#11150C]/10 text-[#11150C]',
    matchTag: 'bg-[#11150C] text-[#FFB86B]',
    button: 'bg-[#11150C] hover:bg-black text-[#FFB86B]',
    blurBg: 'bg-[#11150C]/10',
    blurLine: 'bg-[#11150C]/15',
    savedButton: 'bg-[#11150C]/20 text-[#11150C] border-[#11150C]/30',
    saveButton: 'bg-[#11150C] hover:bg-black text-white',
  },
  pink: {
    cardBg: 'bg-[#F9A8D4]',
    text: 'text-[#11150C]',
    textMuted: 'text-[#11150C]/65',
    tagBg: 'bg-[#11150C]/10 border-[#11150C]/10 text-[#11150C]',
    matchTag: 'bg-[#11150C] text-[#F9A8D4]',
    button: 'bg-[#11150C] hover:bg-black text-[#F9A8D4]',
    blurBg: 'bg-[#11150C]/10',
    blurLine: 'bg-[#11150C]/15',
    savedButton: 'bg-[#11150C]/20 text-[#11150C] border-[#11150C]/30',
    saveButton: 'bg-[#11150C] hover:bg-black text-white',
  },
}

const ACCENT_ORDER: (keyof typeof themeMap)[] = ['purple', 'pink', 'cyan', 'mint', 'orange']

export default function LeadCard({
  lead,
  index,
  isSelected,
  onClick,
  onSaveToggle,
  onReveal,
}: {
  lead: AppLead
  index?: number
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

  // Alternate pastel accents across leads (cycles Purple, Pink, Cyan, Mint, Orange)
  const resolvedAccent: keyof typeof themeMap =
    typeof index === 'number'
      ? ACCENT_ORDER[index % ACCENT_ORDER.length]
      : lead.accent && ACCENT_ORDER.includes(lead.accent as keyof typeof themeMap) && lead.accent !== 'mint'
        ? (lead.accent as keyof typeof themeMap)
        : ACCENT_ORDER[
            Math.abs(
              lead.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0),
            ) % ACCENT_ORDER.length
          ]

  const theme = themeMap[resolvedAccent]

  // Top Left Category / Niche (Zero social sources: no Twitter/LinkedIn)
  const topCategory =
    (lead.niches && lead.niches.length > 0 && lead.niches[0]) ||
    (lead.category && lead.category.toLowerCase() !== 'general' ? lead.category : 'LEAD SIGNAL')

  // Headline (sanitized to prevent person names, company names, or contacts)
  const displayHeadline = sanitizeHeadline(lead.title, topCategory)

  // Main Quote content (strictly sanitized to prevent WhatsApp/phone/email/contact leaks)
  const rawQuote =
    lead.taskScope && lead.taskScope.trim() !== ''
      ? lead.taskScope
      : lead.category && lead.category.toLowerCase() !== 'general'
        ? lead.category
        : 'Verified service demand opportunity.'

  const quoteContent = sanitizePublicText(rawQuote)

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
      addToast({
        type: 'error',
        message: 'This lead is not yet approved. Intelligence is still being generated.',
      })
      return
    }

    try {
      const token = await getFirebaseToken()
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
        addToast({
          type: 'error',
          message: json.message || json.code || 'Failed to reveal lead',
        })
        return
      }

      setIsRevealed(true)
      addToast({
        type: 'success',
        message: `Unlocked contact for ${json.name || 'lead'}!`,
      })

      if (onReveal) {
        onReveal(lead.id, json.name, json.email, json.phone)
      }
    } catch {
      addToast({
        type: 'error',
        message: 'Network error while unlocking lead. Please try again.',
      })
    }
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative text-left flex flex-col p-6 rounded-[28px] overflow-hidden min-h-[320px] w-full col-span-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer ${
        theme.cardBg
      } ${isSelected ? 'ring-4 ring-black/30' : ''}`}
    >
      {/* Header: Niche & Urgency */}
      <div className="flex items-center justify-between mb-4 w-full select-none">
        {/* Top Left: Niche / Service Type (No Platform Sources) */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full bg-current shrink-0 ${theme.text}`} />
          <span className={`text-[11px] font-bold tracking-[0.2em] uppercase truncate ${theme.textMuted}`}>
            {topCategory}
          </span>
        </div>

        {/* Top Right: Urgency */}
        <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider shrink-0 ml-3 ${theme.textMuted}`}>
          <Activity size={14} />
          <span>{lead.urgency}</span>
        </div>
      </div>

      {/* Small Headline */}
      <h4 className={`text-[12px] font-bold tracking-widest uppercase mb-2 line-clamp-1 select-none ${theme.text}`}>
        {displayHeadline}
      </h4>

      {/* Large Main Quote */}
      <h3 className={`text-[18px] sm:text-[21px] font-semibold tracking-tight leading-[1.35] mb-5 flex-grow line-clamp-3 select-none ${theme.text}`}>
        &quot;{quoteContent}&quot;
      </h3>

      {/* Tags & Match Rate */}
      <div className="flex flex-wrap items-center gap-2 mb-6 shrink-0 select-none">
        {(lead.nicheTags || [])
          .filter((tag) => {
            if (!tag) return false
            const t = tag.trim()
            const lower = t.toLowerCase()
            if (['linkedin', 'reddit', 'twitter', 'github', 'seed', 'external'].includes(lower)) return false
            const words = t.split(/\s+/)
            if (words.length >= 2 && words.length <= 3 && words.every((w) => /^[A-Z][a-z]+$/.test(w))) return false
            if (words.length >= 2 && words.length <= 3 && words.every((w) => /^[A-Z]{3,}$/.test(w))) return false
            return true
          })
          .map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border backdrop-blur-sm ${theme.tagBg}`}
            >
              {tag}
            </span>
          ))}

        {lead.replyProbability > 0 && (
          <span
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-transparent flex items-center gap-1.5 shadow-sm ${theme.matchTag}`}
          >
            <ShieldCheck size={14} />
            {lead.replyProbability}% Match
          </span>
        )}
      </div>

      {/* Footer Area */}
      <div className="w-full pt-4 flex items-center justify-between shrink-0 border-t border-black/10">
        {!isRevealed ? (
          <>
            {/* Locked Blurred Contact Area */}
            <div className="flex items-center gap-3 select-none">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${theme.blurBg}`}
              >
                <Lock size={15} className={theme.textMuted} />
              </div>
              <div className="flex flex-col gap-1.5 pointer-events-none">
                <div className={`h-2.5 w-24 rounded-[4px] blur-[2px] ${theme.blurLine}`} />
                <div className={`h-2 w-32 rounded-[4px] blur-[2px] ${theme.blurBg}`} />
              </div>
            </div>

            {/* Reveal Action Button */}
            <button
              type="button"
              onClick={handleReveal}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px] shadow-md transition-all active:scale-95 cursor-pointer ${theme.button}`}
            >
              Reveal
              <span className="flex items-center gap-1 opacity-90 text-[10px] uppercase tracking-widest ml-1">
                <Coins size={13} /> -{lead.revealCost ?? 3}
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Unlocked Contact Details: 2 clean rows */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${theme.matchTag}`}
              >
                {lead.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-bold truncate ${theme.text}`}>{lead.name}</div>
                {lead.email && (
                  <div
                    className={`text-[10px] truncate select-all flex items-center gap-1 mt-0.5 ${theme.textMuted}`}
                    title={lead.email}
                  >
                    <Mail size={11} className="shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div
                    className={`text-[10px] truncate select-all flex items-center gap-1 ${theme.textMuted}`}
                    title={lead.phone}
                  >
                    <Phone size={11} className="shrink-0" />
                    <span className="truncate">{lead.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Save / Saved Button */}
            <button
              type="button"
              onClick={handleSave}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-all shrink-0 cursor-pointer border ml-2 ${
                isSaved ? theme.savedButton : theme.saveButton
              }`}
            >
              {isSaved ? '✓ Saved' : 'Save'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}