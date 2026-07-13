import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, InactiveUserError } from '@/lib/auth'
import { getPosts, getPost } from '@/lib/external-api/client'
import type { ExternalPost } from '@/lib/external-api/client'
import type { AppLead } from '@/types/lead'

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function extractTags(post: ExternalPost): string[] {
  const tags: string[] = []
  if (post.keyword) tags.push(post.keyword.replace(/^watchlist:/, ''))
  if (post.platform) tags.push(post.platform)
  return tags
}

function externalPostToAppLead(post: ExternalPost, userState?: { isSaved: boolean; isRevealed: boolean; status: string } | null): AppLead {
  const isRevealed = userState?.isRevealed || false
  const phone = post.contact_info?.phone_numbers?.[0]?.number || null
  const email = post.email || post.contact_info?.emails?.[0]?.email || ''

  return {
    id: post.id,
    name: isRevealed ? (post.author?.name || 'Unknown') : 'Unlocked Contact',
    email: isRevealed ? email : 'unlocked@leadhunterclub.com',
    company: post.contact_info?.company_name || post.author?.name || post.platform || '',
    source: post.platform || 'Unknown',
    category: post.keyword?.replace(/^watchlist:/, '') || post.platform || 'General',
    title: post.author?.info || post.keyword || post.platform || 'Lead Signal',
    signalContext: post.content || '',
    role: post.author?.info || '',
    taskScope: '',
    mustHave: '',
    nicheBonus: '',
    buyerType: '',
    urgency: 'medium',
    winProb: 'medium',
    nicheTags: extractTags(post),
    niches: [],
    hashtags: [],
    replyProbability: Math.max(post.ai_score || 0, 60),
    accent: 'mint',
    status: (userState?.status || 'new') as AppLead['status'],
    timestamp: post.posted_at?.postedAgoShort || formatTimeAgo(post.created_at),
    isSaved: userState?.isSaved || false,
    isRevealed,
    hasPhone: !!phone,
    phone,
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid
    const { searchParams } = new URL(request.url)
    const saved = searchParams.get('saved')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    const externalRes = await getPosts({ page, perPage: pageSize })

    const externalLeads = externalRes.data

    const leadIds = externalLeads.map(l => l.id)
    const userStates = leadIds.length > 0
      ? await db.userLeadState.findMany({
          where: {
            userId,
            leadId: { in: leadIds },
          },
        })
      : []

    const stateMap = new Map(userStates.map(s => [s.leadId, s]))

    let data = externalLeads.map(lead => externalPostToAppLead(lead, stateMap.get(lead.id)))

    if (saved === 'true') {
      data = data.filter(l => l.isSaved)
    } else if (saved === 'outreach') {
      data = data.filter(l => ['drafting', 'sent', 'replied', 'follow-up'].includes(l.status))
    } else {
      data = data.filter(l => l.status === 'new')
    }

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.signalContext.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.nicheTags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    const total = externalRes.total || data.length
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
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json({ code: 'INACTIVE', message: 'Your account is not active' }, { status: 403 })
    }
    console.error('[Leads API] GET error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve leads' },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { code: 'READ_ONLY', message: 'Lead creation is not supported. Leads are read-only from external source.' },
    { status: 400 },
  )
}
