import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  requireFullyAuthorized,
  AuthRequiredError,
  InactiveUserError,
  EmailNotVerifiedError,
  OnboardingRequiredError,
} from '@/lib/auth'
import { getPosts, getPost } from '@/lib/external-api/client'
import type { ExternalPost } from '@/lib/external-api/client'
import type { AppLead } from '@/types/lead'
import { getLeadRevealCost } from '@/lib/config/coins'

export const dynamic = 'force-dynamic'

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

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const PHONE_REGEX = /(\+?\d[\d\s\-()\/.]{6,}\d)/g

function redactContact(content: string): string {
  return content.replace(EMAIL_REGEX, '[email hidden]').replace(PHONE_REGEX, '[phone hidden]')
}

function isLeadClaimable(post: ExternalPost): boolean {
  return post.source === 'seed' || (post.review_status === 'approved' && !!post.intelligence)
}

function isFeedEligible(post: ExternalPost): boolean {
  if (post.source === 'seed') return false
  if (post.review_status !== 'approved') return false
  if (!post.intelligence) return false
  return true
}

function extractSection(text: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`#+\\s*\\?*\\s*${escaped}\\s*\\n+([\\s\\S]*?)(?:\\n#+\\s|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function externalPostToAppLead(
  post: ExternalPost,
  userState?: { isSaved: boolean; isRevealed: boolean; status: string } | null,
): AppLead {
  const isRevealed = userState?.isRevealed || false
  const phone = post.contact_info?.phone_numbers?.[0]?.number || null
  const email = post.email || post.contact_info?.emails?.[0]?.email || ''
  const intel = post.intelligence || ''

  return {
    id: post.id,
    name: isRevealed ? post.author?.name || 'Unknown' : 'Unlocked Contact',
    email: isRevealed ? email : 'unlocked@leadhunterclub.com',
    company: post.contact_info?.company_name || post.author?.name || post.platform || '',
    source: post.platform || 'Unknown',
    category: extractSection(intel, 'One-Liner') || post.author?.info || post.keyword?.replace(/^watchlist:/, '') || post.platform || 'General',
    title: post.author?.info || post.keyword || post.platform || 'Lead Signal',
    signalContext: isRevealed ? post.content || '' : redactContact(post.content || ''),
    role: post.author?.info || extractSection(intel, 'One-Liner'),
    taskScope: extractSection(intel, 'Context You Might Miss'),
    mustHave: extractSection(intel, 'What They Actually Want'),
    nicheBonus: extractSection(intel, 'How to Win'),
    buyerType: intel,
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
    isClaimable: isLeadClaimable(post),
    hasPhone: !!phone,
    revealCost: getLeadRevealCost(post),
    phone,
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireFullyAuthorized(request)
    const userId = authUser.uid
    const { searchParams } = new URL(request.url)
    const saved = searchParams.get('saved')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    const isSavedView = saved === 'true'
    const isOutreachView = saved === 'outreach'
    const showAll = isSavedView || isOutreachView

    async function asyncMapConcurrent<T, R>(
      items: T[],
      fn: (item: T) => Promise<R>,
      concurrency: number,
    ): Promise<R[]> {
      const results: R[] = []
      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency)
        const batchResults = await Promise.allSettled(batch.map(fn))
        for (const r of batchResults) {
          if (r.status === 'fulfilled') results.push(r.value)
        }
      }
      return results
    }

    let data: AppLead[]

    if (isSavedView || isOutreachView) {
      const userStates = await db.userLeadState.findMany({
        where: isSavedView
          ? { userId, isSaved: true }
          : { userId, status: { in: ['drafting', 'sent', 'replied', 'follow-up'] } },
      })
      const results = await asyncMapConcurrent(
        userStates,
        (state) => getPost(state.leadId).then((p) => ({ post: p, state })),
        10,
      )
      data = results.map((r) => externalPostToAppLead(r.post, r.state))
    } else {
      const externalRes = await getPosts({ page, perPage: pageSize, status: 'approved' })
      const externalLeads = externalRes.data.filter(isFeedEligible)
      const leadIds = externalLeads.map((l) => l.id)
      const userStates =
        leadIds.length > 0
          ? await db.userLeadState.findMany({
              where: { userId, leadId: { in: leadIds } },
            })
          : []
      const stateMap = new Map(userStates.map((s) => [s.leadId, s]))
      data = externalLeads.map((lead) => externalPostToAppLead(lead, stateMap.get(lead.id)))
      data = data.filter((l) => l.status === 'new')
    }

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.signalContext.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.nicheTags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }

    const total = data.length
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
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }
    if (error instanceof EmailNotVerifiedError) {
      return NextResponse.json(
        { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before continuing' },
        { status: 403 },
      )
    }
    if (error instanceof OnboardingRequiredError) {
      return NextResponse.json(
        { code: 'ONBOARDING_REQUIRED', message: 'Please complete onboarding first' },
        { status: 403 },
      )
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json(
        { code: 'INACTIVE', message: 'Your account is not active' },
        { status: 403 },
      )
    }
    console.error('[Leads API] GET error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'Failed to retrieve leads' },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json(
    {
      code: 'READ_ONLY',
      message: 'Lead creation is not supported. Leads are read-only from external source.',
    },
    { status: 400 },
  )
}
