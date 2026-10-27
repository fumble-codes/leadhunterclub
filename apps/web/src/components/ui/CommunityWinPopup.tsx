'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  SparklesIcon,
  TrophyIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export interface CommunityPopupPost {
  id: string
  title: string
  content: string
  category: 'DEAL_CLOSED' | 'MEETING_SCHEDULED' | 'POSITIVE_REPLY' | 'SPOTLIGHT' | string
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

// Single mint accent for this success moment — never paired with amber here
const WIN_PILL = 'border-accent-mint/25 bg-accent-mint/[0.12] text-accent-mint'

const CATEGORY_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  DEAL_CLOSED: {
    label: 'Client Deal Closed',
    icon: TrophyIcon,
    color: WIN_PILL,
  },
  MEETING_SCHEDULED: {
    label: 'Meeting Booked',
    icon: CalendarDaysIcon,
    color: WIN_PILL,
  },
  POSITIVE_REPLY: {
    label: 'Positive Reply',
    icon: ChatBubbleLeftRightIcon,
    color: WIN_PILL,
  },
  SPOTLIGHT: {
    label: 'Member Spotlight',
    icon: SparklesIcon,
    color: WIN_PILL,
  },
}

export function CommunityWinPopup({
  open,
  post,
  onClose,
  onViewWin,
}: CommunityWinPopupProps) {
  const reduceMotion = useReducedMotion()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const catConfig =
    (post && CATEGORY_LABELS[post.category]) || {
      label: 'Verified Member Win',
      icon: SparklesIcon,
      color: WIN_PILL,
    }
  const CategoryIcon = catConfig.icon

  const handleCelebrateClick = () => {
    if (!post) return
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F5A0', '#00D9F5', '#FFB800', '#FF4D6D'],
      })
    } catch {
      // Ignore if confetti blocked
    }
    onViewWin(post.id)
  }

  return (
    <AnimatePresence>
      {open && post && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop (Modal treatment) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Liquid-glass dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Community win"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#0b0b0e]/[0.97] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_32px_80px_-20px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
          >
            {/* ambient depth: top sheen + soft mint glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] via-white/[0.012] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent-mint/[0.06] blur-3xl"
            />

            <div className="relative space-y-5 p-6 md:p-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-accent-mint/20 bg-accent-mint/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_18px_-8px_rgba(0,0,0,0.7)]">
                    <SparklesIcon className="h-5 w-5 text-accent-mint" strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-mint">
                      <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                      <span>New Addition in Community Hub</span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold leading-snug tracking-tight text-text-primary">
                      Fresh Member Win Just Verified!
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  title="Close popup"
                  aria-label="Close dialog"
                  className="-mr-2 -mt-1 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl p-2 text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-mint/50"
                >
                  <XMarkIcon className="h-5 w-5" strokeWidth={1.6} />
                </button>
              </div>

              {/* Post Preview Card */}
              <div className="relative overflow-hidden rounded-[13px] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-5">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1 text-[11px] font-semibold ${catConfig.color}`}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    <span>{catConfig.label}</span>
                  </span>

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

                {/* Title */}
                <h4 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-text-primary">
                  {post.title}
                </h4>

                {/* Story Snippet */}
                <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-text-secondary">
                  {post.content}
                </p>

                {/* Author Footer in Card */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-text-secondary">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-mint/20 bg-accent-mint/10 text-[10px] font-bold uppercase text-accent-mint">
                      {post.authorName.slice(0, 2)}
                    </span>
                    <span className="truncate font-semibold text-text-primary">
                      {post.authorName}
                    </span>
                    <span className="rounded-[10px] border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-text-secondary">
                      {post.authorPlan || 'PRO MEMBER'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent-mint/90">
                    <CheckIcon className="h-3 w-3" strokeWidth={1.8} />
                    Verified Win
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] rounded-xl border border-white/[0.12] px-4 text-[13px] font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-mint/50"
                >
                  Maybe Later
                </button>

                <button
                  type="button"
                  onClick={handleCelebrateClick}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-accent-mint px-5 text-[13px] font-semibold text-black shadow-[0_10px_28px_-12px_rgba(67,237,158,0.45)] transition-all hover:bg-accent-mint/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-mint/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0e]"
                >
                  <span>View in Community Hub</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
