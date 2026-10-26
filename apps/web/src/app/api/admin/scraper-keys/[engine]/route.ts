import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { getScraperKeys, createScraperKey, ExternalApiError } from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ engine: string }> }
) {
  try {
    await requireAdmin(request)
    const { engine } = await params
    const result = await getScraperKeys(engine)
    return NextResponse.json({ success: true, data: result.data || [] })
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
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to fetch scraper keys' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ engine: string }> }
) {
  try {
    await requireAdmin(request)
    const { engine } = await params
    const body = await request.json()
    const { key, label } = body

    if (!key || typeof key !== 'string' || !key.trim()) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'A valid API key/token is required' }, { status: 400 })
    }

    const result = await createScraperKey(engine, { key: key.trim(), label: label ? String(label).trim() : null })
    return NextResponse.json({ success: true, data: result.data }, { status: 201 })
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
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to add scraper key' }, { status: 500 })
  }
}
