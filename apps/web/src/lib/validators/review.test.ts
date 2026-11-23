import { describe, it, expect } from 'vitest'
import {
  createReviewSchema,
  adminCreateReviewSchema,
  adminBulkReviewSchema,
  adminUpdateReviewSchema,
} from '@/lib/validators/review'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/wFjQ7LJAAAAAElFTkSuQmCC'
const valid = { authorName: 'Jane Doe', authorRole: 'Designer', quote: 'Found a great client in two days.', imageUrl: PNG }

describe('createReviewSchema', () => {
  it('accepts a valid member submission', () => {
    expect(createReviewSchema.safeParse(valid).success).toBe(true)
  })

  it('requires a screenshot', () => {
    const { imageUrl, ...withoutImage } = valid
    expect(createReviewSchema.safeParse(withoutImage).success).toBe(false)
  })

  it('rejects remote URLs in place of a screenshot', () => {
    expect(createReviewSchema.safeParse({ ...valid, imageUrl: 'https://example.com/a.png' }).success).toBe(false)
  })

  it('rejects quotes that are too short', () => {
    expect(createReviewSchema.safeParse({ ...valid, quote: 'nice' }).success).toBe(false)
  })
})

describe('adminCreateReviewSchema', () => {
  it('publishes immediately by default and leaves featuring off', () => {
    const parsed = adminCreateReviewSchema.parse(valid)
    expect(parsed.status).toBe('APPROVED')
    expect(parsed.isFeatured).toBe(false)
  })

  it('can save as pending and featured=false', () => {
    const parsed = adminCreateReviewSchema.parse({ ...valid, status: 'PENDING', isFeatured: false })
    expect(parsed.status).toBe('PENDING')
  })
})

describe('adminBulkReviewSchema', () => {
  it('accepts a caption-free screenshot with a folder label', () => {
    const parsed = adminBulkReviewSchema.parse({ imageUrl: PNG, category: 'Closures', authorName: null, quote: null })
    expect(parsed.category).toBe('Closures')
    expect(parsed.quote).toBeNull()
  })

  it('still requires the image', () => {
    expect(adminBulkReviewSchema.safeParse({ category: 'Deals' }).success).toBe(false)
  })
})

describe('adminUpdateReviewSchema', () => {
  it('accepts moderation actions', () => {
    expect(adminUpdateReviewSchema.safeParse({ status: 'REJECTED', isFeatured: false }).success).toBe(true)
    expect(adminUpdateReviewSchema.safeParse({ status: 'SPAM' }).success).toBe(false)
  })
})
