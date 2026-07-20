import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, InactiveUserError } from '@/lib/auth'
import { claimPost, getPost } from '@/lib/external-api/client'
import { leadRevealSchema } from '@/lib/validators/auth'
import { rateLimitByKey } from '@/lib/rate-limit'
import { creditService, InsufficientCreditsError } from '@/lib/services/credits'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid

    const rl = await rateLimitByKey(`user:${userId}:reveal`, 30, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
    const body = await request.json()
    const parsed = leadRevealSchema.safeParse(body)
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

    const { leadId } = parsed.data

    const externalLead = await getPost(leadId)

    const existingState = await db.userLeadState.findUnique({
      where: {
        userId_leadId: {
          userId,
          leadId,
        },
      },
    })

    if (existingState?.isRevealed) {
      return NextResponse.json({
        success: true,
        isRevealed: true,
        name: externalLead.author?.name || 'Unknown',
        email: externalLead.email || externalLead.contact_info?.emails?.[0]?.email || '',
        phone: externalLead.contact_info?.phone_numbers?.[0]?.number || null,
      })
    }

    const phone = externalLead.contact_info?.phone_numbers?.[0]?.number || null
    const hasPhone = !!phone
    const CREDIT_COST = hasPhone ? 5 : 3

    const txResult = await db.$transaction(async (tx) => {
      const result = await creditService.deductInTx(tx, userId, CREDIT_COST, 'lead_reveal', {
        leadId,
      })

      const claimedLead = await claimPost(leadId)

      await tx.lead.upsert({
        where: { id: leadId },
        update: {},
        create: {
          id: leadId,
          name: claimedLead.author?.name || 'Unknown',
          email: claimedLead.email || claimedLead.contact_info?.emails?.[0]?.email || '',
          phone: claimedLead.contact_info?.phone_numbers?.[0]?.number || null,
          company: claimedLead.contact_info?.company_name || claimedLead.author?.name || claimedLead.platform || '',
          source: claimedLead.platform || 'Unknown',
          category: claimedLead.keyword?.replace(/^watchlist:/, '') || claimedLead.platform || 'General',
          title: claimedLead.author?.info || claimedLead.keyword || claimedLead.platform || 'Lead Signal',
          signalContext: claimedLead.content || '',
          role: claimedLead.author?.info || '',
          taskScope: '',
          mustHave: '',
          nicheBonus: '',
          buyerType: '',
          urgency: 'medium',
          winProb: 'medium',
          nicheTags: claimedLead.keyword ? [claimedLead.keyword.replace(/^watchlist:/, '')] : [],
          niches: [],
          hashtags: [],
          replyProbability: Math.max(claimedLead.ai_score || 0, 60),
          accent: 'mint',
        },
      })

      const updatedState = await tx.userLeadState.upsert({
        where: {
          userId_leadId: {
            userId,
            leadId,
          },
        },
        update: {
          isRevealed: true,
          revealedAt: new Date(),
        },
        create: {
          userId,
          leadId,
          isRevealed: true,
          revealedAt: new Date(),
          status: 'new',
        },
      })

      const revealedEmail = claimedLead.email || claimedLead.contact_info?.emails?.[0]?.email || ''
      const revealedPhone = claimedLead.contact_info?.phone_numbers?.[0]?.number || null

      return {
        creditsRemaining: result.subscriptionBalance + result.bonusBalance,
        state: updatedState,
        name: claimedLead.author?.name || 'Unknown',
        email: revealedEmail,
        phone: revealedPhone,
      }
    })

    return NextResponse.json({
      success: true,
      isRevealed: true,
      name: txResult.name,
      email: txResult.email,
      phone: txResult.phone,
      creditsRemaining: txResult.creditsRemaining,
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
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          code: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits to reveal lead',
          required: error.required,
        },
        { status: 400 },
      )
    }
    const errMsg = error instanceof Error ? error.message : 'Failed to reveal lead contact info'
    console.error('[Lead Reveal API] Error:', errMsg)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reveal lead contact info' },
      { status: 500 },
    )
  }
}
