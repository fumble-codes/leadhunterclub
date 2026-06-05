import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 },
    )
  }

  return NextResponse.json({
    data: {
      id: 'user_1',
      email: 'hunter@leadhunterclub.com',
      name: 'Alex Hunter',
      role: 'user',
      credits: 750,
      provider: 'email',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-09-12T00:00:00Z',
    },
  })
}
