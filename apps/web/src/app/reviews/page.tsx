'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ALL_REVIEW_IMAGES, ReviewScreenshotCard } from '@/app/components/TestimonialsSection'
import { SubmittedReviewCard } from '@/components/reviews/SubmittedReviewCard'
import { ReviewSubmissionModal } from '@/components/reviews/ReviewSubmissionModal'
import { useAuth } from '@/hooks/useAuth'
import { getFirebaseToken } from '@/lib/firebase'
import type { ReviewDTO } from '@/lib/reviews'

const ease = [0.16, 1, 0.3, 1] as const

const statusStyles: Record<string, string> = {
  PENDING: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  APPROVED: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  REJECTED: 'border-red-500/25 bg-red-500/10 text-red-400',
}

export default function ReviewsPage() {
  const { user } = useAuth()
  const [approved, setApproved] = useState<ReviewDTO[]>([])
  const [mine, setMine] = useState<ReviewDTO[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(json.reviews)) setApproved(json.reviews)
    } catch {
      // The static gallery below still renders if the feed is unavailable.
    }
  }, [])

  const loadMine = useCallback(async () => {
    try {
      const token = await getFirebaseToken()
      if (!token) return
      const res = await fetch('/api/reviews/mine', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(json.reviews)) setMine(json.reviews)
    } catch {
      // Non-critical: the submission CTA still works.
    }
  }, [])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  useEffect(() => {
    if (user) void loadMine()
    else setMine([])
  }, [user, loadMine])

  return (
    <main className="relative min-h-screen bg-[#0A0A0F] overflow-hidden text-text-primary font-sans">
      {/* Background radial glow accents using LeadHunterClub brand colors */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0A0A0F]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(var(--rgb-accent-orange),0.08)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[1000px] bg-[radial-gradient(ellipse_at_center,rgba(var(--rgb-accent-orange),0.07)_0%,rgba(var(--rgb-accent-purple),0.04)_40%,transparent_70%)]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto pt-40 pb-24 px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="text-[10px] font-bold tracking-ultra uppercase mb-6 block text-accent-orange">
              Reviews (what people say)
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="font-display text-[42px] md:text-[56px] font-semibold tracking-tight text-text-primary leading-[1.1] mb-5"
          >
            What People Say
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-base text-text-secondary/60 max-w-xl mx-auto leading-relaxed mb-6"
          >
            See why freelancers, designers, and agency owners trust Lead Hunter Club. Real feedback screenshots shared in our active channels.
          </motion.p>

          {/* Live Feed Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-[12px] text-text-secondary/45 mb-7"
          >
            <span>✨</span>
            <span>This feed is live and updated directly with feedback screenshots.</span>
          </motion.div>

          <div>
            {user ? (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent-orange px-6 py-3 text-sm font-semibold text-bg-main transition-opacity hover:opacity-90"
              >
                Share your review
              </button>
            ) : (
              <Link
                href="/login?redirect=/reviews"
                className="inline-flex items-center gap-2 rounded-full border border-accent-orange/40 bg-accent-orange/10 px-6 py-3 text-sm font-semibold text-accent-orange transition-colors hover:bg-accent-orange/20"
              >
                Log in to share your review
              </Link>
            )}
          </div>
        </div>

        {/* My submissions — status tracking for signed-in members */}
        {mine.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-5 font-display text-xl font-semibold text-text-primary">Your submissions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((review) => (
                <div key={review.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[review.status] || statusStyles.PENDING}`}>
                      {review.status === 'PENDING' ? 'Pending approval' : review.status === 'APPROVED' ? 'Live' : 'Not published'}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.quote ? (
                    <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary/80">“{review.quote}”</p>
                  ) : (
                    <p className="text-[11px] text-text-muted">Screenshot submitted</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Approved member reviews (admin + member submissions) */}
        {approved.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-text-primary">From our members</h2>
                <p className="mt-1 text-xs text-text-secondary/60">Reviews shared by the LeadHunterClub community.</p>
              </div>
              <span className="text-xs text-text-muted">{approved.length} review{approved.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {approved.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, ease }}
                >
                  <SubmittedReviewCard review={review} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Screenshot archive shared inside the community */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-text-primary">More from the club</h2>
              <p className="mt-1 text-xs text-text-secondary/60">Screenshot highlights shared in our active channels.</p>
            </div>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {ALL_REVIEW_IMAGES.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease }}
                className="break-inside-avoid mb-6"
              >
                <ReviewScreenshotCard imageUrl={imageUrl} index={index} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <ReviewSubmissionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultName={user?.name || ''}
        onSubmitted={() => void loadMine()}
      />
    </main>
  )
}
