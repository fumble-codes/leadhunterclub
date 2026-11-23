import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { updateTaskSchema } from '@/lib/validators/work'
import { dueDateToDate, serializeTask } from '@/lib/work'

export const dynamic = 'force-dynamic'

const taskInclude = {
  product: { select: { id: true, name: true, color: true } },
} as const
const memberSelect = { id: true, name: true, email: true } as const

function handleKnownError(error: unknown, fallback: string) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
  }
  if ((error as { code?: string } | null)?.code === 'P2025') {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Task not found' }, { status: 404 })
  }
  console.error('[Admin Task] error:', error)
  return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: fallback }, { status: 500 })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const body = await request.json().catch(() => null)
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid update' },
        { status: 400 },
      )
    }

    const existing = await db.workTask.findUnique({ where: { id }, select: { status: true } })
    if (!existing) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Task not found' }, { status: 404 })
    }

    const input = parsed.data
    const data: Record<string, unknown> = {}
    if (input.title !== undefined) data.title = input.title
    if (input.description !== undefined) data.description = input.description
    if (input.productId !== undefined) data.productId = input.productId
    if (input.priority !== undefined) data.priority = input.priority
    if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId
    if (input.dueDate !== undefined) data.dueDate = dueDateToDate(input.dueDate)

    if (input.status !== undefined && input.status !== existing.status) {
      data.status = input.status
      data.completedAt = input.status === 'DONE' ? new Date() : null
    }

    if (input.productId) {
      const product = await db.workProduct.findUnique({
        where: { id: input.productId },
        select: { id: true },
      })
      if (!product) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Product no longer exists' },
          { status: 400 },
        )
      }
    }
    if (input.assigneeId) {
      const assignee = await db.user.findUnique({
        where: { id: input.assigneeId },
        select: { id: true },
      })
      if (!assignee) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Assignee no longer exists' },
          { status: 400 },
        )
      }
    }

    const task = await db.workTask.update({
      where: { id },
      data,
      include: taskInclude,
    })
    const assignee = task.assigneeId
      ? await db.user.findUnique({ where: { id: task.assigneeId }, select: memberSelect })
      : null
    return NextResponse.json({
      success: true,
      data: serializeTask({ ...task, assignee: assignee ?? null }),
    })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to update task')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    await db.workTask.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Task deleted' })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to delete task')
  }
}
