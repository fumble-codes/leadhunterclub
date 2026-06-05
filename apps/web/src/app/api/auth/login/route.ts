import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.email || !body.password) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
      { status: 422 },
    )
  }

  return NextResponse.json({
    data: {
      session: {
        user: {
          id: 'user_1',
          email: body.email,
          name: 'Alex Hunter',
          role: 'user',
          credits: 750,
          provider: 'email',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-09-12T00:00:00Z',
        },
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    },
  })
}
