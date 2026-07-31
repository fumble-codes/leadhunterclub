import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, ForbiddenError } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const target = await db.sourceProfile.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Target not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { ...target, _id: target.id } })
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
    const existing = await db.sourceProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Target not found' }, { status: 404 })
    }
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.notes !== undefined) updateData.notes = body.notes.trim() || null
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.platform !== undefined) updateData.platform = body.platform

    if (body.url !== undefined) {
      const url = body.url.trim()
      const duplicate = await db.sourceProfile.findFirst({ where: { url, NOT: { id } } })
      if (duplicate) {
        return NextResponse.json({ code: 'CONFLICT', message: 'This profile URL is already on the watchlist' }, { status: 400 })
      }
      updateData.url = url
    }

    const target = await db.sourceProfile.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: { ...target, _id: target.id } })
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
    const existing = await db.sourceProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Target not found' }, { status: 404 })
    }
    await db.sourceProfile.delete({ where: { id } })
    return NextResponse.json({ success: true, data: {} })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
