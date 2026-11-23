import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { createTaskSchema } from '@/lib/validators/work'
import {
  dueDateToDate,
  emptyTaskCounts,
  serializeTask,
  TASK_STATUSES,
  type TaskStatus,
} from '@/lib/work'

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
  console.error('[Admin Tasks] error:', error)
  return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: fallback }, { status: 500 })
}

/** List tasks with optional product / assignee / status / text filters. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const params = request.nextUrl.searchParams
    const productParam = params.get('productId')?.trim() || ''
    const assigneeParam = params.get('assigneeId')?.trim() || ''
    const status = params.get('status')?.trim().toUpperCase() || ''
    const q = params.get('q')?.trim() || ''

    const where: Record<string, unknown> = {}
    if (productParam) where.productId = productParam === 'none' ? null : productParam
    if (assigneeParam) where.assigneeId = assigneeParam === 'none' ? null : assigneeParam
    if (status && (TASK_STATUSES as readonly string[]).includes(status)) where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    const tasks = await db.workTask.findMany({
      where,
      include: taskInclude,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
      take: 1000,
    })

    const byStatus = emptyTaskCounts()
    for (const task of tasks) {
      if ((TASK_STATUSES as readonly string[]).includes(task.status)) {
        byStatus[task.status as TaskStatus] += 1
      }
    }

    const assigneeIds = [...new Set(tasks.map((task) => task.assigneeId).filter(Boolean))] as string[]
    const users = assigneeIds.length
      ? await db.user.findMany({ where: { id: { in: assigneeIds } }, select: memberSelect })
      : []
    const userMap = new Map(users.map((user) => [user.id, user]))

    return NextResponse.json({
      data: tasks.map((task) =>
        serializeTask({
          ...task,
          assignee: task.assigneeId ? userMap.get(task.assigneeId) ?? null : null,
        }),
      ),
      byStatus,
      total: tasks.length,
    })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to load tasks')
  }
}

/** Create a task. New tasks go to the bottom of their column. */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json().catch(() => null)
    const parsed = createTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid task',
          issues: parsed.error.issues,
        },
        { status: 400 },
      )
    }

    const input = parsed.data
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

    const last = await db.workTask.aggregate({
      where: { status: input.status },
      _max: { position: true },
    })

    const task = await db.workTask.create({
      data: {
        title: input.title,
        description: input.description,
        productId: input.productId,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: dueDateToDate(input.dueDate),
        position: (last._max.position ?? -1) + 1,
        createdById: admin.uid,
        completedAt: input.status === 'DONE' ? new Date() : null,
      },
      include: taskInclude,
    })
    const assignee = task.assigneeId
      ? await db.user.findUnique({ where: { id: task.assigneeId }, select: memberSelect })
      : null

    return NextResponse.json(
      { success: true, data: serializeTask({ ...task, assignee: assignee ?? null }) },
      { status: 201 },
    )
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to create task')
  }
}
