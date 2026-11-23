'use client'

import type { ReviewDTO } from '@/lib/reviews'

export function SubmittedReviewCard({ review }: { review: ReviewDTO }) {
  const initials = (review.authorName ?? '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const hasCaption = !!(review.quote || review.authorName)

  return (
    <article className="mb-6 break-inside-avoid overflow-hidden rounded-xl border border-white/[0.06] bg-surface/40 p-1.5">
      <a href={review.imageUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.imageUrl}
          alt={review.authorName ? `Screenshot shared by ${review.authorName}` : 'LeadHunterClub deal screenshot'}
          loading="lazy"
          className="block h-auto w-full object-contain"
        />
      </a>
      {(hasCaption || review.category) && (
        <div className="px-3 pb-3 pt-3.5">
          {review.category && (
            <span className="mb-2 inline-flex rounded-full border border-accent-purple/25 bg-accent-purple/10 px-2 py-0.5 text-[10px] font-semibold text-accent-purple">
              {review.category}
            </span>
          )}
          {review.quote && <p className="text-[13px] leading-relaxed text-text-secondary/90">“{review.quote}”</p>}
          {review.authorName && (
            <div className={`flex items-center gap-2.5 ${review.quote ? 'mt-3 border-t border-white/[0.05] pt-3' : 'mt-2'}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-orange/15 text-[11px] font-semibold text-accent-orange">
                {initials || 'LH'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text-primary">{review.authorName}</p>
                {review.authorRole && <p className="truncate text-[11px] text-text-muted">{review.authorRole}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
