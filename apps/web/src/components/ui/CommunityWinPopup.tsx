'use client'

import { useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export interface CommunityPopupPost {
  id: string
  title: string
  content: string
  category:
    | 'ANNOUNCEMENT'
    | 'DEAL_CLOSED'
    | 'MEETING_SCHEDULED'
    | 'POSITIVE_REPLY'
    | 'SPOTLIGHT'
    | 'STRATEGY'
    | string
  dealSize?: string | null
  clientNiche?: string | null
  imageUrl?: string | null
  authorName: string
  authorPlan?: string | null
  createdAt?: string
}

interface CommunityWinPopupProps {
  open: boolean
  post: CommunityPopupPost | null
  onClose: () => void
  onViewWin: (postId: string) => void
}

type Tone = {
  pill: string
  tile: string
  icon: string
  glow: string
  cta: string
  ring: string
}

// Category tones follow the Community Hub itself: amber = official, cyan = playbook, mint = member win.
const TONES: Record<'amber' | 'mint' | 'cyan', Tone> = {
  amber: {
    pill: 'border-accent-purple/25 bg-accent-purple/[0.12] text-accent-purple',
    tile: 'border-accent-purple/25 bg-accent-purple/[0.09]',
    icon: 'text-accent-purple',
    glow: 'bg-accent-purple/[0.09]',
    cta: 'bg-accent-purple text-text-on-accent shadow-[0_10px_28px_-12px_rgba(255,184,0,0.5)] hover:brightness-110',
    ring: 'focus-visible:ring-accent-purple/50',
  },
  mint: {
    pill: 'border-accent-mint/25 bg-accent-mint/[0.12] text-accent-mint',
    tile: 'border-accent-mint/20 bg-accent-mint/[0.08]',
    icon: 'text-accent-mint',
    glow: 'bg-accent-mint/[0.07]',
    cta: 'bg-accent-mint text-black shadow-[0_10px_28px_-12px_rgba(67,237,158,0.45)] hover:bg-accent-mint/90',
    ring: 'focus-visible:ring-accent-mint/50',
  },
  cyan: {
    pill: 'border-accent-cyan/25 bg-accent-cyan/[0.12] text-accent-cyan',
    tile: 'border-accent-cyan/20 bg-accent-cyan/[0.08]',
    icon: 'text-accent-cyan',
    glow: 'bg-accent-cyan/[0.07]',
    cta: 'bg-accent-cyan text-[#00222b] shadow-[0_10px_28px_-12px_rgba(171,235,255,0.45)] hover:brightness-105',
    ring: 'focus-visible:ring-accent-cyan/50',
  },
}

interface CategoryConfig {
  label: string
  eyebrow: string
  icon: typeof MegaphoneIcon
  tone: keyof typeof TONES
  isWin: boolean
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  ANNOUNCEMENT: {
    label: 'Official Announcement',
    eyebrow: 'From the Lead Hunter team',
    icon: MegaphoneIcon,
    tone: 'amber',
    isWin: false,
  },
  DEAL_CLOSED: {
    label: 'Client Deal Closed',
    eyebrow: 'Verified member win',
    icon: TrophyIcon,
    tone: 'mint',
    isWin: true,
  },
  MEETING_SCHEDULED: {
    label: 'Meeting Booked',
    eyebrow: 'Verified member win',
    icon: CalendarDaysIcon,
    tone: 'mint',
    isWin: true,
  },
  POSITIVE_REPLY: {
    label: 'Positive Reply',
    eyebrow: 'Verified member win',
    icon: ChatBubbleLeftRightIcon,
    tone: 'mint',
    isWin: true,
  },
  SPOTLIGHT: {
    label: 'Member Spotlight',
    eyebrow: 'Featured member',
    icon: StarIcon,
    tone: 'mint',
    isWin: true,
  },
  STRATEGY: {
    label: 'Strategy & Playbook',
    eyebrow: 'Playbook update',
    icon: BookOpenIcon,
    tone: 'cyan',
    isWin: false,
  },
}

const FALLBACK_CONFIG: CategoryConfig = {
  label: 'Community Update',
  eyebrow: 'New in the Community Hub',
  icon: ShieldCheckIcon,
  tone: 'mint',
  isWin: false,
}

function formatPostDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function CommunityWinPopup({ open, post, onClose, onViewWin }: CommunityWinPopupProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Keep focus inside the dialog while it is open.
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 60)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      window.clearTimeout(focusTimer)
    }
  }, [open, handleKeyDown])

  const config = (post && CATEGORY_CONFIG[post.category]) || FALLBACK_CONFIG
  const tone = TONES[config.tone]
  const CategoryIcon = config.icon
  const postedOn = formatPostDate(post?.createdAt)
  const ctaLabel = config.isWin ? 'View in Community Hub' : 'Read in Community Hub'

  const handleView = () => {
    if (!post) return
    if (config.isWin) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffb800', '#43ed9e', '#abebff', '#ffb4ab'],
        })
      } catch {
        // Confetti blocked — the navigation still matters more.
      }
    }
    onViewWin(post.id)
  }

  return (
    <AnimatePresence>
      {open && post && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Liquid-glass dialog. The whole panel scrolls so long announcements and images
              are always fully readable; the action bar stays pinned to the bottom. */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-popup-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
            className="scrollbar-hide relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[640px] flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-[24px] border border-white/[0.11] bg-[#0b0b0e]/[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_32px_80px_-20px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.5)] outline-none backdrop-blur-2xl backdrop-saturate-150 sm:max-w-[720px]"
          >
            {/* ambient depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] via-white/[0.012] to-transparent"
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl ${tone.glow}`}
            />

            {/* Header */}
            <div className="relative flex items-start gap-3 px-5 pb-3 pt-5 md:px-7 md:pt-6">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_18px_-8px_rgba(0,0,0,0.7)] ${tone.tile}`}
              >
                <CategoryIcon className={`h-5 w-5 ${tone.icon}`} strokeWidth={1.6} />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${tone.pill}`}
                >
                  <span className="truncate">{config.label}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-text-muted">{config.eyebrow}</p>
                <h3
                  id="community-popup-title"
                  className="mt-1 break-words text-lg font-semibold leading-snug tracking-tight text-text-primary md:text-xl"
                >
                  {post.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                title="Close popup"
                aria-label="Close dialog"
                className={`-mr-2 -mt-1 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl p-2 text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 ${tone.ring}`}
              >
                <XMarkIcon className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </div>

            {/* Attachment — shown at full panel width, cropped consistently */}
            {post.imageUrl && (
              <div className="relative w-full shrink-0 overflow-hidden border-y border-white/[0.07] bg-white/[0.03]">
                {/* Arbitrary admin-supplied URL — plain img avoids remotePatterns config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt={`Attachment for ${post.title}`}
                  loading="lazy"
                  className="h-52 w-full object-cover sm:h-72"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b0b0e] to-transparent"
                />
              </div>
            )}

            {/* Body — full content, never clamped or truncated */}
            <div className="px-5 pb-5 pt-4 md:px-7">
              {(post.dealSize || post.clientNiche) && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {post.dealSize && (
                    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-accent-mint/20 bg-accent-mint/[0.1] px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-accent-mint">
                      {post.dealSize}
                    </span>
                  )}
                  {post.clientNiche && (
                    <span className="inline-flex items-center rounded-[10px] border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      {post.clientNiche}
                    </span>
                  )}
                </div>
              )}

              <p className="whitespace-pre-line break-words text-[13.5px] leading-relaxed text-text-secondary md:text-sm">
                {post.content}
              </p>

              {/* Author / provenance */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-text-secondary">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold uppercase ${tone.tile} ${tone.icon}`}
                  >
                    {post.authorName.slice(0, 2)}
                  </span>
                  <span className="truncate font-semibold text-text-primary">{post.authorName}</span>
                  <span className="rounded-[10px] border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-text-secondary">
                    {post.authorPlan || (config.isWin ? 'PRO MEMBER' : 'OFFICIAL')}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${tone.icon}`}>
                  <CheckBadgeIcon className="h-3 w-3" strokeWidth={1.8} />
                  {postedOn ? `Posted ${postedOn}` : config.isWin ? 'Verified win' : 'Official update'}
                </span>
              </div>
            </div>

            {/* Actions — pinned to the bottom of the panel while the content scrolls */}
            <div className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-end gap-2.5 border-t border-white/[0.07] bg-[#0b0b0e]/95 px-5 py-3.5 backdrop-blur-xl md:px-7">
              <button
                type="button"
                onClick={onClose}
                className={`min-h-[44px] rounded-xl border border-white/[0.12] px-4 text-[13px] font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 ${tone.ring}`}
              >
                Maybe later
              </button>

              <button
                type="button"
                onClick={handleView}
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-[13px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0e] ${tone.cta} ${tone.ring}`}
              >
                <span>{ctaLabel}</span>
                <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
