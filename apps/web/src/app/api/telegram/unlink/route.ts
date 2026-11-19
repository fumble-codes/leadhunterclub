import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    await db.user.update({
      where: { id: authUser.uid },
      data: {
        telegram_chat_id: null,
        telegram_username: null,
      },
    })

    return NextResponse.json({ success: true, message: 'Telegram account unlinked.' })
  } catch (error: any) {
    console.error('[Telegram Unlink] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error?.message || 'Failed to unlink Telegram.' },
      { status: 500 }
    )
  }
}
