import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { getPlanCredits } from '@/lib/config/plans'

export class InsufficientCreditsError extends Error {
  public required: number
  public available: number

  constructor(required: number, available: number) {
    super(`Insufficient credits. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientCreditsError'
    this.required = required
    this.available = available
  }
}

function now(): Date {
  return new Date()
}

async function checkAndRenewInTx(tx: Prisma.TransactionClient, userId: string) {
  await tx.$executeRaw`SELECT 1 FROM "credit_accounts" WHERE "userId" = ${userId} FOR UPDATE`

  const account = await tx.creditAccount.findUnique({
    where: { userId },
    include: { user: { select: { plan: true } } },
  })

  if (!account) return null

  if (account.renewalDate && now() >= account.renewalDate) {
    const limit = getPlanCredits(account.user.plan)
    const renewed = await tx.creditAccount.update({
      where: { userId },
      data: {
        subscriptionBalance: limit,
        renewalDate: new Date(account.renewalDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
    })

    await tx.auditLog.create({
      data: {
        userId,
        adminId: userId,
        action: 'CREDIT_CHANGE',
        targetType: 'USER',
        targetId: userId,
        details: {
          type: 'renewal',
          previousSubscriptionBalance: account.subscriptionBalance,
          newSubscriptionBalance: limit,
          reason: 'auto_renewal',
        },
      },
    })

    return renewed
  }

  return account
}

async function deductInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>,
) {
  await checkAndRenewInTx(tx, userId)

  const account = await tx.creditAccount.findUnique({
    where: { userId },
  })

  if (!account) throw new Error('CreditAccount not found')

  const totalAvailable = account.bonusBalance + account.subscriptionBalance
  if (totalAvailable < amount) throw new InsufficientCreditsError(amount, totalAvailable)

  let bonusDeduction = Math.min(account.bonusBalance, amount)
  let subscriptionDeduction = amount - bonusDeduction

  const updated = await tx.creditAccount.update({
    where: { userId },
    data: {
      bonusBalance: { decrement: bonusDeduction },
      subscriptionBalance: { decrement: subscriptionDeduction },
    },
    select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
  })

  const actingAdminId = (metadata?.adminId as string) ?? userId

  await tx.auditLog.create({
    data: {
      userId,
      adminId: actingAdminId,
      action: 'CREDIT_CHANGE',
      targetType: 'USER',
      targetId: userId,
      details: {
        type: 'deduct',
        amount,
        bonusUsed: bonusDeduction,
        subscriptionUsed: subscriptionDeduction,
        reason,
        subscriptionBalanceAfter: updated.subscriptionBalance,
        bonusBalanceAfter: updated.bonusBalance,
        ...metadata,
      },
    },
  })

  return updated
}

async function grantInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: string,
  adminId?: string,
  pool: 'bonus' | 'subscription' = 'bonus',
) {
  await tx.$executeRaw`SELECT 1 FROM "credit_accounts" WHERE "userId" = ${userId} FOR UPDATE`

  const account = await tx.creditAccount.findUnique({
    where: { userId },
  })

  if (!account) throw new Error('CreditAccount not found')

  const field = pool === 'bonus' ? 'bonusBalance' : 'subscriptionBalance'

  const updated = await tx.creditAccount.update({
    where: { userId },
    data: { [field]: { increment: amount } },
    select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
  })

  const actingAdminId = adminId ?? userId

  await tx.auditLog.create({
    data: {
      userId,
      adminId: actingAdminId,
      action: 'CREDIT_CHANGE',
      targetType: 'USER',
      targetId: userId,
      details: {
        type: 'grant',
        pool,
        amount,
        reason,
        subscriptionBalanceAfter: updated.subscriptionBalance,
        bonusBalanceAfter: updated.bonusBalance,
      },
    },
  })

  return updated
}

export const creditService = {
  async deduct(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    return db.$transaction((tx) => deductInTx(tx, userId, amount, reason, metadata))
  },

  deductInTx,

  async grantBonus(userId: string, amount: number, reason: string, adminId?: string) {
    return db.$transaction((tx) => grantInTx(tx, userId, amount, reason, adminId, 'bonus'))
  },

  async grantSubscription(userId: string, amount: number, reason: string, adminId?: string) {
    return db.$transaction((tx) => grantInTx(tx, userId, amount, reason, adminId, 'subscription'))
  },

  grantInTx,

  async getBalances(userId: string) {
    await db.$transaction((tx) => checkAndRenewInTx(tx, userId))

    const account = await db.creditAccount.findUnique({
      where: { userId },
      select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
    })

    return {
      subscriptionBalance: account?.subscriptionBalance ?? 0,
      bonusBalance: account?.bonusBalance ?? 0,
      total: (account?.subscriptionBalance ?? 0) + (account?.bonusBalance ?? 0),
      renewalDate: account?.renewalDate ?? null,
    }
  },

  async getTotalBalance(userId: string) {
    const balances = await creditService.getBalances(userId)
    return balances.total
  },

  async assignPlan(userId: string, planId: string) {
    const limit = getPlanCredits(planId)
    const renewalDate = new Date()
    renewalDate.setDate(renewalDate.getDate() + 30)

    return db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM "credit_accounts" WHERE "userId" = ${userId} FOR UPDATE`

      await tx.user.update({
        where: { id: userId },
        data: { plan: planId },
      })

      const updated = await tx.creditAccount.update({
        where: { userId },
        data: {
          subscriptionBalance: limit,
          renewalDate,
        },
        select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
      })

      await tx.auditLog.create({
        data: {
          userId,
          adminId: userId,
          action: 'CREDIT_CHANGE',
          targetType: 'USER',
          targetId: userId,
          details: {
            type: 'plan_assignment',
            plan: planId,
            subscriptionCredits: limit,
            renewalDate: renewalDate.toISOString(),
          },
        },
      })

      return updated
    })
  },

  async renewSubscription(userId: string) {
    return db.$transaction(async (tx) => {
      const account = await tx.creditAccount.findUnique({
        where: { userId },
        include: { user: { select: { plan: true } } },
      })

      if (!account) throw new Error('CreditAccount not found')

      const limit = getPlanCredits(account.user.plan)
      const renewalDate = new Date()
      renewalDate.setDate(renewalDate.getDate() + 30)

      const updated = await tx.creditAccount.update({
        where: { userId },
        data: {
          subscriptionBalance: limit,
          renewalDate,
        },
        select: { subscriptionBalance: true, bonusBalance: true, renewalDate: true },
      })

      await tx.auditLog.create({
        data: {
          userId,
          adminId: userId,
          action: 'CREDIT_CHANGE',
          targetType: 'USER',
          targetId: userId,
          details: {
            type: 'manual_renewal',
            previousSubscriptionBalance: account.subscriptionBalance,
            newSubscriptionBalance: limit,
            newRenewalDate: renewalDate.toISOString(),
          },
        },
      })

      return updated
    })
  },
}
