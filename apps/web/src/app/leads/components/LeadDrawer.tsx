'use client'

import { useState } from 'react'
import {
  XMarkIcon,
  LockClosedIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PhoneIcon,
  ClockIcon,
  SparklesIcon,
  UserIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid'
import { AppLead } from '@/types/lead'
import { Badge, Modal, Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { getFirebaseToken } from '@/lib/firebase'

import { sanitizePublicText } from '@/lib/claim-reveal'
import { triggerUnlockConfetti } from '@/lib/confetti'
import { NicheBadge } from '@/components/ui/NicheBadge'

export default function LeadDrawer({
  lead,
  onClose,
  onReveal,
}: {
  lead: AppLead
  onClose: () => void
  onReveal: (name: string, email: string, phone?: string | null) => void
}) {
  const [isRevealing, setIsRevealing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const { addToast } = useToast()
  const tokenCost = lead.revealCost ?? null

  const displayTitle = !lead.isRevealed
    ? lead.title || 'OPPORTUNITY FOR —'
    : lead.title && lead.title !== '--' && lead.title !== '-'
      ? lead.title.replace(/FOR —|FOR -/i, `FOR ${lead.company || lead.name}`)
      : lead.company || lead.name || 'Lead Signal'

  const taskScopeDisplay = lead.isRevealed ? lead.taskScope : sanitizePublicText(lead.taskScope || '')
  const detailsSummaryDisplay =
    lead.detailsSummary && lead.detailsSummary.trim() !== ''
      ? (lead.isRevealed ? lead.detailsSummary : sanitizePublicText(lead.detailsSummary))
      : lead.summary && lead.summary.trim() !== ''
        ? (lead.isRevealed ? lead.summary : sanitizePublicText(lead.summary))
        : taskScopeDisplay

  const handleRevealClick = async () => {
    if (lead.isClaimedByOther) {
      setErrorMsg('This lead has already been claimed by another member to prevent client fatigue.')
      return
    }
    if (!lead.isClaimable) {
      setErrorMsg('This lead is not yet approved. Intelligence is still being generated.')
      return
    }
    if (tokenCost === null) {
      setErrorMsg('No contact info found on this lead. Reveal is not available.')
      return
    }
    setShowCreditModal(true)
  }

  const confirmReveal = async () => {
    // Smooth reveal for demo/mock leads
    if (
      lead.id.startsWith('mock') ||
      lead.id.startsWith('hero') ||
      lead.id.startsWith('card') ||
      ['checkout', 'shopify', 'rebrand', 'freelancers', 'agencies', 'consultants'].includes(lead.id)
    ) {
      setIsRevealing(true)
      setErrorMsg(null)
      setShowCreditModal(false)
      await new Promise((resolve) => setTimeout(resolve, 550))
      onReveal(lead.name, lead.email, lead.phone)
      triggerUnlockConfetti()
      addToast({
        type: 'success',
        message: `✓ Contact information unlocked for ${lead.name}`,
      })
      setIsRevealing(false)
      return
    }

    try {
      setIsRevealing(true)
      setErrorMsg(null)
      setShowCreditModal(false)
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
      if (res.ok && json.success) {
        onReveal(json.name, json.email, json.phone)
        triggerUnlockConfetti()
        addToast({
          type: 'success',
          message: `✓ Contact information unlocked${json.coinsUsed ? ` · ${json.coinsUsed} coins` : ''}`,
        })
        if (typeof json.creditsRemaining === 'number') {
          window.dispatchEvent(
            new CustomEvent('credits-updated', { detail: { creditsRemaining: json.creditsRemaining } }),
          )
        }
        window.dispatchEvent(new Event('user-refetch'))
      } else {
        setErrorMsg(json.message || 'Failed to unlock lead')
      }
    } catch {
      setErrorMsg('An unexpected network error occurred')
    } finally {
      setIsRevealing(false)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-3xl border border-white/[0.1] bg-surface-container-low/98 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:rounded-[22px]">
      {/* Credit confirmation modal */}
      <Modal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="Unlock Contact Information"
        size="sm"
        actions={
          <>
            <Button variant="ghost" color="mint" onClick={() => setShowCreditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" color="mint" onClick={confirmReveal} loading={isRevealing}>
              Unlock - {tokenCost} Credits
            </Button>
          </>
        }
      >
        <p className="mb-2">
          This costs <strong>{tokenCost} credits</strong>.
        </p>
        <p>
          You will get access to the lead&apos;s name, email{lead.hasPhone ? ', phone,' : ','} and
          company details.
        </p>
      </Modal>

      {/* Obsidian shell: rim light + grain + ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 128 128\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />

      {/* Drag handle (mobile) */}
      <div className="flex justify-center pt-2.5 pb-1 shrink-0 sm:hidden" aria-hidden>
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/[0.08] bg-gradient-to-b from-surface-container-high/70 to-surface-elevated/25 px-4 pt-3 pb-3.5 sm:px-6 sm:pt-5 sm:pb-4 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
              Lead intel
            </span>
            <span className="h-px w-8 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden />
            <NicheBadge niche={lead.niche} keyword={lead.category} content={lead.signalContext} />
            <Badge size="sm" color="purple">
              Lead Hunter Club
            </Badge>
          </div>

          <h2 className="text-lg sm:text-[22px] font-bold tracking-[-0.01em] text-white leading-[1.25]">
            {displayTitle}
          </h2>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 select-none text-[11px]">
            {lead.timestamp && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-text-secondary">
                <ClockIcon className="w-3 h-3 text-text-secondary/70" />
                Posted {lead.timestamp}
              </span>
            )}
            {lead.replyProbability > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-accent-purple/25 bg-accent-purple/10 px-2.5 py-1 font-medium text-accent-purple">
                <SparklesIcon className="w-3 h-3" />
                {lead.replyProbability}% AI Match
              </span>
            )}
            {lead.winProb === 'high' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-medium text-secondary">
                High win odds
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close lead details"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-black/30 text-text-secondary transition-all hover:border-white/15 hover:text-white active:scale-90"
        >
          <XMarkIcon className="w-[17px] h-[17px]" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-5 scrollbar-hide">
        {/* Summary + skills layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            {detailsSummaryDisplay && detailsSummaryDisplay.trim() !== '' && (
              <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-elevated/55 p-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-secondary/50 via-secondary/10 to-transparent" aria-hidden />
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-secondary">
                    Lead summary
                  </span>
                  <span className="h-px flex-1 bg-white/[0.06]" aria-hidden />
                </div>
                <p className="text-[13.5px] font-medium leading-relaxed text-text-primary whitespace-pre-line">
                  {detailsSummaryDisplay}
                </p>
              </section>
            )}

            {lead.nicheTags && lead.nicheTags.length > 0 && (
              <section className="mt-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Required skills
                  </span>
                  <span className="h-px flex-1 bg-white/[0.06]" aria-hidden />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lead.nicheTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:border-primary/35 hover:bg-primary/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {lead.hashtags && lead.hashtags.length > 0 && (
              <section className="mt-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Tags
                  </span>
                  <span className="h-px flex-1 bg-white/[0.06]" aria-hidden />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lead.hashtags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[12px] font-medium text-text-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Deep intel */}
          <section className="relative min-w-0">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
                Deep intel
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/35 to-transparent" aria-hidden />
            </div>

            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              {!lead.isRevealed && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-surface-container-low/70 backdrop-blur-[7px]">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-primary/10 mb-2.5">
                    <LockClosedIcon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    AI intel locked
                  </p>
                  <p className="mt-1 max-w-[200px] text-center text-[11px] text-text-secondary">
                    Reveal contact to unlock buyer, scope & requirements
                  </p>
                </div>
              )}

              <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 ${
                  !lead.isRevealed ? 'opacity-30 blur-[2.5px] select-none' : ''
                }`}
              >
                <IntelBlock label="Target buyer" value={lead.buyerType} />
                <IntelBlock label="Ideal candidate" value={lead.role} />
                <IntelBlock label="Core scope" value={lead.taskScope} />
                <IntelBlock label="Requirements" value={lead.mustHave} />
                <IntelBlock label="Bonus points" value={lead.nicheBonus} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="relative z-10 shrink-0 border-t border-white/[0.08] bg-surface-container-high/55 px-4 py-3.5 sm:px-6 sm:py-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {lead.isRevealed ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-secondary/35 bg-secondary/12 text-secondary">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-white">{lead.name}</span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1 truncate text-xs font-medium text-secondary hover:underline"
                  >
                    <EnvelopeIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-accent-purple hover:underline"
                    >
                      <PhoneIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-3 select-none">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                  <LockClosedIcon className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="flex flex-col gap-1.5 pointer-events-none">
                  <div className="h-2 w-32 rounded-full bg-white/10 blur-[1px]" />
                  <div className="h-2 w-24 rounded-full bg-white/5 blur-[1px]" />
                </div>
              </div>
            )}
          </div>

          {!lead.isRevealed &&
            (lead.isClaimedByOther ? (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-500 select-none">
                <LockClosedIcon className="h-4 w-4 shrink-0" />
                <span>Claimed by a member</span>
              </div>
            ) : (
              <Button
                variant="outline"
                color="mint"
                size="sm"
                onClick={handleRevealClick}
                loading={isRevealing}
                className="min-h-[48px] w-full shrink-0 text-[13px] sm:w-auto sm:min-w-[200px]"
              >
                {isRevealing ? (
                  <>
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    Unlock & Save Lead
                    <span className="ml-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-text-secondary">
                      <BanknotesIcon className="w-3 h-3" /> -{tokenCost ?? '–'}
                    </span>
                  </>
                )}
              </Button>
            ))}
        </div>
        {errorMsg && <div className="mt-2.5 text-xs font-medium text-red-400">{errorMsg}</div>}
      </div>
    </div>
  )
}

function IntelBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-primary/85">
        {label}
      </span>
      <span className="block break-words text-[13px] font-medium leading-relaxed text-text-primary">
        {value}
      </span>
    </div>
  )
}
