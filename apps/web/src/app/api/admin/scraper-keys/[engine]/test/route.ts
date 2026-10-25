import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { testScraperKey, ExternalApiError } from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { engine: string } }
) {
  try {
    await requireAdmin(request)
    const { engine } = params
    const body = await request.json()
    const { key } = body

    if (!key || typeof key !== 'string' || !key.trim()) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Token or key is required' }, { status: 400 })
    }

    const result = await testScraperKey(engine, key.trim())
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
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to verify key' }, { status: 500 })
  }
}
