import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  requireFullyAuthorized,
  AuthRequiredError,
  EmailNotVerifiedError,
  OnboardingRequiredError,
  InactiveUserError,
} from '@/lib/auth'
import { emailService } from '@/lib/services/email'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireFullyAuthorized(request)
    const userId = authUser.uid

    const tickets = await db.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    })

    return NextResponse.json({
      data: tickets,
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
    console.error('[Support Tickets] GET error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to load support tickets' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireFullyAuthorized(request)
    const userId = authUser.uid

    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, any>
    let screenshots: string[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        subject: formData.get('subject'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        firstMessage: formData.get('firstMessage'),
      }
      const files = formData
        .getAll('screenshots')
        .filter((f): f is File => typeof f !== 'string' && f.size > 0)

      // Same base64 pattern as milestone rewards: store screenshots as data URLs
      // on the message, so admins see them inline in the admin ticket thread.
      if (files.length > 2) {
        return NextResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Attach at most 2 screenshots' },
          { status: 400 },
        )
      }
      const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp']
      for (const file of files) {
        if (!ALLOWED_MIME.includes(file.type)) {
          return NextResponse.json(
            { code: 'VALIDATION_ERROR', message: 'Screenshots must be PNG, JPEG or WebP' },
            { status: 400 },
          )
        }
        if (file.size > 3 * 1024 * 1024) {
          return NextResponse.json(
            { code: 'VALIDATION_ERROR', message: 'Each screenshot must be under 3MB' },
            { status: 400 },
          )
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        screenshots.push(`data:${file.type};base64,${buffer.toString('base64')}`)
      }
    } else {
      body = await request.json()
    }

    const { subject, category, priority, firstMessage } = body
    if (!subject || !firstMessage) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Subject and first message are required' },
        { status: 400 },
      )
    }

    const ticket = await db.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          userId,
          subject,
          category: category || 'general',
          priority: priority || 'normal',
        },
      })
      await tx.supportTicketMessage.create({
        data: {
          ticketId: created.id,
          authorId: userId,
          authorRole: 'user',
          body: firstMessage,
          // JSON array of data URLs (empty when no screenshots). Kept on the
          // message so admin/thread reads need no extra query.
          imageUrl: screenshots.length ? JSON.stringify(screenshots) : null,
        },
      })
      return created
    })

    const user = await db.user.findUnique({ where: { id: userId } })

    void emailService
      .notifyAdmin(category === 'bug' ? 'New Bug Report' : 'New Support Ticket', {
        subject,
        category: category || 'general',
        screenshots: screenshots.length,
        from: user?.name || authUser.name || userId,
        email: user?.email || authUser.email || '',
        ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'}/admin/support/${ticket.id}`,
      })
      .catch((e) => console.error('[Support] notifyAdmin failed:', e))

    return NextResponse.json({ success: true, data: ticket }, { status: 201 })
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
    console.error('[Support Tickets] POST error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create support ticket' },
      { status: 500 },
    )
  }
}