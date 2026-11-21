import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { creditService } from '@/lib/services/credits'
import { referralService } from '@/lib/services/referral'
import { sendTelegramMessage, answerCallbackQuery, escapeTgHtml } from '@/lib/services/telegram'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // 1. Handle Inline Button Callback Queries (e.g. [⚡ Claim Lead])
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query)
      return NextResponse.json({ ok: true })
    }

    // 2. Handle Text Messages & Slash Commands
    if (update.message?.text) {
      await handleTextMessage(update.message)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[Telegram Webhook] Error processing update:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 }) // Return 200 so Telegram does not loop retries
  }
}

async function handleTextMessage(message: any) {
  const chatId = message.chat.id
  const text = (message.text || '').trim()
  const tgUsername = message.from?.username || null

  // 1. /start command (Account linking or Referral)
  if (text.startsWith('/start')) {
    const payload = text.split(/\s+/)[1]?.trim()
    await handleStartCommand(chatId, tgUsername, payload)
    return
  }

  // 2. /balance command
  if (text === '/balance') {
    await handleBalanceCommand(chatId)
    return
  }

  // 3. /leads or /latest command
  if (text === '/leads' || text === '/latest') {
    await handleLatestLeadsCommand(chatId)
    return
  }

  // 4. /claim <leadId> command
  if (text.startsWith('/claim')) {
    const leadId = text.split(/\s+/)[1]?.trim()
    if (!leadId) {
      await sendTelegramMessage(
        chatId,
        '⚠️ Please provide a Lead ID to claim:\nExample: <code>/claim &lt;lead_id&gt;</code>',
      )
      return
    }
    await processLeadClaim(chatId, leadId)
    return
  }

  // 5. /help command
  if (text === '/help') {
    await sendTelegramMessage(
      chatId,
      `🎯 <b>Lead Hunter Telegram Bot Commands:</b>

• <b>/leads</b> — View latest approved high-intent leads right now.
• <b>/balance</b> — Check your current credit balance & expiry.
• <b>/claim &lt;lead_id&gt;</b> — Unlock buyer email & phone directly in chat.
• <b>/help</b> — Show available commands.

💡 <i>Tap any [⚡ Claim Lead] button on alert drops to unlock instantly.</i>`,
    )
    return
  }

  // Default fallback for unhandled text
  await sendTelegramMessage(
    chatId,
    `👋 Hello! Send <b>/leads</b> to see available leads, <b>/balance</b> to check credits, or <b>/help</b> for commands.`,
  )
}

async function handleStartCommand(chatId: number | string, tgUsername: string | null, payload?: string) {
  const chatIdStr = String(chatId)

  // A. Payload is a Referral Code / Link: ref_XXXXX
  if (payload && payload.startsWith('ref_')) {
    const refCode = payload.replace(/^ref_/, '')
    const existingUser = await db.user.findFirst({
      where: { telegram_chat_id: chatIdStr },
    })

    if (existingUser) {
      await sendTelegramMessage(
        chatId,
        `⚠️ Your Telegram account is already linked to <b>${escapeTgHtml(existingUser.email)}</b>.`,
      )
      return
    }

    await sendTelegramMessage(
      chatId,
      `🎉 Welcome to <b>Lead Hunter Club</b>!
You joined through an invite link!

To claim your <b>+10 bonus credits</b>:
1. Register on the website: <a href="${APP_URL}/register?ref=${encodeURIComponent(refCode)}">${APP_URL}/register</a>
2. Go to <b>Settings</b> and tap <b>Connect Telegram</b> to link this chat.`,
    )
    return
  }

  // B. Payload is a User ID (Account Linking from /settings)
  if (payload) {
    const targetUser = await db.user.findUnique({
      where: { id: payload },
    })

    if (!targetUser) {
      await sendTelegramMessage(
        chatId,
        `❌ Invalid link code. Please open <a href="${APP_URL}/settings">${APP_URL}/settings</a> and click <b>Connect Telegram</b> again.`,
      )
      return
    }

    // Link user
    await db.user.update({
      where: { id: targetUser.id },
      data: {
        telegram_chat_id: chatIdStr,
        telegram_username: tgUsername,
      },
    })

    const balances = await creditService.getBalances(targetUser.id)

    await sendTelegramMessage(
      chatId,
      `✅ <b>Account Successfully Linked!</b>

Welcome, <b>${escapeTgHtml(targetUser.name || 'Hunter')}</b>!
• <b>Account:</b> ${escapeTgHtml(targetUser.email)}
• <b>Active Credits:</b> ${balances.total}

You will now receive <b>instant Telegram alerts</b> the moment verified client opportunities matching your niches are approved.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Open Lead Feed', url: `${APP_URL}/leads` }],
          ],
        },
      },
    )
    return
  }

  // C. Bare /start without payload
  const existing = await db.user.findFirst({
    where: { telegram_chat_id: chatIdStr },
  })

  if (existing) {
    const balances = await creditService.getBalances(existing.id)
    await sendTelegramMessage(
      chatId,
      `👋 Welcome back, <b>${escapeTgHtml(existing.name || 'Hunter')}</b>!

• <b>Account:</b> ${escapeTgHtml(existing.email)}
• <b>Credits:</b> ${balances.total}
• Status: 🟢 <b>Alerts Active</b>

Send <b>/balance</b> to check details or visit <a href="${APP_URL}/leads">Lead Hunter Feed</a>.`,
    )
    return
  }

  // Unlinked user
  await sendTelegramMessage(
    chatId,
    `👋 Welcome to <b>Lead Hunter Club Bot</b>!

To link your account and receive instant alerts:
1. Log into your dashboard: <a href="${APP_URL}/settings">${APP_URL}/settings</a>
2. Under <b>Telegram Alerts</b>, click <b>Connect Telegram</b>.`,
  )
}

async function handleBalanceCommand(chatId: number | string) {
  const user = await db.user.findFirst({
    where: { telegram_chat_id: String(chatId) },
  })

  if (!user) {
    await sendTelegramMessage(
      chatId,
      `⚠️ Your Telegram account is not linked to Lead Hunter yet.\nLink it at <a href="${APP_URL}/settings">${APP_URL}/settings</a>.`,
    )
    return
  }

  const balances = await creditService.getBalances(user.id)
  const rolloverExp = balances.rolloverExpiresAt
    ? new Date(balances.rolloverExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None'

  await sendTelegramMessage(
    chatId,
    `💰 <b>Your Lead Hunter Credit Balance:</b>

• <b>Total Available:</b> <b>${balances.total} Credits</b>
• <b>Monthly Plan:</b> ${balances.subscriptionBalance} credits
• <b>Rollover (15 Days):</b> ${balances.rolloverBalance} credits (Expires: ${rolloverExp})
• <b>Purchased / Bonus:</b> ${balances.bonusBalance} credits (Never expires)

<a href="${APP_URL}/pricing">⚡ Top up or Upgrade Plan &rarr;</a>`,
  )
}

async function handleLatestLeadsCommand(chatId: number | string) {
  const leads = await db.leadPost.findMany({
    where: {
      status: 'relevant',
      review_status: 'approved',
      is_deleted: false,
    },
    orderBy: { created_at: 'desc' },
    take: 3,
  })

  if (!leads || leads.length === 0) {
    await sendTelegramMessage(
      chatId,
      '📭 <b>No approved leads found right now.</b>\nNew verified leads will be posted here the moment they are approved by admins.',
    )
    return
  }

  await sendTelegramMessage(
    chatId,
    `🔥 <b>Latest Verified Leads (${leads.length}):</b>\nTap <b>[⚡ Claim Lead]</b> to unlock decision-maker contacts:`,
  )

  for (const lead of leads) {
    const title = lead.title?.trim() || 'New High-Intent Client Requirement'
    const niche = lead.niche || lead.keyword || 'General'
    const cleanContent = lead.content ? lead.content.replace(/\s+/g, ' ').trim() : ''
    const snippet = cleanContent ? cleanContent.slice(0, 180) + '...' : ''
    const leadUrl = `${APP_URL}/leads?lead=${encodeURIComponent(lead.id)}`

    const messageText = `🎯 <b>${escapeTgHtml(niche)}</b>
<b>${escapeTgHtml(title)}</b>

${snippet ? `<i>"${escapeTgHtml(snippet)}"</i>\n` : ''}
⚡ <b>Platform:</b> ${escapeTgHtml(lead.platform || 'LinkedIn')} | <b>Cost:</b> ${lead.credit_cost ?? 15} credits`

    await sendTelegramMessage(chatId, messageText, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⚡ Claim Lead (In-Chat)', callback_data: `claim:${lead.id}` },
            { text: '🌐 View Full Intel', url: leadUrl },
          ],
        ],
      },
    })
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const queryId = callbackQuery.id
  const data = (callbackQuery.data || '').trim()
  const chatId = callbackQuery.message?.chat?.id

  if (!chatId || !data) {
    await answerCallbackQuery(queryId)
    return
  }

  if (data.startsWith('claim:')) {
    const leadId = data.replace(/^claim:/, '')
    await answerCallbackQuery(queryId, 'Processing your lead claim...')
    await processLeadClaim(chatId, leadId)
    return
  }

  await answerCallbackQuery(queryId)
}

async function processLeadClaim(chatId: number | string, leadId: string) {
  const user = await db.user.findFirst({
    where: { telegram_chat_id: String(chatId) },
  })

  if (!user) {
    await sendTelegramMessage(
      chatId,
      `⚠️ You must link your Lead Hunter account first.\nConnect at <a href="${APP_URL}/settings">${APP_URL}/settings</a>.`,
    )
    return
  }

  if (user.status !== 'ACTIVE' && user.status !== 'active') {
    await sendTelegramMessage(
      chatId,
      `🚫 Your account is currently <b>${escapeTgHtml(user.status)}</b> and cannot claim leads.`,
    )
    return
  }

  // Check lead existence
  const lead = await db.leadPost.findFirst({
    where: { id: leadId, is_deleted: false },
  })

  if (!lead) {
    await sendTelegramMessage(chatId, `❌ Lead not found with ID <code>${escapeTgHtml(leadId)}</code>.`)
    return
  }

  // Check already claimed
  const existingState = await db.userLeadState.findUnique({
    where: {
      userId_leadId: {
        userId: user.id,
        leadId,
      },
    },
  })

  const contact = (lead.contact_info as any) || {}
  const emails = contact.emails?.map((e: any) => e.email).filter(Boolean) || []
  const phones = contact.phone_numbers?.map((p: any) => p.number).filter(Boolean) || []
  const profileUrl = lead.url || contact.linkedin_url || ''

  if (existingState?.isRevealed) {
    await sendTelegramMessage(
      chatId,
      `✅ <b>You have already unlocked this lead:</b>

<b>${escapeTgHtml(lead.title || 'Client Requirement')}</b>
• <b>Email:</b> ${escapeTgHtml(emails.join(', ') || 'None')}
• <b>Phone:</b> ${escapeTgHtml(phones.join(', ') || 'None')}
• <b>Profile / Post:</b> <a href="${profileUrl}">View Post</a>

<a href="${APP_URL}/leads?lead=${encodeURIComponent(leadId)}">View Full Lead Intelligence &rarr;</a>`,
    )
    return
  }

  // Enforce 25 claim limit
  if (lead.claimed_count >= 25) {
    await sendTelegramMessage(
      chatId,
      `⚠️ <b>Claim Limit Reached:</b> This lead has already been claimed by the maximum allowed 25 hunters.`,
    )
    return
  }

  // Calculate dynamic credit cost (15 phone+email, 12 phone, 10 email, 5 profile)
  let creditCost = 5
  if (phones.length > 0 && emails.length > 0) creditCost = 15
  else if (phones.length > 0) creditCost = 12
  else if (emails.length > 0) creditCost = 10

  const balances = await creditService.getBalances(user.id)
  if (balances.total < creditCost) {
    await sendTelegramMessage(
      chatId,
      `❌ <b>Insufficient Credits:</b> This lead requires <b>${creditCost} credits</b>, but your balance is <b>${balances.total} credits</b>.

<a href="${APP_URL}/pricing">⚡ Top Up Credits Now &rarr;</a>`,
    )
    return
  }

  // Atomically deduct credits & save claim
  try {
    await db.$transaction(async (tx) => {
      // Deduct credits
      await creditService.deductInTx(tx, user.id, creditCost, `Telegram Claim: Lead ${lead.id.slice(0, 8)}`)

      // Create / update userLeadState
      await tx.userLeadState.upsert({
        where: {
          userId_leadId: {
            userId: user.id,
            leadId,
          },
        },
        create: {
          userId: user.id,
          leadId,
          isRevealed: true,
          revealedAt: new Date(),
        },
        update: {
          isRevealed: true,
          revealedAt: new Date(),
        },
      })

      // Increment claimed_count on lead
      await tx.leadPost.update({
        where: { id: leadId },
        data: { claimed_count: { increment: 1 } },
      })
    })

    const newBalances = await creditService.getBalances(user.id)

    await sendTelegramMessage(
      chatId,
      `🎉 <b>Lead Successfully Claimed!</b> (-${creditCost} credits)

<b>${escapeTgHtml(lead.title || 'Client Requirement')}</b>
📁 <b>Niche:</b> ${escapeTgHtml(lead.niche || 'High-Intent')}

<b>Verified Decision Maker Contact:</b>
• <b>Email:</b> <code>${escapeTgHtml(emails.join(', ') || 'N/A')}</code>
• <b>Phone:</b> <code>${escapeTgHtml(phones.join(', ') || 'N/A')}</code>
• <b>Source Link:</b> <a href="${profileUrl}">${profileUrl ? 'Open Client Post' : 'N/A'}</a>

💰 <b>Remaining Balance:</b> ${newBalances.total} Credits`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🧠 View AI Pitch & Intelligence', url: `${APP_URL}/leads?lead=${encodeURIComponent(leadId)}` }],
          ],
        },
      },
    )
  } catch (err: any) {
    console.error('[Telegram Claim Error]:', err.message)
    await sendTelegramMessage(chatId, `❌ Failed to claim lead: ${escapeTgHtml(err.message)}`)
  }
}
