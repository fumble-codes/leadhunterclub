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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    let { userId } = await auth()
    userId = userId || 'demo_user_123'
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const lead = await db.lead.findUnique({
      where: { id: params.id },
      include: {
        userStates: {
          where: { userId },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Lead not found' },
        { status: 404 },
      )
    }

    const state = lead.userStates[0]
    const isSaved = state?.isSaved || false
    const isRevealed = state?.isRevealed || false
    const status = state?.status || 'new'

    return NextResponse.json({
      data: {
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
        status,
        isSaved,
        isRevealed,
        timestamp: formatTimeAgo(lead.createdAt),
      },
    })
  } catch (error) {
    console.error('[Lead GET API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve lead details' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    let { userId } = await auth()
    userId = userId || 'demo_user_123'
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const body = await request.json()

    // Verify lead exists
    const leadExists = await db.lead.findUnique({
      where: { id: params.id },
    })

    if (!leadExists) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Lead not found' },
        { status: 404 },
      )
    }

    // Prepare update parameters for UserLeadState
    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.isSaved !== undefined) updateData.isSaved = body.isSaved

    // If they saved a lead and didn't set status, set status to 'saved'
    if (body.isSaved === true && body.status === undefined) {
      updateData.status = 'saved'
    } else if (body.isSaved === false && body.status === 'saved') {
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
        status: updateData.status || 'new',
        isSaved: updateData.isSaved || false,
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
  } catch (error) {
    console.error('[Lead PATCH API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update lead status' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    let { userId } = await auth()
    userId = userId || 'demo_user_123'
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    // Find and delete UserLeadState or the Lead
    // For consistency with lead deletion (like removing it from feed), we can just delete state
    await db.userLeadState.deleteMany({
      where: {
        userId,
        leadId: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[Lead DELETE API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete lead' },
      { status: 500 },
    )
  }
}
