import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET environment variable.')
    return new Response('CLERK_WEBHOOK_SECRET is not configured', {
      status: 500,
    })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('[Clerk Webhook] Error verifying webhook signature:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get event details
  const eventType = evt.type
  const { id } = evt.data

  console.log(`[Clerk Webhook] Received event: ${eventType} for ID: ${id}`)

  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data
    const primaryEmail = email_addresses?.[0]?.email_address || ''
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User'

    try {
      // Upsert the user to prevent duplicate sync issues
      const user = await db.user.upsert({
        where: { id: clerkId },
        update: {
          email: primaryEmail,
          name,
        },
        create: {
          id: clerkId,
          email: primaryEmail,
          name,
          credits: 200, // Starting credits
          role: 'user',
          plan: 'FREE',
        },
      })
      console.log(`[Clerk Webhook] Handled user.created successfully: ${user.id}`)
    } catch (dbErr) {
      console.error('[Clerk Webhook] Database error initializing user:', dbErr)
      return NextResponse.json({ error: 'Database sync failure' }, { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data
    try {
      if (clerkId) {
        await db.user.delete({
          where: { id: clerkId },
        })
        console.log(`[Clerk Webhook] Deleted user: ${clerkId}`)
      }
    } catch (dbErr) {
      console.error('[Clerk Webhook] Database error deleting user:', dbErr)
      return NextResponse.json({ error: 'Database sync failure' }, { status: 500 })
    }
  }

  return new Response('Webhook processed successfully', { status: 200 })
}
