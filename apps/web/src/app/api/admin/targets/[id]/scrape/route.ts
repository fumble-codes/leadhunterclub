import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const target = await db.sourceProfile.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Target not found' }, { status: 404 })
    }
    if (!target.is_active) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Cannot scrape a paused target. Activate it first.' }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      message: `Scrape queued for "${target.name}"`,
      jobId: null,
      data: { ...target, _id: target.id },
    })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
