import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.refreshToken) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
      { status: 422 },
    )
  }

  return NextResponse.json({
    data: {
      session: {
        accessToken: 'mock_refreshed_access_token',
        refreshToken: 'mock_refreshed_refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    },
  })
}
