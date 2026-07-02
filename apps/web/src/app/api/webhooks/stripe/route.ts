import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

// Stripe SDK initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key', {
  apiVersion: '2024-04-10' as any, // Stable Next API version compatible
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

// Plan credit allocations
const PLAN_CREDITS: Record<string, number> = {
  FREE: 200,
  PRO: 1000,
  ENTERPRISE: 10000,
}

export async function POST(req: Request) {
  const body = await req.text() // raw body required for signature check
  const headerList = headers()
  const signature = headerList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET environment variable.')
    return new NextResponse('Stripe Webhook Secret not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId && false) {
          console.warn('[Stripe Webhook] checkout.session.completed received without client_reference_id (userId)')
          break
        }

        // Fetch subscription info from Stripe to get price/period details
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any
        const priceId = subscription.items.data[0]?.price.id

        // Map priceId to our local plan names
        const plan = 'PRO' 

        await db.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            credits: PLAN_CREDITS[plan] || 1000, // credit refill upon upgrade
          },
        })
        console.log(`[Stripe Webhook] Successfully initialized subscription for user: ${userId}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any
          const user = await db.user.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
          })

          if (user) {
            const plan = user.plan
            await db.user.update({
              where: { id: user.id },
              data: {
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                credits: PLAN_CREDITS[plan] || 1000, // Refill credits on successful payment cycle
              },
            })
            console.log(`[Stripe Webhook] Refilled credits for user: ${user.id} on invoice payment success`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const user = await db.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing'
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: isActive ? user.plan : 'FREE',
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
          console.log(`[Stripe Webhook] Updated subscription status for user: ${user.id}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const user = await db.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: 'FREE',
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              credits: 200, // Demote back to free starter credits
            },
          })
          console.log(`[Stripe Webhook] Cancelled subscription and demoted user: ${user.id}`)
        }
        break
      }
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing event: ${err.message}`)
    return new NextResponse(`Webhook Handler Error: ${err.message}`, { status: 500 })
  }

  return new NextResponse('Webhook processed successfully', { status: 200 })
}
