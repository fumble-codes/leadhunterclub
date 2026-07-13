import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, InactiveUserError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid
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

  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json({ code: 'INACTIVE', message: 'Your account is not active' }, { status: 403 })
    }
    console.error('[Thread API Error]', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch thread' }, { status: 500 })
  }
}
