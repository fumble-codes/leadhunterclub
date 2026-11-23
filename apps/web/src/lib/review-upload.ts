import { createHash } from 'node:crypto'
import { MAX_REVIEW_IMAGE_BYTES, REVIEW_IMAGE_TYPES } from '@/lib/validators/review'

export class ReviewFormError extends Error {}

/** Turn an uploaded image File into a storable base64 data URL + content hash. */
export async function readReviewFile(file: File) {
  if (file.size === 0) throw new ReviewFormError('Empty image')
  if (!(REVIEW_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new ReviewFormError('Screenshot must be PNG, JPEG or WebP')
  }
  if (file.size > MAX_REVIEW_IMAGE_BYTES) {
    throw new ReviewFormError('Screenshot must be under 3MB')
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  return {
    imageUrl: `data:${file.type};base64,${buffer.toString('base64')}`,
    imageHash: createHash('sha256').update(buffer).digest('hex'),
  }
}

/**
 * Shared multipart parser for single admin/member uploads.
 * Screenshots are stored as base64 data URLs, the same pattern used by
 * support tickets / milestone proofs (Vercel has no writable public dir).
 */
export async function readReviewFormData(formData: FormData) {
  const authorName = String(formData.get('authorName') || '').trim()
  const authorRole = String(formData.get('authorRole') || '').trim() || null
  const category = String(formData.get('category') || '').trim() || null
  const quote = String(formData.get('quote') || '').trim()

  const file = formData.get('screenshot')
  if (!(file instanceof File) || file.size === 0) {
    throw new ReviewFormError('A screenshot is required')
  }
  const { imageUrl, imageHash } = await readReviewFile(file)
  return { authorName, authorRole, category, quote, imageUrl, imageHash }
}

/**
 * Bulk parser: a chunk of screenshot files plus an optional parallel array of
 * folder labels. Returns one entry per file with its hash for deduplication.
 */
export async function readBulkReviewFormData(formData: FormData) {
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) throw new ReviewFormError('No images in this batch')

  let categories: (string | null)[] = []
  const rawCategories = formData.get('categories')
  if (typeof rawCategories === 'string' && rawCategories) {
    try {
      const parsed: unknown = JSON.parse(rawCategories)
      if (Array.isArray(parsed)) categories = parsed.map((c) => (typeof c === 'string' && c.trim() ? c.trim() : null))
    } catch {
      // Malformed labels are ignored — images still upload.
    }
  }

  const items: { imageUrl: string; imageHash: string; category: string | null }[] = []
  for (let i = 0; i < files.length; i++) {
    const { imageUrl, imageHash } = await readReviewFile(files[i])
    items.push({ imageUrl, imageHash, category: categories[i] ?? null })
  }
  return items
}
