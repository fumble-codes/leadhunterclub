'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BanknotesIcon, CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CreditExhaustedModalProps {
  open?: boolean
  onClose?: () => void
}

interface CreditExhaustedDetail {
  available?: number
  required?: number
}

// Display-only mirror of the single paid plan in `pricing/page.tsx` (DEFAULT_PLANS).
const FREELANCER_PLAN = {
  name: 'Freelancer Pro',
  price: 999,
  credits: 1000,
  features: [
    '1,000 credits renewed monthly',
    '15-day rollover on unused credits',
    'Priority lead delivery & email reveals',
    'Google Sheets export integration',
  ],
}

// Display-only mirror of `pricing/page.tsx` (DEFAULT_REFILL_PACKS).
const TOP_UP_PACKS = [
  { credits: 125, price: 199, popular: false },
  { credits: 275, price: 399, popular: true },
  { credits: 450, price: 599, popular: false },
]

export function CreditExhaustedModal({
  open: controlledOpen,
  onClose: controlledOnClose,
}: CreditExhaustedModalProps = {}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [internalOpen, setInternalOpen] = useState(false)
  const [available, setAvailable] = useState<number | null>(null)
  const [required, setRequired] = useState<number | null>(null)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose()
    } else {
      setInternalOpen(false)
    }
  }, [isControlled, controlledOnClose])

  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const detail = (event as CustomEvent<CreditExhaustedDetail>).detail
      setAvailable(typeof detail?.available === 'number' ? detail.available : null)
      setRequired(typeof detail?.required === 'number' ? detail.required : null)
      setInternalOpen(true)
    }
    window.addEventListener('open-credit-exhausted-modal', handleTrigger)
    return () => {
      window.removeEventListener('open-credit-exhausted-modal', handleTrigger)
    }
  }, [])

  // Same dismissal contract as Modal / UpgradeNudgePopup: Escape + scroll lock.
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  const handleUpgrade = () => {
    handleClose()
    router.push('/pricing')
  }

  const handleTopUp = () => {
    handleClose()
    router.push('/pricing?tab=refills')
  }

  const creditsLabel =
    available === null ? 'Credits exhausted' : `${available.toLocaleString('en-IN')} Credits Remaining`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop (Modal treatment) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Liquid-glass dialog, matching UpgradeNudgePopup */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-exhausted-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
            className="scrollbar-hide relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/[0.11] bg-[#0b0b0e]/[0.97] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_32px_80px_-20px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
          >
            {/* ambient depth: top sheen + palette glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] via-white/[0.012] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent-purple/[0.08] blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-accent-mint/[0.05] blur-3xl"
            />

            <div className="relative p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-accent-purple/20 bg-accent-purple/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_18px_-8px_rgba(0,0,0,0.7)]">
                  <BanknotesIcon className="h-5 w-5 text-accent-purple" strokeWidth={1.6} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-purple">
                    {creditsLabel}
                  </p>
                  <h2
                    id="credit-exhausted-title"
                    className="mt-1 text-lg font-semibold tracking-tight text-text-primary"
                  >
                    You&apos;ve reached your credit limit
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close dialog"
                  className="-mr-2 -mt-1 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl p-2 text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50"
                >
                  <XMarkIcon className="h-5 w-5" strokeWidth={1.6} />
                </button>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                {required !== null ? (
                  <>
                    Unlocking this lead needs{' '}
                    <span className="font-semibold text-text-primary">{required} credits</span>
                    {available !== null ? <> — you have {available.toLocaleString('en-IN')}</> : null}.
                  </>
                ) : (
                  'You need active credits to unlock full decision-maker contact details.'
                )}{' '}
                Upgrade or top up to keep hunting without interruption.
              </p>

              {/* Single paid plan */}
              <div className="mt-4 rounded-[16px] border border-accent-purple/[0.18] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-purple">
                      {FREELANCER_PLAN.name}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
                      {FREELANCER_PLAN.credits.toLocaleString('en-IN')}{' '}
                      <span className="text-[12px] font-medium text-text-secondary">credits / month</span>
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold tracking-tight text-text-primary">
                    ₹{FREELANCER_PLAN.price.toLocaleString('en-IN')}
                    <span className="text-[11px] font-normal text-text-secondary">/mo</span>
                  </p>
                </div>

                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {FREELANCER_PLAN.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-[11px] leading-snug text-text-secondary"
                    >
                      <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent-mint" strokeWidth={2.4} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-accent-purple px-4 text-[13px] font-semibold text-text-on-accent shadow-[0_10px_28px_-12px_rgba(255,184,0,0.45)] transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0e]"
                >
                  Get {FREELANCER_PLAN.name}
                  <span aria-hidden>→</span>
                </button>
              </div>

              {/* Top-ups */}
              <div className="mt-4 rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    <PlusIcon className="h-3 w-3 text-accent-mint" strokeWidth={2.4} />
                    Or top up instantly
                  </p>
                  <button
                    type="button"
                    onClick={handleTopUp}
                    className="min-h-[32px] text-[11px] font-medium text-accent-mint transition-colors hover:text-accent-mint/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-mint/50"
                  >
                    View all →
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TOP_UP_PACKS.map((pack) => (
                    <button
                      key={pack.credits}
                      type="button"
                      onClick={handleTopUp}
                      className={`flex min-h-[52px] flex-col items-start justify-center rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-mint/50 ${
                        pack.popular
                          ? 'border-accent-mint/25 bg-accent-mint/[0.06] hover:bg-accent-mint/[0.1]'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-accent-mint/25 hover:bg-accent-mint/[0.05]'
                      }`}
                    >
                      <span className="flex items-baseline gap-1 leading-none">
                        <span className="text-[12px] font-semibold tracking-tight text-text-primary tabular-nums">
                          {pack.credits.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] font-medium text-text-muted">credits</span>
                      </span>
                      <span className="mt-1 flex w-full items-center justify-between gap-1 text-[10px] leading-none text-text-muted">
                        <span>₹{pack.price}</span>
                        {pack.popular && (
                          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-accent-mint">
                            Popular
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <span className="text-[11px] text-text-muted">Instant activation via Razorpay</span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-[44px] rounded-xl px-3 text-[12px] font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
