import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { deleteScraperKey, ExternalApiError } from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ engine: string; id: string }> }
) {
  try {
    await requireAdmin(request)
    const { engine, id } = await params
    await deleteScraperKey(engine, id)
    return NextResponse.json({ success: true })
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
    return NextResponse.json({ code: 'ERROR', message: error.message || 'Failed to delete scraper key' }, { status: 500 })
  }
}
