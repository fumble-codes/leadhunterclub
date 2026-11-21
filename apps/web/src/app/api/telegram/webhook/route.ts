import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { creditService } from '@/lib/services/credits'
import { referralService } from '@/lib/services/referral'
import { sendTelegramMessage, answerCallbackQuery, escapeTgHtml } from '@/lib/services/telegram'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

const BOT_COMMANDS_FOOTER = `───────────────────────
📌 <b>Bot Commands:</b>
• <b>/leads</b> — Browse latest high-intent client opportunities
• <b>/saved</b> — View your bookmarked leads & unlocked contacts
• <b>/balance</b> — Check your credit balance & rollover expiry
• <b>/claim &lt;lead_id&gt;</b> — Unlock buyer email & phone directly in chat
• <b>/help</b> — Show quick guide & all commands`

export const BOT_COMMANDS_KEYBOARD = [
  [
    { text: '🎯 Latest Leads', callback_data: 'cmd:leads' },
    { text: '🔖 Saved Leads', callback_data: 'cmd:saved' },
  ],
  [
    { text: '💰 Check Balance', callback_data: 'cmd:balance' },
    { text: '❓ Help Guide', callback_data: 'cmd:help' },
  ],
]

function withCommandsFooter(text: string): string {
  return `${text}\n\n${BOT_COMMANDS_FOOTER}`
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // 1. Handle Inline Button Callback Queries (e.g. [⚡ Claim Lead] or Command Buttons)
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

  // 4. /saved command (Bookmarked leads from web app)
  if (text === '/saved') {
    await handleSavedLeadsCommand(chatId)
    return
  }

  // 5. /claim <leadId> command
  if (text.startsWith('/claim')) {
    const leadId = text.split(/\s+/)[1]?.trim()
    if (!leadId) {
      await sendTelegramMessage(
        chatId,
        withCommandsFooter('⚠️ Please provide a Lead ID to claim:\nExample: <code>/claim &lt;lead_id&gt;</code>'),
        {
          reply_markup: {
            inline_keyboard: BOT_COMMANDS_KEYBOARD,
          },
        },
      )
      return
    }
    await processLeadClaim(chatId, leadId)
    return
  }

  // 6. /help command
  if (text === '/help') {
    await handleHelpCommand(chatId)
    return
  }

  // Default fallback for unhandled text
  await sendTelegramMessage(
    chatId,
    withCommandsFooter(`👋 Hello! Tap any button below or send a command to start hunting leads:`),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
  )
}

async function handleHelpCommand(chatId: number | string) {
  await sendTelegramMessage(
    chatId,
    withCommandsFooter(
      `🎯 <b>Lead Hunter Telegram Bot</b>\n\nInstant high-intent buyer alerts and in-chat contact unlocks.\n💡 <i>Tap any [⚡ Claim Lead] button on alert drops to unlock instantly.</i>`,
    ),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
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
        withCommandsFooter(`⚠️ Your Telegram account is already linked to <b>${escapeTgHtml(existingUser.email)}</b>.`),
        {
          reply_markup: {
            inline_keyboard: BOT_COMMANDS_KEYBOARD,
          },
        },
      )
      return
    }

    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `🎉 Welcome to <b>Lead Hunter Club</b>!\nYou joined through an invite link!\n\nTo claim your <b>+10 bonus credits</b>:\n1. Register on the website: <a href="${APP_URL}/register?ref=${encodeURIComponent(refCode)}">${APP_URL}/register</a>\n2. Go to <b>Settings</b> and tap <b>Connect Telegram</b> to link this chat.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
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
        withCommandsFooter(`❌ Invalid link code. Please open <a href="${APP_URL}/settings">${APP_URL}/settings</a> and click <b>Connect Telegram</b> again.`),
        {
          reply_markup: {
            inline_keyboard: BOT_COMMANDS_KEYBOARD,
          },
        },
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
      withCommandsFooter(
        `✅ <b>Account Successfully Linked!</b>\n\nWelcome, <b>${escapeTgHtml(targetUser.name || 'Hunter')}</b>!\n• <b>Account:</b> ${escapeTgHtml(targetUser.email)}\n• <b>Active Credits:</b> ${balances.total}\n\nYou will now receive <b>instant Telegram alerts</b> the moment verified client opportunities matching your niches are approved.`,
      ),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Open Lead Feed', url: `${APP_URL}/leads` }],
            ...BOT_COMMANDS_KEYBOARD,
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
      withCommandsFooter(
        `👋 Welcome back, <b>${escapeTgHtml(existing.name || 'Hunter')}</b>!\n\n• <b>Account:</b> ${escapeTgHtml(existing.email)}\n• <b>Credits:</b> ${balances.total}\n• Status: 🟢 <b>Alerts Active</b>\n\nTap any button below or visit <a href="${APP_URL}/leads">Lead Hunter Feed</a>.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  // Unlinked user
  await sendTelegramMessage(
    chatId,
    withCommandsFooter(
      `👋 Welcome to <b>Lead Hunter Club Bot</b>!\n\nTo link your account and receive instant alerts:\n1. Log into your dashboard: <a href="${APP_URL}/settings">${APP_URL}/settings</a>\n2. Under <b>Telegram Alerts</b>, click <b>Connect Telegram</b>.`,
    ),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
  )
}

async function handleBalanceCommand(chatId: number | string) {
  const user = await db.user.findFirst({
    where: { telegram_chat_id: String(chatId) },
  })

  if (!user) {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `⚠️ Your Telegram account is not linked to Lead Hunter yet.\nLink it at <a href="${APP_URL}/settings">${APP_URL}/settings</a>.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  const balances = await creditService.getBalances(user.id)
  const rolloverExp = balances.rolloverExpiresAt
    ? new Date(balances.rolloverExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None'

  await sendTelegramMessage(
    chatId,
    withCommandsFooter(
      `💰 <b>Your Lead Hunter Credit Balance:</b>\n\n• <b>Total Available:</b> <b>${balances.total} Credits</b>\n• <b>Monthly Plan:</b> ${balances.subscriptionBalance} credits\n• <b>Rollover (15 Days):</b> ${balances.rolloverBalance} credits (Expires: ${rolloverExp})\n• <b>Purchased / Bonus:</b> ${balances.bonusBalance} credits (Never expires)\n\n<a href="${APP_URL}/pricing">⚡ Top up or Upgrade Plan &rarr;</a>`,
    ),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
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
      withCommandsFooter(
        '📭 <b>No approved leads found right now.</b>\nNew verified leads will be posted here the moment they are approved by admins.',
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
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
⚡ <b>Platform:</b> ${escapeTgHtml(lead.platform || 'LinkedIn')} | <b>Cost:</b> ${lead.credit_cost ?? 15} credits
🆔 <b>Lead ID:</b> <code>${lead.id}</code>`

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

  // Footer summary after batch with interactive command buttons
  await sendTelegramMessage(
    chatId,
    withCommandsFooter('💡 <i>Tap any [⚡ Claim Lead] button above to unlock decision-maker contacts instantly.</i>'),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
  )
}

async function handleSavedLeadsCommand(chatId: number | string) {
  const user = await db.user.findFirst({
    where: { telegram_chat_id: String(chatId) },
  })

  if (!user) {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `⚠️ Your Telegram account is not linked to Lead Hunter yet.\nLink it at <a href="${APP_URL}/settings">${APP_URL}/settings</a> to view your saved leads.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  const savedStates = await db.userLeadState.findMany({
    where: {
      userId: user.id,
      isSaved: true,
      lead: { is_deleted: false },
    },
    include: {
      lead: true,
    },
    orderBy: { lastActionDate: 'desc' },
    take: 5,
  })

  if (!savedStates || savedStates.length === 0) {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `📌 <b>No Saved Leads Yet</b>\n\nYou haven't bookmarked any leads. Click the bookmark icon on any lead on the <a href="${APP_URL}/leads">Lead Feed</a> to save it here for quick access.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  await sendTelegramMessage(
    chatId,
    `📌 <b>Your Saved Leads (${savedStates.length}):</b>\n<a href="${APP_URL}/leads?tab=saved">Open Saved Tab in Web App &rarr;</a>`,
  )

  for (const item of savedStates) {
    const lead = item.lead
    if (!lead) continue

    const title = lead.title?.trim() || 'Client Requirement'
    const niche = lead.niche || lead.keyword || 'General'
    const isUnlocked = item.isRevealed
    const leadUrl = `${APP_URL}/leads?lead=${encodeURIComponent(lead.id)}`

    let contactSnippet = ''
    if (isUnlocked) {
      const contact = (lead.contact_info as any) || {}
      const emails = contact.emails?.map((e: any) => e.email).filter(Boolean) || []
      const phones = contact.phone_numbers?.map((p: any) => p.number).filter(Boolean) || []
      contactSnippet = `\n✅ <b>Unlocked:</b> Email: <code>${emails.join(', ') || 'None'}</code> | Phone: <code>${phones.join(', ') || 'None'}</code>`
    }

    const messageText = `🔖 <b>${escapeTgHtml(niche)}</b>
<b>${escapeTgHtml(title)}</b>
⚡ <b>Platform:</b> ${escapeTgHtml(lead.platform || 'LinkedIn')}${contactSnippet}
🆔 <b>Lead ID:</b> <code>${lead.id}</code>`

    const buttons = isUnlocked
      ? [[{ text: '🌐 View Full Intel', url: leadUrl }]]
      : [
          [
            { text: '⚡ Claim Lead (In-Chat)', callback_data: `claim:${lead.id}` },
            { text: '🌐 View on Platform', url: leadUrl },
          ],
        ]

    await sendTelegramMessage(chatId, messageText, {
      reply_markup: {
        inline_keyboard: buttons,
      },
    })
  }

  // Footer summary after batch with interactive command buttons
  await sendTelegramMessage(
    chatId,
    withCommandsFooter(`💡 <i>Saved leads are synced live. Open <a href="${APP_URL}/leads?tab=saved">Saved Leads in Web App</a> to manage them.</i>`),
    {
      reply_markup: {
        inline_keyboard: BOT_COMMANDS_KEYBOARD,
      },
    },
  )
}

async function handleCallbackQuery(callbackQuery: any) {
  const queryId = callbackQuery.id
  const data = (callbackQuery.data || '').trim()
  const chatId = callbackQuery.message?.chat?.id

  if (!chatId || !data) {
    await answerCallbackQuery(queryId)
    return
  }

  // Handle lead claim button
  if (data.startsWith('claim:')) {
    const leadId = data.replace(/^claim:/, '')
    await answerCallbackQuery(queryId, 'Processing your lead claim...')
    await processLeadClaim(chatId, leadId)
    return
  }

  // Handle command buttons
  if (data === 'cmd:leads') {
    await answerCallbackQuery(queryId, 'Fetching newest leads...')
    await handleLatestLeadsCommand(chatId)
    return
  }

  if (data === 'cmd:saved') {
    await answerCallbackQuery(queryId, 'Fetching saved leads...')
    await handleSavedLeadsCommand(chatId)
    return
  }

  if (data === 'cmd:balance') {
    await answerCallbackQuery(queryId, 'Checking credit balance...')
    await handleBalanceCommand(chatId)
    return
  }

  if (data === 'cmd:help') {
    await answerCallbackQuery(queryId)
    await handleHelpCommand(chatId)
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
      withCommandsFooter(
        `⚠️ You must link your Lead Hunter account first.\nConnect at <a href="${APP_URL}/settings">${APP_URL}/settings</a>.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  if (user.status !== 'ACTIVE' && user.status !== 'active') {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `🚫 Your account is currently <b>${escapeTgHtml(user.status)}</b> and cannot claim leads.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  // Check lead existence
  const lead = await db.leadPost.findFirst({
    where: { id: leadId, is_deleted: false },
  })

  if (!lead) {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(`❌ Lead not found with ID <code>${escapeTgHtml(leadId)}</code>.`),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
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
      withCommandsFooter(
        `✅ <b>You have already unlocked this lead:</b>\n\n<b>${escapeTgHtml(lead.title || 'Client Requirement')}</b>\n• <b>Email:</b> ${escapeTgHtml(emails.join(', ') || 'None')}\n• <b>Phone:</b> ${escapeTgHtml(phones.join(', ') || 'None')}\n• <b>Profile / Post:</b> <a href="${profileUrl}">View Post</a>\n\n<a href="${APP_URL}/leads?lead=${encodeURIComponent(leadId)}">View Full Lead Intelligence &rarr;</a>`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
    return
  }

  // Enforce 25 claim limit
  if (lead.claimed_count >= 25) {
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(
        `⚠️ <b>Claim Limit Reached:</b> This lead has already been claimed by the maximum allowed 25 hunters.`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
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
      withCommandsFooter(
        `❌ <b>Insufficient Credits:</b> This lead requires <b>${creditCost} credits</b>, but your balance is <b>${balances.total} credits</b>.\n\n<a href="${APP_URL}/pricing">⚡ Top Up Credits Now &rarr;</a>`,
      ),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
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
      withCommandsFooter(
        `🎉 <b>Lead Successfully Claimed!</b> (-${creditCost} credits)\n\n<b>${escapeTgHtml(lead.title || 'Client Requirement')}</b>\n📁 <b>Niche:</b> ${escapeTgHtml(lead.niche || 'High-Intent')}\n\n<b>Verified Decision Maker Contact:</b>\n• <b>Email:</b> <code>${escapeTgHtml(emails.join(', ') || 'N/A')}</code>\n• <b>Phone:</b> <code>${escapeTgHtml(phones.join(', ') || 'N/A')}</code>\n• <b>Source Link:</b> <a href="${profileUrl}">${profileUrl ? 'Open Client Post' : 'N/A'}</a>\n\n💰 <b>Remaining Balance:</b> ${newBalances.total} Credits`,
      ),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🧠 View AI Pitch & Intelligence', url: `${APP_URL}/leads?lead=${encodeURIComponent(leadId)}` }],
            ...BOT_COMMANDS_KEYBOARD,
          ],
        },
      },
    )
  } catch (err: any) {
    console.error('[Telegram Claim Error]:', err.message)
    await sendTelegramMessage(
      chatId,
      withCommandsFooter(`❌ Failed to claim lead: ${escapeTgHtml(err.message)}`),
      {
        reply_markup: {
          inline_keyboard: BOT_COMMANDS_KEYBOARD,
        },
      },
    )
  }
}
