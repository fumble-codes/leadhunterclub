import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthRequiredError } from '@/lib/auth'
import { emailService } from '@/lib/services/email'
import { createReviewSchema } from '@/lib/validators/review'
import { readReviewFormData, ReviewFormError } from '@/lib/review-upload'
import { PUBLIC_REVIEWS_CACHE, serializeReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

/** Public feed — only approved reviews are ever returned. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featuredOnly = searchParams.get('featured') === 'true'
    const rawLimit = Number(searchParams.get('limit') || '50')
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 50

    const reviews = await db.review.findMany({
      where: { status: 'APPROVED', ...(featuredOnly ? { isFeatured: true } : {}) },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })

    return NextResponse.json(
      { success: true, reviews: reviews.map(serializeReview) },
      { headers: { 'Cache-Control': PUBLIC_REVIEWS_CACHE } },
    )
  } catch (error: unknown) {
    console.error('[Reviews GET] error:', error)
    return NextResponse.json({ success: false, message: 'Failed to load reviews' }, { status: 500 })
  }
}

/** Logged-in member submits a review — always PENDING until an admin approves it. */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const contentType = request.headers.get('content-type') || ''

    let body: Record<string, unknown>
    if (contentType.includes('multipart/form-data')) {
      body = await readReviewFormData(await request.formData())
    } else {
      body = await request.json().catch(() => ({}))
    }

    const parsed = createReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid review' },
        { status: 400 },
      )
    }

    const dbUser = await db.user.findUnique({
      where: { id: authUser.uid },
      select: { name: true, email: true },
    })
    const input = parsed.data

    const review = await db.review.create({
      data: {
        authorName: input.authorName || dbUser?.name || authUser.name || 'Member',
        authorRole: input.authorRole || null,
        quote: input.quote,
        imageUrl: input.imageUrl,
        status: 'PENDING',
        userId: authUser.uid,
      },
    })

    void emailService
      .notifyAdmin('New review awaiting approval', {
        author: review.authorName,
        quote: review.quote,
        reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'}/admin/reviews`,
      })
      .catch((e) => console.error('[Reviews] notifyAdmin failed:', e))

    return NextResponse.json(
      { success: true, message: 'Thanks! Your review is pending approval.', data: serializeReview(review) },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Please log in to share a review' }, { status: 401 })
    }
    if (error instanceof ReviewFormError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: error.message }, { status: 400 })
    }
    console.error('[Reviews POST] error:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to submit review' }, { status: 500 })
  }
}
