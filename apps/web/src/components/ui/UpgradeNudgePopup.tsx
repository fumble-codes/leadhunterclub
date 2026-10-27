'use client'

import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowPathIcon,
  BanknotesIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type UpgradeNudgeVariant = 'upgrade' | 'renewal' | 'low-credits' | 'out-of-credits'

interface UpgradeNudgePopupProps {
  open: boolean
  variant?: UpgradeNudgeVariant
  plan?: string
  creditsRemaining?: number
  planMax?: number
  renewalDate?: string
  onClose: () => void
  // You wire this to your upgrade / billing flow. UI only — no API calls here.
  onUpgrade?: () => void
}

const copy: Record<UpgradeNudgeVariant, { title: string; heading: string; body: string; cta: string }> = {
  upgrade: {
    title: 'Upgrade plan',
    heading: 'You’re on Free — unlock more pipeline',
    body: 'Paid plans get more credits, faster reveals and priority signals. Upgrade when you’re ready — your saved leads stay put.',
    cta: 'View paid plans',
  },
  renewal: {
    title: 'Plan renewal',
    heading: 'Your plan renews soon',
    body: 'Renew to keep your credits flowing and avoid a gap in reveals. Your saved leads and outreach history are untouched.',
    cta: 'Renew plan',
  },
  'low-credits': {
    title: 'Credits running low',
    heading: 'You’re almost out of credits',
    body: 'Top up or upgrade so you can keep unlocking contacts without interruption.',
    cta: 'Top up credits',
  },
  'out-of-credits': {
    title: 'Out of credits',
    heading: 'You’ve used all your credits',
    body: 'Unlocks are paused until you top up or renew. Upgrade for a bigger monthly allowance.',
    cta: 'Get more credits',
  },
}

export function UpgradeNudgePopup({
  open,
  variant = 'upgrade',
  plan = 'FREE',
  creditsRemaining,
  planMax,
  renewalDate,
  onClose,
  onUpgrade,
}: UpgradeNudgePopupProps) {
  const c = copy[variant]
  const showCredits = typeof creditsRemaining === 'number'
  const pct =
    showCredits && planMax && planMax > 0
      ? Math.min(100, Math.max(0, (creditsRemaining! / planMax) * 100))
      : null
  const reduceMotion = useReducedMotion()

  // Dismissal parity with Modal: Escape key + body scroll lock while open
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

  const LeadingIcon =
    variant === 'renewal' ? ArrowPathIcon : variant === 'upgrade' ? SparklesIcon : BanknotesIcon

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
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
            aria-label={c.title}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#0b0b0e]/[0.97] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_32px_80px_-20px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
          >
            {/* ambient depth: top sheen + soft accent glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] via-white/[0.012] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-accent-purple/[0.06] blur-3xl"
            />

            <div className="relative p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-accent-purple/20 bg-accent-purple/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_18px_-8px_rgba(0,0,0,0.7)]">
                  <LeadingIcon className="h-5 w-5 text-accent-purple" strokeWidth={1.6} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-purple">
                    {c.title}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">
                    {c.heading}
                  </h2>
                  <span className="mt-2 inline-flex items-center rounded-[10px] border border-accent-purple/20 bg-accent-purple/[0.07] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-purple">
                    Current plan · {plan}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="-mr-2 -mt-1 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl p-2 text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50"
                >
                  <XMarkIcon className="h-5 w-5" strokeWidth={1.6} />
                </button>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{c.body}</p>

              {showCredits && (
                <div className="mt-4 rounded-[13px] border border-accent-purple/[0.16] bg-white/[0.035] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      Credits remaining
                    </span>
                    <span className="text-[12.5px] font-semibold tabular-nums text-text-primary">
                      {creditsRemaining}
                      {typeof planMax === 'number' ? ` / ${planMax}` : ''}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-accent-purple transition-all duration-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {variant === 'renewal' && renewalDate && (
                <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                  Renews on {renewalDate}.
                </p>
              )}

              <div
                aria-hidden
                className="relative mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
              />

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] rounded-xl border border-white/[0.12] px-4 text-[13px] font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50"
                >
                  Maybe later
                </button>
                <button
                  type="button"
                  onClick={onUpgrade ?? onClose}
                  className="min-h-[44px] rounded-xl bg-accent-purple px-5 text-[13px] font-semibold text-text-on-accent shadow-[0_10px_28px_-12px_rgba(255,184,0,0.45)] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0e]"
                >
                  {c.cta} →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
