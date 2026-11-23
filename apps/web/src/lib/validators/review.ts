import { z } from 'zod'

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const REVIEW_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export const MAX_REVIEW_IMAGE_BYTES = 3 * 1024 * 1024

/** Accepts the base64 data URLs we store for screenshots (no arbitrary http URLs). */
export const imageDataUrlSchema = z
  .string()
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/, 'Invalid screenshot')
  .max(5_000_000, 'Screenshot is too large')

const authorName = z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long')
const authorRole = z.string().trim().max(100, 'Role is too long').optional().nullable()
const category = z.string().trim().max(60, 'Label is too long').optional().nullable()
const quote = z.string().trim().min(10, 'Please write at least 10 characters').max(800, 'Review is too long')

/** Public/member submission — text is required on the member form. */
export const createReviewSchema = z.object({
  authorName,
  authorRole,
  quote,
  imageUrl: imageDataUrlSchema,
})

/**
 * Admin uploads are caption-free by default: the screenshot is the review.
 * Text fields may be blank; a folder label can be supplied as `category`.
 */
const adminReviewBase = z.object({
  authorName: authorName.optional().nullable(),
  authorRole,
  category,
  quote: quote.optional().nullable(),
  imageUrl: imageDataUrlSchema,
})

export const adminCreateReviewSchema = adminReviewBase.extend({
  status: z.enum(['PENDING', 'APPROVED']).default('APPROVED'),
  isFeatured: z.boolean().default(false),
})

/** One file in a bulk batch — all metadata optional except the image. */
export const adminBulkReviewSchema = adminReviewBase

export const adminUpdateReviewSchema = z.object({
  authorName: authorName.optional().nullable(),
  authorRole,
  category,
  quote: quote.optional().nullable(),
  imageUrl: imageDataUrlSchema.optional(),
  status: z.enum(REVIEW_STATUSES).optional(),
  isFeatured: z.boolean().optional(),
  adminNote: z.string().trim().max(1000).optional().nullable(),
})
