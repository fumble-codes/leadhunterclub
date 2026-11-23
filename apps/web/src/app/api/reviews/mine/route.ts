import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthRequiredError } from '@/lib/auth'
import { serializeReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

/** The signed-in member's own submissions, with moderation status. */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const reviews = await db.review.findMany({
      where: { userId: authUser.uid },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ success: true, reviews: reviews.map(serializeReview) })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    console.error('[Reviews mine] error:', error)
    return NextResponse.json({ success: false, message: 'Failed to load your reviews' }, { status: 500 })
  }
}
