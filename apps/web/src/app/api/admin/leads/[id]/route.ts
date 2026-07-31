import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import {
  getPost,
  approvePost,
  rejectPost,
  regenerateIntel,
  reEnrichPost,
} from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(_request)
    const { id } = await params
    const post = await getPost(id)
    return NextResponse.json({ success: true, data: post })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch lead'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(_request)
    const { id } = await params
    const body = await _request.json()
    const { action } = body ?? {}

    switch (action) {
      case 'approve': {
        const approved = await approvePost(id)
        let mode: string | undefined
        try {
          const intelResult = await regenerateIntel(id)
          mode = intelResult.mode
        } catch {
          // intel generation is best-effort on approve
        }
        return NextResponse.json({ success: true, data: approved, mode })
      }
      case 'reject': {
        await rejectPost(id)
        return NextResponse.json({ success: true, message: 'Lead rejected' })
      }
      case 'regenerate-intel': {
        const result = await regenerateIntel(id)
        return NextResponse.json({ success: true, data: result.post, mode: result.mode })
      }
      case 're-enrich': {
        await reEnrichPost(id)
        return NextResponse.json({ success: true, message: 'Re-enrichment queued' })
      }
      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 },
        )
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process action'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
