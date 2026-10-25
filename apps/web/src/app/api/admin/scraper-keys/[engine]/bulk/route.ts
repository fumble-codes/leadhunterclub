import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { bulkCreateScraperKeys, bulkDeleteScraperKeys, ExternalApiError } from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { engine: string } }
) {
  try {
    await requireAdmin(request)
    const { engine } = params
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'No items provided' }, { status: 400 })
    }

    const result = await bulkCreateScraperKeys(engine, items)
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ExternalApiError) {
      return NextResponse.json({ code: 'ERROR', message: error.externalMessage }, { status: error.status })
    }
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to bulk import scraper keys' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { engine: string } }
) {
  try {
    await requireAdmin(request)
    const { engine } = params
    const body = await request.json().catch(() => ({}))
    const { ids, all } = body

    const result = await bulkDeleteScraperKeys(engine, { ids, all })
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ExternalApiError) {
      return NextResponse.json({ code: 'ERROR', message: error.externalMessage }, { status: error.status })
    }
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to bulk delete scraper keys' }, { status: 500 })
  }
}
