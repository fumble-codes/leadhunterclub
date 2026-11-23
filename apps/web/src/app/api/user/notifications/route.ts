import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/notifications
 * Returns whether the current user has Lead Drop Email Alerts enabled or muted.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)

    const user = await db.user.findUnique({
      where: { id: authUser.uid },
      select: { id: true, email: true, tags: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const tags = Array.isArray(user.tags) ? user.tags : []
    const isMuted = tags.includes('no_email_alerts')

    return NextResponse.json({
      success: true,
      emailAlertsEnabled: !isMuted,
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to fetch notification settings'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

/**
 * POST /api/user/notifications
 * Toggles Lead Drop Email Alerts ON or OFF for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)
    const body = await request.json().catch(() => ({}))
    const enabled = Boolean(body.emailAlertsEnabled)

    const user = await db.user.findUnique({
      where: { id: authUser.uid },
      select: { id: true, email: true, tags: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const currentTags = Array.isArray(user.tags) ? [...user.tags] : []
    let updatedTags: string[]

    if (enabled) {
      // Remove 'no_email_alerts' tag
      updatedTags = currentTags.filter((t) => t !== 'no_email_alerts')
    } else {
      // Add 'no_email_alerts' tag
      if (!currentTags.includes('no_email_alerts')) {
        updatedTags = [...currentTags, 'no_email_alerts']
      } else {
        updatedTags = currentTags
      }
    }

    await db.user.update({
      where: { id: authUser.uid },
      data: { tags: updatedTags },
    })

    // Also update settings table unsubscribed_alert_emails list if user has email
    if (user.email) {
      const cleanEmail = user.email.trim().toLowerCase()
      try {
        const existingSetting = await db.setting.findUnique({
          where: { key: 'unsubscribed_alert_emails' },
        })

        let emails: string[] = []
        if (existingSetting?.value && typeof existingSetting.value === 'object') {
          const val = existingSetting.value as { emails?: string[] }
          if (Array.isArray(val.emails)) {
            emails = val.emails.map((e) => e.trim().toLowerCase())
          }
        }

        if (enabled) {
          emails = emails.filter((e) => e !== cleanEmail)
        } else {
          if (!emails.includes(cleanEmail)) {
            emails.push(cleanEmail)
          }
        }

        await db.setting.upsert({
          where: { key: 'unsubscribed_alert_emails' },
          create: {
            key: 'unsubscribed_alert_emails',
            value: { emails },
            description: 'List of user emails unsubscribed from automated lead drop alerts',
          },
          update: {
            value: { emails },
          },
        })
      } catch (err) {
        console.warn('[notifications] Failed to sync settings blacklist:', err)
      }
    }

    return NextResponse.json({
      success: true,
      emailAlertsEnabled: enabled,
      message: enabled
        ? 'Lead drop email alerts turned ON'
        : 'Lead drop email alerts turned OFF',
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to update notification settings'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
