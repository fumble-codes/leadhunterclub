import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function currentUsageMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const where: Record<string, unknown> = {}
    if (active === 'true') where.is_active = true
    if (active === 'false') where.is_active = false

    let targets = await db.sourceProfile.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    const month = currentUsageMonth()
    targets = await Promise.all(
      targets.map(async (t) => {
        if (t.usage_month && t.usage_month !== month) {
          await db.sourceProfile.update({
            where: { id: t.id },
            data: { monthly_comments_found: 0, usage_month: month },
          })
          return { ...t, monthly_comments_found: 0, usage_month: month }
        }
        return t
      })
    )

    return NextResponse.json({
      success: true,
      count: targets.length,
      data: targets.map(t => ({ ...t, _id: t.id })),
    })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const url = body.url.trim()
    const existing = await db.sourceProfile.findUnique({ where: { url } })
    if (existing) {
      return NextResponse.json({ code: 'CONFLICT', message: 'This profile is already on the watchlist' }, { status: 400 })
    }
    const target = await db.sourceProfile.create({
      data: {
        name: body.name.trim(),
        url,
        platform: body.platform || 'linkedin',
        notes: body.notes?.trim() || null,
      },
    })
    return NextResponse.json({ success: true, data: { ...target, _id: target.id } }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
