import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { createProductSchema } from '@/lib/validators/work'
import { emptyTaskCounts, serializeProduct, TASK_STATUSES, type TaskStatus } from '@/lib/work'

export const dynamic = 'force-dynamic'

const memberSelect = { id: true, name: true, email: true } as const

function handleKnownError(error: unknown, fallback: string) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
  }
  console.error('[Admin Products] error:', error)
  return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: fallback }, { status: 500 })
}

/** List products/workstreams with their task counts. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const [products, grouped] = await Promise.all([
      db.workProduct.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        take: 300,
      }),
      db.workTask.groupBy({
        by: ['productId', 'status'],
        _count: { _all: true },
        where: { productId: { not: null } },
      }),
    ])

    const ownerIds = [...new Set(products.map((product) => product.ownerId).filter(Boolean))] as string[]
    const owners = ownerIds.length
      ? await db.user.findMany({ where: { id: { in: ownerIds } }, select: memberSelect })
      : []
    const ownerMap = new Map(owners.map((owner) => [owner.id, owner]))

    const countsByProduct = new Map<string, Record<TaskStatus, number>>()
    for (const row of grouped) {
      if (!row.productId) continue
      if (!countsByProduct.has(row.productId)) countsByProduct.set(row.productId, emptyTaskCounts())
      const counts = countsByProduct.get(row.productId)!
      if ((TASK_STATUSES as readonly string[]).includes(row.status)) {
        counts[row.status as TaskStatus] = row._count._all
      }
    }

    return NextResponse.json({
      data: products.map((product) =>
        serializeProduct(
          { ...product, owner: product.ownerId ? ownerMap.get(product.ownerId) ?? null : null },
          countsByProduct.get(product.id),
        ),
      ),
      total: products.length,
    })
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to load products')
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json().catch(() => null)
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid product',
          issues: parsed.error.issues,
        },
        { status: 400 },
      )
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

    const product = await db.workProduct.create({
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        color: input.color,
        ownerId: input.ownerId,
        createdById: admin.uid,
      },
    })
    const owner = input.ownerId
      ? await db.user.findUnique({ where: { id: input.ownerId }, select: memberSelect })
      : null

    return NextResponse.json(
      { success: true, data: serializeProduct({ ...product, owner: owner ?? null }) },
      { status: 201 },
    )
  } catch (error: unknown) {
    return handleKnownError(error, 'Failed to create product')
  }
}
