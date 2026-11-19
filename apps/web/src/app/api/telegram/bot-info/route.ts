import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const envBot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME
    if (envBot && envBot.trim()) {
      return NextResponse.json({
        configured: true,
        botUsername: envBot.trim().replace(/^@/, ''),
      })
    }

    // Fallback: check setting in database
    const setting = await db.setting.findUnique({
      where: { key: 'telegram_config' },
    }).catch(() => null)

    const val = (setting?.value as Record<string, any>) || {}
    const botUsername = (val.bot_username || '').trim().replace(/^@/, '')

    return NextResponse.json({
      configured: !!botUsername,
      botUsername: botUsername || null,
    })
  } catch (error) {
    return NextResponse.json({ configured: false, botUsername: null })
  }
}
