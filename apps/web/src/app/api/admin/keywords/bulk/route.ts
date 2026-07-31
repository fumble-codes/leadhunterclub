import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const texts: string[] = body.texts || []
    const platforms: string[] = body.platforms || ['linkedin']
    const results = []
    for (const text of texts) {
      if (!text.trim()) continue
      try {
        const existing = await db.keyword.findFirst({ where: { text: text.trim() } })
        if (existing) {
          if (existing.is_deleted) {
            const kw = await db.keyword.update({
              where: { id: existing.id },
              data: { is_deleted: false, deleted_at: null, is_active: true, platforms },
            })
            results.push({ ...kw, _id: kw.id })
          }
          continue
        }
        const kw = await db.keyword.create({ data: { text: text.trim(), platforms } })
        results.push({ ...kw, _id: kw.id })
      } catch { /* skip duplicates */ }
    }
    return NextResponse.json({ success: true, count: results.length, data: results }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { ids, updateData } = body
    await db.keyword.updateMany({
      where: { id: { in: ids }, is_deleted: false },
      data: updateData,
    })
    return NextResponse.json({ success: true, data: {} })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { ids } = body
    await db.keyword.updateMany({
      where: { id: { in: ids } },
      data: { is_deleted: true, deleted_at: new Date(), is_active: false },
    })
    return NextResponse.json({ success: true, data: {} })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
