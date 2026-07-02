'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Secures credit deduction atomically via Prisma Transactions.
 * Validates the caller using Clerk auth() before checking/deducting.
 */
export async function consumeCredits(amount: number, description: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Authentication required')
  }

  if (amount <= 0) {
    throw new Error('Invalid credit amount')
  }

  try {
    const updatedUser = await db.$transaction(async (tx) => {
      // 1. Fetch user atomically
      const user = await tx.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found in database')
      }

      // 2. Perform guard check
      if (user.credits < amount) {
        throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user.credits}`)
      }

      // 3. Deduct credits
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount
          }
        }
      })

      console.log(`[Credit Deduction] Successfully deducted ${amount} credits from user ${userId} for: ${description}`)
      return updated
    })

    // Revalidate paths to update layout header/sidebar balances
    revalidatePath('/dashboard')
    revalidatePath('/leads')
    revalidatePath('/outreach')
    revalidatePath('/settings')

    return {
      success: true,
      credits: updatedUser.credits,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        credits: updatedUser.credits,
        plan: updatedUser.plan,
      }
    }
  } catch (err: any) {
    console.error(`[Credit Deduction Error] Failed to deduct credits: ${err.message}`)
    return {
      success: false,
      error: err.message,
    }
  }
}

/**
 * Securely fetch current credit balance and plan details.
 */
export async function getUserCredits() {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, error: 'Authentication required' }
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        plan: true,
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      credits: user.credits,
      plan: user.plan,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
