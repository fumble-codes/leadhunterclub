import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { rateLimitByKey } from '@/lib/rate-limit'
import { getPlanCredits } from '@/lib/config/plans'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rl = await rateLimitByKey(`ip:${ip}`, 30, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const { uid, email, name, phone, emailVerified } = authUser

    let user = await db.user.findUnique({
      where: { id: uid },
      include: {
        creditAccount: {
          select: {
              subscriptionBalance: true,
              bonusBalance: true,
              rolloverBalance: true,
              rolloverExpiresAt: true,
              renewalDate: true,
            },
        },
      },
    })

    if (!user) {
      const limit = getPlanCredits('FREE')
      const renewalDate = new Date()
      renewalDate.setDate(renewalDate.getDate() + 30)

      user = await db.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({
          where: { id: uid },
          include: {
            creditAccount: {
              select: {
              subscriptionBalance: true,
              bonusBalance: true,
              rolloverBalance: true,
              rolloverExpiresAt: true,
              renewalDate: true,
            },
            },
          },
        })
        if (existing) return existing

        return tx.user.create({
          data: {
            id: uid,
            email: email || '',
            name: name || 'User',
            phone: phone || null,
            role: 'user',
            status: 'PENDING',
            creditAccount: {
              create: { subscriptionBalance: limit, bonusBalance: 0, renewalDate },
            },
          },
          include: {
            creditAccount: {
              select: {
              subscriptionBalance: true,
              bonusBalance: true,
              rolloverBalance: true,
              rolloverExpiresAt: true,
              renewalDate: true,
            },
            },
          },
        })
      })
    } else if (email && email !== user.email) {
      user = await db.user.update({
        where: { id: uid },
        data: { email },
        include: {
          creditAccount: {
            select: {
              subscriptionBalance: true,
              bonusBalance: true,
              rolloverBalance: true,
              rolloverExpiresAt: true,
              renewalDate: true,
            },
          },
        },
      })
    }

    if (emailVerified === true && !user.emailVerified) {
      user = await db.user.update({
        where: { id: uid },
        data: { emailVerified: new Date() },
        include: {
          creditAccount: {
            select: {
              subscriptionBalance: true,
              bonusBalance: true,
              rolloverBalance: true,
              rolloverExpiresAt: true,
              renewalDate: true,
            },
          },
        },
      })
    }

    const hasCompletedOnboarding = !!(
      user.portfolio ||
      user.website ||
      user.linkedin ||
      user.instagram ||
      (user.servicesOffered?.length ?? 0) > 0 ||
      (user.preferredLeadCategories?.length ?? 0) > 0 ||
      user.outreachExperience ||
      user.discoverySource
    )

    const creditAccount = user.creditAccount
      ? {
          subscriptionBalance: user.creditAccount.subscriptionBalance,
          bonusBalance: user.creditAccount.bonusBalance,
          rolloverBalance: user.creditAccount.rolloverBalance,
          rolloverExpiresAt: user.creditAccount.rolloverExpiresAt?.toISOString() || null,
          total:
            user.creditAccount.subscriptionBalance +
            user.creditAccount.bonusBalance +
            user.creditAccount.rolloverBalance,
          renewalDate: user.creditAccount.renewalDate?.toISOString() || null,
        }
      : {
          subscriptionBalance: 0,
          bonusBalance: 0,
          rolloverBalance: 0,
          rolloverExpiresAt: null,
          total: 0,
          renewalDate: null,
        }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || null,
        role: user.role,
        creditAccount,
        status: user.status,
        provider: email ? 'email' : 'phone',
        emailVerified: user.emailVerified?.toISOString() || null,
        plan: user.plan,
        hasCompletedOnboarding,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Auth Me API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
