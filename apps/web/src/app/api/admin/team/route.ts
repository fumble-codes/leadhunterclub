import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Admin accounts available for task assignment. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const members = await db.user.findMany({
      where: { role: 'admin' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
      take: 200,
    })

    return NextResponse.json({ data: members })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    console.error('[Admin Team] error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to load team members' },
      { status: 500 },
    )
  }
}
