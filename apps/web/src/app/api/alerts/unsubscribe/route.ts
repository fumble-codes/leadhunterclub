import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET & POST /api/alerts/unsubscribe
 * Handles 1-click unsubscribe from lead drop emails directly from the email footer.
 * Query: ?email=<user_email>&action=unsubscribe|resubscribe|status
 */
export async function GET(request: NextRequest) {
  return handleUnsubscribe(request)
}

export async function POST(request: NextRequest) {
  return handleUnsubscribe(request)
}

async function handleUnsubscribe(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let email = searchParams.get('email')
    let action = searchParams.get('action') || 'unsubscribe'

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}))
      if (body.email) email = body.email
      if (body.action) action = body.action
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Find user by email in PostgreSQL
    const user = await db.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      select: { id: true, email: true, tags: true },
    })

    const isResubscribe = action === 'resubscribe'

    if (user) {
      const currentTags = Array.isArray(user.tags) ? [...user.tags] : []
      let updatedTags: string[]

      if (isResubscribe) {
        updatedTags = currentTags.filter((t) => t !== 'no_email_alerts')
      } else {
        updatedTags = currentTags.includes('no_email_alerts')
          ? currentTags
          : [...currentTags, 'no_email_alerts']
      }

      await db.user.update({
        where: { id: user.id },
        data: { tags: updatedTags },
      })
    }

    // 2. Sync global blacklist in settings table
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

      if (isResubscribe) {
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
    } catch (settingErr) {
      console.warn('[alerts/unsubscribe] Setting sync warning:', settingErr)
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      isSubscribed: isResubscribe,
      message: isResubscribe
        ? `Lead drop email alerts have been re-enabled for ${cleanEmail}.`
        : `You have successfully unsubscribed from lead drop emails (${cleanEmail}).`,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unsubscribe request failed'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
