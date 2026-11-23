/**
 * Shared shapes for the reviews feature (member submissions + admin moderation).
 * Kept framework-free so it can be imported by both routes and client components.
 */
import type { ReviewStatus } from '@/lib/validators/review'

export interface ReviewDTO {
  id: string
  authorName: string | null
  authorRole: string | null
  category: string | null
  quote: string | null
  imageUrl: string
  isFeatured: boolean
  status: ReviewStatus
  createdAt: string
}

export interface ReviewRecord {
  id: string
  authorName: string | null
  authorRole: string | null
  category?: string | null
  quote: string | null
  imageUrl: string
  status: string
  isFeatured: boolean
  createdAt: Date
  userId?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  adminNote?: string | null
  updatedAt?: Date
}

/** Convert a Prisma row into the JSON shape sent to the browser. */
export function serializeReview(r: ReviewRecord): ReviewDTO {
  return {
    id: r.id,
    authorName: r.authorName ?? null,
    authorRole: r.authorRole ?? null,
    category: r.category ?? null,
    quote: r.quote ?? null,
    imageUrl: r.imageUrl,
    isFeatured: r.isFeatured,
    status: r.status as ReviewStatus,
    createdAt: r.createdAt.toISOString(),
  }
}

/** Public cache policy — approved reviews only change on admin action. */
export const PUBLIC_REVIEWS_CACHE = 'public, s-maxage=60, stale-while-revalidate=120'
