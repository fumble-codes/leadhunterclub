import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendTelegramMessage, formatTelegramLeadCard } from '@/lib/services/telegram'
import {
  getTelegramDripSettings,
  formatDripMessage,
  getDripButton,
  DEFAULT_TELEGRAM_DRIPS,
  type TelegramDripSettings,
} from '@/lib/services/telegram-drips'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

const DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE = `🚀 <b>Fresh Leads Dropped — Lead Hunter Club</b>

🔥 <b>{count} new verified client opportunit{count_suffix}</b> {have_has} just been approved and added to the platform!

📌 <b>Niches:</b> {niches}

👉 <b>Review & unlock them now on the Dashboard:</b>
{link}`

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const [tgConfig, tgChannel, tgTemplate, tgDrips, tgDetected] = await Promise.allSettled([
      db.setting.findUnique({ where: { key: 'telegram_config' } }),
      db.setting.findUnique({ where: { key: 'telegram_community_channel' } }),
      db.setting.findUnique({ where: { key: 'telegram_alert_template' } }),
      db.setting.findUnique({ where: { key: 'telegram_drip_settings' } }),
      db.setting.findUnique({ where: { key: 'telegram_detected_chats' } }),
    ])

    const configVal = tgConfig.status === 'fulfilled' && tgConfig.value?.value
      ? (tgConfig.value.value as Record<string, any>)
      : {}

    const channelVal = tgChannel.status === 'fulfilled' && tgChannel.value?.value
      ? (tgChannel.value.value as Record<string, any>)
      : {}

    const templateVal = tgTemplate.status === 'fulfilled' && tgTemplate.value?.value
      ? (tgTemplate.value.value as Record<string, any>)
      : {}

    const dripsVal = tgDrips.status === 'fulfilled' && tgDrips.value?.value
      ? (tgDrips.value.value as Record<string, any>)
      : {}

    const detectedChats = tgDetected.status === 'fulfilled' && Array.isArray(tgDetected.value?.value)
      ? tgDetected.value.value
      : []

    const dripSettings = await getTelegramDripSettings()

    return NextResponse.json({
      success: true,
      data: {
        botUsername: configVal.bot_username || 'leadhunterclubbot',
        botEnabled: configVal.enabled !== false,
        hasBotToken: Boolean(configVal.bot_token || process.env.TELEGRAM_BOT_TOKEN),
        configuredChannelId: channelVal.channel_id || '',
        configuredChannelName: channelVal.channel_name || null,
        detectedChats,
        alertTemplate: templateVal.template || DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE,
        dripSettings,
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Admin access required' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to fetch Telegram settings'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (action === 'save_channel') {
      const channelId = (body.channelId || '').trim()
      const channelName = (body.channelName || '').trim() || null

      await db.setting.upsert({
        where: { key: 'telegram_community_channel' },
        create: {
          key: 'telegram_community_channel',
          value: { channel_id: channelId, channel_name: channelName },
          description: 'Target Telegram community channel or group for automated lead drops',
        },
        update: {
          value: { channel_id: channelId, channel_name: channelName },
        },
      })

      return NextResponse.json({ success: true, message: 'Target Telegram channel saved successfully' })
    }

    if (action === 'clear_channel') {
      await db.setting.deleteMany({ where: { key: 'telegram_community_channel' } })
      return NextResponse.json({ success: true, message: 'Target Telegram channel cleared' })
    }

    if (action === 'save_template') {
      const template = (body.template || '').trim()
      if (!template) {
        return NextResponse.json({ code: 'BAD_REQUEST', message: 'Template text cannot be empty' }, { status: 400 })
      }

      await db.setting.upsert({
        where: { key: 'telegram_alert_template' },
        create: {
          key: 'telegram_alert_template',
          value: { template },
          description: 'Custom message template for Telegram community lead drop alerts',
        },
        update: {
          value: { template },
        },
      })

      return NextResponse.json({ success: true, message: 'Telegram alert template saved successfully' })
    }

    if (action === 'reset_template') {
      await db.setting.deleteMany({ where: { key: 'telegram_alert_template' } })
      return NextResponse.json({
        success: true,
        message: 'Template reset to default',
        template: DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE,
      })
    }

    if (action === 'save_drip_settings') {
      const existing = await getTelegramDripSettings()
      const incoming = (body.dripSettings || body) as Partial<TelegramDripSettings>

      const updatedSettings: TelegramDripSettings = {
        free_upsell: {
          enabled: incoming.free_upsell?.enabled ?? existing.free_upsell.enabled,
          template: incoming.free_upsell?.template || existing.free_upsell.template,
        },
        low_credits: {
          enabled: incoming.low_credits?.enabled ?? existing.low_credits.enabled,
          threshold: incoming.low_credits?.threshold || existing.low_credits.threshold || 200,
          template: incoming.low_credits?.template || existing.low_credits.template,
        },
        mid_cycle_checkin: {
          enabled: incoming.mid_cycle_checkin?.enabled ?? existing.mid_cycle_checkin.enabled,
          template: incoming.mid_cycle_checkin?.template || existing.mid_cycle_checkin.template,
        },
        pre_renewal: {
          enabled: incoming.pre_renewal?.enabled ?? existing.pre_renewal.enabled,
          template: incoming.pre_renewal?.template || existing.pre_renewal.template,
        },
        grace_period: {
          enabled: incoming.grace_period?.enabled ?? existing.grace_period.enabled,
          template: incoming.grace_period?.template || existing.grace_period.template,
        },
        win_back: {
          enabled: incoming.win_back?.enabled ?? existing.win_back.enabled,
          template: incoming.win_back?.template || existing.win_back.template,
        },
      }

      await db.setting.upsert({
        where: { key: 'telegram_drip_settings' },
        create: {
          key: 'telegram_drip_settings',
          value: updatedSettings,
          description: 'Telegram automated marketing & retention drip campaign settings (all 6 triggers)',
        },
        update: {
          value: updatedSettings,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Telegram drip campaigns updated successfully',
        dripSettings: updatedSettings,
      })
    }

    if (action === 'send_test_alert') {
      const channelSetting = await db.setting.findUnique({ where: { key: 'telegram_community_channel' } })
      const channelVal = (channelSetting?.value as Record<string, any>) || {}
      const targetChannel = channelVal.channel_id || body.targetChannel

      if (!targetChannel) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Please configure and save a Target Telegram Channel/Group ID first.' },
          { status: 400 },
        )
      }

      const templateSetting = await db.setting.findUnique({ where: { key: 'telegram_alert_template' } })
      const rawTemplate = (templateSetting?.value as any)?.template || body.template || DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE

      const sampleMessage = rawTemplate
        .replace(/{count}/g, '3')
        .replace(/{count_suffix}/g, 'ies')
        .replace(/{have_has}/g, 'have')
        .replace(/{niches}/g, 'Web Dev, AI & Automation, UI/UX Design')
        .replace(/{link}/g, `${APP_URL}/leads`)

      const ok = await sendTelegramMessage(targetChannel, sampleMessage, {
        inline_keyboard: [
          [{ text: '🚀 Review & Claim on Dashboard ↗', url: `${APP_URL}/leads` }],
        ],
      })

      if (!ok) {
        return NextResponse.json(
          {
            code: 'SEND_FAILED',
            message: `Failed to deliver test message to "${targetChannel}". Ensure @leadhunterclubbot is added as an Administrator to the channel with 'Post Messages' permission.`,
          },
          { status: 502 },
        )
      }

      return NextResponse.json({ success: true, message: `Test drop alert posted to ${targetChannel}!` })
    }

    if (action === 'send_test_lead_alert') {
      const channelSetting = await db.setting.findUnique({ where: { key: 'telegram_community_channel' } })
      const channelVal = (channelSetting?.value as Record<string, any>) || {}
      const targetChat = channelVal.channel_id || body.targetChannel || body.targetChatId

      if (!targetChat) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Target Telegram Channel or Chat ID required.' },
          { status: 400 },
        )
      }

      const sampleCard = {
        id: 'sample-lead-001',
        title: 'Enterprise Digital Platform Revamp Project',
        niche: 'Web Development',
        content: "We're looking to connect with a website development agency for a website revamp project. We're looking for an agency with expertise in website design, development...",
      }

      const formatted = formatTelegramLeadCard(sampleCard, APP_URL)
      const ok = await sendTelegramMessage(targetChat, formatted.text, {
        inline_keyboard: formatted.inline_keyboard,
      })

      if (!ok) {
        return NextResponse.json(
          {
            code: 'SEND_FAILED',
            message: `Could not send test lead card to "${targetChat}". Ensure @leadhunterclubbot has permission to post in that chat/channel.`,
          },
          { status: 502 },
        )
      }

      return NextResponse.json({ success: true, message: `Sample individual lead card sent to ${targetChat}!` })
    }

    if (action === 'send_test_drip') {
      const { dripType, targetChatId, templateOverride } = body
      const channelSetting = await db.setting.findUnique({ where: { key: 'telegram_community_channel' } })
      const channelVal = (channelSetting?.value as Record<string, any>) || {}
      const target = targetChatId || channelVal.channel_id

      if (!target) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Target Telegram chat ID or channel required for test drip' },
          { status: 400 },
        )
      }

      const validTypes = ['free_upsell', 'low_credits', 'mid_cycle_checkin', 'pre_renewal', 'grace_period', 'win_back'] as const
      const type = (validTypes.includes(dripType) ? dripType : 'free_upsell') as keyof TelegramDripSettings

      const currentDrips = await getTelegramDripSettings()
      const dripConfig = currentDrips[type] || DEFAULT_TELEGRAM_DRIPS[type]

      const template = templateOverride || dripConfig?.template || DEFAULT_TELEGRAM_DRIPS[type].template
      const sampleText = formatDripMessage(
        template,
        {
          name: 'Hustler',
          credits: 140,
          days_left: 4,
          plan: 'Freelancer Pro',
        },
        APP_URL,
      )

      const buttons = getDripButton(type, APP_URL)

      const ok = await sendTelegramMessage(target, sampleText, {
        inline_keyboard: buttons,
      })

      if (!ok) {
        return NextResponse.json(
          { code: 'SEND_FAILED', message: `Could not send test message to chat ${target}` },
          { status: 502 },
        )
      }

      return NextResponse.json({ success: true, message: `Test ${type} drip delivered successfully to ${target}!` })
    }

    return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Admin access required' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to update Telegram settings'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}
