import { NextRequest, NextResponse } from 'next/server'
import { allLeads } from '@/lib/mock/leadsData'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const lead = allLeads.find(l => l.id === params.id)
  if (!lead) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Lead not found' },
      { status: 404 },
    )
  }
  return NextResponse.json({ data: lead })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const lead = allLeads.find(l => l.id === params.id)
  if (!lead) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Lead not found' },
      { status: 404 },
    )
  }

  const body = await request.json()
  const updated = { ...lead, ...body }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const index = allLeads.findIndex(l => l.id === params.id)
  if (index === -1) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Lead not found' },
      { status: 404 },
    )
  }

  return new NextResponse(null, { status: 204 })
}
