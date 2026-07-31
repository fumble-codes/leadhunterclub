import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const keywords = await db.keyword.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json({ success: true, count: keywords.length, data: keywords.map(k => ({ ...k, _id: k.id })) })
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
    const existing = await db.keyword.findFirst({ where: { text: body.text.trim() } })
    if (existing) {
      if (existing.is_deleted) {
        const kw = await db.keyword.update({
          where: { id: existing.id },
          data: { is_deleted: false, deleted_at: null, is_active: true, platforms: body.platforms || existing.platforms },
        })
        return NextResponse.json({ success: true, data: { ...kw, _id: kw.id } }, { status: 201 })
      }
      return NextResponse.json({ code: 'CONFLICT', message: 'Keyword already exists' }, { status: 400 })
    }
    const kw = await db.keyword.create({
      data: { text: body.text.trim(), platforms: body.platforms || ['linkedin'] },
    })
    return NextResponse.json({ success: true, data: { ...kw, _id: kw.id } }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
