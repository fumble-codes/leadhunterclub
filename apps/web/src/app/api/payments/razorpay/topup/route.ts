import { NextRequest, NextResponse } from 'next/server'
import { requireActiveUser, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { fetchApi } from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireActiveUser(request)
    const body = await request.json()
    const data = await fetchApi('/payments/razorpay/topup', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to create topup order'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}
