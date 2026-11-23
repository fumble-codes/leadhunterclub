import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { updateProductSchema } from '@/lib/validators/work'
import { emptyTaskCounts, serializeProduct } from '@/lib/work'

export const dynamic = 'force-dynamic'

const memberSelect = { id: true, name: true, email: true } as const

function handleKnownError(error: unknown, fallback: string) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
  }
  if ((error as { code?: string } | null)?.code === 'P2025') {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Product not found' }, { status: 404 })
  }
  console.error('[Admin Product] error:', error)
  return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: fallback }, { status: 500 })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const body = await request.json().catch(() => null)
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid update' },
        { status: 400 },
      )
    }

    const existing = await db.workProduct.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Product not found' }, { status: 404 })
    }

    const input = parsed.data
    if (input.ownerId) {
      const owner = await db.user.findUnique({
        where: { id: input.ownerId },
        select: { id: true },
      })
      if (!owner) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Owner no longer exists' },
          { status: 400 },
        )
      }
    }

    const data: Record<string, unknown> = {}
    if (input.name !== undefined) data.name = input.name
    if (input.description !== undefined) data.description = input.description
    if (input.status !== undefined) data.status = input.status
    if (input.color !== undefined) data.color = input.color
    if (input.ownerId !== undefined) data.ownerId = input.ownerId

    const product = await db.workProduct.update({ where: { id }, data })
    const owner = product.ownerId
      ? await db.user.findUnique({ where: { id: product.ownerId }, select: memberSelect })
      : null
    return NextResponse.json({
      success: true,
      data: serializeProduct({ ...product, owner: owner ?? null }),
    })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to update product')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    await db.workProduct.delete({ where: { id } })
    // Tasks keep their records — the FK sets productId to null.
    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to delete product')
  }
}
