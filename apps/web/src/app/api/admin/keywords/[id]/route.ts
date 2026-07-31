import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const kw = await db.keyword.findFirst({ where: { id, is_deleted: false } })
    if (!kw) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Keyword not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { ...kw, _id: kw.id } })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const kw = await db.keyword.findFirst({ where: { id, is_deleted: false } })
    if (!kw) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Keyword not found' }, { status: 404 })
    }
    const updated = await db.keyword.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: { ...updated, _id: updated.id } })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const kw = await db.keyword.findUnique({ where: { id } })
    if (!kw) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Keyword not found' }, { status: 404 })
    }
    await db.keyword.update({
      where: { id },
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
