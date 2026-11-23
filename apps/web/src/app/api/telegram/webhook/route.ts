import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { referralService } from '@/lib/services/referral'
import { sendTelegramMessage, answerCallbackQuery, escapeTgHtml } from '@/lib/services/telegram'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

const DASHBOARD_KEYBOARD = [
  [{ text: '🚀 Open Lead Hunter Dashboard ↗', url: `${APP_URL}/leads` }],
  [{ text: '⚙️ Account & Credit Settings ↗', url: `${APP_URL}/settings` }],
]

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // 1. Handle Inline Button Callback Queries (redirects any click to web dashboard)
    if (update.callback_query) {
      const cb = update.callback_query
      await answerCallbackQuery(cb.id, 'Opening Lead Hunter Web Dashboard...')
      await sendTelegramMessage(
        cb.message?.chat?.id || cb.from?.id,
        `🌐 <b>Lead Hunter Web Dashboard:</b>\n\nAll verified client opportunities, buyer intelligence reports, contact unlocks, and credit balance tracking are exclusively managed on your web dashboard.`,
        {
          reply_markup: {
            inline_keyboard: DASHBOARD_KEYBOARD,
          },
        },
      )
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

  // Fallback for any other commands (/leads, /claim, /balance, /help, etc.) or chat messages:
  // Direct hunter 100% to the web dashboard as requested
  await sendTelegramMessage(
    chatId,
    `👋 <b>Welcome to The Lead Hunter Club!</b>\n\nAll verified client opportunities, AI buyer intelligence, contact claiming, and credit balances are managed directly on the web dashboard.\n\nThis bot will notify you here in real time whenever fresh leads drop or your account requires attention.`,
    {
      reply_markup: {
        inline_keyboard: DASHBOARD_KEYBOARD,
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
        `⚠️ Your Telegram account is already linked to <b>${escapeTgHtml(existingUser.email)}</b>.`,
        {
          reply_markup: {
            inline_keyboard: DASHBOARD_KEYBOARD,
          },
        },
      )
      return
    }

    await sendTelegramMessage(
      chatId,
      `🎉 Welcome to <b>Lead Hunter Club</b>!\nYou joined through an invite link!\n\nTo claim your <b>+10 bonus credits</b>:\n1. Register on the website: <a href="${APP_URL}/register?ref=${encodeURIComponent(refCode)}">${APP_URL}/register</a>\n2. Go to <b>Settings</b> and tap <b>Connect Telegram</b> to link this chat.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Register & Claim Bonus ↗', url: `${APP_URL}/register?ref=${encodeURIComponent(refCode)}` }],
          ],
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
        `❌ Invalid link code. Please open <a href="${APP_URL}/settings">${APP_URL}/settings</a> and click <b>Connect Telegram</b> again.`,
        {
          reply_markup: {
            inline_keyboard: DASHBOARD_KEYBOARD,
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

    // Award Telegram connection bounty (+10 credits) once
    try {
      await referralService.awardTelegramConnectionBounty(targetUser.id)
    } catch {
      // ignore if already awarded
    }

    await sendTelegramMessage(
      chatId,
      `✅ <b>Account Successfully Linked!</b>\n\nWelcome, <b>${escapeTgHtml(targetUser.name || 'Hunter')}</b>!\n• <b>Account:</b> ${escapeTgHtml(targetUser.email)}\n\nYou will now receive <b>instant Telegram alerts</b> the moment verified client opportunities matching your niches are approved.\n\nAll lead discovery, AI intelligence, and contact claiming happen on your web dashboard:`,
      {
        reply_markup: {
          inline_keyboard: DASHBOARD_KEYBOARD,
        },
      },
    )
    return
  }

  // C. Plain /start without link code
  const linkedUser = await db.user.findFirst({
    where: { telegram_chat_id: chatIdStr },
    select: { id: true, name: true, email: true },
  })

  if (linkedUser) {
    await sendTelegramMessage(
      chatId,
      `👋 <b>Welcome Back, ${escapeTgHtml(linkedUser.name || 'Hunter')}!</b>\n\nYour Telegram is linked to <b>${escapeTgHtml(linkedUser.email)}</b>.\n\nAll live leads, buyer intelligence, and contact unlocks live on your web dashboard:`,
      {
        reply_markup: {
          inline_keyboard: DASHBOARD_KEYBOARD,
        },
      },
    )
    return
  }

  // D. Unlinked user sending /start
  await sendTelegramMessage(
    chatId,
    `👋 <b>Welcome to The Lead Hunter Club!</b>\n\nWe monitor live public platforms for high-intent clients asking for service providers right now.\n\nTo link this Telegram chat for instant lead alerts:\n1. Open your Lead Hunter dashboard.\n2. Go to <b>Settings</b> &rarr; tap <b>Connect Telegram</b>.\n\nAll verified leads, AI intelligence, and contact claiming live on the web dashboard:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open Lead Hunter Dashboard ↗', url: `${APP_URL}/leads` }],
          [{ text: '🌐 Register Account ↗', url: `${APP_URL}/register` }],
        ],
      },
    },
  )
}
