import { NextRequest, NextResponse } from 'next/server'
import { allLeads } from '@/lib/mock/leadsData'
import type { Lead, LeadStatus } from '@leadhunter/shared'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const saved = searchParams.get('saved')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

  let filtered = [...allLeads]

  if (status && status !== 'all') {
    filtered = filtered.filter(l => l.status === status)
  }

  if (saved === 'true') {
    const savedStatuses: LeadStatus[] = ['saved', 'drafting', 'sent', 'replied', 'follow-up']
    filtered = filtered.filter(l => savedStatuses.includes(l.status))
  }

  if (saved === 'outreach') {
    const outreachStatuses: LeadStatus[] = ['drafting', 'sent', 'replied', 'follow-up']
    filtered = filtered.filter(l => outreachStatuses.includes(l.status))
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.signalContext.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q),
    )
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return NextResponse.json({
    data: paginated,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const lead: Lead = {
    id: String(Date.now()),
    name: body.name || 'Unknown',
    email: body.email || '',
    company: body.company || '',
    source: body.source || 'Manual',
    title: body.title || '',
    signalContext: body.signalContext || '',
    urgency: body.urgency || 'medium',
    nicheTags: body.nicheTags || [],
    replyProbability: Math.floor(Math.random() * 30) + 60,
    accent: (['mint', 'purple', 'cyan', 'orange', 'pink'] as const)[Math.floor(Math.random() * 5)],
    status: 'new',
    timestamp: 'Just now',
  }

  return NextResponse.json({ data: lead }, { status: 201 })
}
