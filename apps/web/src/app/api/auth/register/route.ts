import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.email || !body.password || !body.name) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' },
      { status: 422 },
    )
  }

  return NextResponse.json({
    data: {
      session: {
        user: {
          id: 'user_new',
          email: body.email,
          name: body.name,
          role: 'user',
          credits: 200,
          provider: 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        accessToken: 'mock_access_token_new',
        refreshToken: 'mock_refresh_token_new',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    },
  }, { status: 201 })
}
