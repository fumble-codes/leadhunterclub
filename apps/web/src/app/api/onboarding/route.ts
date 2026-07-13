import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { onboardingSchema } from '@/lib/validators/auth'
import { emailService } from '@/lib/services/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid onboarding data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const existingUser = await db.user.findUnique({ where: { id: authUser.uid } })
    if (!existingUser) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'User not found. Create an account first.' },
        { status: 404 },
      )
    }

    const isAdmin = existingUser.role === 'admin'
    const updatedUser = await db.user.update({
      where: { id: authUser.uid },
      data: {
        ...parsed.data,
        status: isAdmin ? existingUser.status : 'PENDING',
      },
    })

    emailService.sendApplicationReceived({ name: updatedUser.name, email: updatedUser.email })
    emailService.notifyAdmin('New Application', {
      name: updatedUser.name,
      email: updatedUser.email,
      id: updatedUser.id,
    })

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        status: updatedUser.status,
      },
    })
  } catch (error) {
    console.error('[Onboarding API] Error:', error)
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
