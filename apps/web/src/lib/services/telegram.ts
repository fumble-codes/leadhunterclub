import { db } from '@/lib/db'

export interface TelegramConfig {
  botToken: string
  botUsername: string
  enabled: boolean
}

export async function getTelegramConfig(): Promise<TelegramConfig> {
  const envToken = process.env.TELEGRAM_BOT_TOKEN
  const envUser = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME

  if (envToken && envToken.trim()) {
    return {
      botToken: envToken.trim(),
      botUsername: (envUser || '').trim().replace(/^@/, ''),
      enabled: true,
    }
  }

  // Fallback to database setting
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'telegram_config' },
    })
    const val = (setting?.value as Record<string, any>) || {}
    return {
      botToken: (val.bot_token || '').trim(),
      botUsername: (val.bot_username || '').trim().replace(/^@/, ''),
      enabled: val.enabled !== false && Boolean(val.bot_token),
    }
  } catch {
    return { botToken: '', botUsername: '', enabled: false }
  }
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown'
    reply_markup?: {
      inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
    }
  },
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const config = await getTelegramConfig()
  if (!config.enabled || !config.botToken) {
    return { success: false, error: 'Telegram bot is not configured or disabled.' }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'HTML',
        disable_web_page_preview: false,
        reply_markup: options?.reply_markup,
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.warn(`[Telegram] Failed to send message to ${chatId}:`, data.description)
      return { success: false, error: data.description }
    }

    return { success: true, messageId: data.result?.message_id }
  } catch (err: any) {
    console.error(`[Telegram] Network error sending to ${chatId}:`, err.message)
    return { success: false, error: err.message }
  }
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false,
): Promise<void> {
  const config = await getTelegramConfig()
  if (!config.botToken) return

  try {
    await fetch(`https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    })
  } catch (err: any) {
    console.warn('[Telegram] answerCallbackQuery error:', err.message)
  }
}

export async function broadcastTelegramLeadAlert(leads: Array<{
  id: string
  title?: string | null
  niche?: string | null
  platform?: string | null
  snippet?: string | null
  content?: string | null
}>): Promise<{ sent: number; failed: number }> {
  if (!leads || leads.length === 0) return { sent: 0, failed: 0 }
  const config = await getTelegramConfig()
  if (!config.enabled || !config.botToken) return { sent: 0, failed: 0 }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

  const users = await db.user.findMany({
    where: {
      status: { in: ['ACTIVE', 'active'] },
      telegram_chat_id: { not: null },
    },
    select: {
      id: true,
      name: true,
      telegram_chat_id: true,
    },
  })

  let sent = 0
  let failed = 0

  for (const lead of leads) {
    const leadTitle = lead.title?.trim() || 'New High-Intent Client Requirement'
    const leadNiche = lead.niche || 'Strategic Lead'
    const cleanContent = lead.content ? lead.content.replace(/\s+/g, ' ').trim() : ''
    const snippet = lead.snippet || (cleanContent ? cleanContent.slice(0, 180) + '...' : '')
    const leadUrl = `${appUrl}/leads?lead=${encodeURIComponent(lead.id)}`

    const messageHtml = `🔥 <b>New Lead Alert | ${escapeTgHtml(leadNiche)}</b>

<b>${escapeTgHtml(leadTitle)}</b>

${snippet ? `<i>"${escapeTgHtml(snippet)}"</i>\n` : ''}
⚡ <b>Platform:</b> ${escapeTgHtml(lead.platform || 'LinkedIn')}
👉 <i>Claim before competitors reach out!</i>`

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⚡ Claim Lead (In-Chat)', callback_data: `claim:${lead.id}` },
          { text: '🌐 View on Platform', url: leadUrl },
        ],
      ],
    }

    for (const user of users) {
      if (!user.telegram_chat_id) continue
      const res = await sendTelegramMessage(user.telegram_chat_id, messageHtml, {
        reply_markup: keyboard,
      })
      if (res.success) sent++
      else failed++
    }
  }

  return { sent, failed }
}

export function escapeTgHtml(str?: string | null): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
