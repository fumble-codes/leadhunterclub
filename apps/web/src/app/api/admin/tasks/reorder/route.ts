import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { reorderTasksSchema } from '@/lib/validators/work'

export const dynamic = 'force-dynamic'

/** Persist drag-and-drop ordering. Accepts the final status + index of each moved task. */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json().catch(() => null)
    const parsed = reorderTasksSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid reorder' },
        { status: 400 },
      )
    }

    const existing = await db.workTask.findMany({
      where: { id: { in: parsed.data.tasks.map((task) => task.id) } },
      select: { id: true, status: true },
    })
    const byId = new Map(existing.map((task) => [task.id, task]))
    if (byId.size !== parsed.data.tasks.length) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'One or more tasks no longer exist' },
        { status: 404 },
      )
    }

    const now = new Date()
    await db.$transaction(
      parsed.data.tasks.map((task) =>
        db.workTask.update({
          where: { id: task.id },
          data: {
            status: task.status,
            position: task.position,
            ...(task.status !== byId.get(task.id)?.status
              ? { completedAt: task.status === 'DONE' ? now : null }
              : {}),
          },
        }),
      ),
    )

    return NextResponse.json({ success: true, updated: parsed.data.tasks.length })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    console.error('[Admin Tasks] reorder error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reorder tasks' },
      { status: 500 },
    )
  }
}
