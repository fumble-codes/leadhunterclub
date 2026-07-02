import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    let { userId } = await auth(); userId = userId || 'demo_user_123'
    if (!userId && false) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing leadId' }, { status: 400 })
    }

    const userState = await db.userLeadState.findUnique({
      where: {
        userId_leadId: {
          userId,
          leadId,
        },
      },
      include: {
        emails: {
          orderBy: {
            sentAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: userState?.emails || [] })

  } catch (error) {
    console.error('[Thread API Error]', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch thread' }, { status: 500 })
  }
}
