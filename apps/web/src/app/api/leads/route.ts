import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Lead } from '@prisma/client'
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
import { extractNiches, sanitizePublicText, extractCleanNicheTags, sanitizeHeadline } from '@/lib/claim-reveal'

export const dynamic = 'force-dynamic'

function formatTimeAgo(dateStr: string): string {
  const diffMs = new Date().getTime() - new Date(dateStr).getTime()
  const seconds = Math.max(0, Math.floor(diffMs / 1000))
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
  const platform = (post.platform || '').toLowerCase()
  const authorName = (post.author?.name || '').toLowerCase()
  const company = (post.contact_info?.company_name || '').toLowerCase()

  if (post.keyword) {
    const rawTag = post.keyword.replace(/^watchlist:/, '')
    const tagLower = rawTag.toLowerCase()
    
    // Filter out platform source, author name, and company name matches
    const isPlatform = tagLower === platform || ['linkedin', 'reddit', 'twitter', 'github', 'seed', 'external'].includes(tagLower)
    const isAuthor = authorName && (authorName.includes(tagLower) || tagLower.includes(authorName))
    const isCompany = company && (company.includes(tagLower) || tagLower.includes(company))

    if (!isPlatform && !isAuthor && !isCompany) {
      tags.push(rawTag)
    }
  }

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

  const niches = extractNiches(post.keyword, post.content || '', post.intelligence)
  const cleanTags = extractCleanNicheTags(post, niches)
  const cleanTitle = sanitizeHeadline(post.author?.info || post.keyword || '', niches[0])
  const cleanScope = sanitizePublicText(
    extractSection(intel, 'Context You Might Miss') ||
      extractSection(intel, 'What They Actually Want') ||
      extractSection(intel, 'One-Liner') ||
      post.content ||
      '',
  )

  return {
    id: post.id,
    name: isRevealed ? post.author?.name || 'Unknown' : 'Unlocked Contact',
    email: isRevealed ? email : 'unlocked@leadhunterclub.com',
    company: isRevealed
      ? post.contact_info?.company_name || post.author?.name || post.platform || ''
      : 'Confidential Client',
    source: 'Lead Signal',
    category: niches[0] || 'General',
    title: cleanTitle,
    signalContext: isRevealed ? post.content || '' : sanitizePublicText(post.content || ''),
    role: sanitizePublicText(post.author?.info || extractSection(intel, 'One-Liner')),
    taskScope: cleanScope,
    mustHave: sanitizePublicText(extractSection(intel, 'What They Actually Want')),
    nicheBonus: sanitizePublicText(extractSection(intel, 'How to Win')),
    buyerType: sanitizePublicText(intel),
    urgency: 'medium',
    winProb: 'medium',
    nicheTags: cleanTags,
    niches,
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
    phone: isRevealed ? phone : null,
  }
}

function dbLeadToAppLead(
  lead: Lead,
  userState?: { isSaved: boolean; isRevealed: boolean; status: string } | null,
): AppLead {
  const isRevealed = userState?.isRevealed || false
  const phone = lead.phone || null
  const email = lead.email || ''

  return {
    id: lead.id,
    name: isRevealed ? lead.name : 'Unlocked Contact',
    email: isRevealed ? email : 'unlocked@leadhunterclub.com',
    company: isRevealed ? lead.company : 'Confidential Client',
    source: lead.source || 'Lead Signal',
    category: lead.category || 'General',
    title: lead.title,
    signalContext: isRevealed ? lead.signalContext : sanitizePublicText(lead.signalContext || ''),
    role: sanitizePublicText(lead.role || ''),
    taskScope: sanitizePublicText(lead.taskScope || ''),
    mustHave: sanitizePublicText(lead.mustHave || ''),
    nicheBonus: sanitizePublicText(lead.nicheBonus || ''),
    buyerType: sanitizePublicText(lead.buyerType || ''),
    urgency: (lead.urgency as AppLead['urgency']) || 'medium',
    winProb: (lead.winProb as AppLead['winProb']) || 'medium',
    nicheTags: lead.nicheTags || [],
    niches: lead.niches || [],
    hashtags: lead.hashtags || [],
    replyProbability: lead.replyProbability || 60,
    accent: (lead.accent as AppLead['accent']) || 'mint',
    status: (userState?.status || 'saved') as AppLead['status'],
    timestamp: formatTimeAgo(lead.createdAt.toISOString()),
    isSaved: userState?.isSaved ?? true,
    isRevealed,
    isClaimable: true,
    hasPhone: !!phone,
    revealCost: 1,
    phone: isRevealed ? phone : null,
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
          ? { userId, isSaved: true, isRevealed: true }
          : { userId, status: { in: ['drafting', 'sent', 'replied', 'follow-up'] } },
        include: { lead: true },
      })
      const statesNeedingFetch = userStates.filter((s) => !s.lead)
      const fetchedMap = new Map<string, ExternalPost>()
      if (statesNeedingFetch.length > 0) {
        const fetched = await asyncMapConcurrent(
          statesNeedingFetch,
          async (state) => {
            try {
              const p = await getPost(state.leadId)
              return { id: state.leadId, post: p }
            } catch {
              return null
            }
          },
          10,
        )
        for (const f of fetched) {
          if (f?.post) fetchedMap.set(f.id, f.post)
        }
      }
      data = userStates
        .map((s) => {
          if (s.lead) {
            return dbLeadToAppLead(s.lead, s)
          }
          const p = fetchedMap.get(s.leadId)
          return p ? externalPostToAppLead(p, s) : null
        })
        .filter((l): l is AppLead => l !== null)
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
      const statusFilter = searchParams.get('status')
      if (statusFilter) {
        data = data.filter((l) => l.status === statusFilter)
      }
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
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve leads' },
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
