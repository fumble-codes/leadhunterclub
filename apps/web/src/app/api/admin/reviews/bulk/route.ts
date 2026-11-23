import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { adminBulkReviewSchema, reviewPlacementSchema } from '@/lib/validators/review'
import { readBulkReviewFormData, ReviewFormError } from '@/lib/review-upload'

export const dynamic = 'force-dynamic'

const MAX_FILES_PER_CHUNK = 6

/**
 * Bulk upload screenshots. The client sends small chunks (Vercel caps request
 * bodies at ~4.5MB), each with a parallel `categories` array. Images are
 * deduped by sha256 so re-running an upload never creates duplicate reviews.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const form = await request.formData()
    const items = await readBulkReviewFormData(form)
    if (items.length > MAX_FILES_PER_CHUNK) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: `Send at most ${MAX_FILES_PER_CHUNK} images per batch` },
        { status: 400 },
      )
    }

    const rawName = String(form.get('authorName') || '').trim()
    const rawRole = String(form.get('authorRole') || '').trim()
    const rawQuote = String(form.get('quote') || '').trim()
    const rawStatus = String(form.get('status') || 'APPROVED').toUpperCase()
    const status = rawStatus === 'PENDING' ? 'PENDING' : 'APPROVED'
    const rawFeatured = form.get('isFeatured')
    const isFeatured = rawFeatured === 'true' || rawFeatured === 'on'
    const rawLanding = form.get('showOnLanding')
    const rawWall = form.get('showOnWall')
    const rawPosition = form.get('position')
    const placement = reviewPlacementSchema.parse({
      showOnLanding: rawLanding === null ? undefined : rawLanding === 'true' || rawLanding === 'on',
      showOnWall: rawWall === null ? undefined : rawWall === 'true' || rawWall === 'on',
      position: rawPosition !== null && Number.isFinite(Number(rawPosition)) ? Number(rawPosition) : undefined,
    })

    const common = adminBulkReviewSchema
      .omit({ imageUrl: true })
      .parse({
        authorName: rawName || null,
        authorRole: rawRole || null,
        quote: rawQuote || null,
      })

    const reviewedAt = status === 'APPROVED' ? new Date() : null
    const data = items.map((item) => ({
      authorName: common.authorName ?? null,
      authorRole: common.authorRole ?? null,
      category: item.category,
      quote: common.quote ?? null,
      imageUrl: item.imageUrl,
      imageHash: item.imageHash,
      status,
      isFeatured: isFeatured && status === 'APPROVED',
      showOnLanding: placement.showOnLanding,
      showOnWall: placement.showOnWall,
      position: placement.position,
      userId: null,
      reviewedBy: admin.uid,
      reviewedAt,
    }))

    // skipDuplicates uses the unique index on imageHash — covers both repeats
    // inside this batch and screenshots already in the library.
    const result = await db.review.createMany({ data, skipDuplicates: true })
    revalidatePath('/reviews')
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      created: result.count,
      skipped: data.length - result.count,
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof ReviewFormError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: error.message }, { status: 400 })
    }
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Invalid review metadata' }, { status: 400 })
    }
    console.error('[Admin Reviews Bulk] error:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Bulk upload failed' }, { status: 500 })
  }
}
