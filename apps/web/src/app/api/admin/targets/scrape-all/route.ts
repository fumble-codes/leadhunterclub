import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const activeTargets = await db.sourceProfile.findMany({
      where: { is_active: true, platform: 'linkedin' },
      orderBy: { name: 'asc' },
    })
    if (activeTargets.length === 0) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'No active watchlist targets to scrape.' }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      message: `Scrape queued for ${activeTargets.length} active watchlist targets`,
      count: activeTargets.length,
      jobIds: [],
    })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
