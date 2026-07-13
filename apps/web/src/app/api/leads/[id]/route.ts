import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, InactiveUserError } from '@/lib/auth'
import { getPost } from '@/lib/external-api/client'
import { updateLeadSchema } from '@/lib/validators/auth'
import type { AppLead } from '@/types/lead'

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

function extractTags(keyword: string | null, platform: string): string[] {
  const tags: string[] = []
  if (keyword) tags.push(keyword.replace(/^watchlist:/, ''))
  if (platform) tags.push(platform)
  return tags
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid

    const externalLead = await getPost(params.id)

    const userState = await db.userLeadState.findUnique({
      where: {
        userId_leadId: {
          userId,
          leadId: params.id,
        },
      },
    })

    const isRevealed = userState?.isRevealed || false
    const phone = externalLead.contact_info?.phone_numbers?.[0]?.number || null
    const email = externalLead.email || externalLead.contact_info?.emails?.[0]?.email || ''

    const lead: AppLead = {
      id: externalLead.id,
      name: isRevealed ? externalLead.author?.name || 'Unknown' : 'Unlocked Contact',
      email: isRevealed
        ? externalLead.email || externalLead.contact_info?.emails?.[0]?.email || ''
        : 'unlocked@leadhunterclub.com',
      company:
        externalLead.contact_info?.company_name ||
        externalLead.author?.name ||
        externalLead.platform ||
        '',
      source: externalLead.platform || 'Unknown',
      category:
        externalLead.keyword?.replace(/^watchlist:/, '') || externalLead.platform || 'General',
      title:
        externalLead.author?.info || externalLead.keyword || externalLead.platform || 'Lead Signal',
      signalContext: externalLead.content || '',
      role: externalLead.author?.info || '',
      taskScope: '',
      mustHave: '',
      nicheBonus: '',
      buyerType: '',
      urgency: 'medium',
      winProb: 'medium',
      nicheTags: extractTags(externalLead.keyword, externalLead.platform),
      niches: [],
      hashtags: [],
      replyProbability: Math.max(externalLead.ai_score || 0, 60),
      accent: 'mint',
      status: (userState?.status || 'new') as AppLead['status'],
      timestamp: externalLead.posted_at?.postedAgoShort || formatTimeAgo(externalLead.created_at),
      isSaved: userState?.isSaved || false,
      isRevealed,
      hasPhone: !!phone,
      phone,
    }

    return NextResponse.json({ data: lead })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json(
        { code: 'INACTIVE', message: 'Your account is not active' },
        { status: 403 },
      )
    }
    console.error('[Lead GET API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve lead details' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid

    const body = await request.json()
    const parsed = updateLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { status, isSaved } = parsed.data
    const updateData: Record<string, string | boolean> = {}
    if (status !== undefined) updateData.status = status
    if (isSaved !== undefined) updateData.isSaved = isSaved

    if (isSaved === true && status === undefined) {
      updateData.status = 'saved'
    } else if (isSaved === false && status === 'saved') {
      updateData.status = 'new'
    }

    const userState = await db.userLeadState.upsert({
      where: {
        userId_leadId: {
          userId,
          leadId: params.id,
        },
      },
      update: updateData,
      create: {
        userId,
        leadId: params.id,
        status: (updateData.status as string) || 'new',
        isSaved: (updateData.isSaved as boolean) || false,
      },
    })

    return NextResponse.json({
      data: {
        leadId: params.id,
        status: userState.status,
        isSaved: userState.isSaved,
        isRevealed: userState.isRevealed,
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json(
        { code: 'INACTIVE', message: 'Your account is not active' },
        { status: 403 },
      )
    }
    console.error('[Lead PATCH API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update lead status' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid

    await db.userLeadState.deleteMany({
      where: {
        userId,
        leadId: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json(
        { code: 'INACTIVE', message: 'Your account is not active' },
        { status: 403 },
      )
    }
    console.error('[Lead DELETE API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete lead' },
      { status: 500 },
    )
  }
}
