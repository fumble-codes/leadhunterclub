import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export async function GET(request: NextRequest) {
  try {
    let { userId } = await auth(); userId = userId || 'demo_user_123'
    if (!userId && false) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const saved = searchParams.get('saved')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    const whereClause: any = {}

    // Status filter (user-specific state)
    if (status && status !== 'all') {
      if (status === 'new') {
        whereClause.OR = [
          { userStates: { none: { userId } } },
          { userStates: { some: { userId, status: 'new' } } },
        ]
      } else {
        whereClause.userStates = {
          some: { userId, status },
        }
      }
    }

    // Saved state filter
    if (saved === 'true') {
      whereClause.userStates = {
        some: { userId, isSaved: true },
      }
    } else if (saved === 'outreach') {
      whereClause.userStates = {
        some: {
          userId,
          status: { in: ['drafting', 'sent', 'replied', 'follow-up'] },
        },
      }
    }

    // Search filter
    if (search) {
      const q = search
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { signalContext: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Paginate and query
    const total = await db.lead.count({ where: whereClause })
    const leads = await db.lead.findMany({
      where: whereClause,
      include: {
        userStates: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // Process and merge user state, and redact locked contact info
    const data = leads.map((lead) => {
      const state = lead.userStates[0] // Since we filtered by userId, there will be at most 1 state
      const isSaved = state?.isSaved || false
      const isRevealed = state?.isRevealed || false
      const leadStatus = state?.status || 'new'

      return {
        id: lead.id,
        name: isRevealed ? lead.name : 'Unlocked Contact',
        email: isRevealed ? lead.email : 'unlocked@leadhunterclub.com',
        company: lead.company,
        source: lead.source,
        category: lead.category,
        title: lead.title,
        signalContext: lead.signalContext,
        role: lead.role,
        taskScope: lead.taskScope,
        mustHave: lead.mustHave,
        nicheBonus: lead.nicheBonus,
        buyerType: lead.buyerType,
        urgency: lead.urgency,
        winProb: lead.winProb,
        nicheTags: lead.nicheTags,
        niches: lead.niches,
        hashtags: lead.hashtags,
        replyProbability: lead.replyProbability,
        accent: lead.accent,
        status: leadStatus,
        isSaved,
        isRevealed,
        hasPhone: lead.phone !== null && lead.phone !== '',
        timestamp: formatTimeAgo(lead.createdAt),
      }
    })

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('[Leads API] GET error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve leads' },
      { status: 500 },
    )
  }
}

// POST endpoint (e.g. for manually adding leads)
export async function POST(request: NextRequest) {
  try {
    let { userId } = await auth(); userId = userId || 'demo_user_123'
    if (!userId && false) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const body = await request.json()

    const lead = await db.lead.create({
      data: {
        name: body.name || 'Unknown',
        email: body.email || '',
        company: body.company || '',
        source: body.source || 'Manual',
        category: body.category || 'General',
        title: body.title || '',
        signalContext: body.signalContext || '',
        role: body.role || '',
        taskScope: body.taskScope || '',
        mustHave: body.mustHave || '',
        nicheBonus: body.nicheBonus || '',
        buyerType: body.buyerType || '',
        urgency: body.urgency || 'medium',
        winProb: body.winProb || 'medium',
        nicheTags: body.nicheTags || [],
        niches: body.niches || [],
        hashtags: body.hashtags || [],
        replyProbability: Math.floor(Math.random() * 30) + 60,
        accent: (['mint', 'purple', 'cyan', 'orange', 'pink'] as const)[Math.floor(Math.random() * 5)],
      },
    })

    return NextResponse.json({ data: lead }, { status: 201 })
  } catch (error) {
    console.error('[Leads API] POST error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create lead' },
      { status: 500 },
    )
  }
}
