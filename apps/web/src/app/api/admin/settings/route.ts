import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'key query param required' }, { status: 400 })
    }
    const setting = await db.setting.findUnique({ where: { key } })
    if (!setting || setting.is_deleted) {
      return NextResponse.json({ success: true, data: { is_configured: false } })
    }
    return NextResponse.json({
      success: true,
      data: {
        ...setting.value as Record<string, unknown>,
        is_configured: true,
        _id: setting.id,
      },
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
    const { key, value, description } = body
    if (!key) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'key is required' }, { status: 400 })
    }
    const setting = await db.setting.upsert({
      where: { key },
      create: { key, value, description: description || null },
      update: { value, description: description || undefined, is_deleted: false, deleted_at: null },
    })
    return NextResponse.json({ success: true, data: { ...setting, _id: setting.id } })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
