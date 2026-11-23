import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { adminCreateReviewSchema, REVIEW_STATUSES } from '@/lib/validators/review'
import { readReviewFormData, ReviewFormError } from '@/lib/review-upload'
import { serializeReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

function handleKnownError(error: unknown, fallback: string) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
  }
  if (error instanceof ReviewFormError) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: error.message }, { status: 400 })
  }
  console.error('[Admin Reviews] error:', error)
  return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: fallback }, { status: 500 })
}

/** Admin list — all statuses, filter + pagination. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const params = request.nextUrl.searchParams
    const status = (params.get('status') || 'ALL').toUpperCase()
    const page = Math.max(1, Number(params.get('page') || '1') || 1)
    const pageSize = Math.min(60, Math.max(1, Number(params.get('pageSize') || '12') || 12))
    const where = status !== 'ALL' && (REVIEW_STATUSES as readonly string[]).includes(status) ? { status } : {}

    const [reviews, total, grouped] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: [{ status: 'asc' }, { isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.review.count({ where }),
      db.review.groupBy({ by: ['status'], _count: { _all: true } }),
    ])

    const byStatus: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    for (const row of grouped) byStatus[row.status] = row._count._all

    return NextResponse.json({
      data: reviews.map(serializeReview),
      total,
      allTotal: grouped.reduce((sum, row) => sum + row._count._all, 0),
      byStatus,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to load reviews')
  }
}

/** Admin uploads a review on a member's behalf. Published by default. */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown>
    let imageHash: string | undefined
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const uploaded = await readReviewFormData(form)
      imageHash = uploaded.imageHash
      const statusValue = form.get('status')
      const featureValue = form.get('isFeatured')
      const landingValue = form.get('showOnLanding')
      const wallValue = form.get('showOnWall')
      const positionValue = form.get('position')
      body = {
        ...uploaded,
        ...(statusValue ? { status: String(statusValue) } : {}),
        isFeatured: featureValue === 'true' || featureValue === 'on',
        ...(landingValue !== null ? { showOnLanding: landingValue === 'true' || landingValue === 'on' } : {}),
        ...(wallValue !== null ? { showOnWall: wallValue === 'true' || wallValue === 'on' } : {}),
        ...(positionValue !== null && Number.isFinite(Number(positionValue)) ? { position: Number(positionValue) } : {}),
      }
    } else {
      body = await request.json().catch(() => ({}))
    }

    const parsed = adminCreateReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid review' },
        { status: 400 },
      )
    }

    const input = parsed.data
    const approved = input.status === 'APPROVED'
    const review = await db.review.create({
      data: {
        authorName: input.authorName || null,
        authorRole: input.authorRole || null,
        category: input.category || null,
        quote: input.quote || null,
        imageUrl: input.imageUrl,
        imageHash: imageHash ?? null,
        status: input.status,
        isFeatured: input.isFeatured && approved,
        showOnLanding: input.showOnLanding,
        showOnWall: input.showOnWall,
        position: input.position,
        userId: null,
        reviewedBy: admin.uid,
        reviewedAt: approved ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: serializeReview(review) }, { status: 201 })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to create review')
  }
}
