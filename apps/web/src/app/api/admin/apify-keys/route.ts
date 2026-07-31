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
    let keys = await db.apifyKey.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
    })

    const month = currentUsageMonth()
    keys = await Promise.all(
      keys.map(async (k) => {
        if (k.usage_month !== month) {
          await db.apifyKey.update({
            where: { id: k.id },
            data: { comments_used: 0, usage_month: month },
          })
          return { ...k, comments_used: 0, usage_month: month, comments_remaining: k.comments_limit }
        }
        return { ...k, comments_remaining: Math.max(0, k.comments_limit - k.comments_used) }
      })
    )

    return NextResponse.json({
      success: true,
      count: keys.length,
      worker_id: null,
      active_leases: [],
      data: keys.map(k => ({ ...k, _id: k.id, assigned_worker: null, usage: null, platform_usage: null })),
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
    const keyStr = body.key.trim()
    const existing = await db.apifyKey.findFirst({ where: { key: keyStr } })
    if (existing) {
      if (existing.is_deleted) {
        const updated = await db.apifyKey.update({
          where: { id: existing.id },
          data: { is_deleted: false, deleted_at: null, is_active: true, label: body.label || existing.label },
        })
        return NextResponse.json({ success: true, data: { ...updated, _id: updated.id } }, { status: 201 })
      }
      return NextResponse.json({ code: 'CONFLICT', message: 'Apify key already exists' }, { status: 400 })
    }
    const key = await db.apifyKey.create({
      data: { key: keyStr, label: body.label || null, usage_month: currentUsageMonth() },
    })
    return NextResponse.json({ success: true, data: { ...key, _id: key.id } }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
