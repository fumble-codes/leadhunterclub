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
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
    reply_markup?: {
      inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
    }
  },
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const config = await getTelegramConfig()
  if (!config.enabled || !config.botToken) {
    return { success: false, error: 'Telegram bot is not configured or disabled.' }
  }

  const replyMarkup =
    options?.reply_markup ||
    (options?.inline_keyboard ? { inline_keyboard: options.inline_keyboard } : undefined)

  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'HTML',
        disable_web_page_preview: false,
        reply_markup: replyMarkup,
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

export function formatTelegramLeadCard(
  lead: {
    id: string
    title?: string | null
    niche?: string | null
    platform?: string | null
    snippet?: string | null
    content?: string | null
    keyword?: string | null
  },
  appUrl: string,
): { text: string; inline_keyboard: Array<Array<{ text: string; url: string }>> } {
  const displayTitle =
    lead.title?.trim() ||
    (lead.niche ? `${lead.niche} Opportunity` : lead.keyword || 'Strategic Client Opportunity')
  const niche = (lead.niche || lead.keyword || 'Strategic Lead').trim().toUpperCase()

  let snippet = lead.snippet || ''
  if (!snippet && lead.content) {
    const clean = lead.content.replace(/\s+/g, ' ').trim()
    snippet = clean.length > 200 ? clean.slice(0, 200) + '...' : clean
  }

  const cleanAppUrl = appUrl.replace(/\/+$/, '')
  const leadUrl = `${cleanAppUrl}/leads?lead=${encodeURIComponent(lead.id)}`

  const text = `💼 <b>Lead Hunter Club</b>

🏷️ <b>[${escapeTgHtml(niche)}]</b>
<b>${escapeTgHtml(displayTitle)}</b>

${snippet ? `${escapeTgHtml(snippet)}\n\n` : ''}👉 <i>Claim before competitors reach out!</i>`

  const inline_keyboard = [
    [
      { text: '⚡ View & Claim Lead ↗', url: leadUrl },
    ],
  ]

  return { text, inline_keyboard }
}

export async function broadcastTelegramLeadAlert(leads: Array<{
  id: string
  title?: string | null
  niche?: string | null
  platform?: string | null
  snippet?: string | null
  content?: string | null
  keyword?: string | null
}>): Promise<{ sent: number; failed: number }> {
  if (!leads || leads.length === 0) return { sent: 0, failed: 0 }
  const config = await getTelegramConfig()
  if (!config.enabled || !config.botToken) return { sent: 0, failed: 0 }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

  const [channelSetting, users] = await Promise.all([
    db.setting.findUnique({ where: { key: 'telegram_community_channel' } }),
    db.user.findMany({
      where: {
        status: { in: ['ACTIVE', 'active'] },
        telegram_chat_id: { not: null },
      },
      select: {
        id: true,
        name: true,
        telegram_chat_id: true,
      },
    }),
  ])

  const channelVal = (channelSetting?.value as Record<string, any>) || {}
  const channelId = channelVal.channel_id

  if (!channelId && users.length === 0) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0

  // Send each lead directly as an INDIVIDUAL Telegram message card
  for (const lead of leads) {
    const { text: messageHtml, inline_keyboard } = formatTelegramLeadCard(lead, appUrl)

    // Send directly to the Telegram Community Channel
    if (channelId) {
      const channelRes = await sendTelegramMessage(channelId, messageHtml, {
        inline_keyboard,
      })
      if (channelRes.success) sent++
      else failed++
    }

    // Send directly to individual hunters with connected Telegram
    for (const user of users) {
      if (!user.telegram_chat_id) continue
      const res = await sendTelegramMessage(user.telegram_chat_id, messageHtml, {
        inline_keyboard,
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
